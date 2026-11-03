const db = require('../database/db');
const { updateReadiness } = require('../services/readiness');
const { shuffle, isCorrect, presentQuiz } = require('../utils/quiz');

const XP_PER_LESSON = 50;

/** GET /lessons/levels - all levels with user progress */
const getLevels = async (req, res) => {
  try {
    const userId = req.user.id;
    const levels = await db.query(
      `SELECT id, level_number, title_en, title_rw, description_en, description_rw,
              exam_pass_mark, exam_time_limit_minutes
       FROM levels ORDER BY level_number`
    );
    const ul = await db.query('SELECT * FROM user_levels WHERE user_id=$1', [userId]);
    const unlocked = ul.rows[0]?.unlocked_levels || [0];

    const progress = await db.query(
      `SELECT lesson_id, status FROM user_progress WHERE user_id=$1`,
      [userId]
    );
    const done = new Set(progress.rows.filter(r => r.status === 'completed').map(r => r.lesson_id));

    const lessons = await db.query(
      `SELECT id, level_id FROM lessons WHERE state='published'`
    );
    const byLevel = {};
    lessons.rows.forEach(l => {
      byLevel[l.level_id] = byLevel[l.level_id] || { total: 0, completed: 0 };
      byLevel[l.level_id].total++;
      if (done.has(l.id)) byLevel[l.level_id].completed++;
    });

    // exam status per level
    const exams = await db.query(
      `SELECT level_id, status, MAX(score) AS best FROM exam_attempts
       WHERE user_id=$1 AND exam_type='mcq' GROUP BY level_id, status`,
      [userId]
    );
    const examPassed = new Set(exams.rows.filter(r => r.status === 'passed').map(r => r.level_id));

    res.json({
      levels: levels.rows.map(l => ({
        ...l,
        unlocked: unlocked.includes(l.level_number),
        lessons_total: byLevel[l.id]?.total || 0,
        lessons_completed: byLevel[l.id]?.completed || 0,
        exam_passed: examPassed.has(l.id),
      })),
      current_level: ul.rows[0]?.current_level ?? 0,
      total_xp: ul.rows[0]?.total_xp ?? 0,
      readiness_score: ul.rows[0]?.readiness_score ?? 0,
      readiness_streak_days: ul.rows[0]?.readiness_streak_days ?? 0,
      broker_ready: ul.rows[0]?.broker_ready ?? false,
    });
  } catch (e) {
    console.error('getLevels:', e);
    res.status(500).json({ error: 'Failed to load levels' });
  }
};

/** GET /lessons/level/:levelId - lessons in a level with user status */
const getLessonsForLevel = async (req, res) => {
  try {
    const r = await db.query(
      `SELECT l.id, l.lesson_number, l.title_en, l.title_rw, l.duration_minutes,
              p.status, p.xp_earned
       FROM lessons l
       LEFT JOIN user_progress p ON p.lesson_id = l.id AND p.user_id = $2
       WHERE l.level_id = $1 AND l.state='published'
       ORDER BY l.lesson_number`,
      [req.params.levelId, req.user.id]
    );
    res.json({ lessons: r.rows });
  } catch (e) {
    console.error('getLessonsForLevel:', e);
    res.status(500).json({ error: 'Failed to load lessons' });
  }
};

/** GET /lessons/:id - lesson detail + quizzes (without answers) */
const getLesson = async (req, res) => {
  try {
    const r = await db.query(
      `SELECT id, level_id, lesson_number, title_en, title_rw, content_en, content_rw,
              animation_url, diagram_url, duration_minutes
       FROM lessons WHERE id=$1 AND state='published'`,
      [req.params.id]
    );
    if (r.rows.length === 0) return res.status(404).json({ error: 'Lesson not found' });

    const quiz = await db.query(
      `SELECT id, question_en, question_rw, options_en, options_rw, order_index
       FROM lesson_quizzes WHERE lesson_id=$1 ORDER BY order_index`,
      [req.params.id]
    );
    const progress = await db.query(
      'SELECT status FROM user_progress WHERE user_id=$1 AND lesson_id=$2',
      [req.user.id, req.params.id]
    );
    res.json({
      lesson: r.rows[0],
      // shuffle question order and each question's options so the correct
      // answer position is unpredictable (all seeds have correct_index = 0)
      quizzes: shuffle(quiz.rows).map(presentQuiz),
      status: progress.rows[0]?.status || 'locked',
    });
  } catch (e) {
    console.error('getLesson:', e);
    res.status(500).json({ error: 'Failed to load lesson' });
  }
};

