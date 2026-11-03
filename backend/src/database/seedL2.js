/**
 * L2 content pack — Reading Charts & Candles.
 * RW strings are DRAFT pending native review (same status as L0/L1).
 */

const L2_LESSONS = [
  {
    n: 1,
    t: 'What is a Candlestick?', tr: 'Candlestick ni iki?',
    c: 'A candlestick shows four prices for a period: open, high, low, and close. The body is the thick part between open and close. The wicks (or shadows) are the thin lines to the high and low. A green candle means the price closed higher than it opened. A red candle means it closed lower. Candles let you see the whole story of a period in one shape.',
    cr: 'Candlestick yerekana ibiciro bine by\'igihe: ifungura, hejuru, hasi, n\'ifunga. Umubiri ni igice kinini hagati y\'ifungura n\'ifunga. Wicks ni imirongo mito kugeza hejuru no hasi. Candle icyatsi bivuga ko igiciro cyafunze hejuru y\'aho cyafunguye. Candle itukura bivuga ko cyafunze hasi.',
    quiz: [
      { q: 'What four prices does a candlestick show?', qr: 'Candlestick yerekana ibiciro bine biki?', o: ['Open, high, low, close', 'Buy, sell, wait, stop', 'High, low, spread, margin', 'Start, middle, end, average'], or: ['Ifungura, hejuru, hasi, ifunga', 'Gura, gurisha, tegereza, hagarara', 'Hejuru, hasi, spread, margin', 'Itangira, hagati, iherezo, impuzandengo'], a: 0, e: 'Every candle records open, high, low, close (OHLC).', er: 'Candle yose yerekana open, high, low, close (OHLC).' },
      { q: 'What does a green candle mean?', qr: 'Candle icyatsi ivuga iki?', o: ['Price closed higher than it opened', 'Price closed lower', 'The market is closed', 'A scam is happening'], or: ['Igiciro cyafunze hejuru y\'aho cyafunguye', 'Igiciro cyafunze hasi', 'Isoko ryafunze', 'Hari uburyo bwa scam'], a: 0, e: 'Green = close higher than open (price went up).', er: 'Icyatsi = ifunga hejuru y\'ifungura (igiciro cyazamutse).' },
      { q: 'What is the wick of a candle?', qr: 'Wick ya candle ni iki?', o: ['The thin line to the high and low', 'The thick middle part', 'A type of order', 'The candle color'], or: ['Umurongo muto kugeza hejuru no hasi', 'Igice kinini cy\'hagati', 'Ubwoko bwa order', 'Ibara rya candle'], a: 0, e: 'Wicks show the extremes the price reached.', er: 'Wicks zerekana aho igiciro cyageze.' },
    ],
  },
  {
    n: 2,
    t: 'Uptrends and Downtrends', tr: 'Uptrends na Downtrends',
    c: 'A trend is the general direction of price. An uptrend makes higher highs and higher lows - each peak is higher than the last. A downtrend makes lower highs and lower lows. Beginners should trade WITH the trend, not against it. "The trend is your friend" is a common saying because fighting the trend loses money fast.',
    cr: 'Trend ni icyerekezo rusange cy\'igiciro. Uptrend ikora higher highs na higher lows - buri hejuru iri hejuru y\'iyabanjirije. Downtrend ikora lower highs na lower lows. Abatangira bagomba gucuruza NA trend, ntabwo bayirwanya. "Trend ni inshuti yawe" ni umugani uzwiho kubera kurwanya trend gutakaza amafaranga vuba.',
    quiz: [
      { q: 'What is an uptrend?', qr: 'Uptrend ni iki?', o: ['Higher highs and higher lows', 'Lower highs and lower lows', 'Flat prices', 'Random movement'], or: ['Higher highs na higher lows', 'Lower highs na lower lows', 'Ibiciro bitahinduka', 'Imyigende idahuriwe'], a: 0, e: 'Uptrend = each peak and each dip is higher than before.', er: 'Uptrend = buri hejuru na buri hasi biri hejuru y\'ibyabanjirije.' },
      { q: 'Should beginners trade against the trend?', qr: 'Abatangira bagomba gucuruza barwanya trend?', o: ['No, trade with the trend', 'Yes, always', 'Only on Fridays', 'Only with big lots'], or: ['Oya, gucuruza na trend', 'Yego, buri gihe', 'Ku wa gatanu gusa', 'Na lots nini gusa'], a: 0, e: 'Trading with the trend is safer and higher-probability.', er: 'Gucuruza na trend ni umutekanye kandi urenganye amahirwe.' },
      { q: 'What does a downtrend look like?', qr: 'Downtrend isa n\'iki?', o: ['Lower highs and lower lows', 'Higher highs and higher lows', 'Only green candles', 'Only red candles forever'], or: ['Lower highs na lower lows', 'Higher highs na higher lows', 'Candles icyatsi gusa', 'Candles itukura gusa iteka'], a: 0, e: 'Downtrend = each peak and each dip is lower.', er: 'Downtrend = buri hejuru na buri hasi biri hasi y\'ibyabanjirije.' },
    ],
  },
  {
    n: 3,
    t: 'Support and Resistance', tr: 'Support na Resistance',
    c: 'Support is a price level where the price tends to stop falling and bounce up - like a floor. Resistance is a level where price tends to stop rising and fall back - like a ceiling. These levels form because many traders watch the same prices. Traders often buy near support and sell near resistance, or trade breakouts when a level fails.',
    cr: 'Support ni urwego rw\'igiciro aho igiciro kiba kiba hagarara kugwa kandi cyongerera hejuru - nka sifuri. Resistance ni urwego aho igiciro kiba kiba hagarara kuzamuka kandi kisubira hasi - nka silingi. Aya maneo akubaho kubera abacuruzi benshi bareba ibiciro bimwe. Abacuruzi bakenshi bagura hafi ya support bagurisha hafi ya resistance, cyangwa bagucuruza breakouts iyo urwego rutsinzwe.',
    quiz: [
      { q: 'What is support?', qr: 'Support ni iki?', o: ['A floor where price tends to stop falling', 'A ceiling where price stops rising', 'A broker feature', 'A type of scam'], or: ['Sifuri aho igiciro kiba kiba hagarara kugwa', 'Silingi aho igiciro gihagarara kuzamuka', 'Ikintu cya broker', 'Ubwoko bwa scam'], a: 0, e: 'Support acts like a floor under price.', er: 'Support ikora nka sifuri munsi y\'igiciro.' },
      { q: 'What is resistance?', qr: 'Resistance ni iki?', o: ['A ceiling where price tends to stop rising', 'A floor for price', 'Your account balance', 'A candle pattern'], or: ['Silingi aho igiciro kiba kiba hagarara kuzamuka', 'Sifuri y\'igiciro', 'Amafaranga ya konti yawe', 'Imiterere ya candle'], a: 0, e: 'Resistance acts like a ceiling above price.', er: 'Resistance ikora nka silingi hejuru y\'igiciro.' },
      { q: 'What is a breakout?', qr: 'Breakout ni iki?', o: ['When price moves past a support or resistance level', 'When the market closes', 'When you lose money', 'A chart error'], or: ['Iyo igiciro cyarenze urwego rwa support cyangwa resistance', 'Iyo isoko rifunze', 'Iyo utakaje amafaranga', 'Ikosa rya chart'], a: 0, e: 'A breakout happens when price breaks through a watched level.', er: 'Breakout iba iyo igiciro cyarenze urwego rwerekanwe.' },
    ],
  },
];

