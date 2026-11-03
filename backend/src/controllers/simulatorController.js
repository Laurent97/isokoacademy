const db = require('../database/db');
const feed = require('../services/priceFeed');
const tm = require('../services/tradeMath');

// ---- helpers -------------------------------------------------------------

async function getAccount(userId) {
  const r = await db.query('SELECT * FROM sandbox_accounts WHERE user_id = $1', [userId]);
  return r.rows[0];
}

async function getPairBySymbol(symbol) {
  const r = await db.query('SELECT * FROM trading_pairs WHERE symbol = $1 AND is_active = true', [symbol]);
  return r.rows[0];
}

function quoteFor(pair) {
  return feed.getQuote(pair.symbol, Number(pair.spread_pips), pair.pip_location);
}

/**
 * JOINed rows carry `contract` (pair lot_size) alongside the order's own
 * `lot_size` (lots traded). tradeMath expects pair.lot_size = contract.
 */
function pairFromRow(row) {
  return {
    symbol: row.symbol,
    pip_location: row.pip_location,
    lot_size: row.contract,
    base_currency: row.base_currency,
    quote_currency: row.quote_currency,
  };
}

/**
 * Lazy order lifecycle engine: fills pending orders whose trigger was hit,
 * and closes filled orders that hit SL/TP. Runs on read so prices are live.
 */
async function syncOrders(userId) {
  const pending = await db.query(
    `SELECT o.*, p.symbol, p.pip_location, p.lot_size AS contract, p.base_currency, p.quote_currency, p.spread_pips, p.max_leverage
     FROM sandbox_orders o JOIN trading_pairs p ON p.id = o.pair_id
     WHERE o.user_id = $1 AND o.order_status = 'pending'`,
    [userId]
  );
  for (const o of pending.rows) {
    const q = quoteFor(o);
    if (!q) continue;
    const limit = Number(o.entry_price);
    let fill = false;
    if (o.order_side === 'buy') {
      if (o.order_type === 'limit' && q.ask <= limit) fill = true;
      if (o.order_type === 'stop' && q.ask >= limit) fill = true;
    } else {
      if (o.order_type === 'limit' && q.bid >= limit) fill = true;
      if (o.order_type === 'stop' && q.bid <= limit) fill = true;
    }
    if (fill) {
      const px = o.order_side === 'buy' ? q.ask : q.bid;
      await db.query(
        `UPDATE sandbox_orders SET order_status='filled', entry_price=$1, filled_at=NOW(), updated_at=NOW() WHERE id=$2`,
        [px, o.id]
      );
      // reserve margin when a pending order fills
      await db.query(
        'UPDATE sandbox_accounts SET balance_usd = balance_usd - $1, updated_at=NOW() WHERE id=$2',
        [o.margin_used, o.sandbox_account_id]
      );
    }
  }

  // SL/TP checks on filled orders
  const filled = await db.query(
    `SELECT o.*, p.symbol, p.pip_location, p.lot_size AS contract, p.base_currency, p.quote_currency, p.spread_pips, p.max_leverage
     FROM sandbox_orders o JOIN trading_pairs p ON p.id = o.pair_id
     WHERE o.user_id = $1 AND o.order_status = 'filled'`,
    [userId]
  );
  const account = await getAccount(userId);
  for (const o of filled.rows) {
    const q = quoteFor(o);
    if (!q) continue;
    let exit = null;
    if (o.order_side === 'buy') {
      if (o.stop_loss_price && q.bid <= Number(o.stop_loss_price)) exit = Number(o.stop_loss_price);
      else if (o.take_profit_price && q.bid >= Number(o.take_profit_price)) exit = Number(o.take_profit_price);
    } else {
      if (o.stop_loss_price && q.ask >= Number(o.stop_loss_price)) exit = Number(o.stop_loss_price);
      else if (o.take_profit_price && q.ask <= Number(o.take_profit_price)) exit = Number(o.take_profit_price);
    }
    if (exit !== null) {
      await closeOrder(o, exit, account);
      continue;
    }
    // trailing stop: ratchet SL when price moves in favor by trailing_stop_pips
    if (o.trailing_stop_pips) {
      const trail = Number(o.trailing_stop_pips) * Math.pow(10, -o.pip_location);
      if (o.order_side === 'buy') {
        const newSl = q.bid - trail;
        if (!o.stop_loss_price || newSl > Number(o.stop_loss_price)) {
          await db.query('UPDATE sandbox_orders SET stop_loss_price=$1, updated_at=NOW() WHERE id=$2',
            [newSl, o.id]);
        }
      } else {
        const newSl = q.ask + trail;
        if (!o.stop_loss_price || newSl < Number(o.stop_loss_price)) {
          await db.query('UPDATE sandbox_orders SET stop_loss_price=$1, updated_at=NOW() WHERE id=$2',
            [newSl, o.id]);
        }
      }
    }
  }
}

