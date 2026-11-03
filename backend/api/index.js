/**
 * Vercel serverless entry point.
 * The Express app itself has no load-time side effects (see src/app.js);
 * the database is initialized lazily once per warm instance and failures
 * reset so the next invocation can retry instead of being stuck.
 */
const app = require('../src/app');
const db = require('../src/database/db');
const feed = require('../src/services/priceFeed');

let ready;
let lastSync = 0;

module.exports = async (req, res) => {
  try {
    if (!ready) ready = db.init();
    await ready;
  } catch (e) {
    ready = null;
    return res.status(500).json({ error: 'Service unavailable', detail: e.message });
  }
  // intervals die between invocations — refresh real prices opportunistically
  // while a warm instance lives (fire-and-forget; synthetic feed is the fallback)
  if (Date.now() - lastSync > 30000) {
    lastSync = Date.now();
    feed.syncRealPrices().catch(() => {});
  }
  return app(req, res);
};
