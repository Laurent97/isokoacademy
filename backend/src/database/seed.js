/**
 * Seed data for the dev database.
 * Content comes from LESSONS_L0_L1_SPEC.md.
 * Kinyarwanda strings are DRAFT translations pending native review.
 * Idempotent: only seeds when tables are empty.
 */

const LEVELS = [
  { n: 0, t: 'Introduction to Trading', tr: 'Intangiriro ya Trading', d: 'Welcome to Isoko Academy! This level introduces what trading is, why we practice first, and how to stay safe from scams.', dr: 'Murakaza neza muri Isoko Academy! Iyi level ivuga uko trading ikora, impamvu tutangira gukorera imyitozo, na uko twirinda ibyoryo.' },
  { n: 1, t: 'Basics of Forex and Gold', tr: 'Ibanze bya Forex na Zahabu', d: 'Learn what FOREX is, what gold trading is, and basic terms like pips, lots, and pairs. You will start practicing in the simulator.', dr: 'Muri iyi level, uziga FOREX ni iki, trading ya zahabu ni iki, n\'amagambo ya mbere nka pips, lots, na pairs.' },
  { n: 2, t: 'Reading Charts & Candles', tr: 'Gusoma Charts na Candles', d: 'Understand candlesticks, trends, and support/resistance.', dr: 'Sobanukirwa candlesticks, trends, na support/resistance.' },
  { n: 3, t: 'Risk Management', tr: 'Gucunga Risk', d: 'Position sizing, stop losses, and protecting your capital.', dr: 'Ingano y\'isoko, stop losses, no kurinda amafaranga yawe.' },
  { n: 4, t: 'Trading Psychology & Strategy', tr: 'Psychology na Strategy', d: 'Discipline, journaling, and building a simple trading plan.', dr: 'Kwikorera, journaling, no kubaka plan yoroshye ya trading.' },
  { n: 5, t: 'Readiness for Real Markets', tr: 'Kwitegura Isoko Ryukuri', d: 'Final assessment: prove consistent, disciplined practice before real trading.', dr: 'Isuzuma rya nyuma: garagaza ko witeguye mbere ya trading nyayo.' },
];

