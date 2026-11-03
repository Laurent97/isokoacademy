const express = require('express');
const router = express.Router();
const ctrl = require('../controllers/aiController');
const { auth } = require('../middleware/auth');

router.use(auth);

router.get('/usage', ctrl.getUsage);
router.post('/explain', ctrl.explain);
router.post('/trade-review', ctrl.tradeReview);
router.post('/study-plan', ctrl.studyPlan);
router.post('/chat', ctrl.chat);
router.post('/suggest-sltp', ctrl.suggestSltp);
router.post('/mistakes-report', ctrl.mistakesReport);

module.exports = router;
