/**
 * Extra lessons from the 2025-26 curriculum synthesis:
 * Leverage (L1.6), Order Types (L2.4), High-Impact News (L4.4).
 * RW strings DRAFT pending native review.
 */

const EXTRA = [
  {
    level: 1, n: 6,
    t: 'Leverage and Margin', tr: 'Leverage na Margin',
    c: 'Leverage lets you control a big trade with small money. With 1:100 leverage, $10 controls $1,000. But leverage multiplies losses the same way it multiplies profits. Margin is the money the broker holds to open your trade. In this app, leverage is capped at 1:30 until you pass Level 3 - because most beginners lose money to leverage, not to the market.',
    cr: 'Leverage igufasha kugenzura trade nini n\'amafaranga make. Na leverage ya 1:100, $10 igenzura $1,000. Ariko leverage igwiza igihombo uko yikurikiza umusaruro. Margin ni amafaranga broker afata kugira ngo afungure trade yawe. Muri iyi app, leverage ntirenge 1:30 kugeza utsinze Level 3.',
    quiz: [
      ['With 1:100 leverage, $10 controls?', 'Na leverage 1:100, $10 igenzura?', ['$1,000', '$100', '$10,000', '$10'], ['$1,000', '$100', '$10,000', '$10'], 0, 'Leverage 1:100 means $10 controls $1,000 of position.', 'Leverage 1:100 bivuga $10 igenzura $1,000.'],
      ['Leverage makes losses...', 'Leverage ikora igihombo...', ['Bigger too', 'Smaller', 'Zero', 'Safer'], ['Kinini nanone', 'Gito', 'Ntacyo', 'Umutekanye'], 0, 'Leverage multiplies BOTH profits and losses.', 'Leverage igwiza umusaruro N\'igihombo.'],
      ['What is margin?', 'Margin ni iki?', ['Money held to open the trade', 'Your profit', 'A fee', 'A bonus'], ['Amafaranga afatwa kugira ngo ufungure trade', 'Umusaruro', 'Ikiguzi', 'Bonus'], 0, 'Margin is collateral for the open position.', 'Margin ni ingwate ya position ifunguye.'],
    ],
  },
  {
    level: 2, n: 4,
    t: 'The 4 Order Types', tr: 'Ubwoko 4 bwa Orders',
    c: 'Market order buys or sells right now at the current price. Limit order waits for a better price - buy lower or sell higher. Stop order triggers when price reaches a level - used for breakouts or protection. Stop Loss and Take Profit close your trade automatically at prices you set. Always know which type you are placing before you click.',
    cr: 'Market order igura cyangwa igurisha ubu ku giciro kiriho. Limit order itegereza igiciro cyiza - gura hasi cyangwa gurisha hejuru. Stop order ikora iyo igiciro kigeze ku rwego. Stop Loss na Take Profit bifunga trade ku biciro washyizeho. Buri gihe menya ubwoko ushyira mbere yo gukanda.',
    quiz: [
      ['Buy only if price drops to 1.0900?', 'Gura gusa iyo igiciro kigwa kuri 1.0900?', ['Limit order', 'Market order', 'Stop order', 'Take profit'], ['Limit order', 'Market order', 'Stop order', 'Take profit'], 0, 'Limit = wait for a better price.', 'Limit = tegereza igiciro cyiza.'],
      ['Stop Loss does what?', 'Stop Loss ikora iki?', ['Closes trade to limit your loss', 'Guarantees profit', 'Opens a trade', 'Raises leverage'], ['Ifunga trade kugira ngo igabanye igihombo', 'Isezeranya umusaruro', 'Ifungura trade', 'Ikongera leverage'], 0, 'SL auto-closes the trade to cap the loss.', 'SL ifunga trade igabanya igihombo.'],
      ['Take Profit does what?', 'Take Profit ikora iki?', ['Closes trade at your target', 'Stops losses', 'Buys more', 'Cancels orders'], ['Ifunga trade ku ntego yawe', 'Ihagarika igihombo', 'Igura byinshi', 'Ikuraho orders'], 0, 'TP locks in profit automatically.', 'TP ifata umusaruro mu buryo bwikora.'],
    ],
  },
  {
    level: 4, n: 4,
    t: 'The 3 High-Impact News Events', tr: 'Amakuru 3 Akomeye',
    c: 'Three events move gold and forex violently: US CPI (monthly inflation report - high inflation pushes gold up), Non-Farm Payrolls or NFP (first Friday of the month, the US jobs report - huge volatility), and the Federal Reserve interest rate decision (8 times a year - the biggest single mover). Beginners should not trade during these releases. Prices can jump 50 pips in seconds.',
    cr: 'Amakuru atatu ahimura zahabu n\'ifaranga bikaze: US CPI (raporo y\'infurwa buri kwezi - infurwa iremereye ishira zahabu hejuru), NFP (kuwa gatanu wa mbere w\'ukwezi, raporo y\'imirimo - imiruka minini), n\'icyemezo cy\'inyungu cya Fed (inshuro 8 ku mwaka - igihimura kinini). Abatangira ntibakwiye gucuruza muri ibi bihe.',
    quiz: [
      ['Which event moves gold most?', 'Ni ikihe gihimura zahabu cyane?', ['Fed rate decision', 'Weekly oil report', 'Company earnings', 'Weather news'], ['Icyemezo cya Fed', 'Raporo ya peteroli', 'Amafaranga ya sosiyete', 'Amakuru y\'ikirere'], 0, 'Fed decisions are the biggest single gold mover.', 'Ibyemezo bya Fed ni byo bihimura zahabu cyane.'],
      ['When is NFP released?', 'NFP ishyirwa hanze ryari?', ['First Friday of the month', 'Every Monday', 'Only in December', 'Randomly'], ['Kuwa gatanu wa mbere w\'ukwezi', 'Buri wa mbere', 'Ukuboza gusa', 'Ku mpamvu yose'], 0, 'NFP = first Friday of every month.', 'NFP = kuwa gatanu wa mbere w\'ukwezi.'],
      ['Should beginners trade news releases?', 'Abatangira bagomba gucuruza igihe amakuru asohoka?', ['No - too volatile', 'Yes, always', 'Only with big lots', 'Only on gold'], ['Oya - birahungabana', 'Yego, buri gihe', 'Na lots nini gusa', 'Kuri zahabu gusa'], 0, 'News spikes can wipe out a beginner in seconds.', 'Imiruka y\'amakuru ishobora gusenya umutangiri mu masegonda.'],
    ],
  },
];

async function seedExtra(db, levelIds) {
  for (const L of EXTRA) {
    const lr = await db.query(
      `INSERT INTO lessons (level_id, lesson_number, title_en, title_rw, content_en, content_rw, duration_minutes, order_index, state, native_speaker_approved)
       VALUES ($1,$2,$3,$4,$5,$6,5,$7,'published',false) RETURNING id`,
      [levelIds[L.level], L.n, L.t, L.tr, L.c, L.cr, L.n]
    );
    let i = 0;
    for (const [q, qr, o, orw, a, e, er] of L.quiz) {
      await db.query(
        `INSERT INTO lesson_quizzes (lesson_id, question_en, question_rw, options_en, options_rw, correct_index, explanation_en, explanation_rw, order_index)
         VALUES ($1,$2,$3,$4,$5,$6,$7,$8,$9)`,
        [lr.rows[0].id, q, qr, JSON.stringify(o), JSON.stringify(orw), a, e, er, i++]
      );
    }
  }
}

module.exports = { seedExtra };
