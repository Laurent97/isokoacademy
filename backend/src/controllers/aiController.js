const db = require('../database/db');
const crypto = require('crypto');

/**
 * AI Coach. Uses the Anthropic API when CLAUDE_API_KEY is configured;
 * otherwise falls back to deterministic educational responses so the app
 * is fully usable offline in dev.
 */

const sha256 = (s) => crypto.createHash('sha256').update(String(s)).digest('hex');

async function featureConfig(feature) {
  const r = await db.query('SELECT * FROM ai_config WHERE feature=$1', [feature]);
  return r.rows[0] || { is_enabled: false, max_calls_per_user_per_day: 20, system_prompt: '' };
}

async function dailyUsage(userId) {
  const r = await db.query(
    `SELECT calls_made, total_cost_usd FROM ai_daily_costs WHERE user_id=$1 AND date=CURRENT_DATE`,
    [userId]
  );
  return r.rows[0] || { calls_made: 0, total_cost_usd: 0 };
}

// Guardrail: responses that look like advice/signals get auto-flagged for review
const FLAG_PATTERNS = [
  /\byou should\b/i,
  /\byou must (buy|sell|trade)\b/i,
  /\b(buy|sell) now\b/i,
  /\btarget price\b/i,
  /\bwill (rise|fall|go up|go down|increase|drop) (to|by)\b/i,
  /\bguaranteed (profit|return|gain)\b/i,
  /\b\d+(\.\d+)?\s*(pips?\s+)?(profit|gain|target)\b/i,
];

function flagCheck(output) {
  for (const re of FLAG_PATTERNS) {
    const m = output.match(re);
    if (m) return `Matched "${m[0]}" in response`;
  }
  return null;
}

async function recordUsage(userId, { feature, input, output, tokens, cost }) {
  const flagReason = flagCheck(output);
  const client = await db.connect();
  try {
    await client.query('BEGIN');
    await client.query(
      `INSERT INTO ai_interactions (user_id, feature, input_hash, input_text, output_text, output_hash, tokens_used, cost_usd, is_flagged, flag_reason)
       VALUES ($1,$2,$3,$4,$5,$6,$7,$8,$9,$10)`,
      [userId, feature, sha256(input), input, output, sha256(output), tokens, cost,
       !!flagReason, flagReason]
    );
    await client.query(
      `INSERT INTO ai_daily_costs (user_id, date, calls_made, total_cost_usd)
       VALUES ($1, CURRENT_DATE, 1, $2)
       ON CONFLICT (user_id, date) DO UPDATE SET
         calls_made = ai_daily_costs.calls_made + 1,
         total_cost_usd = ai_daily_costs.total_cost_usd + $2`,
      [userId, cost]
    );
    await client.query('COMMIT');
  } catch (e) {
    await client.query('ROLLBACK');
    throw e;
  } finally {
    client.release();
  }
}

const DISCLAIMER = '\n\n_Educational only - not financial advice._';

// OpenAI-compatible provider chain: OpenAI -> Groq -> Gemini
const PROVIDERS = [
  { key: () => process.env.GROQ_API_KEY, url: 'https://api.groq.com/openai/v1/chat/completions', model: () => process.env.GROQ_MODEL || 'openai/gpt-oss-120b' },
  { key: () => process.env.GEMINI_API_KEY, url: 'https://generativelanguage.googleapis.com/v1beta/openai/chat/completions', model: () => process.env.GEMINI_MODEL || 'gemini-2.0-flash' },
  { key: () => process.env.DEEPSEEK_API_KEY, url: 'https://api.deepseek.com/v1/chat/completions', model: () => process.env.DEEPSEEK_MODEL || 'deepseek-chat' },
];

async function callClaude(systemPrompt, userText) {
  for (const p of PROVIDERS) {
    const key = p.key();
    if (!key || key.startsWith('your_')) continue;
    try {
      const resp = await fetch(p.url, {
        method: 'POST',
        headers: { 'Authorization': `Bearer ${key}`, 'Content-Type': 'application/json' },
        body: JSON.stringify({
          model: p.model(), max_tokens: 500,
          messages: [{ role: 'system', content: systemPrompt }, { role: 'user', content: userText }],
        }),
        signal: AbortSignal.timeout(15000),
      });
      if (!resp.ok) continue;
      const data = await resp.json();
      const text = data.choices?.[0]?.message?.content;
      if (text) return { text, tokens: (data.usage?.total_tokens || 0) };
    } catch (e) { /* try next provider */ }
  }
  return null;
}

