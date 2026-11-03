const crypto = require('crypto');

/**
 * Shared quiz helpers.
 *
 * All seeded questions have correct_index = 0 ("always A"), so correctness
 * must never rely on the stored option order. Options are shuffled
 * server-side before display, and answers are graded by option VALUE
 * (the text the user tapped), which survives any shuffle. Numeric answers
 * are still accepted for backward compatibility with older clients that
 * submit a raw index.
 */

/** Fisher-Yates shuffle backed by crypto randomness. Returns a new array. */
function shuffle(arr) {
  const a = [...arr];
  for (let i = a.length - 1; i > 0; i--) {
    const j = crypto.randomInt(i + 1);
    [a[i], a[j]] = [a[j], a[i]];
  }
  return a;
}

/** Random permutation of the indices 0..n-1. */
function shuffledIndices(n) {
  return shuffle(Array.from({ length: n }, (_, i) => i));
}

/**
 * Shuffle a question's options for display. The en/rw lists are shuffled
 * with the same permutation so translations stay aligned.
 */
function shuffledOptions(q) {
  const en = q.options_en || [];
  const rw = q.options_rw || [];
  const order = shuffledIndices(en.length);
  return {
    options_en: order.map((i) => en[i]),
    options_rw: rw.length === en.length ? order.map((i) => rw[i]) : rw,
  };
}

/**
 * Grade a submitted answer against a quiz/bank row by option VALUE.
 * Options are shuffled server-side before display, so an index carries no
 * meaning and is always wrong — numeric submissions are rejected outright
 * (every seeded question has correct_index = 0; grading `n === 0` would
 * both mis-grade stale clients and reintroduce the "always A" exploit).
 */
function isCorrect(chosen, q) {
  if (chosen == null || typeof chosen !== 'string') return false;
  const ci = q.correct_index;
  const val = chosen.trim();
  const enCorrect = (q.options_en || [])[ci];
  const rwCorrect = (q.options_rw || [])[ci];
  return (enCorrect != null && val === String(enCorrect).trim())
      || (rwCorrect != null && val === String(rwCorrect).trim());
}

/**
 * Grade an exam answer where the client submits the DISPLAYED index and the
 * server stored the option permutation (perm) in the attempt.
 * String submissions are graded by value instead.
 */
function isExamAnswerCorrect(chosen, q, perm) {
  if (chosen == null) return false;
  if (typeof chosen === 'number') {
    const order = perm && perm[q.id];
    const original = order ? order[chosen] : chosen;
    return original === q.correct_index;
  }
  return isCorrect(chosen, q);
}

/**
 * Draw `count` questions from a bank, balanced across lessons:
 * - grouped by lesson_id (unlinked questions form a shared 'bank' group)
 * - within each group, questions the user hasn't been served recently come first
 * - groups are picked round-robin so every lesson is represented
 * - final shuffle so the served order isn't clustered by lesson
 */
function drawQuestions(bankRows, seenIds, count) {
  const seen = seenIds || new Set();
  const groups = new Map();
  for (const q of bankRows) {
    const key = q.lesson_id || 'bank';
    if (!groups.has(key)) groups.set(key, { fresh: [], stale: [] });
    (seen.has(q.id) ? groups.get(key).stale : groups.get(key).fresh).push(q);
  }
  const queues = [...groups.values()].map(g => [...shuffle(g.fresh), ...shuffle(g.stale)]);
  const picked = [];
  while (picked.length < count && queues.some(q => q.length > 0)) {
    for (const queue of queues) {
      if (picked.length >= count) break;
      if (queue.length > 0) picked.push(queue.shift());
    }
  }
  return shuffle(picked);
}

/**
 * Pure gate for starting a level exam: the level must be unlocked for the
 * user AND all its published lessons must be completed — the exam covers
 * the whole level, so taking it before studying guarantees a mismatch.
 */
function examAccess({ levelNumber, unlockedLevels, lessonsCompleted, lessonsTotal }) {
  const levelUnlocked = (unlockedLevels || [0]).includes(levelNumber);
  const lessonsDone = lessonsTotal === 0 || lessonsCompleted >= lessonsTotal;
  return { levelUnlocked, lessonsDone, allowed: levelUnlocked && lessonsDone };
}

/** Public shape for a quiz question — never leaks correct_index/answers. */
function presentQuiz(q) {
  const { options_en, options_rw } = shuffledOptions(q);
  return {
    id: q.id,
    question_en: q.question_en,
    question_rw: q.question_rw,
    options_en,
    options_rw,
    order_index: q.order_index,
  };
}

module.exports = { shuffle, shuffledIndices, shuffledOptions, drawQuestions, examAccess, isCorrect, isExamAnswerCorrect, presentQuiz };
