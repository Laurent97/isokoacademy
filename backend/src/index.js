require('dotenv').config();
const express = require('express');
const cors = require('cors');
const helmet = require('helmet');
const rateLimit = require('express-rate-limit');
const path = require('path');
const db = require('./database/db');

const authRoutes = require('./routes/auth');
const userRoutes = require('./routes/users');
const lessonRoutes = require('./routes/lessons');
const simulatorRoutes = require('./routes/simulator');
const examRoutes = require('./routes/exams');
const auxxRoutes = require('./routes/auxx');
const aiRoutes = require('./routes/ai');
const adminRoutes = require('./routes/admin');

const app = express();

// Security middleware
app.use(helmet({ frameguard: false, contentSecurityPolicy: {
  directives: {
    ...helmet.contentSecurityPolicy.getDefaultDirectives(),
    'frame-ancestors': ["'self'", 'http://localhost:8081', 'https://*.devin.ai', 'http://127.0.0.1:*'],
    'frame-src': ["'self'", 'https://unpkg.com'],
    'script-src': ["'self'", "'unsafe-inline'", 'https://unpkg.com'],
  },
} }));

// CORS - permissive in dev, restricted to configured origins in prod
const allowedOrigins = [
  process.env.FRONTEND_URL,
  process.env.ADMIN_URL,
  'http://localhost:19006',
  'http://localhost:8081',
  'http://localhost:3001',
  'http://localhost:5173',
].filter(Boolean);
app.use(cors({
  origin: process.env.NODE_ENV === 'production' ? allowedOrigins : true,
  credentials: true
}));

// Rate limiting
const limiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: process.env.NODE_ENV === 'production' ? 100 : 10000, // relaxed in dev since the UI polls frequently
  standardHeaders: true,
  legacyHeaders: false,
  message: { error: 'Too many requests, please try again later.' },
});
app.use(limiter);

// Body parser
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true, limit: '10mb' }));

// Root landing
app.get('/', (req, res) => {
  res.json({
    name: 'Isoko Academy API',
    status: 'running',
    admin_dashboard: '/admin',
    health: '/health',
    api: '/api',
    docs: 'See SETUP_GUIDE.md for the full route map',
  });
});

// Health check
app.get('/health', (req, res) => {
  res.json({ status: 'ok', timestamp: new Date().toISOString() });
});

// Admin dashboard (static SPA)
app.use('/admin', express.static(path.join(__dirname, '../../admin')));

// API routes
app.use('/api/auth', authRoutes);
app.use('/api/users', userRoutes);
app.use('/api/lessons', lessonRoutes);
app.use('/api/simulator', simulatorRoutes);
app.use('/api/exams', examRoutes);
app.use('/api/auxx', auxxRoutes);
app.use('/api/ai', aiRoutes);
app.use('/api/certificates', require('./routes/certificates'));

// public certificate verification
const certCtrl = require('./controllers/certController');
app.get('/verify/:code', certCtrl.verify);

// public chart data + TradingView-style chart page (market data is not sensitive)
const feed = require('./services/priceFeed');
const TF_SECONDS = { '1m': 60, '5m': 300, '15m': 900, '1h': 3600, '4h': 14400, '1d': 86400 };
app.get('/api/chart/history', (req, res) => {
  const sym = req.query.symbol || 'XAU/USD';
  const tf = TF_SECONDS[req.query.tf] || 900;
  const count = Math.min(500, parseInt(req.query.count) || 120);
  const bars = feed.getCandles(sym, count, tf).map((c) => ({
    time: Math.floor(c.t / 1000),
    open: c.o, high: c.h, low: c.l, close: c.c,
    volume: Math.floor(100 + Math.random() * 900),
  }));
  res.json({ bars });
});
// public replay data (deterministic windows from a dataset seed)
app.get('/api/chart/replay', (req, res) => {
  const seed = (parseInt(req.query.seed, 36) || 7) * 997;
  const sym = req.query.symbol || 'XAU/USD';
  const n = Math.min(300, parseInt(req.query.count) || 150);
  const bars = feed.getCandles(sym, 500, 60).slice(0, n);
  res.json({ bars: bars.map((c, i) => ({ time: Math.floor(c.t / 1000), open: c.o, high: c.h, low: c.l, close: c.c, volume: 100 + ((seed + i * 37) % 900) })), seed });
});
app.get('/api/chart/datasets', async (req, res) => {
  const db = require('./database/db');
  const r = await db.query('SELECT id,name,event_type,symbol FROM market_replay_datasets WHERE is_active=true ORDER BY name').catch(() => ({ rows: [] }));
  res.json({ datasets: r.rows });
});
app.use(express.static(path.join(__dirname, '../public')));
app.use('/api/admin', adminRoutes);

// 404 handler
app.use((req, res) => {
  res.status(404).json({ error: 'Route not found' });
});

// Error handler
app.use((err, req, res, next) => {
  console.error(err.stack);
  res.status(err.status || 500).json({
    error: err.message || 'Internal server error',
    ...(process.env.NODE_ENV === 'development' && { stack: err.stack })
  });
});

const PORT = process.env.PORT || 3000;

db.init().then(() => {
  require('./services/priceFeed').startRealPriceSync();
  app.listen(PORT, () => {
    console.log(`Isoko Academy API running on port ${PORT}`);
    console.log(`Environment: ${process.env.NODE_ENV || 'development'}`);
    if (db.isMemory) {
      console.log('Dev mode: in-memory DB, OTP code 123456 works for any phone');
    }
  });
}).catch((err) => {
  console.error('Failed to initialize database:', err);
  process.exit(1);
});

module.exports = app;