function offlineCoach(feature, input) {
  // Deterministic educational fallback when no API key is configured.
  switch (feature) {
    case 'trade_reviewer':
      return `Here's a framework for reviewing this practice trade:\n\n1. Risk: Did you risk only 1-2% of your account? Check your position size against your stop loss distance.\n2. Stop loss: Was a stop loss set before entry? Never move it further away.\n3. Reason: Write down why you entered. If you can't explain it, don't take the trade.\n4. Result: Judge the trade by whether you followed your rules, not by profit or loss.\n\nIn Isoko Academy, discipline beats luck. Keep journaling every trade.` + DISCLAIMER;
    case 'study_plan':
      return `Suggested study plan:\n\n- Day 1-2: Finish remaining lessons at your current level\n- Day 3: Place 3 practice trades with a stop loss on every one (0.01 lots)\n- Day 4: Review your journal - did every trade have a plan?\n- Day 5: Take the level exam when your lessons are complete\n\nConsistency matters more than speed.` + DISCLAIMER;
    case 'lesson_explainer':
    default:
      return `Let me break that down simply:\n\n${input ? `"${input.slice(0, 200)}"` : 'This concept'} is best understood by doing, not just reading.\n\nKey idea: every trading term exists to measure or control risk. Open the simulator, find the term in action, and try it with 0.01 lots - small enough that mistakes cost nothing but teach a lot.\n\nIf a concept feels abstract, check the glossary for a one-line definition, then come back and ask me to explain it differently.` + DISCLAIMER;
  }
}

async function handleCoach(req, res, feature, buildInput) {
  try {
    const cfg = await featureConfig(feature);
    if (!cfg.is_enabled) {
      return res.status(403).json({ error: `${feature} is currently disabled` });
    }
    const usage = await dailyUsage(req.user.id);
    if (usage.calls_made >= cfg.max_calls_per_user_per_day) {
      return res.status(429).json({
        error: 'Daily AI limit reached',
        limit: cfg.max_calls_per_user_per_day,
      });
    }

    const input = await buildInput(req);
    let output, tokens = 0, cost = 0, source = 'offline';

    try {
      const claude = await callClaude(cfg.system_prompt, input);
      if (claude) {
        output = claude.text + DISCLAIMER;
        tokens = claude.tokens;
        cost = Math.min(tokens * 0.000001, Number(cfg.max_cost_per_call_usd));
        source = 'claude';
      }
    } catch (e) {
      console.warn('Claude call failed, using offline fallback:', e.message);
    }
    if (!output) {
      output = offlineCoach(feature, input);
    }

    await recordUsage(req.user.id, { feature, input, output, tokens, cost });
    res.json({ response: output, source, calls_remaining: cfg.max_calls_per_user_per_day - usage.calls_made - 1 });
  } catch (e) {
    console.error('handleCoach:', e);
    res.status(500).json({ error: 'Coach unavailable' });
  }
}

/** POST /ai/explain { text, lesson_id? } */
const explain = (req, res) =>
  handleCoach(req, res, 'lesson_explainer', (r) => {
    const ctx = r.body.lesson_title ? `Lesson: ${r.body.lesson_title}\n` : '';
    return `${ctx}Explain this trading concept in simple words: ${r.body.text || ''}`;
  });

/** POST /ai/trade-review { order_id } */
const tradeReview = (req, res) =>
  handleCoach(req, res, 'trade_reviewer', async (r) => {
    if (!r.body.order_id) return 'Review a practice trade with a stop loss and journal entry.';
    const o = await db.query(
      `SELECT o.*, p.symbol FROM sandbox_orders o JOIN trading_pairs p ON p.id=o.pair_id
       WHERE o.id=$1 AND o.user_id=$2`,
      [r.body.order_id, r.user.id]
    );
    if (o.rows.length === 0) return 'Review a practice trade with a stop loss and journal entry.';
    const t = o.rows[0];
    return `Review this ${t.order_side} trade on ${t.symbol}: ${t.lot_size} lots, entry ${t.entry_price}, SL ${t.stop_loss_price}, TP ${t.take_profit_price}, P&L ${t.profit_loss} (${t.profit_loss_pips} pips), risk ${t.risk_percent}%, journal: ${t.journal_entry || 'none'}. Give brief educational feedback on risk management.`;
  });