const L0_LESSONS = [
  {
    n: 1,
    t: 'What is Trading?', tr: 'Trading ni iki?',
    c: 'Trading means buying and selling things to make a profit. In trading, you buy something at a low price and sell it at a higher price. The difference is your profit. For example, if you buy gold at $1,800 and sell it at $1,850, you make $50 profit. But prices can also go down, so you can lose money too. That is why we practice first in a sandbox.',
    cr: 'Trading ni ugugura no kugurisha ibintu kugira ngo utange umusaruro. Muri trading, ugura ikintu ku giciro gito ukagurisha ku giciro kinini. Itandukaniro ni umusaruro wawe. Urugero, niba ugura zahabu ku $1,800 ukagurisha ku $1,850, utanga $50 umusaruro. Ariko ibiciro birashobora no kugwa, bityo ushobora no gutakaza. Niyo mpamvu dutangira gukora imyitozo muri sandbox.',
    quiz: [
      { q: 'What is trading?', qr: 'Trading ni iki?', o: ['Buying and selling to make profit', 'Only buying things', 'Giving money away', 'Working a job'], or: ['Gugura no kugurisha kugira ngo utange umusaruro', 'Gugura ibintu gusa', 'Gutanga amafaranga ubuntu', 'Gukora akazi'], a: 0, e: 'Trading is buying at a low price and selling at a higher price to make profit.', er: 'Trading ni ugugura ku giciro gito ukagurisha ku giciro kinini kugira ngo utange umusaruro.' },
      { q: 'If you buy gold at $1,800 and sell at $1,850, what is your profit?', qr: 'Niba ugura zahabu ku $1,800 ukagurisha ku $1,850, umusaruro wawe ni uwuhe?', o: ['$50', '$100', '$1,800', '$1,850'], or: ['$50', '$100', '$1,800', '$1,850'], a: 0, e: '$1,850 - $1,800 = $50 profit.', er: '$1,850 - $1,800 = $50 umusaruro.' },
      { q: 'Why do we practice in a sandbox first?', qr: 'Kuki dutangira gukora imyitozo muri sandbox?', o: ['To learn without losing real money', 'To make real money fast', 'Because trading is easy', 'To show off to friends'], or: ['Kugira ngo twigire tutatakaje amafaranga nyayo', 'Kugira ngo dukore amafaranga nyayo vuba', 'Kubera ko trading ari yoroshye', 'Kugaragariza inshuti'], a: 0, e: 'The sandbox lets you practice with virtual money so you can learn safely.', er: 'Sandbox igufasha gukora imyitozo n\'amafaranga y\'ikinamico kugira ngo wigire mutekanye.' },
    ],
  },
  {
    n: 2,
    t: 'Why We Never Risk Real Money While Learning', tr: 'Impamvu tutashyira amafaranga nyayo mu kaga tukiga',
    c: 'Many people lose money in trading because they start with real money before learning. In Isoko Academy, you will use a sandbox account with virtual money. This account is not real. You cannot withdraw the money. It is only for practice. This way, you can make mistakes and learn from them without losing your real money. When you are ready, you can try a real account with a licensed broker.',
    cr: 'Abantu benshi batakaza amafaranga muri trading kubera ko batangira n\'amafaranga nyayo mbere yo kwiga. Muri Isoko Academy, uzakoresha konti ya sandbox n\'amafaranga y\'ikinamico. Iyi konti si nyayo. Ntushobora gukuramo amafaranga. Ni yo gukoresha imyitozo gusa. Uku buryo, ushobora gukora amakosa no kwigira ku makosa atatakaje amafaranga yawe nyayo. Iyo witeguye, ushobora kugerageza konti nyayo n\'umucuruzi wemewe.',
    quiz: [
      { q: 'What is a sandbox account?', qr: 'Konti ya sandbox ni iki?', o: ['A practice account with virtual money', 'A real bank account', 'A gambling account', 'A savings account'], or: ['Konti yo gukorera imyitozo n\'amafaranga y\'ikinamico', 'Konti ya banki nyayo', 'Konti yo gucirizamo', 'Konti yo kubitsa'], a: 0, e: 'A sandbox account is for practice only and uses virtual money, not real money.', er: 'Konti ya sandbox ni yo gukora imyitozo gusa ikoresha amafaranga y\'ikinamico, si amafaranga nyayo.' },
      { q: 'Can you withdraw money from a sandbox account?', qr: 'Ushobora gukuramo amafaranga muri konti ya sandbox?', o: ['No, it is only for practice', 'Yes, anytime', 'Only after 30 days', 'Only if you make profit'], or: ['Oya, ni yo gukora imyitozo gusa', 'Yego, igihe cyose', 'Nyuma y\'iminsi 30 gusa', 'Niba utanze umusaruro gusa'], a: 0, e: 'Sandbox money is virtual and cannot be withdrawn.', er: 'Amafaranga ya sandbox ni ay\'ikinamico ntashobora gukurwa.' },
      { q: 'Why should you not start with real money?', qr: 'Kuki utagomba gutangira n\'amafaranga nyayo?', o: ['You might lose money before learning', 'Real money is better', 'It is faster to learn with real money', 'Practice is not needed'], or: ['Ushobora gutakaza amafaranga mbere yo kwiga', 'Amafaranga nyayo ni meza', 'Ni byihuse kwiga n\'amafaranga nyayo', 'Imyitozo ntibikenewe'], a: 0, e: 'If you start with real money before learning, you can lose it all.', er: 'Niba utangira n\'amafaranga nyayo mbere yo kwiga, ushobora kuyatakaza yose.' },
    ],
  },
  {
    n: 3,
    t: 'How to Spot Trading Scams', tr: 'Uko wamenya ibyoryo bya trading',
    c: 'Many scams promise you will get rich quick in trading. They say "guaranteed profit" or "no risk". This is never true. Trading always has risk. Real trading education teaches you about risk first. Scams often ask you to send money to them directly. Real brokers are licensed and regulated. Never give your password or private keys to anyone. If it sounds too good to be true, it is probably a scam.',
    cr: 'Ibyoryo byinshi birasezeranya ko uzakira vuba muri trading. Bavuga "umusaruro wizewe" cyangwa "nta kaga". Ibi ntabwo ari ukuri. Trading buri gihe ifite akaga. Uburezi bwa trading nyaburanga bukwigisha ku bijyanye n\'akaga mbere. Ibyoryo akenshi bikubwira kohereza amafaranga kuri bo mu buryo butaziguye. Abacuruzi nyabo bafite uruhushya kandi barengwa. Ntuzagire uwo uha ijambo ry\'ibanga cyangwa urufunguzo rwawe. Niba bivugwa ko ari byiza cyane kutemera ukuri, birashobora kuba uburyo.',
    quiz: [
      { q: 'What do scams often promise?', qr: 'Ibyoryo bikunze kusezeranya iki?', o: ['Guaranteed profit', 'Risk management', 'Licensed brokers', 'Education first'], or: ['Umusaruro wizewe', 'Gucunga risk', 'Abacuruzi bemerewe', 'Uburezi mbere'], a: 0, e: 'Scams promise guaranteed profit, which is impossible in real trading.', er: 'Ibyoryo bisezeranya umusaruro wizewe, ibyo ntibishoboka muri trading nyayo.' },
      { q: 'Is it true that trading has no risk?', qr: 'Ni ukuri ko trading nta kaga ifite?', o: ['No, trading always has risk', 'Yes, if you know how', 'Only for beginners', 'Only with big money'], or: ['Oya, trading buri gihe ifite akaga', 'Yego, niba uzi uko', 'Ku bato gusa', 'Ku mafaranga menshi gusa'], a: 0, e: 'Trading always involves risk. Anyone who says otherwise is lying.', er: 'Trading buri gihe ifite akaga. Umuntu wese uvuga ibindi arabeshya.' },
      { q: 'What should you never give to anyone?', qr: 'Ni iki utagomba guha umuntu wese?', o: ['Your password or private keys', 'Your trading ideas', 'Your quiz answers', 'Your level progress'], or: ['Ijambo ry\'ibanga cyangwa urufunguzo rwawe', 'Ibitekerezo byawe bya trading', 'Ibisubizo byawe', 'Aho wageze'], a: 0, e: 'Never share your password or private keys with anyone.', er: 'Ntuzagire uwo uha ijambo ry\'ibanga cyangwa urufunguzo rwawe.' },
    ],
  },
];