async function closeOrder(order, exitPrice, account) {
  const pl = tm.profitLossUsd(pairFromRow(order), order, exitPrice);
  const client = await db.connect();
  try {
    await client.query('BEGIN');
    await client.query(
      `UPDATE sandbox_orders
       SET order_status='closed', closed_at=NOW(), close_price=$1,
           profit_loss=$2, profit_loss_pips=$3, updated_at=NOW()
       WHERE id=$4`,
      [exitPrice, pl.usd, pl.pips, order.id]
    );
    await client.query(
      `UPDATE sandbox_accounts
       SET balance_usd = balance_usd + $1, updated_at = NOW()
       WHERE id = $2`,
      [pl.usd + Number(order.margin_used || 0), order.sandbox_account_id]
    );
    // v2 rule: mark when a user's balance hits zero — blocks purchases 24h
    const bal = await client.query(
      'SELECT balance_usd FROM sandbox_accounts WHERE id=$1', [order.sandbox_account_id]);
    if (Number(bal.rows[0]?.balance_usd) <= 0) {
      await client.query(
        `INSERT INTO auxx_purchase_limits (user_id, last_zero_balance_at)
         VALUES ($1, NOW())
         ON CONFLICT (user_id) DO UPDATE SET last_zero_balance_at = NOW()`,
        [order.user_id]
      );
    }
    await client.query('COMMIT');
    return pl;
  } catch (e) {
    await client.query('ROLLBACK');
    throw e;
  } finally {
    client.release();
  }
}

function openExposure(rows) {
  // rows: filled orders joined with pair info
  let pl = 0;
  for (const o of rows) {
    const q = quoteFor(o);
    if (!q) continue;
    const px = o.order_side === 'buy' ? q.bid : q.ask;
    pl += tm.profitLossUsd(pairFromRow(o), o, px).usd;
  }
  return tm.round(pl, 2);
}

// ---- endpoints -----------------------------------------------------------

const getPairs = async (req, res) => {
  try {
    const r = await db.query('SELECT * FROM trading_pairs WHERE is_active = true ORDER BY symbol');
    const pairs = r.rows.map((p) => ({ ...p, quote: quoteFor(p) }));
    res.json({ pairs });
  } catch (e) {
    console.error('getPairs:', e);
    res.status(500).json({ error: 'Failed to load pairs' });
  }
};

const getPrice = async (req, res) => {
  const pair = await getPairBySymbol(req.query.symbol);
  if (!pair) return res.status(404).json({ error: 'Unknown symbol' });
  const q = quoteFor(pair);
  res.json({ symbol: pair.symbol, ...q, ts: Date.now() });
};

const getCandles = async (req, res) => {
  const pair = await getPairBySymbol(req.query.symbol);
  if (!pair) return res.status(404).json({ error: 'Unknown symbol' });
  const count = Math.min(parseInt(req.query.count) || 50, 200);
  res.json({ symbol: pair.symbol, candles: feed.getCandles(pair.symbol, count) });
};

const getAccountSummary = async (req, res) => {
  try {
    await syncOrders(req.user.id);
    const account = await getAccount(req.user.id);
    if (!account) return res.status(404).json({ error: 'No sandbox account' });

    const open = await db.query(
      `SELECT o.*, p.symbol, p.pip_location, p.lot_size AS contract, p.base_currency, p.quote_currency, p.spread_pips, p.max_leverage
       FROM sandbox_orders o JOIN trading_pairs p ON p.id = o.pair_id
       WHERE o.user_id = $1 AND o.order_status = 'filled'`,
      [req.user.id]
    );
    const floating = openExposure(open.rows);
    const marginUsed = open.rows.reduce((s, o) => s + Number(o.margin_used || 0), 0);
    const balance = Number(account.balance_usd);

    res.json({
      balance_usd: balance,
      equity_usd: tm.round(balance + floating, 2),
      floating_pl: floating,
      margin_used: tm.round(marginUsed, 2),
      free_margin: tm.round(balance + floating - marginUsed, 2),
      starting_balance_usd: Number(account.starting_balance_usd),
      reset_count: account.reset_count,
      open_positions: open.rows.length,
    });
  } catch (e) {
    console.error('getAccountSummary:', e);
    res.status(500).json({ error: 'Failed to load account' });
  }
};