/** POST /ai/study-plan {} */
const studyPlan = (req, res) =>
  handleCoach(req, res, 'study_plan', () => 'Create a simple 5-day study plan for a beginner trader.');

/** POST /ai/chat { message, history? } - general coach chat */
const chat = (req, res) =>
  handleCoach(req, res, 'lesson_explainer', (r) => String(r.body.message || ''));

/**
 * POST /ai/suggest-sltp { symbol, side, entry_price?, lot_size? }
 * Deterministic SL/TP from recent swing structure (SL beyond the swing,
 * TP at 2R). The AI only explains the reasoning — numbers never come
 * from the model, so suggestions are reproducible and safe offline.
 */
const suggestSltp = async (req, res) => {
  try {
    const { symbol, side = 'buy', lot_size = 0.01 } = req.body || {};
    const isBuy = side !== 'sell';

    const cfg = await featureConfig('sltp_advisor');
    if (!cfg.is_enabled) return res.status(403).json({ error: 'sltp_advisor is currently disabled' });
    const usage = await dailyUsage(req.user.id);
    if (usage.calls_made >= cfg.max_calls_per_user_per_day) {
      return res.status(429).json({ error: 'Daily AI limit reached', limit: cfg.max_calls_per_user_per_day });
    }

    const pr = await db.query('SELECT * FROM trading_pairs WHERE symbol=$1 AND is_active=true', [symbol]);
    const pair = pr.rows[0];
    if (!pair) return res.status(400).json({ error: 'Unknown symbol' });

    const feed = require('../services/priceFeed');
    const q = feed.getQuote(symbol, Number(pair.spread_pips), Number(pair.pip_location));
    if (!q) return res.status(503).json({ error: 'No price available' });
    const entry = Number(req.body.entry_price) || (isBuy ? q.ask : q.bid);

    // SL beyond the recent swing (40 x 15m candles), buffered by 3 pips
    const candles = feed.getCandles(symbol, 40, 900);
    const pip = Math.pow(10, -Number(pair.pip_location));
    const buffer = 3 * pip;
    const swing = isBuy ? Math.min(...candles.map(c => c.l)) : Math.max(...candles.map(c => c.h));
    let riskDist = Math.abs(entry - swing) + buffer;
    const minRisk = 15 * pip, maxRisk = 60 * pip;
    riskDist = Math.min(Math.max(riskDist, minRisk), maxRisk);

    const sl = isBuy ? entry - riskDist : entry + riskDist;
    const tp = isBuy ? entry + riskDist * 2 : entry - riskDist * 2;
    const dec = Number(pair.pip_location) + 1;
    const riskPips = riskDist / pip;

    const suggestion = {
      entry_price: Number(entry.toFixed(dec)),
      stop_loss: Number(sl.toFixed(dec)),
      take_profit: Number(tp.toFixed(dec)),
      risk_pips: Number(riskPips.toFixed(1)),
      rr: 2,
      swing_level: Number(swing.toFixed(dec)),
    };

    // explanation: LLM when configured, deterministic template otherwise
    const prompt = `For an educational trading exercise on ${symbol}, a ${isBuy ? 'buy' : 'sell'} at ${suggestion.entry_price} has SL ${suggestion.stop_loss} and TP ${suggestion.take_profit} (${suggestion.risk_pips} pips risk, 1:2 reward-to-risk, SL ${isBuy ? 'below' : 'above'} swing ${isBuy ? 'low' : 'high'} ${suggestion.swing_level}). In 3 short sentences explain WHY these levels make sense pedagogically: swing protection, buffer, and R:R. No profit promises.`;
    let explanation, tokens = 0, cost = 0, source = 'offline';
    const fallback = `The stop loss sits ${isBuy ? 'below' : 'above'} the recent swing ${isBuy ? 'low' : 'high'} (${suggestion.swing_level}) — the level that would prove the trade idea wrong if price reaches it. A ${(buffer / pip).toFixed(0)}-pip buffer beyond the swing avoids being stopped by ordinary noise (${suggestion.risk_pips} pips total risk). The take profit is set at twice the risk (1:2), so one winning trade can pay for two losing ones — this is the minimum R:R most traders' plans require.`;
    try {
      const claude = await callClaude('You are an educational trading coach. Explain SL/TP placement concepts simply. Never promise profit or give signals. Always label as educational.', prompt);
      if (claude) { explanation = claude.text; tokens = claude.tokens; cost = Math.min(tokens * 0.000001, Number(cfg.max_cost_per_call_usd)); source = 'claude'; }
    } catch (e) { /* offline below */ }
    if (!explanation) explanation = fallback;
    explanation += DISCLAIMER;

    const input = `suggest-sltp ${symbol} ${side} @${suggestion.entry_price} lots=${lot_size}`;
    await recordUsage(req.user.id, { feature: 'sltp_advisor', input, output: explanation, tokens, cost });

    res.json({ ...suggestion, explanation, source, calls_remaining: cfg.max_calls_per_user_per_day - usage.calls_made - 1 });
  } catch (e) {
    console.error('suggestSltp:', e);
    res.status(500).json({ error: 'Suggestion unavailable' });
  }
};