const L2_EXAM = [
  ['What does a candlestick show?', ['Open, high, low, close', 'Only the close price', 'News events', 'Broker fees'], 0],
  ['A green candle means...', ['Close is higher than open', 'Close is lower than open', 'Market is closed', 'Spread is zero'], 0],
  ['The wick shows...', ['The high and low extremes', 'The body only', 'Volume', 'Your balance'], 0],
  ['An uptrend has...', ['Higher highs and higher lows', 'Lower highs and lower lows', 'No pattern', 'Only green candles'], 0],
  ['A downtrend has...', ['Lower highs and lower lows', 'Higher highs and higher lows', 'Flat prices', 'Random jumps'], 0],
  ['Support is like a...', ['Floor', 'Ceiling', 'Wall', 'Door'], 0],
  ['Resistance is like a...', ['Ceiling', 'Floor', 'Window', 'Bridge'], 0],
  ['Beginners should trade...', ['With the trend', 'Against the trend', 'Without a stop loss', 'Only at night'], 0],
  ['A breakout is...', ['Price passing a level', 'A market holiday', 'Losing all money', 'A news event'], 0],
  ['"The trend is your friend" means...', ['Trade with the trend direction', 'Ignore the trend', 'Trends are scams', 'Only trade gold'], 0],
];

