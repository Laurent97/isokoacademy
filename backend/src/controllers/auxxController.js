const db = require('../database/db');

const getConfig = async () => {
  const r = await db.query('SELECT * FROM auxx_config ORDER BY updated_at DESC LIMIT 1');
  return r.rows[0];
};

const getBalance = async (userId) => {
  const r = await db.query(
    `SELECT COALESCE(SUM(amount_auxx),0)::int AS balance FROM auxx_ledger WHERE user_id=$1`,
    [userId]
  );
  return r.rows[0].balance;
};

async function recordEntry(client, { userId, type, amount, usdt = null, description, ref = null, metadata = null }) {
  const bal = await getBalance(userId);
  const after = bal + amount;
  if (after < 0) throw Object.assign(new Error('Insufficient AUXX balance'), { status: 400 });
  const r = await client.query(
    `INSERT INTO auxx_ledger (user_id, transaction_type, amount_auxx, amount_usdt, balance_after_auxx, description, reference_id, metadata)
     VALUES ($1,$2,$3,$4,$5,$6,$7,$8) RETURNING *`,
    [userId, type, amount, usdt, after, description, ref, metadata ? JSON.stringify(metadata) : null]
  );
  return r.rows[0];
}

/** GET /auxx/wallet - balance + config + limits */
const getWallet = async (req, res) => {
  try {
    const userId = req.user.id;
    const config = await getConfig();
    const balance = await getBalance(userId);
    const limits = await db.query('SELECT * FROM auxx_purchase_limits WHERE user_id=$1', [userId]);
    const account = await db.query('SELECT balance_usd, reset_count FROM sandbox_accounts WHERE user_id=$1', [userId]);
    res.json({
      balance_auxx: balance,
      usdt_rate: Number(config.usdt_rate),
      balance_usdt_equiv: Math.round(balance * Number(config.usdt_rate) * 100) / 100,
      daily_free_reset_auxx: config.daily_free_reset_auxx,
      limits: limits.rows[0] || null,
      sandbox: account.rows[0] || null,
    });
  } catch (e) {
    console.error('getWallet:', e);
    res.status(500).json({ error: 'Failed to load wallet' });
  }
};

/** GET /auxx/ledger */
const getLedger = async (req, res) => {
  try {
    const r = await db.query(
      `SELECT id, transaction_type, amount_auxx, amount_usdt, balance_after_auxx,
              description, created_at
       FROM auxx_ledger WHERE user_id=$1 ORDER BY created_at DESC LIMIT 100`,
      [req.user.id]
    );
    res.json({ entries: r.rows });
  } catch (e) {
    console.error('getLedger:', e);
    res.status(500).json({ error: 'Failed to load ledger' });
  }
};

/**
 * POST /auxx/purchase - { amount_usdt }
 * Dev mode: instantly confirms a mock deposit. In production this would
 * create a crypto_deposits row pending on-chain confirmation.
 */
const purchaseAuxx = async (req, res) => {
  try {
    const amountUsdt = Number(req.body.amount_usdt);
    if (!amountUsdt || amountUsdt <= 0 || amountUsdt > 500) {
      return res.status(400).json({ error: 'amount_usdt must be between 0 and 500' });
    }
    const config = await getConfig();
    const auxx = Math.floor(amountUsdt / Number(config.usdt_rate));
    const userId = req.user.id;

    const limits = await db.query('SELECT * FROM auxx_purchase_limits WHERE user_id=$1', [userId]);

    // v2 loss-refill rule: hitting $0 sandbox balance blocks purchases for 24h
    const zeroedAt = limits.rows[0]?.last_zero_balance_at;
    if (zeroedAt && Date.now() - new Date(zeroedAt).getTime() < 24 * 3600e3) {
      return res.status(429).json({
        error: 'Purchases are paused for 24 hours after your sandbox hits $0. Review your mistakes first.',
        code: 'ZERO_BALANCE_COOLDOWN',
        until: new Date(new Date(zeroedAt).getTime() + 24 * 3600e3).toISOString(),
      });
    }

    // monthly purchase cap: $100 USDT equivalent
    const monthly = Number(limits.rows[0]?.current_month_usdt_purchased || 0);
    if (monthly + amountUsdt > 100) {
      return res.status(400).json({ error: 'Monthly purchase limit is 100 USDT' });
    }

    const client = await db.connect();
    try {
      await client.query('BEGIN');
      const dep = await client.query(
        `INSERT INTO crypto_deposits (user_id, transaction_hash, amount_usdt, auxx_credited, confirmations, required_confirmations, status, confirmed_at)
         VALUES ($1,$2,$3,$4,20,20,'confirmed',NOW()) RETURNING id`,
        [userId, `dev_${Date.now()}_${userId.slice(0, 8)}`, amountUsdt, auxx]
      );
      const entry = await recordEntry(client, {
        userId, type: 'purchase', amount: auxx, usdt: amountUsdt,
        description: `Purchased ${auxx} AUXX for ${amountUsdt} USDT`,
        ref: dep.rows[0].id,
      });
      await client.query(
        `INSERT INTO auxx_purchase_limits (user_id, lifetime_usdt_purchased, current_month_usdt_purchased)
         VALUES ($1, $2, $2)
         ON CONFLICT (user_id) DO UPDATE SET
           lifetime_usdt_purchased = auxx_purchase_limits.lifetime_usdt_purchased + $2,
           current_month_usdt_purchased = auxx_purchase_limits.current_month_usdt_purchased + $2,
           updated_at = NOW()`,
        [userId, amountUsdt]
      );
      await client.query('COMMIT');
      res.status(201).json({ entry, auxx_credited: auxx });
    } catch (e) {
      await client.query('ROLLBACK');
      throw e;
    } finally {
      client.release();
    }
  } catch (e) {
    console.error('purchaseAuxx:', e);
    res.status(e.status || 500).json({ error: e.message || 'Purchase failed' });
  }
};