/**
 * POST /ai/mistakes-report — deterministic analysis of closed trades:
 * finds the user's top 3 mistakes and maps each to the lesson that fixes it.
 * (No AI call needed; the report is generated from the trade log.)
 */
const mistakesReport = async (req, res) => {
  try {
    const r = await db.query(
      `SELECT o.*, p.symbol FROM sandbox_orders o JOIN trading_pairs p ON p.id=o.pair_id
       WHERE o.user_id=$1 AND o.order_status='closed' ORDER BY o.closed_at`,
      [req.user.id]
    );
    const trades = r.rows;
    const n = trades.length;
    const mistakes = [];

    if (n >= 1) {
      const noSL = trades.filter(t => !t.stop_loss_price).length;
      const overRisk = trades.filter(t => Number(t.risk_percent) > 2).length;
      const noJournal = trades.filter(t => !t.journal_entry || t.journal_entry.length <= 10).length;
      const bigLots = trades.filter(t => Number(t.lot_size) > 0.1 && t.symbol === 'XAU/USD').length;
      const losses = trades.filter(t => Number(t.profit_loss) < 0).length;

      if (noSL / n >= 0.25) mistakes.push({
        id: 'missing_stop_loss', stat: `${noSL}/${n} trades had no stop loss`,
        lesson: 'L3.3 The 1% Rule and Drawdown', fix: 'Always set a stop loss before entering.',
      });
      if (overRisk / n >= 0.2) mistakes.push({
        id: 'oversized_risk', stat: `${overRisk}/${n} trades risked more than 2%`,
        lesson: 'L3.2 Position Sizing', fix: 'Size positions so risk stays at 1-2%.',
      });
      if (noJournal / n >= 0.5) mistakes.push({
        id: 'no_journal', stat: `${noJournal}/${n} trades lack a journal entry`,
        lesson: 'L4.2 Building a Trading Plan', fix: 'Write one line on why before every trade.',
      });
      if (bigLots >= 2) mistakes.push({
        id: 'gold_oversizing', stat: `${bigLots} gold trades used >0.1 lots`,
        lesson: 'L4.2 Why Gold is More Dangerous', fix: 'Use half the lot size on gold vs forex.',
      });
      if (losses / n >= 0.8 && n >= 5) mistakes.push({
        id: 'counter_trend', stat: `${losses}/${n} trades were losses`,
        lesson: 'L2.2 Uptrends and Downtrends', fix: 'Trade with the trend, not against it.',
      });
    }

    res.json({
      trades_analyzed: n,
      mistakes: mistakes.slice(0, 3),
      message: mistakes.length === 0
        ? (n < 3 ? 'Keep trading - not enough history yet.' : 'No systematic mistakes found. Strong discipline.')
        : `Top ${Math.min(3, mistakes.length)} mistakes detected - see fix-it lessons.`,
    });
  } catch (e) {
    console.error('mistakesReport:', e);
    res.status(500).json({ error: 'Failed to build report' });
  }
};

/** GET /ai/usage */
const getUsage = async (req, res) => {
  try {
    const usage = await dailyUsage(req.user.id);
    const cfg = await featureConfig('lesson_explainer');
    res.json({
      calls_made: usage.calls_made,
      daily_limit: cfg.max_calls_per_user_per_day,
      calls_remaining: Math.max(0, cfg.max_calls_per_user_per_day - usage.calls_made),
      claude_enabled: !!(process.env.CLAUDE_API_KEY && !process.env.CLAUDE_API_KEY.startsWith('your_')),
    });
  } catch (e) {
    console.error('getUsage:', e);
    res.status(500).json({ error: 'Failed to load usage' });
  }
};

module.exports = { explain, tradeReview, studyPlan, chat, getUsage, mistakesReport, suggestSltp };