const getOrders = async (req, res) => {
  try {
    await syncOrders(req.user.id);
    const status = req.query.status;
    let sql = `SELECT o.*, p.symbol, p.pip_location, p.lot_size AS contract,
                      p.base_currency, p.quote_currency, p.spread_pips
               FROM sandbox_orders o JOIN trading_pairs p ON p.id = o.pair_id
               WHERE o.user_id = $1`;
    const params = [req.user.id];
    if (status && status !== 'all') {
      params.push(status);
      sql += ` AND o.order_status = $${params.length}`;
    }
    sql += ' ORDER BY o.created_at DESC LIMIT 200';
    const r = await db.query(sql, params);

    // annotate open orders with live P&L
    const orders = r.rows.map((o) => {
      if (o.order_status === 'filled') {
        const q = feed.getQuote(o.symbol, 0, o.pip_location);
        if (q) {
          const pl = tm.profitLossUsd(pairFromRow(o), o, q.mid);
          return { ...o, live_pl_usd: pl.usd, live_pl_pips: pl.pips, current_price: q.mid };
        }
      }
      return o;
    });
    res.json({ orders });
  } catch (e) {
    console.error('getOrders:', e);
    res.status(500).json({ error: 'Failed to load orders' });
  }
};

const placeOrder = async (req, res) => {
  try {
    const {
      symbol, side, lot_size, type = 'market',
      limit_price, stop_loss, take_profit, journal_entry, trailing_stop_pips,
    } = req.body;

    if (!symbol || !['buy', 'sell'].includes(side)) {
      return res.status(400).json({ error: 'symbol and side (buy|sell) are required' });
    }
    const lots = Number(lot_size);
    if (!lots || lots <= 0 || lots > 10) {
      return res.status(400).json({ error: 'lot_size must be between 0 and 10' });
    }
    if (!['market', 'limit', 'stop'].includes(type)) {
      return res.status(400).json({ error: 'type must be market|limit|stop' });
    }

    const pair = await getPairBySymbol(symbol);
    if (!pair) return res.status(404).json({ error: 'Unknown symbol' });
    const q = quoteFor(pair);

    const account = await getAccount(req.user.id);
    if (!account) return res.status(404).json({ error: 'No sandbox account' });
    const equity = Number(account.balance_usd);

    let status = 'pending';
    let entry = null;
    let trigger = null;

    if (type === 'market') {
      entry = side === 'buy' ? q.ask : q.bid;
      status = 'filled';
    } else {
      trigger = Number(limit_price);
      if (!trigger) return res.status(400).json({ error: 'limit_price required for pending orders' });
      entry = trigger;
    }

    // SL/TP direction validation
    const sl = stop_loss ? Number(stop_loss) : null;
    const tp = take_profit ? Number(take_profit) : null;
    if (side === 'buy') {
      if (sl && sl >= entry) return res.status(400).json({ error: 'Stop loss must be below entry for a buy' });
      if (tp && tp <= entry) return res.status(400).json({ error: 'Take profit must be above entry for a buy' });
    } else {
      if (sl && sl <= entry) return res.status(400).json({ error: 'Stop loss must be above entry for a sell' });
      if (tp && tp >= entry) return res.status(400).json({ error: 'Take profit must be below entry for a sell' });
    }

    // Curriculum rule: leverage capped at 1:30 until user is at L3+
    const ulv = await db.query('SELECT current_level FROM user_levels WHERE user_id=$1', [req.user.id]);
    const userLevel = ulv.rows[0]?.current_level ?? 0;
    const maxLev = userLevel >= 3 ? pair.max_leverage : Math.min(30, pair.max_leverage);

    const margin = tm.marginRequired(pair, lots, entry, maxLev);
    if (margin > equity) {
      return res.status(400).json({ error: `Insufficient margin: need $${tm.round(margin, 2)}, equity $${tm.round(equity, 2)}` });
    }

    const orderShell = { entry_price: entry, stop_loss_price: sl, lot_size: lots };
    const risk = tm.riskPercent(pair, orderShell, equity);
    const rr = (sl && tp)
      ? tm.round(Math.abs(tp - entry) / Math.abs(entry - sl), 2)
      : null;

    const client = await db.connect();
    let order;
    try {
      await client.query('BEGIN');
      const r = await client.query(
        `INSERT INTO sandbox_orders
         (user_id, sandbox_account_id, pair_id, order_type, order_side, order_status,
          lot_size, entry_price, stop_loss_price, take_profit_price, trailing_stop_pips, risk_percent,
          risk_reward_ratio, margin_used, pip_value, filled_at, journal_entry)
         VALUES ($1,$2,$3,$4,$5,$6,$7,$8,$9,$10,$11,$12,$13,$14,$15,$16,$17)
         RETURNING *`,
        [req.user.id, account.id, pair.id, type, side, status, lots, entry,
         sl, tp, trailing_stop_pips || null, risk, rr, margin,
         tm.round(tm.pipValueUsd(pair, lots, entry), 4),
         status === 'filled' ? new Date() : null, journal_entry || null]
      );
      order = r.rows[0];
      // reserve margin for filled orders immediately
      if (status === 'filled') {
        await client.query(
          'UPDATE sandbox_accounts SET balance_usd = balance_usd - $1, updated_at=NOW() WHERE id=$2',
          [margin, account.id]
        );
      }
      await client.query('COMMIT');
    } catch (e) {
      await client.query('ROLLBACK');
      throw e;
    } finally {
      client.release();
    }

    // Curriculum warnings: surfaced to the app but don't block execution
    const warnings = [];
    if (risk !== null && risk > 1) {
      warnings.push({ code: 'RISK_OVER_1PCT', message: `This trade risks ${risk}% of your account. The 1% rule says never risk more than 1%.` });
    }
    if (!sl) warnings.push({ code: 'NO_STOP_LOSS', message: 'No stop loss set. Beginners should always trade with a stop loss.' });
    if (symbol === 'XAU/USD' && lots > 0.05) {
      warnings.push({ code: 'GOLD_SIZE', message: 'Gold moves 2-3x more than forex pairs. Use half the lot size you would on EUR/USD.' });
    }

    res.status(201).json({ order: { ...order, symbol }, margin_used: margin, risk_percent: risk, warnings });
  } catch (e) {
    console.error('placeOrder:', e);
    res.status(500).json({ error: 'Failed to place order' });
  }
};

