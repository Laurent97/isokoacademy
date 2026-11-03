const express = require('express');
const router = express.Router();
const ctrl = require('../controllers/adminController');
const { auth, requireRole } = require('../middleware/auth');

const ADMIN = ['support', 'content_admin', 'finance', 'super_admin'];

router.use(auth, requireRole(ADMIN));

router.get('/stats', ctrl.getStats);
router.get('/users', ctrl.getUsers);
router.post('/users/:id/block', ctrl.blockUser);
router.post('/users/:id/unblock', ctrl.unblockUser);
router.post('/users/:id/reset-sandbox', ctrl.resetUserSandbox);
router.get('/content/lessons', ctrl.getContentLessons);
router.post('/lessons/:id/state', ctrl.setLessonState);
router.get('/audit', ctrl.getAuditLog);
router.get('/deposits', ctrl.getDeposits);
router.post('/deposits/:id/status', ctrl.setDepositStatus);
router.get('/ai/flagged', ctrl.getFlaggedAi);
router.get('/settings', ctrl.getSettings);
router.post('/settings', ctrl.setSettings);
router.get('/tickets', ctrl.getTickets);

module.exports = router;
