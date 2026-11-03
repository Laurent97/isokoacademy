const {
  shuffle, shuffledIndices, shuffledOptions, drawQuestions, examAccess,
  isCorrect, isExamAnswerCorrect, presentQuiz,
} = require('../src/utils/quiz');

const QUESTION = {
  id: 'q1',
  question_en: 'Capital of France?',
  question_rw: 'Umujyi wa Faransa?',
  options_en: ['Paris', 'London', 'Berlin', 'Rome'],
  options_rw: ['Paris', 'London', 'Berlin', 'Rome'],
  correct_index: 0, // all seed data stores the correct answer first
};

const bankOf = (n) => Array.from({ length: n }, (_, i) => ({ id: `q${i}`, options_en: ['a', 'b', 'c', 'd'] }));

// --- Layer: option shuffle ---------------------------------------------------

test('correct answer position is not always A', () => {
  const positions = new Set();
  for (let i = 0; i < 200; i++) {
    const { options_en } = shuffledOptions(QUESTION);
    positions.add(options_en.indexOf('Paris'));
  }
  expect(positions.size).toBe(4);
});

test('correct answer position is roughly uniform', () => {
  const counts = [0, 0, 0, 0];
  const N = 4000;
  for (let i = 0; i < N; i++) {
    counts[shuffledOptions(QUESTION).options_en.indexOf('Paris')]++;
  }
  for (const c of counts) {
    expect(c).toBeGreaterThan(N * 0.15);
    expect(c).toBeLessThan(N * 0.35);
  }
});

test('en and rw options stay aligned after shuffling', () => {
  const q = { ...QUESTION, options_rw: ['Paryi', 'Londoni', 'Berlini', 'Roma'] };
  for (let i = 0; i < 50; i++) {
    const { options_en, options_rw } = shuffledOptions(q);
    expect(options_rw[options_en.indexOf('Paris')]).toBe('Paryi');
  }
});

// --- Layer: question order / draw ---------------------------------------------

test('two shuffles of the question bank produce different orders', () => {
  const ids = bankOf(20).map(q => q.id);
  const a = shuffle(ids).join(',');
  const b = shuffle(ids).join(',');
  expect(a).not.toBe(b);
});

test('drawQuestions prefers questions not recently served', () => {
  const bank = bankOf(20);
  const seen = new Set(bank.slice(0, 10).map(q => q.id));
  const drawn = drawQuestions(bank, seen, 10);
  expect(drawn).toHaveLength(10);
  expect(drawn.every(q => !seen.has(q.id))).toBe(true);
});

test('drawQuestions falls back to seen questions when fresh pool is too small', () => {
  const bank = bankOf(20);
  const seen = new Set(bank.map(q => q.id));
  const drawn = drawQuestions(bank, seen, 10);
  expect(drawn).toHaveLength(10);
});

test('drawQuestions covers every lesson in the level', () => {
  // 4 lessons x 3 questions each, draw 6 -> every lesson should appear
  const bank = [];
  for (let l = 0; l < 4; l++) {
    for (let i = 0; i < 3; i++) bank.push({ id: `L${l}q${i}`, lesson_id: `les${l}`, options_en: ['a'] });
  }
  for (let run = 0; run < 20; run++) {
    const lessons = new Set(drawQuestions(bank, new Set(), 6).map(q => q.lesson_id));
    expect(lessons.size).toBeGreaterThanOrEqual(3);
  }
});

test('unlinked bank questions still get drawn', () => {
  const bank = [
    { id: 'a', lesson_id: null, options_en: ['x'] },
    { id: 'b', lesson_id: null, options_en: ['x'] },
    { id: 'c', lesson_id: 'les1', options_en: ['x'] },
  ];
  const drawn = drawQuestions(bank, new Set(), 2);
  expect(drawn).toHaveLength(2);
});

test('examAccess gates on level unlock and lesson completion', () => {
  const base = { levelNumber: 2, unlockedLevels: [0, 1, 2], lessonsCompleted: 4, lessonsTotal: 4 };
  expect(examAccess(base).allowed).toBe(true);
  expect(examAccess({ ...base, unlockedLevels: [0, 1] }).allowed).toBe(false);
  expect(examAccess({ ...base, lessonsCompleted: 3 }).allowed).toBe(false);
  // a level with no lessons does not block on lesson completion
  expect(examAccess({ ...base, lessonsCompleted: 0, lessonsTotal: 0 }).allowed).toBe(true);
});

// --- Layer: grading ------------------------------------------------------------

test('value-based grading works in both languages', () => {
  expect(isCorrect('Paris', QUESTION)).toBe(true);
  expect(isCorrect('London', QUESTION)).toBe(false);
  expect(isCorrect(null, QUESTION)).toBe(false);
  expect(isCorrect(undefined, QUESTION)).toBe(false);
});

test('index submissions are rejected (server shuffles, so indices are meaningless)', () => {
  expect(isCorrect(0, QUESTION)).toBe(false); // would wrongly pass if graded vs correct_index=0
  expect(isCorrect(2, QUESTION)).toBe(false);
});

test('numeric option text is graded as a value, not an index', () => {
  const q = { options_en: ['50', '25', '10', '5'], options_rw: [], correct_index: 0 };
  expect(isCorrect('50', q)).toBe(true);   // string '50' must not be read as index 50
  expect(isCorrect('25', q)).toBe(false);
});

test('exam grading maps displayed index through the stored permutation', () => {
  const perm = { q1: [2, 0, 3, 1] }; // 'Paris' (original 0) displayed at position 1
  expect(isExamAnswerCorrect(1, QUESTION, perm)).toBe(true);
  expect(isExamAnswerCorrect(0, QUESTION, perm)).toBe(false);
  expect(isExamAnswerCorrect('Paris', QUESTION, perm)).toBe(true); // value path
});

// --- Layer: no leakage ----------------------------------------------------------

test('presentQuiz never exposes correct_index or the correct answer position', () => {
  const out = JSON.stringify(presentQuiz(QUESTION));
  expect(out).not.toContain('correct_index');
  expect(out).not.toContain('correct_answer');
  const pub = presentQuiz(QUESTION);
  expect(Object.keys(pub).sort()).toEqual(
    ['id', 'options_en', 'options_rw', 'order_index', 'question_en', 'question_rw'].sort()
  );
});

test('shuffledIndices covers every index exactly once', () => {
  for (let i = 0; i < 100; i++) {
    expect([...shuffledIndices(4)].sort()).toEqual([0, 1, 2, 3]);
  }
});
