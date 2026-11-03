/**
 * L3-L5 content packs. RW strings DRAFT pending native review.
 * Compact format: [num, title_en, title_rw, content_en, content_rw, quizzes[[q,qr,[opts],[optsRW],ans,exp,expRW]]]
 */

const PACKS = {
  3: {
    lessons: [
      [1, 'What is Risk Management?', 'Gucunga Risk ni iki?',
        'Risk management means deciding how much you can lose on each trade before you enter. Professional traders risk only 1-2% of their account per trade. With a $10,000 account, 1% risk is $100. If the trade loses, you lose $100 - not more. This one rule keeps you in the game long enough to learn and win.',
        'Gucunga risk ni uguhitamo amafaranga ushobora gutakaza kuri trade imwe mbere yo kuyinjira. Abacuruzi b\'abahanga bashyira risk ya 1-2% ya konti kuri trade. Na konti ya $10,000, 1% ni $100. Niba trade itakaza, utakaza $100 gusa. Iri tegeko rigufasha kuguma muri game igihe kirekire.',
        [
          ['How much should you risk per trade?', 'Risk ingahe kuri trade imwe?', ['1-2% of account', '50% of account', 'All of it', 'Nothing'], ['1-2% ya konti', '50% ya konti', 'Yose', 'Nta'], 0, 'Only 1-2% per trade keeps losses survivable.', '1-2% gusa kuri trade bituma igihombo kibeho.'],
          ['With $10,000, what is 1% risk?', 'Na $10,000, 1% risk ni angahe?', ['$100', '$1,000', '$10', '$5,000'], ['$100', '$1,000', '$10', '$5,000'], 0, '1% of $10,000 = $100 maximum loss per trade.', '1% ya $10,000 = $100 ntarenga kuri trade.'],
          ['Why does risk management matter?', 'Kuki gucunga risk ari ingenzi?', ['It keeps you trading long enough to learn', 'It guarantees profit', 'It is optional', 'For experts only'], ['Igufasha kuguma muri trading igihe kirekire', 'Isezeranya umusaruro', 'Si ngombwa', 'Ku bahanga gusa'], 0, 'Small controlled losses let you survive and improve.', 'Ibihombo bito bigenzurwa bigufasha kubaho no kunoza.'],
        ]],
      [2, 'Position Sizing', 'Ingano ya Position',
        'Position size is how much you buy or sell. It depends on your risk and your stop loss distance. Formula: Lot size = (Account × Risk%) / (SL pips × pip value). Example: $10,000 account, 1% risk ($100), 50 pip stop on EUR/USD ($10/pip per lot) = 0.2 lots. Always size from your stop, not from greed.',
        'Ingano ya position ni umubare w\'ibyo ugura cyangwa ugurisha. Iterwa na risk n\'intera ya stop loss. Formula: Lot = (Konti × Risk%) / (SL pips × agaciro ka pip). Urugero: konti $10,000, risk 1% ($100), SL ya pips 50 kuri EUR/USD ($10/pip kuri lot) = 0.2 lots. Buri gihe pima uhereye kuri stop yawe.',
        [
          ['What decides your lot size?', 'Ni iki gihitamo ingano ya lot?', ['Risk % and stop loss distance', 'How confident you feel', 'The pair price', 'Random choice'], ['Risk% n\'intera ya stop loss', 'Uko wiyumva', 'Igiciro cya pair', 'Guhitamo gusa'], 0, 'Lot size comes from risk math, never feelings.', 'Ingano ya lot ivuye muri risk, ntabwo mu biyumvo.'],
          ['$10k account, 1% risk, 50 pip SL, $10/pip = ?', 'Konti $10k, risk 1%, SL pips 50, $10/pip = ?', ['0.2 lots', '2 lots', '0.02 lots', '1 lot'], ['0.2 lots', '2 lots', '0.02 lots', '1 lot'], 0, '$100 / (50 × $10) = 0.2 lots.', '$100 / (50 × $10) = 0.2 lots.'],
          ['Should lot size come from confidence?', 'Ingano ya lot ivuye kwizera?', ['No, from risk math', 'Yes', 'Sometimes', 'Only for pros'], ['Oya, muri risk', 'Yego', 'Rimwe na rimwe', 'Ku bahanga gusa'], 0, 'Confidence is not a sizing method.', 'Kwizera si uburyo bwo gupima.'],
        ]],
      [3, 'The 1% Rule and Drawdown', 'Itegeko rya 1% na Drawdown',
        'The 1% rule means never risking more than 1% of your account on one trade. Drawdown is how far your balance has fallen from its peak. With 1% risk you can lose 10 trades in a row and still keep 90% of your money. With 10% risk, the same 10 losses wipe out most of your account.',
        'Itegeko rya 1% risobanura kutarenga 1% ya konti kuri trade imwe. Drawdown ni uko amafaranga yagabanyutse uhereye hejuru. Na risk ya 1%, ushobora gutakaza trades 10 urukurikirane kandi ukagumana 90% y\'amafaranga. Na risk 10%, igihombo kimwe cyangiza konti.',
        [
          ['With 1% risk, 10 losses in a row leave you with?', 'Na risk 1%, gutsindwa 10 urukurikirane bigusigiriza?', ['About 90% of account', 'About 10%', 'Nothing', 'More money'], ['Hafi 90% ya konti', 'Hafi 10%', 'Nta kintu', 'Amafaranga menshi'], 0, '1% × 10 losses ≈ 10% drawdown.', '1% × 10 ≈ 10% drawdown.'],
          ['What is drawdown?', 'Drawdown ni iki?', ['Fall from peak balance', 'A candle type', 'An order type', 'A fee'], ['Kugwa uhereye hejuru ya konti', 'Ubwoko bwa candle', 'Ubwoko bwa order', 'Ikiguzi'], 0, 'Drawdown measures the decline from your highest balance.', 'Drawdown ipima kugwa uhereye hejuru ya konti yawe.'],
          ['What kills most beginner accounts?', 'Ni iki cyangiza konti z\'abatangira?', ['Risking too much per trade', 'Too much practice', 'Learning slowly', 'Small lots'], ['Gushyira risk nyinshi kuri trade', 'Imyitozo myinshi', 'Kwiga buhoro', 'Lots nto'], 0, 'Oversized risk is the #1 account killer.', 'Risk nini ni yo icakira konti #1.'],
        ]],
    ],
    exam: [
      ['Risk per trade should be?', ['1-2%', '25%', '50%', '100%'], 0],
      ['1% of $5,000 is?', ['$50', '$5', '$500', '$5,000'], 0],
      ['Position size comes from?', ['Risk% and SL distance', 'Feelings', 'Pair name', 'Luck'], 0],
      ['10 losses at 1% risk leave?', ['~90% of account', '~50%', '0%', '110%'], 0],
      ['Drawdown measures?', ['Fall from peak', 'Profit', 'Wins', 'Spread'], 0],
      ['The 1% rule means?', ['Never risk >1% per trade', 'Win 1% daily', 'Lose 1% always', 'Risk it all'], 0],
      ['Bigger lot with same SL means?', ['More risk', 'Less risk', 'Same risk', 'No risk'], 0],
      ['Why keep losses small?', ['Survive to keep learning', 'Look smart', 'Show off', 'Win always'], 0],
    ],
    practicals: [
      [1, 'Place any trade risking about 1% of your sandbox. Set a stop loss sized so the risk stays near 1%.',
        'Shyira trade iyo ari yo yose na risk hafi 1% ya sandbox. Shyira stop loss kugira ngo risk ibe hafi 1%.',
        { checks: [{ id: 'has_sl', weight: 0.4, type: 'has_field', field: 'stop_loss_price' }, { id: 'risk_band', weight: 0.6, type: 'risk_range', field: 'risk_percent', min: 0.5, max: 2 }], pass_threshold: 0.7 }],
    ],
  },
  4: {
    lessons: [
      [1, 'Trading Psychology: Fear and Greed', 'Psychology: Ubwoba na Sebeya',
        'Fear makes you close winners too early. Greed makes you hold losers too long or take too much risk. Both destroy accounts faster than bad analysis. The fix is a written plan: entry, stop loss, take profit, and reason - decided before you click. Then follow the plan, not your feelings.',
        'Ubwoba butuma ufunga abatsinze vuba. Sebeya ituma ufata abatsinzwe kure cyangwa gushyira risk nyinshi. Byombi birimbura konti kurusha isesengura mibi. Igisubizo ni plan yanditse: entry, stop loss, take profit, n\'impamvu - ufata mbere yo gukanda. Hanyuma kurikiza plan, ntabwo ibiyumvo.',
        [
          ['What does fear do to traders?', 'Ubwoba bukora iki ku bacuruzi?', ['Closes winners too early', 'Improves profits', 'Nothing', 'Builds discipline'], ['Gufunga abatsinze vuba', 'Kunoza umusaruro', 'Nta kintu', 'Kubaka discipline'], 0, 'Fear cuts winners short.', 'Ubwoba bugabanya abatsinze.'],
          ['What does greed do?', 'Sebeya ikora iki?', ['Holds losers too long / too much risk', 'Makes you careful', 'Reduces losses', 'Nothing bad'], ['Gufata abatsinzwe kure / risk nyinshi', 'Gukora ubwitonzi', 'Kugabanya igihombo', 'Nta bibi'], 0, 'Greed holds losers and oversizes risk.', 'Sebeya igumisha abatsinzwe no kwongera risk.'],
          ['What is the cure for emotional trading?', 'Igisubizo cya trading y\'imyimerere ni iki?', ['A written plan followed strictly', 'More feelings', 'Bigger lots', 'No stops'], ['Plan yanditse ikarikizwa', 'Imyimerere myinshi', 'Lots nini', 'Nta stops'], 0, 'A plan decided in advance beats in-the-moment emotion.', 'Plan yafashwe mbere iratsinda imyimerere.'],
        ]],
      [2, 'Building a Trading Plan', 'Kubaka Trading Plan',
        'A trading plan is a set of rules you write before trading. It answers: which pairs, when to trade, how much to risk, where the stop goes, where the target is, and when to stop for the day. A simple plan followed every day beats a perfect plan used once. Write yours down and journal whether you followed it.',
        'Trading plan ni amategeko wanditse mbere ya trading. Isubiza: pairs izihe, ryari ugucuruza, risk ingahe, aho stop iri, aho intego iri, n\'igihe uhagarara umunsi. Plan yoroshye ikarikizwa buri munsi iratsinda plan nziza yakoreshejwe rimwe. Yandika kandi wandike niba wayikurikiye.',
        [
          ['What does a trading plan include?', 'Trading plan irimo iki?', ['Pairs, timing, risk, SL, target, daily stop', 'Just the pair', 'Only profits', 'Nothing specific'], ['Pairs, igihe, risk, SL, intego, uhagarara umunsi', 'Pair gusa', 'Umusaruro gusa', 'Nta kintu'], 0, 'A plan covers what, when, how much, and when to stop.', 'Plan igizwe n\'iki, ryari, ingano, n\'igihe guhagarara.'],
          ['Which is better?', 'Ni iyihe myiza?', ['Simple plan followed daily', 'Perfect plan used once', 'No plan', 'Coping others'], ['Plan yoroshye ikarikizwa buri munsi', 'Plan nziza yakoreshejwe rimwe', 'Nta plan', 'Gukopora abandi'], 0, 'Consistency beats perfection.', 'Kurikiza uko bikwiiye kuratsinda ubukungu.'],
          ['What should you journal?', 'Ugomba kwandika iki?', ['Whether you followed the plan', 'Only wins', 'Nothing', 'Others\' trades'], ['Niba wakurikiye plan', 'Abatsinze gusa', 'Nta kintu', 'Trades z\'abandi'], 0, 'Journal plan-adherence, not just results.', 'Andika niba wakurikiye plan, si ibisubizo gusa.'],
        ]],
      [3, 'Common Beginner Mistakes', 'Amakosa Y\'abatangira',
        'The top mistakes: trading without a stop loss, moving stops further away, revenge trading after a loss, overleveraging, and trading during big news without experience. Every one of these is a discipline problem, not a knowledge problem. Recognize them in your journal and they lose their power.',
        'Amakosa ya mbere: gucuruza nta stop loss, kwimura stop kure, revenge trading nyuma yo gutsindwa, leverage nyinshi, no gucuruza mu makuru manini nta bumenyi. Buri kimwe muri ibi ni ikibazo cya discipline, si ubwenge. Byimenye muri journal yawe kandi bitakaza imbaraga.',
        [
          ['Biggest beginner mistake?', 'Ikosa rinini ry\'abatangira?', ['No stop loss', 'Too much practice', 'Learning first', 'Small lots'], ['Nta stop loss', 'Imyitozo myinshi', 'Kwiga mbere', 'Lots nto'], 0, 'No SL = uncontrolled loss.', 'Nta SL = igihombo kidagenzurwa.'],
          ['What is revenge trading?', 'Revenge trading ni iki?', ['Trading emotionally after a loss to win it back', 'A strategy', 'Helping others', 'Paper trading'], ['Gucuruza mu myimerere nyuma yo gutsindwa', 'Strategi', 'Gufasha abandi', 'Paper trading'], 0, 'Revenge trading compounds losses.', 'Revenge trading yikurikiza ibihombo.'],
          ['Should beginners trade big news events?', 'Abatangira bagomba gucuruza amakuru manini?', ['No, avoid until experienced', 'Yes, always', 'Only XAU', 'Only Fridays'], ['Oya, kwirinda kugeza ufite uburambe', 'Yego, buri gihe', 'XAU gusa', 'Ku wa gatanu gusa'], 0, 'News spikes are too wild for beginners.', 'Amakuru manini ni akaga ku batangira.'],
        ]],
    ],
    exam: [
      ['Fear makes you...', ['Close winners early', 'Hold losers', 'Trade more', 'Win more'], 0],
      ['Greed makes you...', ['Hold losers / oversize', 'Careful', 'Safe', 'Small'], 0],
      ['The cure for emotion is...', ['A written plan', 'More trades', 'Bigger lots', 'Luck'], 0],
      ['A trading plan covers...', ['What, when, how much, when to stop', 'Only profits', 'Nothing', 'Pairs only'], 0],
      ['Best plan is...', ['Simple, followed daily', 'Perfect, used once', 'None', 'Copied'], 0],
      ['No stop loss is...', ['The biggest mistake', 'Fine', 'Smart', 'Required'], 0],
      ['Revenge trading is...', ['Emotional trading after a loss', 'A strategy', 'Good', 'Learning'], 0],
      ['Journal should track...', ['Plan adherence', 'Only wins', 'Nothing', 'Losses only'], 0],
    ],
    practicals: [
      [1, 'Place a trade with stop loss and take profit, then write a journal entry explaining your reasoning before closing it.',
        'Shyira trade na stop loss na take profit, hanyuma wandike journal isobanura impamvu mbere yo kuyifunga.',
        { checks: [{ id: 'has_sl', weight: 0.3, type: 'has_field', field: 'stop_loss_price' }, { id: 'has_tp', weight: 0.3, type: 'has_field', field: 'take_profit_price' }, { id: 'journal', weight: 0.4, type: 'has_field', field: 'journal_entry' }], pass_threshold: 0.7 }],
    ],
  },
  5: {
    lessons: [
      [1, 'When Are You Ready for Real Money?', 'Ni ryari witeguye amafaranga nyayo?',
        'You are ready when your practice shows consistent discipline, not just wins. Signs: you pass exams, you always use stop losses, you risk 1-2% max, your Readiness Score stays above 70 for two weeks, and you can explain every trade you take. Even then, start tiny - an amount you can afford to lose completely.',
        'Witeguye iyo imyitozo yawe yerekana discipline ihuriwe, si abatsinze gusa. Ibimenyetso: utsinze ibizami, ukoresha stop loss buri gihe, risk ya 1-2% ntarenga, Readiness Score yawe igumana hejuru ya 70 by\'amayinga abiri, kandi ushobora gusobanura trade yose. N\'ubwo bimeze bityo, tangira bito - amafaranga ushobora gutakaza yose.',
        [
          ['Readiness shows as...', 'Kwitegura bigaragara nka...?', ['Consistent discipline, not just wins', 'One big win', 'Many trades', 'Big lots'], ['Discipline ihuriwe, si abatsinze gusa', 'Umusaruro umwe munini', 'Trades nyinshi', 'Lots nini'], 0, 'Consistency of rules followed is the real signal.', 'Kurikiza amategeko ni yo siyabasa nyayo.'],
          ['Readiness score for real trading?', 'Amanota yo kwitegura kuri trading nyayo?', ['70+ for two weeks', '50 once', '100 forever', 'Any score'], ['70+ mu cyumweru ebyiri', '50 rimwe', '100 iteka', 'Amanota yose'], 0, '≥70 sustained shows durable discipline.', '≥70 ihamye yerekana discipline idashimishwa.'],
          ['First real account should be...', 'Konti ya mbere nyayo igomba kuba...?', ['An amount you can lose fully', 'Your savings', 'Borrowed money', 'Everything you have'], ['Amafaranga ushobora gutakaza yose', 'Ubwizigame bwawe', 'Umwenda', 'Ibyose ufite'], 0, 'Only risk money you can afford to lose.', 'Riska amafaranga ushobora gutakaza gusa.'],
        ]],
      [2, 'Choosing a Licensed Broker', 'Guhitamo Broker Wemewe',
        'A licensed broker is regulated by a government authority. Check: license number on the regulator website (not the broker\'s own site), segregated client funds, clear fees, easy withdrawals. Avoid: guaranteed returns, pressure to deposit fast, unlicensed offshore brokers, and anyone who "trades for you".',
        'Broker wemewe arengwa n\'ikigo cy\'ubutegetsi. Reba: numero ya license kuri site ya regulator (si site ya broker), amafaranga y\'abakiliya atandukanyije, ibiguzi bisobanutse, gukuramo byoroshye. Kwirinda: umusaruro wizewe, kwihutira gushyira, brokers z\'inyanja nta license, n\'umuntu wese "ukucururiza".',
        [
          ['How to verify a broker license?', 'Ugenzura license ya broker gute?', ['Check the regulator\'s official website', 'Trust the broker\'s site', 'Ask them', 'Guess'], ['Reba site ya regulator', 'Wizeye site ya broker', 'Babaze', 'Tahirira'], 0, 'Always verify on the regulator site, not the broker\'s claims.', 'Genzura kuri site ya regulator buri gihe.'],
          ['Red flag: broker promises...', 'Ikibazo: broker isezeranya...?', ['Guaranteed returns', 'Low spreads', 'Fast platform', 'Good support'], ['Umusaruro wizewe', 'Spreads nto', 'Platform yihuta', 'Ubufasha'], 0, 'Guaranteed returns = scam.', 'Umusaruro wizewe = scam.'],
          ['Segregated funds means...', 'Amafaranga atandukanyije bivuga...?', ['Your money kept separate from broker\'s', 'Mixed with broker money', 'Locked forever', 'In crypto only'], ['Amafaranga yawe atandukanyije n\'aya broker', 'Bihungabanye n\'aya broker', 'Birafunzwe iteka', 'Muri crypto gusa'], 0, 'Segregation protects your deposit if broker fails.', 'Kutandukanya kurinda amafaranga yawe niba broker yananiwe.'],
        ]],
      [3, 'Your First Real Trade', 'Trade Yawe ya Mbere Nyayo',
        'When you move to a real account, treat it exactly like the sandbox. Same rules: 1% risk, stop loss always, journal every trade. Start with the smallest possible size (micro lot or less). Expect real money to feel different - emotions get louder. That is normal. Your plan is the anchor.',
        'Iyo ujya kuri konti nyayo, yikore nka sandbox. Amategeko amwe: risk 1%, stop loss buri gihe, journal kuri trade yose. Tangira n\'ingano nto cyane (micro lot cyangwa nto). Tegereza amafaranga nyayo kumva bitandukanye - imyimerere irazamura. Biri bisanzwe. Plan yawe ni yo ihagaritse.',
        [
          ['First real trades should use...', 'Trades za mbere nyayo zakoresha...?', ['Smallest size possible', 'Big size', 'No stops', 'Max leverage'], ['Ingano nto cyane', 'Ingano nini', 'Nta stops', 'Leverage yose'], 0, 'Start micro or smaller while emotions calibrate.', 'Tangira micro cyangwa nto imyimerere iteganijwe.'],
          ['Real money feels different because...', 'Amafaranga nyayo yumva bitandukanye kubera...?', ['Emotions get louder', 'The app changes', 'Brokers cheat', 'Prices differ'], ['Imyimerere irazamura', 'App ihinduka', 'Brokers barabeshya', 'Ibiciro bitandukana'], 0, 'Fear and greed get real when money is real.', 'Ubwoba na sebeya biba ukuri iyo amafaranga ari ay\'ukuri.'],
          ['Your plan when trading real is...', 'Plan yawe muri trading nyayo ni...?', ['The anchor - same sandbox rules', 'To be ignored', 'Optional', 'For beginners only'], ['Ihagaritse - amategeko ya sandbox', 'Kwirengagiza', 'Si ngombwa', 'Ku batangira gusa'], 0, 'The same discipline carries over.', 'Discipline imwe ikomeza.'],
        ]],
    ],
    exam: [
      ['Ready means...', ['Consistent discipline', 'One big win', 'Many trades', 'Big profit'], 0],
      ['Readiness threshold?', ['70+ for 2 weeks', '50 once', '90 once', 'Any'], 0],
      ['First real deposit?', ['Affordable to lose', 'Savings', 'Borrowed', 'Everything'], 0],
      ['Verify broker license on...', ['Regulator website', 'Broker site', 'Social media', 'Trust them'], 0],
      ['Red flag: broker promises...', ['Guaranteed returns', 'Low fees', 'Fast app', 'Support'], 0],
      ['Segregated funds means...', ['Your money kept separate', 'Mixed', 'Locked', 'Crypto only'], 0],
      ['First real trade size?', ['Micro or less', 'Standard lot', 'Max leverage', 'Big'], 0],
      ['On a real account, rules are...', ['Same as sandbox', 'Relaxed', 'Ignored', 'New each day'], 0],
    ],
    practicals: [
      [1, 'Demonstrate full discipline: place a trade with SL, TP, 1-2% risk, and a journal entry, then close it.',
        'Erekana discipline yuzuye: shyira trade na SL, TP, risk ya 1-2%, na journal, hanyuma uyifunge.',
        { checks: [{ id: 'has_sl', weight: 0.25, type: 'has_field', field: 'stop_loss_price' }, { id: 'has_tp', weight: 0.25, type: 'has_field', field: 'take_profit_price' }, { id: 'risk_band', weight: 0.3, type: 'risk_range', field: 'risk_percent', min: 0.5, max: 2.5 }, { id: 'journal', weight: 0.2, type: 'has_field', field: 'journal_entry' }], pass_threshold: 0.7 }],
    ],
  },
};

