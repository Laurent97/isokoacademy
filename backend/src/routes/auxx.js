const express = require('express');
const router = express.Router();
const ctrl = require('../controllers/auxxController');
const { auth } = require('../middleware/auth');

router.use(auth);

router.get('/wallet', ctrl.getWallet);
router.get('/ledger', ctrl.getLedger);
router.post('/purchase', ctrl.purchaseAuxx);
router.post('/refill-sandbox', ctrl.refillSandbox);

module.exports = router;
