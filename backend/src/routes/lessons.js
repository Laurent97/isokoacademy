const express = require('express');
const router = express.Router();
const ctrl = require('../controllers/lessonController');
const { auth } = require('../middleware/auth');

router.use(auth);

router.get('/levels', ctrl.getLevels);
router.get('/level/:levelId', ctrl.getLessonsForLevel);
router.get('/glossary', ctrl.getGlossary);
router.get('/:id', ctrl.getLesson);
router.post('/:id/start', ctrl.startLesson);
router.post('/:id/complete', ctrl.completeLesson);

module.exports = router;