const closeOrderEndpoint = async (req, res) => {
  try {
    await syncOrders(req.user.id);
    const r = await db.query(
      `SELECT o.*, p.symbol, p.pip_location, p.lot_size AS contract, p.base_currency, p.quote_currency, p.spread_pips, p.max_leverage
       FROM sandbox_orders o JOIN trading_pairs p ON p.id = o.pair_id
       WHERE o.id = $1 AND o.user_id = $2`,
      [req.params.id, req.user.id]
    );
    const order = r.rows[0];
    if (!order) return res.status(404).json({ error: 'Order not found' });
    if (order.order_status !== 'filled') {
      return res.status(400).json({ error: `Cannot close order in status ${order.order_status}` });
    }
    const q = quoteFor(order);
    const exit = order.order_side === 'buy' ? q.bid : q.ask;
    const account = await getAccount(req.user.id);

    // partial close: ?lots=0.005 closes part of the position
    const partLots = req.body.lots ? Number(req.body.lots) : null;
    if (partLots && partLots > 0 && partLots < Number(order.lot_size)) {
      const frac = partLots / Number(order.lot_size);
      const pl = tm.profitLossUsd(pairFromRow(order), order, exit);
      const plUsd = tm.round(pl.usd * frac, 2);
      const plPips = pl.pips;
      const marginPart = tm.round(Number(order.margin_used) * frac, 2);
      const client = await db.connect();
      try {
        await client.query('BEGIN');
        // shrink the open order
        await client.query(
          `UPDATE sandbox_orders SET lot_size = lot_size - $1, margin_used = margin_used - $2, updated_at=NOW() WHERE id=$3`,
          [partLots, marginPart, order.id]
        );
        // record the partial close as its own closed order row
        await client.query(
          `INSERT INTO sandbox_orders
           (user_id, sandbox_account_id, pair_id, order_type, order_side, order_status,
            lot_size, entry_price, stop_loss_price, take_profit_price, margin_used, pip_value,
            filled_at, closed_at, close_price, profit_loss, profit_loss_pips, journal_entry)
           VALUES ($1,$2,$3,$4,$5,'closed',$6,$7,$8,$9,$10,$11,$12,NOW(),$13,$14,$15,$16)`,
          [order.user_id, order.sandbox_account_id, order.pair_id, order.order_type, order.order_side,
           partLots, order.entry_price, order.stop_loss_price, order.take_profit_price,
           marginPart, order.pip_value, order.filled_at, exit, plUsd, plPips, order.journal_entry]
        );
        await client.query(
          'UPDATE sandbox_accounts SET balance_usd = balance_usd + $1, updated_at=NOW() WHERE id=$2',
          [plUsd + marginPart, order.sandbox_account_id]
        );
        await client.query('COMMIT');
      } catch (e) {
        await client.query('ROLLBACK');
        throw e;
      } finally {
        client.release();
      }
      return res.json({ message: 'Partial close', closed_lots: partLots, remaining_lots: Number(order.lot_size) - partLots, close_price: exit, profit_loss: plUsd });
    }

    const pl = await closeOrder(order, exit, account);
    res.json({ message: 'Order closed', close_price: exit, profit_loss: pl.usd, profit_loss_pips: pl.pips });
  } catch (e) {
    console.error('closeOrder:', e);
    res.status(500).json({ error: 'Failed to close order' });
  }
};