/**
 * POST /auxx/refill-sandbox - spend AUXX to reset the sandbox account.
 * First reset each day is free if balance hit zero; paid refills limited
 * by config (week/month caps + cooldown).
 */
const refillSandbox = async (req, res) => {
  try {
    const userId = req.user.id;
    const config = await getConfig();
    const limits = await db.query('SELECT * FROM auxx_purchase_limits WHERE user_id=$1', [userId]);
    const lim = limits.rows[0] || {};
    const now = Date.now();

    const cooldownEnd = lim.last_refill_at
      ? new Date(lim.last_refill_at).getTime() + config.refill_cooldown_hours * 3600e3 : 0;
    const cooldown = cooldownEnd > now;
    const weekLeft = config.max_paid_refills_per_week - (lim.current_week_refills || 0);
    const monthLeft = config.max_paid_refills_per_month - (lim.current_month_refills || 0);

    const account = await db.query('SELECT * FROM sandbox_accounts WHERE user_id=$1', [userId]);
    const zeroed = Number(account.rows[0]?.balance_usd || 0) <= 0;

    const freeDaily = zeroed && !cooldown;
    const cost = freeDaily ? 0 : config.daily_free_reset_auxx;

    if (!freeDaily) {
      if (cooldown) return res.status(429).json({ error: 'Refill cooldown active', cooldown_until: new Date(cooldownEnd).toISOString() });
      if (weekLeft <= 0) return res.status(400).json({ error: 'Weekly refill limit reached' });
      if (monthLeft <= 0) return res.status(400).json({ error: 'Monthly refill limit reached' });
      // v2 rule: paid refill after hitting $0 requires the review step first
      if (zeroed && !req.body.confirmed_review) {
        return res.status(428).json({
          error: 'Review your mistakes before buying a refill',
          code: 'REVIEW_REQUIRED',
          review_lesson: 'Look at your last losing trades in the journal. Write down what went wrong, then try again.',
        });
      }
    }

    const client = await db.connect();
    try {
      await client.query('BEGIN');
      let entry = null;
      if (cost > 0) {
        entry = await recordEntry(client, {
          userId, type: 'spend', amount: -cost,
          description: `Sandbox refill (-${cost} AUXX)`,
        });
      }
      await client.query(
        `UPDATE sandbox_accounts
         SET balance_usd = starting_balance_usd, reset_count = reset_count + 1,
             last_reset_at = NOW(), updated_at = NOW()
         WHERE user_id = $1`,
        [userId]
      );
      await client.query(
        `UPDATE sandbox_orders SET order_status='cancelled', updated_at=NOW()
         WHERE user_id=$1 AND order_status IN ('pending','filled')`,
        [userId]
      );
      await client.query(
        `INSERT INTO auxx_purchase_limits (user_id, current_week_refills, current_month_refills, last_refill_at, last_zero_balance_at)
         VALUES ($1, 1, 1, NOW(), CASE WHEN $2 THEN NOW() ELSE NULL END)
         ON CONFLICT (user_id) DO UPDATE SET
           current_week_refills = auxx_purchase_limits.current_week_refills + 1,
           current_month_refills = auxx_purchase_limits.current_month_refills + 1,
           last_refill_at = NOW(),
           last_zero_balance_at = CASE WHEN $2 THEN NOW() ELSE auxx_purchase_limits.last_zero_balance_at END,
           updated_at = NOW()`,
        [userId, zeroed]
      );
      await client.query('COMMIT');
      res.json({
        message: freeDaily ? 'Free daily reset applied' : `Sandbox refilled for ${cost} AUXX`,
        cost_auxx: cost,
        entry,
      });
    } catch (e) {
      await client.query('ROLLBACK');
      throw e;
    } finally {
      client.release();
    }
  } catch (e) {
    console.error('refillSandbox:', e);
    res.status(e.status || 500).json({ error: e.message || 'Refill failed' });
  }
};

module.exports = { getWallet, getLedger, purchaseAuxx, refillSandbox, getBalance };
