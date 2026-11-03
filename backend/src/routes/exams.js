const express = require('express');
const router = express.Router();
const ctrl = require('../controllers/examController');
const placement = require('../controllers/placementController');
const { auth } = require('../middleware/auth');

router.use(auth);

router.post('/placement/start', placement.startPlacement);
router.post('/placement/submit', placement.submitPlacement);

router.get('/:levelId/eligibility', ctrl.getEligibility);
router.get('/:levelId/attempts', ctrl.getAttempts);
router.get('/:levelId/practical', ctrl.getPracticalTasks);
router.post('/:levelId/start', ctrl.startExam);
router.post('/:levelId/submit', ctrl.submitExam);
router.post('/practical/:taskId/submit', ctrl.submitPractical);

module.exports = router;
