/**
 * Links each mcq_question_banks row to the lesson it tests (lesson_id).
 * Matched by question_en -> lesson title within the same level.
 * Idempotent: only fills rows where lesson_id IS NULL.
 * Run standalone:  node src/database/linkBankLessons.js
 */

// { level_number: { lesson_title_en: [question_en, ...] } }
const MAP = {
  0: {
    'What is Trading?': [
      'What is trading?',
      'If you buy at $100 and sell at $110, what is your profit?',
      'Is trading risk-free?',
      'Can prices go down in trading?',
      'What is the difference between buy price and sell price?',
      'What is the first thing to learn in trading?',
    ],
    'Why We Never Risk Real Money While Learning': [
      'What is a sandbox account?',
      'Can you withdraw money from a sandbox account?',
      'Why do we practice first?',
      'The sandbox account is for...',
      'What happens if you start with real money before learning?',
      'When should you try a real account?',
      'What is virtual money?',
    ],
    'How to Spot Trading Scams': [
      'What do scams often promise?',
      'What should you never share?',
      'Real brokers are...',
      'If it sounds too good to be true...',
      'Who regulates real brokers?',
      'Should you send money directly to someone promising trading returns?',
      'Why is scam education important?',
    ],
  },
  1: {
    'What is FOREX?': [
      'What does FOREX mean?',
      'When is FOREX open?',
    ],
    'What is Gold Trading (XAU/USD)?': [
      'What is the symbol for gold?',
      'How many troy ounces in one gold lot?',
      'Gold is popular because...',
      'What does XAU stand for?',
    ],
    'What is a Pip?': [
      'What is a pip?',
      'For EUR/USD, one pip equals?',
      'If EUR/USD moves from 1.1000 to 1.1005, how many pips?',
    ],
    'What is a Lot?': [
      'What is a standard lot?',
      'What is a mini lot?',
      'A micro lot is...',
      'Lot size affects...',
    ],
    'Currency Pairs We Trade': [
      'Which pair is for learning only?',
      'In EUR/USD, what is the base currency?',
      'Which is the quote currency in EUR/USD?',
      'How many pairs do we trade?',
      'Which pair uses Yen?',
      'What is GBP/USD?',
    ],
    'Leverage and Margin': [
      'What should beginners use?',
    ],
  },
  2: {
    'What is a Candlestick?': [
      'What does a candlestick show?',
      'A green candle means...',
      'The wick shows...',
    ],
    'Uptrends and Downtrends': [
      'An uptrend has...',
      'A downtrend has...',
      '"The trend is your friend" means...',
    ],
    'Support and Resistance': [
      'Support is like a...',
      'Resistance is like a...',
      'A breakout is...',
    ],
    'The 4 Order Types': [
      'Beginners should trade...',
    ],
  },
  3: {
    'What is Risk Management?': [
      'Risk per trade should be?',
      'Why keep losses small?',
    ],
    'Position Sizing': [
      'Position size comes from?',
      'Bigger lot with same SL means?',
    ],
    'The 1% Rule and Drawdown': [
      '1% of $5,000 is?',
      '10 losses at 1% risk leave?',
      'Drawdown measures?',
      'The 1% rule means?',
    ],
  },
  4: {
    'Trading Psychology: Fear and Greed': [
      'Fear makes you...',
      'Greed makes you...',
      'The cure for emotion is...',
    ],
    'Building a Trading Plan': [
      'A trading plan covers...',
      'Best plan is...',
      'No stop loss is...',
      'Journal should track...',
    ],
    'Common Beginner Mistakes': [
      'Revenge trading is...',
    ],
  },
  5: {
    'When Are You Ready for Real Money?': [
      'Ready means...',
      'Readiness threshold?',
    ],
    'Choosing a Licensed Broker': [
      'Verify broker license on...',
      'Red flag: broker promises...',
      'Segregated funds means...',
    ],
    'Your First Real Trade': [
      'First real deposit?',
      'First real trade size?',
      'On a real account, rules are...',
    ],
  },
};

async function linkBankLessons(db) {
  const levels = await db.query('SELECT id, level_number FROM levels');
  let linked = 0, unmapped = 0;
  for (const level of levels.rows) {
    const lessonMap = MAP[level.level_number] || {};
    const lessons = await db.query(
      'SELECT id, title_en FROM lessons WHERE level_id=$1', [level.id]
    );
    const byTitle = {};
    lessons.rows.forEach(l => { byTitle[l.title_en] = l.id; });

    for (const [title, questions] of Object.entries(lessonMap)) {
      const lessonId = byTitle[title];
      if (!lessonId) { unmapped += questions.length; continue; }
      const r = await db.query(
        `UPDATE mcq_question_banks SET lesson_id=$1
         WHERE level_id=$2 AND lesson_id IS NULL AND question_en = ANY($3)`,
        [lessonId, level.id, questions]
      );
      linked += r.rowCount || 0;
    }
  }
  return { linked, unmapped };
}

module.exports = { linkBankLessons };

if (require.main === module) {
  require('dotenv').config();
  const db = require('./db');
  db.init().then(async () => {
    await db.query(
      `ALTER TABLE mcq_question_banks ADD COLUMN IF NOT EXISTS lesson_id UUID REFERENCES lessons(id) ON DELETE SET NULL`
    );
    const res = await linkBankLessons(db);
    console.log(`[link] linked=${res.linked} unmapped=${res.unmapped}`);
    const check = await db.query(
      `SELECT COUNT(*)::int AS unlinked FROM mcq_question_banks WHERE lesson_id IS NULL`
    );
    console.log(`[link] rows still unlinked: ${check.rows[0].unlinked}`);
    process.exit(0);
  }).catch(e => { console.error(e); process.exit(1); });
}