const L1_LESSONS = [
  {
    n: 1,
    t: 'What is FOREX?', tr: 'FOREX ni iki?',
    c: 'FOREX means foreign exchange. It is the market where people trade currencies. For example, you can trade the Euro against the US Dollar (EUR/USD). When you buy EUR/USD, you are buying Euros and selling US Dollars. FOREX is the largest market in the world. It is open 24 hours a day, 5 days a week. The price of currencies changes all the time based on news, economy, and politics.',
    cr: 'FOREX ivuga foreign exchange. Ni isoko aho abantu bacuruza ifaranga. Urugero, ushobora gucuruza Euro kuri US Dollar (EUR/USD). Iyo ugura EUR/USD, ugura Euros ukagurisha US Dollars. FOREX ni isoko rinini cyane ku isi. Rifungura amasaha 24 ku munsi, iminsi 5 mu cyumweru. Igiciro cy\'ifaranga gihinduka ibihe byose bitewe n\'amakuru, ubukungu, na politiki.',
    quiz: [
      { q: 'What does FOREX mean?', qr: 'FOREX ivuga iki?', o: ['Foreign exchange', 'Fast exchange', 'Foreign economy', 'Future exchange'], or: ['Foreign exchange', 'Fast exchange', 'Foreign economy', 'Future exchange'], a: 0, e: 'FOREX stands for foreign exchange, which is trading currencies.', er: 'FOREX ivuga foreign exchange, ni ugucuruza ifaranga.' },
      { q: 'What is a currency pair?', qr: 'Currency pair ni iki?', o: ['Two currencies traded against each other', 'One currency only', 'A type of gold', 'A bank account'], or: ['Amafaranga abiri acuruzwa', 'Ifaranga rimwe gusa', 'Ubwoko bwa zahabu', 'Konti ya banki'], a: 0, e: 'A currency pair is two currencies, like EUR/USD.', er: 'Currency pair ni amafaranga abiri, nka EUR/USD.' },
      { q: 'When is FOREX open?', qr: 'FOREX ifungura ryari?', o: ['24 hours, 5 days a week', '24 hours, 7 days a week', '8 hours, 5 days a week', 'Only on weekends'], or: ['Amasaha 24, iminsi 5 mu cyumweru', 'Amasaha 24, iminsi 7 mu cyumweru', 'Amasaha 8, iminsi 5 mu cyumweru', 'Ku mpera z\'icyumweru gusa'], a: 0, e: 'FOREX is open 24 hours a day from Monday to Friday.', er: 'FOREX ifungura amasaha 24 ku munsi kuva kuwa mbere kugeza kuwa gatanu.' },
    ],
  },
  {
    n: 2,
    t: 'What is Gold Trading (XAU/USD)?', tr: 'Trading ya Zahabu (XAU/USD) ni iki?',
    c: 'Gold is traded against the US Dollar. The symbol is XAU/USD. XAU is the code for gold. Gold is popular because it keeps value when the economy is weak. Gold prices can move very fast, especially during news events. Gold is measured in troy ounces. One lot of gold is 100 troy ounces. Gold trading can be risky because prices change quickly.',
    cr: 'Zahabu icuruzwa kuri US Dollar. Ikimenyetso ni XAU/USD. XAU ni kode ya zahabu. Zahabu ikundwa kubera ko igumisha agaciro iyo ubukungu bufite ikibazo. Ibiciro bya zahabu bishobora guhinduka vuba cyane, cyane mu gihe hari amakuru. Zahabu ipimwa muri troy ounces. Lot imwe ya zahabu ni troy ounces 100. Trading ya zahabu ishobora kuba ifite akaga kubera ko ibiciro bihinduka vuba.',
    quiz: [
      { q: 'What is the symbol for gold?', qr: 'Ikimenyetso cya zahabu ni iki?', o: ['XAU', 'GOLD', 'GLD', 'AU'], or: ['XAU', 'GOLD', 'GLD', 'AU'], a: 0, e: 'XAU is the international symbol for gold in trading.', er: 'XAU ni ikimenyetso mpuzamahanga cya zahabu muri trading.' },
      { q: 'What is one lot of gold?', qr: 'Lot imwe ya zahabu ni ingahe?', o: ['100 troy ounces', '1 troy ounce', '10 troy ounces', '1000 troy ounces'], or: ['Troy ounces 100', 'Troy ounce 1', 'Troy ounces 10', 'Troy ounces 1000'], a: 0, e: 'One standard lot of gold is 100 troy ounces.', er: 'Lot imwe isanzwe ya zahabu ni troy ounces 100.' },
      { q: 'Why is gold popular?', qr: 'Kuki zahabu ikundwa?', o: ['It keeps value when economy is weak', 'It is cheap', 'It never changes price', 'It is easy to find'], or: ['Igumisha agaciro iyo ubukungu bufite ikibazo', 'Ni ihendutse', 'Ntihindura igiciro', 'Ni byoroshye kuyibona'], a: 0, e: 'Gold is seen as a safe asset that keeps value in difficult times.', er: 'Zahabu ifatwa nk\'umutungo utekanye ugumisha agaciro mu bihe bigoye.' },
    ],
  },
  {
    n: 3,
    t: 'What is a Pip?', tr: 'Pip ni iki?',
    c: 'A pip is the smallest price move in FOREX. For most pairs like EUR/USD, a pip is 0.0001. For USD/JPY, a pip is 0.01. For gold (XAU/USD), a pip is 0.01. Pips measure how much the price moved. If EUR/USD moves from 1.1000 to 1.1005, it moved 5 pips. Pips are important because your profit or loss is calculated in pips.',
    cr: 'Pip ni ihinduka rito cyane ry\'igiciro muri FOREX. Ku pairs nyinshi nka EUR/USD, pip ni 0.0001. Kuri USD/JPY, pip ni 0.01. Kuri zahabu (XAU/USD), pip ni 0.01. Pips zipima uburyo igiciro cyahindutse. Niba EUR/USD ihagaze uva kuri 1.1000 kugeza kuri 1.1005, yahindutse pips 5. Pips ni ngombwa kubera ko umusaruro cyangwa igihombo cyawe kibarurwa muri pips.',
    quiz: [
      { q: 'What is a pip?', qr: 'Pip ni iki?', o: ['The smallest price move', 'A type of currency', 'A trading strategy', 'A broker fee'], or: ['Ihinduka rito cyane ry\'igiciro', 'Ubwoko bw\'ifaranga', 'Strategi ya trading', 'Ikiguzi cya broker'], a: 0, e: 'A pip is the smallest change in price for a currency pair.', er: 'Pip ni ihinduka rito cyane muri igiciro cya currency pair.' },
      { q: 'For EUR/USD, what is one pip?', qr: 'Kuri EUR/USD, pip imwe ni iyihe?', o: ['0.0001', '0.001', '0.01', '0.1'], or: ['0.0001', '0.001', '0.01', '0.1'], a: 0, e: 'For EUR/USD and similar pairs, one pip equals 0.0001.', er: 'Kuri EUR/USD na pairs zisa, pip imwe ingana na 0.0001.' },
      { q: 'If EUR/USD moves from 1.1000 to 1.1010, how many pips did it move?', qr: 'Niba EUR/USD ihagaze uva kuri 1.1000 kugeza kuri 1.1010, yahindutse pips zingahe?', o: ['10 pips', '1 pip', '100 pips', '0.1 pips'], or: ['Pips 10', 'Pip 1', 'Pips 100', 'Pips 0.1'], a: 0, e: '1.1010 - 1.1000 = 0.0010, which is 10 pips.', er: '1.1010 - 1.1000 = 0.0010, ibi ni pips 10.' },
    ],
  },
  {
    n: 4,
    t: 'What is a Lot?', tr: 'Lot ni iki?',
    c: 'A lot is the size of your trade. A standard lot is 100,000 units of the base currency. A mini lot is 10,000 units. A micro lot is 1,000 units. Beginners should start with micro lots or smaller. Lot size affects how much each pip is worth. A larger lot size means more profit or loss per pip. Always choose a lot size that fits your risk.',
    cr: 'Lot ni ingano y\'isoko ryawe. Lot isanzwe ni imibare 100,000 ya base currency. Mini lot ni imibare 10,000. Micro lot ni imibare 1,000. Abatangira bagomba gutangira na micro lots cyangwa nto. Ingano ya lot ihindura agaciro ka pip buri wose. Ingano nini ya lot bivuga umusaruro cyangwa igihombo kinini kuri pip. Buri gihe hitamo ingano ya lot ihuye n\'akaga wawe.',
    quiz: [
      { q: 'What is a standard lot?', qr: 'Lot isanzwe ni iyihe?', o: ['100,000 units', '10,000 units', '1,000 units', '100 units'], or: ['Imibare 100,000', 'Imibare 10,000', 'Imibare 1,000', 'Imibare 100'], a: 0, e: 'A standard lot is 100,000 units of the base currency.', er: 'Lot isanzwe ni imibare 100,000 ya base currency.' },
      { q: 'What should beginners use?', qr: 'Abatangira bagomba gukoresha iki?', o: ['Micro lots or smaller', 'Standard lots', 'Only mini lots', 'Any lot size'], or: ['Micro lots cyangwa nto', 'Lots isanzwe', 'Mini lots gusa', 'Ingano ya lot iyo ari yo yose'], a: 0, e: 'Beginners should start small with micro lots to manage risk.', er: 'Abatangira bagomba gutangira bito nka micro lots kugira ngo bache akaga.' },
      { q: 'How does lot size affect profit?', qr: 'Ingano ya lot ihindura umusaruro gute?', o: ['Larger lot = more profit per pip', 'Larger lot = less profit per pip', 'Lot size does not matter', 'Smaller lot = more profit per pip'], or: ['Lot nini = umusaruro munini kuri pip', 'Lot nini = umusaruro muto kuri pip', 'Ingano ya lot ntacyo ihindura', 'Lot nto = umusaruro munini kuri pip'], a: 0, e: 'Bigger lot sizes mean each pip is worth more money.', er: 'Ingano nini ya lots bivuga ko pip buri wose ifite amafaranga menshi.' },
    ],
  },
  {
    n: 5,
    t: 'Currency Pairs We Trade', tr: 'Currency Pairs Ducuruza',
    c: 'In Isoko Academy, we trade these pairs: EUR/USD (Euro/US Dollar), GBP/USD (British Pound/US Dollar), USD/JPY (US Dollar/Japanese Yen), XAU/USD (Gold/US Dollar), and USD/RWF (US Dollar/Rwandan Franc) for learning only. The first currency is the base currency. The second is the quote currency. The price shows how much of the quote currency you need to buy one unit of the base currency.',
    cr: 'Muri Isoko Academy, ducuruza pairs zino: EUR/USD (Euro/US Dollar), GBP/USD (British Pound/US Dollar), USD/JPY (US Dollar/Japanese Yen), XAU/USD (Zahabu/US Dollar), na USD/RWF (US Dollar/Rwandan Franc) yo kwiga gusa. Ifaranga rya mbere ni base currency. Irya kabiri ni quote currency. Igiciro kigaragaza ingano ya quote currency ukeneye kugira ngo ugure imwe ya base currency.',
    quiz: [
      { q: 'Which pair is gold?', qr: 'Ni iyihe pair ya zahabu?', o: ['XAU/USD', 'EUR/USD', 'GBP/USD', 'USD/JPY'], or: ['XAU/USD', 'EUR/USD', 'GBP/USD', 'USD/JPY'], a: 0, e: 'XAU/USD is the symbol for gold trading.', er: 'XAU/USD ni ikimenyetso cya trading ya zahabu.' },
      { q: 'What is USD/RWF used for?', qr: 'USD/RWF ikoreshwa iki?', o: ['Learning only', 'Real trading', 'Gold trading', 'Euro trading'], or: ['Kwiga gusa', 'Trading nyayo', 'Trading ya zahabu', 'Trading ya Euro'], a: 0, e: 'USD/RWF is for learning the concept of pairs, not for serious trading.', er: 'USD/RWF ni yo kwiga ibijyanye na pairs, si trading nyayo.' },
      { q: 'In EUR/USD, which is the base currency?', qr: 'Muri EUR/USD, ni iyihe base currency?', o: ['EUR', 'USD', 'Both', 'Neither'], or: ['EUR', 'USD', 'Zombi', 'Nta na rimwe'], a: 0, e: 'The first currency in the pair is the base currency.', er: 'Ifaranga rya mbere muri pair ni base currency.' },
    ],
  },
];

