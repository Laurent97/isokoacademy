const app = require('./app');
const db = require('./database/db');

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