const L2_PRACTICALS = [
  {
    n: 1,
    p: 'On EUR/USD, identify the trend on the chart. Place a trade in the direction of the trend with a stop loss and journal why you entered.',
    pr: 'Kuri EUR/USD, menya trend kuri chart. Shyira trade mu cyerekezo cya trend na stop loss kandi wandike impamvu winjiye.',
    rubric: {
      checks: [
        { id: 'has_sl', weight: 0.4, type: 'has_field', field: 'stop_loss_price' },
        { id: 'journal', weight: 0.4, type: 'has_field', field: 'journal_entry' },
        { id: 'closed', weight: 0.2, type: 'has_field', field: 'closed_at' },
      ],
      pass_threshold: 0.7,
    },
  },
  {
    n: 2,
    p: 'Find support or resistance on XAU/USD. Buy near the level with a stop loss below it and a take profit at least twice the SL distance.',
    pr: 'Shaka support cyangwa resistance kuri XAU/USD. Gura hafi y\'urwo rwego na stop loss munsi y\'urwo kandi take profit nibura kabili intera ya SL.',
    rubric: {
      checks: [
        { id: 'has_sl', weight: 0.3, type: 'has_field', field: 'stop_loss_price' },
        { id: 'has_tp', weight: 0.3, type: 'has_field', field: 'take_profit_price' },
        { id: 'side_buy', weight: 0.2, type: 'equals_value', field: 'order_side', value: 'buy' },
        { id: 'closed', weight: 0.2, type: 'has_field', field: 'closed_at' },
      ],
      pass_threshold: 0.7,
    },
  },
];

async function seedL2(db, levelId) {
  for (const L of L2_LESSONS) {
    const lr = await db.query(
      `INSERT INTO lessons (level_id, lesson_number, title_en, title_rw, content_en, content_rw, duration_minutes, order_index, state, native_speaker_approved)
       VALUES ($1,$2,$3,$4,$5,$6,5,$7,'published',false) RETURNING id`,
      [levelId, L.n, L.t, L.tr, L.c, L.cr, L.n]
    );
    let i = 0;
    for (const Q of L.quiz) {
      await db.query(
        `INSERT INTO lesson_quizzes (lesson_id, question_en, question_rw, options_en, options_rw, correct_index, explanation_en, explanation_rw, order_index)
         VALUES ($1,$2,$3,$4,$5,$6,$7,$8,$9)`,
        [lr.rows[0].id, Q.q, Q.qr, JSON.stringify(Q.o), JSON.stringify(Q.or), Q.a, Q.e, Q.er, i++]
      );
    }
  }
  for (const [q, opts, a] of L2_EXAM) {
    await db.query(
      `INSERT INTO mcq_question_banks (level_id, question_en, question_rw, options_en, options_rw, correct_index, difficulty)
       VALUES ($1,$2,$2,$3,$3,$4,'medium')`,
      [levelId, q, JSON.stringify(opts), a]
    );
  }
  for (const T of L2_PRACTICALS) {
    await db.query(
      `INSERT INTO practical_exam_tasks (level_id, task_number, prompt_en, prompt_rw, rubric, pass_threshold)
       VALUES ($1,$2,$3,$4,$5,$6)`,
      [levelId, T.n, T.p, T.pr, JSON.stringify(T.rubric), T.rubric.pass_threshold]
    );
  }
}

module.exports = { seedL2 };