const cancelOrder = async (req, res) => {
  try {
    const r = await db.query(
      `UPDATE sandbox_orders SET order_status='cancelled', updated_at=NOW()
       WHERE id=$1 AND user_id=$2 AND order_status='pending' RETURNING *`,
      [req.params.id, req.user.id]
    );
    if (r.rows.length === 0) {
      return res.status(400).json({ error: 'Order not found or not pending' });
    }
    res.json({ message: 'Order cancelled', order: r.rows[0] });
  } catch (e) {
    console.error('cancelOrder:', e);
    res.status(500).json({ error: 'Failed to cancel order' });
  }
};

// ---- market replay ------------------------------------------------------

const getReplayDatasets = async (req, res) => {
  const r = await db.query('SELECT * FROM market_replay_datasets WHERE is_active=true ORDER BY name');
  res.json({ datasets: r.rows });
};

/**
 * GET /simulator/replay/:datasetId/candles?offset=N
 * Returns a window of synthetic candles determined by dataset+offset so
 * stepping forward is reproducible within a session.
 */
const getReplayCandles = async (req, res) => {
  const ds = await db.query('SELECT * FROM market_replay_datasets WHERE id=$1', [req.params.datasetId]);
  if (!ds.rows[0]) return res.status(404).json({ error: 'Dataset not found' });
  const dataset = ds.rows[0];
  const offset = Math.max(0, parseInt(req.query.offset) || 0);
  const seedBase = parseInt(dataset.id.replace(/-/g, '').slice(0, 8), 16);
  // generate a longer candle series from the dataset seed, return window [offset, offset+60)
  const all = feed.getCandles(dataset.symbol, 200 + offset, 5);
  const total = all.length;
  const window = all.slice(Math.max(0, total - 60 - offset), total - offset);
  res.json({ dataset: { id: dataset.id, name: dataset.name, symbol: dataset.symbol }, candles: window, offset, has_more: offset + 60 < 200 });
};

// ---- journal ---------------------------------------------------------------

const getJournal = async (req, res) => {
  try {
    const r = await db.query(
      `SELECT o.*, p.symbol FROM sandbox_orders o
       JOIN trading_pairs p ON p.id = o.pair_id
       WHERE o.user_id=$1 AND o.order_status='closed'
       ORDER BY o.closed_at DESC LIMIT 100`,
      [req.user.id]
    );
    res.json({ trades: r.rows });
  } catch (e) {
    console.error('getJournal:', e);
    res.status(500).json({ error: 'Failed to load journal' });
  }
};

// PATCH /orders/:id — update SL/TP (from chart drag)
const updateOrder = async (req, res) => {
  const { stop_loss_price, take_profit_price } = req.body;
  const r = await db.query(
    `UPDATE sandbox_orders SET
       stop_loss_price = COALESCE($2, stop_loss_price),
       take_profit_price = COALESCE($3, take_profit_price),
       updated_at = NOW()
     WHERE id=$1 AND user_id=$4 AND order_status='open' RETURNING *`,
    [req.params.id, stop_loss_price ?? null, take_profit_price ?? null, req.user.id]
  );
  if (!r.rows[0]) return res.status(404).json({ error: 'Open order not found' });
  res.json({ order: r.rows[0] });
};

module.exports = {
  getPairs, getPrice, getCandles, getAccountSummary,
  getOrders, placeOrder, closeOrderEndpoint, cancelOrder, getJournal, updateOrder,
  getReplayDatasets, getReplayCandles,
};
