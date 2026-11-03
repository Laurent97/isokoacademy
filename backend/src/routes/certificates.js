const router = require('express').Router();
const ctrl = require('../controllers/certController');
const { auth, requireRole } = require('../middleware/auth');

router.get('/mine', auth, ctrl.mine);
router.post('/generate', auth, ctrl.generate);
router.get('/file/:file', ctrl.serveFile);
router.post('/:code/revoke', auth, requireRole(['super_admin']), ctrl.revoke);

module.exports = router;
