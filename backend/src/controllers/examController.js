const db = require('../database/db');
const { updateReadiness } = require('../services/readiness');
const { drawQuestions, shuffledIndices, isExamAnswerCorrect, examAccess } = require('../utils/quiz');

const MCQ_COUNT = 10; // questions drawn per exam from the 20-question bank

async function levelById(levelId) {
  const r = await db.query('SELECT * FROM levels WHERE id=$1', [levelId]);
  return r.rows[0];
}

/** Whether this user may take this level's exam: level unlocked + all its lessons completed. */
async function examAccessFor(userId, level) {
  const ul = await db.query('SELECT unlocked_levels FROM user_levels WHERE user_id=$1', [userId]);
  const ls = await db.query(
    `SELECT l.id, p.status FROM lessons l
     LEFT JOIN user_progress p ON p.lesson_id=l.id AND p.user_id=$1
     WHERE l.level_id=$2 AND l.state='published'`,
    [userId, level.id]
  );
  const lessonsTotal = ls.rows.length;
  const lessonsCompleted = ls.rows.filter(r => r.status === 'completed').length;
  return {
    ...examAccess({
      levelNumber: level.level_number,
      unlockedLevels: ul.rows[0]?.unlocked_levels || [0],
      lessonsCompleted, lessonsTotal,
    }),
    lessonsCompleted, lessonsTotal,
  };
}

/** GET /exams/:levelId/eligibility */
const getEligibility = async (req, res) => {
  try {
    const level = await levelById(req.params.levelId);
    if (!level) return res.status(404).json({ error: 'Level not found' });

    const attempts = await db.query(
      `SELECT * FROM exam_attempts
       WHERE user_id=$1 AND level_id=$2 AND exam_type='mcq'
       ORDER BY started_at DESC`,
      [req.user.id, level.id]
    );

    const now = Date.now();
    const windowStart = now - level.exam_cooldown_hours * 3600e3;
    const recent = attempts.rows.filter(a => new Date(a.started_at).getTime() > windowStart);
    const lastAttempt = attempts.rows[0];
    const passed = attempts.rows.some(a => a.status === 'passed');

    let cooldownUntil = null;
    if (lastAttempt && lastAttempt.status === 'failed') {
      const until = new Date(lastAttempt.started_at).getTime() + level.exam_cooldown_hours * 3600e3;
      if (until > now) cooldownUntil = new Date(until).toISOString();
    }

    const inProgress = attempts.rows.find(a => a.status === 'in_progress');
    const gate = await examAccessFor(req.user.id, level);

    res.json({
      level: { id: level.id, level_number: level.level_number, pass_mark: level.exam_pass_mark, time_limit_minutes: level.exam_time_limit_minutes },
      attempts_used: recent.length,
      max_attempts: level.exam_max_attempts,
      passed,
      cooldown_until: cooldownUntil,
      level_unlocked: gate.levelUnlocked,
      lessons_completed: gate.lessonsCompleted,
      lessons_total: gate.lessonsTotal,
      can_start: gate.allowed && !passed && !cooldownUntil && recent.length < level.exam_max_attempts,
      in_progress_attempt_id: inProgress?.id || null,
    });
  } catch (e) {
    console.error('getEligibility:', e);
    res.status(500).json({ error: 'Failed to check eligibility' });
  }
};