// L0 exam bank (from spec, EN only in spec -> RW reuses EN until translated)
const L0_EXAM = [
  ['What is trading?', ['Buying and selling to make profit', 'Only buying things', 'Giving money away', 'Working a job'], 0],
  ['If you buy at $100 and sell at $110, what is your profit?', ['$10', '$20', '$100', '$110'], 0],
  ['What is a sandbox account?', ['A practice account with virtual money', 'A real bank account', 'A gambling account', 'A savings account'], 0],
  ['Can you withdraw money from a sandbox account?', ['No', 'Yes', 'Sometimes', 'Only with permission'], 0],
  ['Why do we practice first?', ['To learn without losing real money', 'To make money fast', 'Because it is easy', 'To show off'], 0],
  ['What do scams often promise?', ['Guaranteed profit', 'Risk management', 'Education', 'Hard work'], 0],
  ['Is trading risk-free?', ['No, never', 'Yes, if you are smart', 'Sometimes', 'Only for professionals'], 0],
  ['What should you never share?', ['Your password', 'Your trading ideas', 'Your progress', 'Your level'], 0],
  ['Real brokers are...', ['Licensed and regulated', 'Unlicensed', 'Hard to find', 'Expensive'], 0],
  ['If it sounds too good to be true...', ['It is probably a scam', 'It is real', 'You should try it', 'Ask for more details'], 0],
  ['What happens if you start with real money before learning?', ['You might lose money', 'You will make profit', 'Nothing bad', 'You will learn faster'], 0],
  ['The sandbox account is for...', ['Practice only', 'Real trading', 'Gambling', 'Saving'], 0],
  ['Can prices go down in trading?', ['Yes', 'No', 'Only sometimes', 'Only for gold'], 0],
  ['What is the difference between buy price and sell price?', ['Profit or loss', 'The broker fee', 'The time', 'Nothing'], 0],
  ['Who regulates real brokers?', ['Government authorities', 'No one', 'The broker themselves', 'Other traders'], 0],
  ['What is the first thing to learn in trading?', ['Risk management', 'How to make profit', 'Which broker to use', 'How to read news'], 0],
  ['Should you send money directly to someone promising trading returns?', ['No', 'Yes', 'Only if they are famous', 'Only a small amount'], 0],
  ['What is virtual money?', ['Money that is not real', 'Money in the bank', 'Cash', 'Gold'], 0],
  ['Why is scam education important?', ['To protect your money', 'To become rich', 'To trade better', 'To find brokers'], 0],
  ['When should you try a real account?', ['After learning and practicing', 'Right now', 'Never', 'When you have lots of money'], 0],
];