async function seedL345(db, levelIds) {
  for (const levelNum of [3, 4, 5]) {
    const pack = PACKS[levelNum];
    const levelId = levelIds[levelNum];
    for (const [n, t, tr, c, cr, quiz] of pack.lessons) {
      const lr = await db.query(
        `INSERT INTO lessons (level_id, lesson_number, title_en, title_rw, content_en, content_rw, duration_minutes, order_index, state, native_speaker_approved)
         VALUES ($1,$2,$3,$4,$5,$6,5,$7,'published',false) RETURNING id`,
        [levelId, n, t, tr, c, cr, n]
      );
      let i = 0;
      for (const [q, qr, o, orw, a, e, er] of quiz) {
        await db.query(
          `INSERT INTO lesson_quizzes (lesson_id, question_en, question_rw, options_en, options_rw, correct_index, explanation_en, explanation_rw, order_index)
           VALUES ($1,$2,$3,$4,$5,$6,$7,$8,$9)`,
          [lr.rows[0].id, q, qr, JSON.stringify(o), JSON.stringify(orw), a, e, er, i++]
        );
      }
    }
    for (const [q, opts, a] of pack.exam) {
      await db.query(
        `INSERT INTO mcq_question_banks (level_id, question_en, question_rw, options_en, options_rw, correct_index, difficulty)
         VALUES ($1,$2,$2,$3,$3,$4,'medium')`,
        [levelId, q, JSON.stringify(opts), a]
      );
    }
    for (const [n, p, pr, rubric] of pack.practicals) {
      await db.query(
        `INSERT INTO practical_exam_tasks (level_id, task_number, prompt_en, prompt_rw, rubric, pass_threshold)
         VALUES ($1,$2,$3,$4,$5,$6)`,
        [levelId, n, p, pr, JSON.stringify(rubric), rubric.pass_threshold]
      );
    }
  }
  console.log('[db] Seeded L3-L5 content');
}

module.exports = { seedL345 };
