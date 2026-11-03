const db = require('../database/db');
const { shuffle, shuffledOptions, isCorrect } = require('../utils/quiz');

/**
 * Placement test (v2 Stage 5): 10 questions drawn from L0+L1 banks.
 * Result sets starting level: >=70% overall -> unlock L0+L1 (start at L2),
 * >=70% L0 subset only -> start at L1, else start at L0.
 * Available to authenticated users who haven't passed L0 exam yet.
 */

// POST /exams/placement/start
const startPlacement = async (req, res) => {
  try {
    const banks = await db.query(
      `SELECT q.id, q.question_en, q.question_rw, q.options_en, q.options_rw, l.level_number
       FROM mcq_question_banks q JOIN levels l ON l.id = q.level_id
       WHERE l.level_number IN (0,1)`
    );
    const l0 = shuffle(banks.rows.filter(q => q.level_number === 0)).slice(0, 5);
    const l1 = shuffle(banks.rows.filter(q => q.level_number === 1)).slice(0, 5);
    const questions = shuffle([...l0, ...l1]);
    if (questions.length < 8) return res.status(503).json({ error: 'Not enough questions' });
    res.json({
      attempt_token: require('crypto').randomUUID(),
      questions: questions.map(q => ({ ...q, ...shuffledOptions(q) })),
    });
  } catch (e) {
    console.error('startPlacement:', e);
    res.status(500).json({ error: 'Failed to start placement' });
  }
};

// POST /exams/placement/submit { responses: {qid: chosen option text | idx} }
const submitPlacement = async (req, res) => {
  try {
    const responses = req.body.responses || {};
    const ids = Object.keys(responses);
    if (ids.length < 5) return res.status(400).json({ error: 'Answer all questions' });

    const banks = await db.query(
      `SELECT q.id, q.correct_index, q.options_en, q.options_rw, l.level_number, l.id AS level_id
       FROM mcq_question_banks q JOIN levels l ON l.id = q.level_id
       WHERE l.level_number IN (0,1)`
    );
    const asked = banks.rows.filter(q => ids.includes(q.id));
    let correct = 0, correctL0 = 0, totalL0 = 0;
    for (const q of asked) {
      if (isCorrect(responses[q.id], q)) {
        correct++;
        if (q.level_number === 0) correctL0++;
      }
      if (q.level_number === 0) totalL0++;
    }
    const score = Math.round((correct / asked.length) * 100);
    const l0Score = totalL0 ? (correctL0 / totalL0) * 100 : 0;

    // determine starting level
    let startLevel = 0;
    if (score >= 70) startLevel = 2;
    else if (l0Score >= 70) startLevel = 1;

    const ul = await db.query('SELECT unlocked_levels FROM user_levels WHERE user_id=$1', [req.user.id]);
    const unlocked = new Set(ul.rows[0]?.unlocked_levels || [0]);
    for (let i = 0; i <= startLevel; i++) unlocked.add(i);

    await db.query(
      `UPDATE user_levels SET current_level=$1, unlocked_levels=$2, updated_at=NOW() WHERE user_id=$3`,
      [startLevel, [...unlocked].sort((a, b) => a - b), req.user.id]
    );

    res.json({
      score, l0_score: Math.round(l0Score),
      placed_level: startLevel,
      message: startLevel === 0 ? 'Start with the basics' : `Placed at Level ${startLevel}`,
    });
  } catch (e) {
    console.error('submitPlacement:', e);
    res.status(500).json({ error: 'Failed to submit placement' });
  }
};

module.exports = { startPlacement, submitPlacement };