const L1_EXAM = [
  ['What does FOREX mean?', ['Foreign exchange', 'Fast exchange', 'Foreign market', 'Future trading'], 0],
  ['What is the symbol for gold?', ['XAU', 'GOLD', 'GLD', 'AU'], 0],
  ['What is a pip?', ['Smallest price move', 'A currency', 'A lot size', 'A broker'], 0],
  ['For EUR/USD, one pip equals?', ['0.0001', '0.001', '0.01', '0.1'], 0],
  ['What is a standard lot?', ['100,000 units', '10,000 units', '1,000 units', '100 units'], 0],
  ['What should beginners use?', ['Micro lots', 'Standard lots', 'Any size', 'No lots'], 0],
  ['Which pair is for learning only?', ['USD/RWF', 'EUR/USD', 'XAU/USD', 'GBP/USD'], 0],
  ['In EUR/USD, what is the base currency?', ['EUR', 'USD', 'Both', 'Neither'], 0],
  ['When is FOREX open?', ['24 hours, 5 days', '24 hours, 7 days', '8 hours, 5 days', 'Weekends only'], 0],
  ['How many troy ounces in one gold lot?', ['100', '10', '1', '1000'], 0],
  ['If EUR/USD moves from 1.1000 to 1.1005, how many pips?', ['5', '50', '0.5', '10'], 0],
  ['What is a mini lot?', ['10,000 units', '100,000 units', '1,000 units', '100 units'], 0],
  ['Which is the quote currency in EUR/USD?', ['USD', 'EUR', 'Both', 'Neither'], 0],
  ['Gold is popular because...', ['It keeps value in weak economy', 'It is cheap', 'It never changes', 'It is easy'], 0],
  ['What does XAU stand for?', ['Gold', 'Silver', 'Euro', 'Dollar'], 0],
  ['A micro lot is...', ['1,000 units', '10,000 units', '100,000 units', '100 units'], 0],
  ['How many pairs do we trade?', ['5', '10', '3', '2'], 0],
  ['Which pair uses Yen?', ['USD/JPY', 'EUR/USD', 'GBP/USD', 'XAU/USD'], 0],
  ['Lot size affects...', ['Profit per pip', 'Nothing', 'Only loss', 'Only profit'], 0],
  ['What is GBP/USD?', ['British Pound/US Dollar', 'Gold/US Dollar', 'Euro/US Dollar', 'US Dollar/British Pound'], 0],
];