/** POST /exams/:levelId/start - draw random questions, create attempt */
const startExam = async (req, res) => {
  try {
    const level = await levelById(req.params.levelId);
    if (!level) return res.status(404).json({ error: 'Level not found' });

    // reuse in-progress attempt if present
    const existing = await db.query(
      `SELECT id, answers FROM exam_attempts
       WHERE user_id=$1 AND level_id=$2 AND exam_type='mcq' AND status='in_progress'
       ORDER BY started_at DESC LIMIT 1`,
      [req.user.id, level.id]
    );

    const bank = await db.query(
      `SELECT id, question_en, question_rw, options_en, options_rw
       FROM mcq_question_banks WHERE level_id=$1`,
      [level.id]
    );
    if (bank.rows.length === 0) {
      return res.status(404).json({ error: 'No questions for this level' });
    }

    let attemptId;
    let questionIds;
    let perm = {}; // qid -> shuffled order of original option indices

    if (existing.rows.length > 0) {
      attemptId = existing.rows[0].id;
      questionIds = existing.rows[0].answers?.question_ids || [];
      perm = existing.rows[0].answers?.perm || {};
    } else {
      // eligibility check
      const cutoff = new Date(Date.now() - level.exam_cooldown_hours * 3600e3);
      const recent = await db.query(
        `SELECT COUNT(*)::int AS n FROM exam_attempts
         WHERE user_id=$1 AND level_id=$2 AND exam_type='mcq'
         AND started_at > $3`,
        [req.user.id, level.id, cutoff]
      );
      if (recent.rows[0].n >= level.exam_max_attempts) {
        return res.status(429).json({ error: 'Max attempts reached. Wait for the cooldown.' });
      }

      // exam must match the user's level: unlocked + all its lessons studied
      const gate = await examAccessFor(req.user.id, level);
      if (!gate.levelUnlocked) {
        return res.status(403).json({ error: 'This level is locked for your account.' });
      }
      if (!gate.lessonsDone) {
        return res.status(403).json({
          error: 'Complete all lessons in this level before the exam.',
          lessons_completed: gate.lessonsCompleted,
          lessons_total: gate.lessonsTotal,
        });
      }

      // prefer questions not served on the last couple of attempts
      const served = await db.query(
        `SELECT answers->'question_ids' AS qids FROM exam_attempts
         WHERE user_id=$1 AND level_id=$2 AND exam_type='mcq' AND status <> 'in_progress'
         ORDER BY started_at DESC LIMIT 2`,
        [req.user.id, level.id]
      );
      const seenIds = new Set(served.rows.flatMap(r => r.qids || []));
      const selected = drawQuestions(bank.rows, seenIds, Math.min(MCQ_COUNT, bank.rows.length));
      questionIds = selected.map(q => q.id);

      // per-question option permutation so the correct answer isn't always first
      for (const q of selected) {
        perm[q.id] = shuffledIndices((q.options_en || []).length);
      }

      const att = await db.query(
        `INSERT INTO exam_attempts (user_id, level_id, exam_type, status, answers)
         VALUES ($1,$2,'mcq','in_progress',$3) RETURNING id`,
        [req.user.id, level.id, JSON.stringify({ question_ids: questionIds, responses: {}, perm })]
      );
      attemptId = att.rows[0].id;
    }

    // apply stored option permutation, preserving the drawn question order
    const byId = new Map(bank.rows.map(q => [q.id, q]));
    const questions = questionIds.map(id => {
      const q = byId.get(id);
      if (!q) return null;
      const en = q.options_en || [];
      const rw = q.options_rw || [];
      const order = perm[id] || en.map((_, i) => i);
      return {
        ...q,
        options_en: order.map(i => en[i]),
        options_rw: rw.length === en.length ? order.map(i => rw[i]) : rw,
      };
    }).filter(Boolean);

    res.json({
      attempt_id: attemptId,
      time_limit_minutes: level.exam_time_limit_minutes,
      pass_mark: level.exam_pass_mark,
      questions,
    });
  } catch (e) {
    console.error('startExam:', e);
    res.status(500).json({ error: 'Failed to start exam' });
  }
};

/** POST /exams/:levelId/submit - { attempt_id, responses: {qid: index}, time_taken_seconds } */
const submitExam = async (req, res) => {
  try {
    const { attempt_id, responses = {}, time_taken_seconds } = req.body;
    const att = await db.query(
      `SELECT * FROM exam_attempts WHERE id=$1 AND user_id=$2 AND status='in_progress'`,
      [attempt_id, req.user.id]
    );
    if (att.rows.length === 0) {
      return res.status(404).json({ error: 'Attempt not found or already submitted' });
    }
    const attempt = att.rows[0];
    const level = await levelById(attempt.level_id);

    const questionIds = attempt.answers?.question_ids || [];
    const bankAll = await db.query(
      `SELECT id, correct_index, options_en, options_rw, explanation_en, explanation_rw
       FROM mcq_question_banks WHERE level_id=$1`,
      [attempt.level_id]
    );
    const qSet = new Set(questionIds);
    const bank = { rows: bankAll.rows.filter(q => qSet.has(q.id)) };
    const perm = attempt.answers?.perm || {};

    let correct = 0;
    const detail = bank.rows.map(q => {
      // index answers are mapped back through the stored shuffle;
      // string answers are compared to the correct option's text
      const ok = isExamAnswerCorrect(responses[q.id], q, perm);
      if (ok) correct++;
      return { question_id: q.id, correct: ok, chosen: responses[q.id],
               explanation_en: q.explanation_en, explanation_rw: q.explanation_rw };
    });

    const score = bank.rows.length ? (correct / bank.rows.length) * 100 : 0;
    const passed = score >= level.exam_pass_mark;

    await db.query(
      `UPDATE exam_attempts
       SET status=$1, score=$2, completed_at=NOW(), time_taken_seconds=$3,
           answers=$4
       WHERE id=$5`,
      [passed ? 'passed' : 'failed', Math.round(score * 100) / 100,
       time_taken_seconds || null,
       JSON.stringify({ question_ids: questionIds, responses }), attempt_id]
    );

    if (passed) {
      // unlock next level + issue certificate
      const ul = await db.query('SELECT current_level, unlocked_levels FROM user_levels WHERE user_id=$1', [req.user.id]);
      const unlocked = new Set(ul.rows[0]?.unlocked_levels || [0]);
      unlocked.add(level.level_number + 1);
      await db.query(
        `UPDATE user_levels
         SET current_level = GREATEST(current_level, $1),
             unlocked_levels = $2,
             updated_at = NOW()
         WHERE user_id = $3`,
        [level.level_number + 1, [...unlocked].sort((a, b) => a - b), req.user.id]
      );
      // issue the full professional certificate (SVG + QR + verify page)
      try {
        await require('../services/certificate').issue(db, {
          userId: req.user.id, levelId: level.id, score,
        });
      } catch (ce) { console.error('cert issue:', ce); }
    }
    await updateReadiness(req.user.id);

    res.json({ passed, score: Math.round(score * 100) / 100, pass_mark: level.exam_pass_mark, correct, total: bank.rows.length, detail });
  } catch (e) {
    console.error('submitExam:', e);
    res.status(500).json({ error: 'Failed to submit exam' });
  }
};

