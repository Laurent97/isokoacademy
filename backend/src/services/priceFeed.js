/**
 * Simulated market price feed for the sandbox simulator.
 *
 * Generates a deterministic-but-drifting random walk per symbol so the
 * app works fully offline. Prices update every "tick" (1s buckets):
 * the same tick always yields the same price, so chart and orders agree.
 */

const SYMBOLS = {
  'XAU/USD': { base: 2350.0, volatility: 0.0008, decimals: 2 },
  'EUR/USD': { base: 1.0850, volatility: 0.0004, decimals: 5 },
  'GBP/USD': { base: 1.2720, volatility: 0.0004, decimals: 5 },
  'USD/JPY': { base: 151.40, volatility: 0.0005, decimals: 3 },
  'USD/RWF': { base: 1300.0, volatility: 0.0002, decimals: 2 },
};

// Per-symbol random walk state
const state = {};
for (const [sym, cfg] of Object.entries(SYMBOLS)) {
  state[sym] = { price: cfg.base, lastTick: 0 };
}

// Seeded pseudo-random from tick + symbol hash -> reproducible within a tick
function seededRand(symbol, tick, salt) {
  let h = 2166136261;
  const s = `${symbol}|${tick}|${salt}`;
  for (let i = 0; i < s.length; i++) {
    h ^= s.charCodeAt(i);
    h = Math.imul(h, 16777619);
  }
  // xorshift-ish output in [-1, 1]
  h ^= h >>> 13; h = Math.imul(h, 0x5bd1e995); h ^= h >>> 15;
  return ((h >>> 0) / 4294967295) * 2 - 1;
}

function currentTick() {
  return Math.floor(Date.now() / 1000);
}

/**
 * Advance the walk for a symbol up to the current tick.
 * Each missed tick applies one step so catching up is realistic.
 */
function advance(symbol, toTick) {
  const s = state[symbol];
  const cfg = SYMBOLS[symbol];
  if (!s || !cfg) return null;
  let t = s.lastTick || toTick - 1;
  // Catch up, but cap the loop for long absences
  const steps = Math.min(toTick - t, 3600);
  for (let i = 0; i < steps; i++) {
    const tick = t + i + 1;
    const drift = seededRand(symbol, tick, 'd') * cfg.volatility;
    const wave = Math.sin(tick / 90) * cfg.volatility * 0.4;
    s.price = s.price * (1 + drift + wave * 0.1);
  }
  s.lastTick = toTick;
  return s.price;
}

// ---- real provider (Twelve Data) with synthetic fallback -----------------
// Set TWELVE_DATA_API_KEY in .env to enable live prices. Cached 5s/symbol.
const realCache = {};
const TD_ENABLED = !!(process.env.TWELVE_DATA_API_KEY && !process.env.TWELVE_DATA_API_KEY.startsWith('your_'));

async function fetchRealPrice(symbol) {
  const hit = realCache[symbol];
  if (hit && Date.now() - hit.t < 5000) return hit.p;
  try {
    const sym = symbol.replace('/', '/');
    const r = await fetch(
      `https://api.twelvedata.com/price?symbol=${encodeURIComponent(sym)}&apikey=${process.env.TWELVE_DATA_API_KEY}`,
      { signal: AbortSignal.timeout(4000) }
    );
    const j = await r.json();
    if (j.price) {
      const p = Number(j.price);
      realCache[symbol] = { p, t: Date.now() };
      state[symbol].price = p; // anchor the walk on real data
      return p;
    }
  } catch (e) { /* fall back to synthetic */ }
  return null;
}

const SYMBOL_MAP = { 'XAU/USD': 'XAU/USD' }; // Twelve Data uses same format

function getPrice(symbol) {
  if (!SYMBOLS[symbol]) return null;
  const price = advance(symbol, currentTick());
  const cfg = SYMBOLS[symbol];
  return Number(price.toFixed(cfg.decimals + 1));
}

/** Async price: tries real provider first (if configured), else synthetic. */
async function getLivePrice(symbol) {
  if (TD_ENABLED) {
    const real = await fetchRealPrice(symbol);
    if (real !== null) return real;
  }
  return getPrice(symbol);
}

/** Bid/ask with spread applied symmetrically */
function getQuote(symbol, spreadPips = 1, pipLocation = 4) {
  const mid = getPrice(symbol);
  if (mid === null) return null;
  const pipSize = Math.pow(10, -pipLocation);
  const half = (spreadPips * pipSize) / 2;
  return { mid, bid: mid - half, ask: mid + half };
}

/**
 * Synthetic candles for charts. Walks backwards from current price,
 * each candle = `seconds` seconds, oldest first.
 */
function getCandles(symbol, count = 50, seconds = 5) {
  if (!SYMBOLS[symbol]) return [];
  const cfg = SYMBOLS[symbol];
  const nowTick = currentTick();
  const endTick = nowTick - (nowTick % seconds);
  const candles = [];
  let close = advance(symbol, endTick);

  // build from newest to oldest then reverse
  for (let i = 0; i < count; i++) {
    const tick = endTick - i * seconds;
    const c = close;
    const o = c / (1 + seededRand(symbol, tick, 'o') * cfg.volatility);
    const hi = Math.max(o, c) * (1 + Math.abs(seededRand(symbol, tick, 'h')) * cfg.volatility * 0.5);
    const lo = Math.min(o, c) * (1 - Math.abs(seededRand(symbol, tick, 'l')) * cfg.volatility * 0.5);
    candles.unshift({
      t: tick * 1000,
      o: Number(o.toFixed(cfg.decimals + 1)),
      h: Number(hi.toFixed(cfg.decimals + 1)),
      l: Number(lo.toFixed(cfg.decimals + 1)),
      c: Number(c.toFixed(cfg.decimals + 1)),
    });
    close = o;
  }
  return candles;
}

/** Fetch real quotes for all symbols on an interval (30s). No-op without key. */
function startRealPriceSync(intervalMs = 30000) {
  if (!TD_ENABLED) return;
  const sync = () => Object.keys(SYMBOLS).forEach(s => fetchRealPrice(s));
  sync();
  setInterval(sync, intervalMs).unref();
  console.log('[feed] Real price sync enabled (Twelve Data)');
}

module.exports = { getPrice, getLivePrice, getQuote, getCandles, SYMBOLS, startRealPriceSync };