const L1_PRACTICALS = [
  {
    n: 1,
    p: 'Buy EUR/USD with 0.01 lots. Set a stop loss. Close the trade after it moves 10 pips in your favor.',
    pr: 'Gura EUR/USD na lots 0.01. Shyiraho stop loss. Funga trade nyuma y\'uko ihagaze pips 10 mu cy\'ubufasha bwawe.',
    rubric: {
      checks: [
        { id: 'lot_size', weight: 0.3, type: 'equals_value', field: 'lot_size', value: 0.01 },
        { id: 'has_sl', weight: 0.3, type: 'has_field', field: 'stop_loss_price' },
        { id: 'side_buy', weight: 0.2, type: 'equals_value', field: 'order_side', value: 'buy' },
        { id: 'moved_10pips', weight: 0.2, type: 'pips_moved', min: 10 },
      ],
      pass_threshold: 0.7,
    },
  },
  {
    n: 2,
    p: 'Sell XAU/USD with 0.01 lots. Set a take profit. Wait for the trade to hit take profit or stop loss.',
    pr: 'Gurisha XAU/USD na lots 0.01. Shyiraho take profit. Tegereza trade igere kuri take profit cyangwa stop loss.',
    rubric: {
      checks: [
        { id: 'lot_size', weight: 0.3, type: 'equals_value', field: 'lot_size', value: 0.01 },
        { id: 'has_tp', weight: 0.3, type: 'has_field', field: 'take_profit_price' },
        { id: 'side_sell', weight: 0.2, type: 'equals_value', field: 'order_side', value: 'sell' },
        { id: 'closed', weight: 0.2, type: 'has_field', field: 'closed_at' },
      ],
      pass_threshold: 0.7,
    },
  },
  {
    n: 3,
    p: 'Open a chart for GBP/USD. Identify the current price. Calculate how many pips the price would need to move to reach a target 50 pips away.',
    pr: 'Fungura chart ya GBP/USD. Menya igiciro kiriho. Vuga pips zingahe igiciro gikeneye guhinduka kugere ku ntego ya pips 50.',
    rubric: {
      checks: [
        { id: 'opened_chart', weight: 0.4, type: 'chart_opened', symbol: 'GBP/USD' },
        { id: 'correct_calculation', weight: 0.6, type: 'quiz_answer', correct_answer: '50' },
      ],
      pass_threshold: 0.7,
    },
  },
];