/** GET /exams/:levelId/attempts - history */
const getAttempts = async (req, res) => {
  try {
    const r = await db.query(
      `SELECT id, exam_type, status, score, started_at, completed_at, time_taken_seconds
       FROM exam_attempts WHERE user_id=$1 AND level_id=$2
       ORDER BY started_at DESC`,
      [req.user.id, req.params.levelId]
    );
    res.json({ attempts: r.rows });
  } catch (e) {
    console.error('getAttempts:', e);
    res.status(500).json({ error: 'Failed to load attempts' });
  }
};

/** GET /exams/:levelId/practical - tasks for a level */
const getPracticalTasks = async (req, res) => {
  try {
    const r = await db.query(
      `SELECT id, task_number, prompt_en, prompt_rw, pass_threshold, time_limit_minutes
       FROM practical_exam_tasks WHERE level_id=$1 ORDER BY task_number`,
      [req.params.levelId]
    );
    res.json({ tasks: r.rows });
  } catch (e) {
    console.error('getPracticalTasks:', e);
    res.status(500).json({ error: 'Failed to load tasks' });
  }
};

/**
 * POST /exams/practical/:taskId/submit
 * body: { order_id, quiz_answer? } - grades an actual sandbox order + optional answer
 * Rubric check types: equals_value, has_field, pips_moved, chart_opened, quiz_answer
 */
const submitPractical = async (req, res) => {
  try {
    const task = await db.query('SELECT * FROM practical_exam_tasks WHERE id=$1', [req.params.taskId]);
    if (task.rows.length === 0) return res.status(404).json({ error: 'Task not found' });
    const t = task.rows[0];
    const rubric = t.rubric;

    // same gate as the MCQ exam: level unlocked + its lessons completed
    const level = await levelById(t.level_id);
    if (level) {
      const gate = await examAccessFor(req.user.id, level);
      if (!gate.levelUnlocked) {
        return res.status(403).json({ error: 'This level is locked for your account.' });
      }
      if (!gate.lessonsDone) {
        return res.status(403).json({
          error: 'Complete all lessons in this level before the exam.',
          lessons_completed: gate.lessonsCompleted,
          lessons_total: gate.lessonsTotal,
        });
      }
    }

    const { order_id, quiz_answer } = req.body;
    let order = null;
    if (order_id) {
      const or = await db.query(
        `SELECT o.*, p.symbol FROM sandbox_orders o JOIN trading_pairs p ON p.id=o.pair_id
         WHERE o.id=$1 AND o.user_id=$2`,
        [order_id, req.user.id]
      );
      order = or.rows[0] || null;
    }

    const checks = (rubric.checks || []).map(c => {
      let pass = false;
      switch (c.type) {
        case 'equals_value':
          pass = order && Number(order[c.field]) === Number(c.value) || (order && order[c.field] === c.value);
          break;
        case 'has_field':
          pass = !!(order && order[c.field] != null);
          break;
        case 'risk_range':
          pass = !!(order && Number(order[c.field]) >= c.min && Number(order[c.field]) <= c.max);
          break;
        case 'pips_moved':
          // "in your favor": profit_loss_pips is direction-aware, so a loss must not count
          pass = !!(order && Number(order.profit_loss_pips || 0) >= c.min);
          break;
        case 'chart_opened':
          pass = !!(order && order.symbol === c.symbol) || !!req.body.chart_opened;
          break;
        case 'quiz_answer':
          pass = String(quiz_answer).trim() === String(c.correct_answer);
          break;
        default:
          pass = false;
      }
      return { ...c, pass };
    });

    const score = checks.reduce((s, c) => s + (c.pass ? c.weight : 0), 0);
    const passed = score >= Number(t.pass_threshold);

    await db.query(
      `INSERT INTO exam_attempts (user_id, level_id, exam_type, task_id, status, score, completed_at, answers, feedback)
       VALUES ($1,$2,'practical',$3,$4,$5,NOW(),$6,$7)`,
      [req.user.id, t.level_id, t.id, passed ? 'passed' : 'failed',
       Math.round(score * 100) / 100,
       JSON.stringify({ order_id, quiz_answer }),
       JSON.stringify({ checks })]
    );
    await updateReadiness(req.user.id);

    res.json({ passed, score: Math.round(score * 100) / 100, pass_threshold: Number(t.pass_threshold), checks });
  } catch (e) {
    console.error('submitPractical:', e);
    res.status(500).json({ error: 'Failed to submit practical' });
  }
};

module.exports = { getEligibility, startExam, submitExam, getAttempts, getPracticalTasks, submitPractical };