/** POST /lessons/:id/start */
const startLesson = async (req, res) => {
  try {
    // derive the level from the lesson, not the client — a wrong/missing
    // client value would create a second progress row for the same lesson
    const lvl = await db.query(
      `SELECT v.level_number FROM lessons l JOIN levels v ON v.id=l.level_id WHERE l.id=$1`,
      [req.params.id]
    );
    if (lvl.rows.length === 0) return res.status(404).json({ error: 'Lesson not found' });
    await db.query(
      `INSERT INTO user_progress (user_id, level, lesson_id, status, started_at)
       VALUES ($1, $2, $3, 'in_progress', NOW())
       ON CONFLICT (user_id, level, lesson_id) DO UPDATE SET status='in_progress'`,
      [req.user.id, lvl.rows[0].level_number, req.params.id]
    );
    res.json({ message: 'Lesson started' });
  } catch (e) {
    console.error('startLesson:', e);
    res.status(500).json({ error: 'Failed to start lesson' });
  }
};

/**
 * POST /lessons/:id/complete
 * body: { answers: { quiz_id: chosen_option_text | chosen_index } }
 * Pass = >=2/3 correct. Awards XP, marks completed, maybe unlocks next lesson.
 */
const completeLesson = async (req, res) => {
  try {
    const userId = req.user.id;
    const lessonId = req.params.id;
    const answers = req.body.answers || {};

    const quiz = await db.query(
      'SELECT id, correct_index, options_en, options_rw, explanation_en, explanation_rw FROM lesson_quizzes WHERE lesson_id=$1',
      [lessonId]
    );
    if (quiz.rows.length === 0) {
      return res.status(400).json({ error: 'Lesson has no quiz' });
    }

    let correct = 0;
    const results = quiz.rows.map(q => {
      const chosen = answers[q.id];
      const ok = isCorrect(chosen, q);
      if (ok) correct++;
      return {
        quiz_id: q.id,
        chosen,
        correct: ok,
        explanation_en: q.explanation_en,
        explanation_rw: q.explanation_rw,
      };
    });

    const passMark = Math.ceil(quiz.rows.length * (2 / 3));
    const passed = correct >= passMark;
    const xp = passed ? XP_PER_LESSON : 0;

    const lesson = await db.query('SELECT level_id FROM lessons WHERE id=$1', [lessonId]);
    const levelId = lesson.rows[0]?.level_id;
    const lvl = await db.query('SELECT level_number FROM levels WHERE id=$1', [levelId]);
    const levelNumber = lvl.rows[0]?.level_number ?? 0;

    if (passed) {
      await db.query(
        `INSERT INTO user_progress (user_id, level, lesson_id, status, started_at, completed_at, xp_earned)
         VALUES ($1, $2, $3, 'completed', NOW(), NOW(), $4)
         ON CONFLICT (user_id, level, lesson_id)
         DO UPDATE SET status='completed', completed_at=NOW(), xp_earned=$4`,
        [userId, levelNumber, lessonId, xp]
      );
      await db.query(
        `UPDATE user_levels SET total_xp = total_xp + $1, updated_at=NOW() WHERE user_id=$2`,
        [xp, userId]
      );
      await updateReadiness(userId);
    }

    res.json({
      passed,
      correct,
      total: quiz.rows.length,
      xp_earned: xp,
      results,
    });
  } catch (e) {
    console.error('completeLesson:', e);
    res.status(500).json({ error: 'Failed to complete lesson' });
  }
};

/** GET /lessons/glossary + /glossary/:term */
const getGlossary = async (req, res) => {
  try {
    const search = req.query.q;
    let sql = 'SELECT id, term, definition_en, definition_rw, category FROM glossary';
    const params = [];
    if (search) {
      params.push(`%${search.toLowerCase()}%`);
      sql += ' WHERE LOWER(term) LIKE $1';
    }
    sql += ' ORDER BY term';
    const r = await db.query(sql, params);
    res.json({ terms: r.rows });
  } catch (e) {
    console.error('getGlossary:', e);
    res.status(500).json({ error: 'Failed to load glossary' });
  }
};

module.exports = { getLevels, getLessonsForLevel, getLesson, startLesson, completeLesson, getGlossary };