const GLOSSARY = [
  ['pip', 'The smallest unit of price movement for a currency pair.', 'Igice gito cyane cy\'ihinduka ry\'igiciro cya currency pair.', 'basics'],
  ['lot', 'The size of a trade. A standard lot is 100,000 units of the base currency.', 'Ingano ya trade. Lot isanzwe ni imibare 100,000 ya base currency.', 'basics'],
  ['leverage', 'Borrowed capital that lets you control a larger position with less money. Increases both profit and loss.', 'Umwenda uhabwa ukagira amahirwe yo gucunga isoko rinini n\'amafaranga make. Yiyongera umusaruro n\'igihombo.', 'basics'],
  ['spread', 'The difference between the buy (ask) and sell (bid) price of a pair.', 'Itandukaniro hagati y\'igiciro cyo kugura na cyo kugurisha cya pair.', 'basics'],
  ['stop_loss', 'An order that automatically closes a trade at a set price to limit your loss.', 'Order ifunga trade ku giciro washyizeho kugira ngo ugabanye igihombo.', 'risk'],
  ['take_profit', 'An order that automatically closes a trade at a set price to lock in profit.', 'Order ifunga trade ku giciro washyizeho kugira ngo ufate umusaruro.', 'risk'],
  ['margin', 'The amount of money required to open and maintain a leveraged position.', 'Amafaranga akenewe kugira ngo ufungure kandi ugumane isoko rikoresha leverage.', 'basics'],
  ['equity', 'Your account balance plus or minus the profit/loss of open trades.', 'Amafaranga yose uri muri konti wongeraho cyangwa ugakuramo umusaruro/igihombo cya trade zifunguye.', 'account'],
  ['drawdown', 'The decline of your account balance from its peak, usually shown as a percentage.', 'Kugabana kw\'amafaranga ya konti uhereye ku rwego rw\'hejuru, bigaragazwa mu kigero.', 'risk'],
  ['candlestick', 'A chart bar that shows the open, high, low, and close price for a period.', 'Umurango wa chart ugaragaza igiciro cy\'ifungura, cy\'hejuru, cy\'hasi, n\'ifunga.', 'charts'],
  ['base_currency', 'The first currency in a pair. The price shows its value in the quote currency.', 'Ifaranga rya mbere muri pair. Igiciro kigaragaza agaciro karyo muri quote currency.', 'basics'],
  ['quote_currency', 'The second currency in a pair. The price shows how much of it buys one unit of base.', 'Ifaranga rya kabiri muri pair. Igiciro kigaragaza ingano yaryo igura imwe ya base.', 'basics'],
  ['bull_market', 'A market where prices are generally rising over time.', 'Isoko aho ibiciro birazamuka mu gihe.', 'markets'],
  ['bear_market', 'A market where prices are generally falling over time.', 'Isoko aho ibiciro biragwa mu gihe.', 'markets'],
  ['risk_reward', 'The ratio between how much you risk and how much you aim to gain on a trade.', 'Igipimo hagati y\'ibyo utakaza n\'ibyo wifuza kubona kuri trade.', 'risk'],
];

const ADMIN_PHONE = '+250700000001';
const DEMO_PHONE = '+250788000000';

