const express = require('express');
const router = express.Router();
const ctrl = require('../controllers/simulatorController');
const { auth } = require('../middleware/auth');

router.use(auth);

router.get('/pairs', ctrl.getPairs);
router.get('/price', ctrl.getPrice);
router.get('/candles', ctrl.getCandles);
router.get('/account', ctrl.getAccountSummary);
router.get('/orders', ctrl.getOrders);
router.get('/journal', ctrl.getJournal);
router.get('/replay/datasets', ctrl.getReplayDatasets);
router.get('/replay/:datasetId/candles', ctrl.getReplayCandles);
router.post('/orders', ctrl.placeOrder);
router.post('/orders/:id/close', ctrl.closeOrderEndpoint);
router.post('/orders/:id/cancel', ctrl.cancelOrder);
router.patch('/orders/:id', ctrl.updateOrder);

module.exports = router;