async function seedIfEmpty(db) {
  const { rows } = await db.query('SELECT COUNT(*)::int AS n FROM users');
  if (rows[0].n > 0) return;

  // Levels
  const levelIds = {};
  for (const L of LEVELS) {
    const r = await db.query(
      `INSERT INTO levels (level_number, title_en, title_rw, description_en, description_rw, order_index)
       VALUES ($1,$2,$3,$4,$5,$6) RETURNING id`,
      [L.n, L.t, L.tr, L.d, L.dr, L.n]
    );
    levelIds[L.n] = r.rows[0].id;
  }

  // Lessons + quizzes (published so learners see them)
  const insertLessons = async (levelId, lessons) => {
    for (const L of lessons) {
      const lr = await db.query(
        `INSERT INTO lessons (level_id, lesson_number, title_en, title_rw, content_en, content_rw, duration_minutes, order_index, state, native_speaker_approved)
         VALUES ($1,$2,$3,$4,$5,$6,5,$7,'published',false) RETURNING id`,
        [levelId, L.n, L.t, L.tr, L.c, L.cr, L.n]
      );
      const lessonId = lr.rows[0].id;
      let i = 0;
      for (const Q of L.quiz) {
        await db.query(
          `INSERT INTO lesson_quizzes (lesson_id, question_en, question_rw, options_en, options_rw, correct_index, explanation_en, explanation_rw, order_index)
           VALUES ($1,$2,$3,$4,$5,$6,$7,$8,$9)`,
          [lessonId, Q.q, Q.qr, JSON.stringify(Q.o), JSON.stringify(Q.or), Q.a, Q.e, Q.er, i++]
        );
      }
    }
  };
  await insertLessons(levelIds[0], L0_LESSONS);
  await insertLessons(levelIds[1], L1_LESSONS);
  const { seedL2 } = require('./seedL2');
  await seedL2(db, levelIds[2]);
  const { seedL345 } = require('./seedL345');
  await seedL345(db, levelIds);
  const { seedExtra } = require('./seedExtra');
  await seedExtra(db, levelIds);

  // MCQ exam banks (RW falls back to EN until translated)
  const insertBank = async (levelId, bank) => {
    for (const [q, opts, a] of bank) {
      await db.query(
        `INSERT INTO mcq_question_banks (level_id, question_en, question_rw, options_en, options_rw, correct_index, difficulty)
         VALUES ($1,$2,$2,$3,$3,$4,'medium')`,
        [levelId, q, JSON.stringify(opts), a]
      );
    }
  };
  await insertBank(levelIds[0], L0_EXAM);
  await insertBank(levelIds[1], L1_EXAM);

  // Practical tasks (L1)
  for (const T of L1_PRACTICALS) {
    await db.query(
      `INSERT INTO practical_exam_tasks (level_id, task_number, prompt_en, prompt_rw, rubric, pass_threshold)
       VALUES ($1,$2,$3,$4,$5,$6)`,
      [levelIds[1], T.n, T.p, T.pr, JSON.stringify(T.rubric), T.rubric.pass_threshold]
    );
  }

  // Glossary
  for (const [term, en, rw, cat] of GLOSSARY) {
    await db.query(
      `INSERT INTO glossary (term, definition_en, definition_rw, category) VALUES ($1,$2,$3,$4)`,
      [term, en, rw, cat]
    );
  }

  // Replay datasets
  await db.query(
    `INSERT INTO market_replay_datasets (name, description, event_type, symbol, start_date, end_date) VALUES
     ('Gold Spike - NFP Day', 'XAU/USD volatility around a US jobs report', 'NFP', 'XAU/USD', NOW() - INTERVAL '30 days', NOW() - INTERVAL '30 days' + INTERVAL '2 hours'),
     ('EUR/USD Trend Day', 'A clean trending session on EUR/USD', 'trend', 'EUR/USD', NOW() - INTERVAL '20 days', NOW() - INTERVAL '20 days' + INTERVAL '4 hours')`
  );

  // Admin + demo user
  const adminRes = await db.query(
    `INSERT INTO users (phone_number, full_name, preferred_language) VALUES ($1, 'Isoko Admin', 'en') RETURNING id`,
    [ADMIN_PHONE]
  );
  await db.query(
    `INSERT INTO admin_roles (user_id, role, is_active) VALUES ($1, 'super_admin', true)`,
    [adminRes.rows[0].id]
  );

  const demoRes = await db.query(
    `INSERT INTO users (phone_number, full_name, preferred_language) VALUES ($1, 'Demo Learner', 'en') RETURNING id`,
    [DEMO_PHONE]
  );
  const demoId = demoRes.rows[0].id;
  await db.query(
    `INSERT INTO sandbox_accounts (user_id, balance_usd, starting_balance_usd) VALUES ($1, 10000.00, 10000.00)`,
    [demoId]
  );
  await db.query(
    `INSERT INTO user_levels (user_id, current_level, unlocked_levels) VALUES ($1, 0, ARRAY[0])`,
    [demoId]
  );
  await db.query(
    `INSERT INTO auxx_purchase_limits (user_id) VALUES ($1)`,
    [demoId]
  );
  await db.query(
    `INSERT INTO user_streaks (user_id) VALUES ($1)`,
    [demoId]
  );
  // Give the demo learner some AUXX
  await db.query(
    `INSERT INTO auxx_ledger (user_id, transaction_type, amount_auxx, balance_after_auxx, description)
     VALUES ($1, 'bonus', 5000, 5000, 'Welcome bonus')`,
    [demoId]
  );

  const { linkBankLessons } = require('./linkBankLessons');
  const link = await linkBankLessons(db);
  console.log(`[db] Linked ${link.linked} exam bank questions to lessons`);

  console.log('[db] Seeded dev data: 6 levels, 8 lessons, 24 quizzes, 40 exam questions, glossary, admin & demo users');
  console.log(`[db] Dev login: ${DEMO_PHONE} (learner) / ${ADMIN_PHONE} (admin) - use OTP 123456`);
}

module.exports = { seedIfEmpty };
