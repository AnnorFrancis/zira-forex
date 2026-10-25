/* Zira Forex: every piece of business content lives here.
   Rebrand or update prices by editing this file only (see README). */
(function () {
  'use strict';

  var KF = {};

  KF.brand = {
    name: 'Zira Forex',
    person: 'Zira Adjei',
    academy: 'Ziraforex Trading Academy',
    foundation: 'The Zira Foundation',
    city: 'Accra, Ghana',
    email: 'desk@example.com',            // sample address, confirm with client
    whatsapp: '#',
    social: [
      { id: 'instagram', label: 'Instagram', handle: '@ziraforex', count: '180K', n: 180000, url: '#' },
      { id: 'tiktok', label: 'TikTok', handle: '@ziraforex', count: '95K', n: 95000, url: '#' },
      { id: 'youtube', label: 'YouTube', handle: '@ziraforex', count: '40K', n: 40000, url: '#' },
      { id: 'telegram', label: 'Telegram', handle: '@ziraforex', count: '25K', n: 25000, url: '#' }
    ],
    x: '#'
  };

  /* Real exchange rates (Yahoo Finance, 23 Oct 2026). Units of currency per 1 USD. */
  KF.ratesDate = '23 Oct 2026';
  KF.currencies = [
    { code: 'USD', sym: '$', rate: 1, dp: 0 },
    { code: 'GHS', sym: 'GH₵', rate: 11.54, dp: 0 },
    { code: 'NGN', sym: '₦', rate: 1329.43, dp: 0 },
    { code: 'ZAR', sym: 'R', rate: 16.5575, dp: 0 },
    { code: 'AED', sym: 'AED ', rate: 3.6729, dp: 0 },
    { code: 'XAF', sym: 'FCFA ', rate: 585.61, dp: 0 },
    { code: 'UGX', sym: 'USh ', rate: 4224.3, dp: 0 },
    { code: 'KES', sym: 'KSh ', rate: 129.81, dp: 0 },
    { code: 'GBP', sym: '£', rate: 0.7474, dp: 0 },
    { code: 'EUR', sym: '€', rate: 0.8934, dp: 0 }
  ];
  KF.fx = { AUDUSD: 1 / 1.4245, USDJPY: 156.754 };

  /* Real gold prices: COMEX gold futures (GC=F), daily OHLC, last 64 sessions to 23 Oct 2026. */
  KF.goldSource = 'COMEX gold futures, daily, to 23 Oct 2026';
  KF.gold = [["2026-07-27",4097.5,4119.3,4067.1,4077.0],["2026-07-28",4083.0,4085.7,4011.1,4038.7],["2026-07-29",4020.9,4115.2,3993.8,4036.3],["2026-07-30",4060.7,4118.5,4028.5,4100.1],["2026-07-31",4163.9,4170.7,4076.4,4107.0],["2026-08-03",4135.2,4145.5,4074.0,4090.5],["2026-08-04",4109.6,4163.8,4098.2,4152.6],["2026-08-05",4133.8,4328.2,4121.6,4305.2],["2026-08-06",4307.0,4363.7,4281.2,4299.6],["2026-08-07",4298.3,4432.3,4288.0,4399.7],["2026-08-10",4400.0,4453.8,4373.9,4419.7],["2026-08-11",4446.9,4495.0,4415.7,4441.1],["2026-08-12",4430.0,4502.7,4421.4,4467.5],["2026-08-13",4468.8,4509.1,4400.0,4420.4],["2026-08-14",4408.2,4454.6,4365.5,4437.3],["2026-08-17",4440.0,4486.5,4422.3,4473.7],["2026-08-18",4473.4,4493.1,4383.3,4420.6],["2026-08-19",4391.4,4582.8,4378.0,4545.3],["2026-08-20",4580.0,4597.1,4506.0,4571.4],["2026-08-21",4577.0,4690.4,4565.5,4680.6],["2026-08-24",4673.4,4738.5,4651.8,4697.8],["2026-08-25",4710.1,4755.0,4659.5,4694.5],["2026-08-26",4715.7,4730.9,4638.2,4653.3],["2026-08-27",4650.0,4697.7,4616.0,4664.0],["2026-08-28",4656.0,4688.0,4495.0,4529.9],["2026-08-31",4483.2,4521.5,4445.6,4481.5],["2026-09-01",4498.7,4510.5,4369.7,4396.4],["2026-09-02",4377.2,4444.4,4329.2,4414.6],["2026-09-03",4436.4,4558.5,4426.7,4539.9],["2026-09-04",4522.0,4537.8,4412.0,4476.6],["2026-09-08",4466.5,4488.8,4381.0,4439.0],["2026-09-09",4399.0,4479.0,4384.1,4460.7],["2026-09-10",4448.0,4479.9,4354.7,4407.3],["2026-09-11",4359.4,4444.9,4333.0,4408.9],["2026-09-14",4375.0,4396.8,4293.0,4351.9],["2026-09-15",4340.3,4358.2,4301.6,4332.8],["2026-09-16",4333.5,4413.1,4273.3,4387.5],["2026-09-17",4301.4,4423.3,4294.5,4399.7],["2026-09-18",4381.6,4439.8,4372.2,4424.9],["2026-09-21",4413.0,4422.1,4360.3,4383.9],["2026-09-22",4382.5,4414.1,4327.6,4376.4],["2026-09-23",4394.7,4407.5,4310.7,4318.4],["2026-09-24",4324.4,4338.0,4278.3,4298.0],["2026-09-25",4309.5,4351.6,4289.2,4321.2],["2026-09-28",4315.0,4315.6,4143.1,4168.4],["2026-09-29",4150.1,4218.1,4145.2,4179.7],["2026-09-30",4216.2,4251.1,4178.2,4186.7],["2026-10-01",4190.1,4222.8,4169.4,4202.3],["2026-10-02",4204.6,4259.0,4153.8,4162.3],["2026-10-05",4169.4,4198.9,4150.4,4156.8],["2026-10-06",4169.2,4212.4,4130.7,4187.1],["2026-10-07",4195.0,4197.8,4091.2,4140.7],["2026-10-08",4139.9,4170.7,4128.1,4157.0],["2026-10-09",4159.7,4233.7,4156.1,4216.3],["2026-10-12",4220.8,4242.3,4178.1,4190.6],["2026-10-13",4195.5,4224.8,4169.7,4177.3],["2026-10-14",4184.2,4193.5,4095.0,4107.9],["2026-10-15",4128.3,4197.7,4120.9,4170.1],["2026-10-16",4192.1,4220.4,4167.5,4181.1],["2026-10-19",4185.0,4211.2,4155.6,4160.1],["2026-10-20",4162.4,4174.9,4130.1,4142.6],["2026-10-21",4143.4,4160.6,4122.3,4150.0],["2026-10-22",4159.0,4164.3,4036.8,4060.4],["2026-10-23",4042.2,4047.8,4000.9,4028.3]];

  /* Worked examples for the trade slip. Gold, GBPAUD and BTC levels are sample demo levels;
     targets for gold are drawn at 1R, 2R and 3R for teaching. USDJPY is a teaching example. */
  KF.setups = {
    XAUUSD: { label: 'Gold', pair: 'XAUUSD', dir: 'Buy', entry: 4124.29, stop: 4098.77, tps: [4149.81, 4175.33, 4200.85], pip: 0.1, pipValueUSD: 10, dp: 2, note: 'Sample gold levels for the demo. Targets drawn at 1R, 2R and 3R.' },
    GBPAUD: { label: 'GBPAUD', pair: 'GBPAUD', dir: 'Buy', entry: 1.90934, stop: 1.90290, tps: [1.91530, 1.92250], pip: 0.0001, pipValueUSD: 10 * (1 / 1.4245), dp: 5, note: 'Sample GBPAUD levels for the demo, stated at 1:2.' },
    USDJPY: { label: 'USDJPY', pair: 'USDJPY', dir: 'Buy', entry: 156.40, stop: 155.90, tps: [156.90, 157.40, 157.90], pip: 0.01, pipValueUSD: 1000 / 156.754, dp: 3, note: 'Teaching example at 1R, 2R and 3R.' },
    BTCUSD: { label: 'Bitcoin', pair: 'BTCUSD', dir: 'Buy', entry: 82178.19, stop: 80590.25, tps: [87361.39, 93280.44], pip: 1, pipValueUSD: 1, dp: 2, note: 'Sample BTC levels for the demo. One lot = one coin.' }
  };

  /* The four ways to trade with Zira. Prices are SAMPLE figures for the pitch: confirm with the client. */
  KF.offers = [
    { id: 'room', name: 'Trading Room', word: 'Access', href: 'trading-room.html', from: 99, unit: 'a month', img: 'portrait-20',
      line: 'My daily setups on gold and the majors, the way I take them: entry, stop and three targets.',
      items: ['Daily gold and FX setups', 'Entry, stop and three targets', 'Two live sessions a week', 'The Sunday forecast', 'Synthetics on weekends', 'The members’ community'] },
    { id: 'academy', name: 'Academy', word: 'Knowledge', href: 'academy.html', from: 249, unit: '', img: 'event-1',
      line: 'From your first candlestick to a written trading plan, in courses built around how I actually trade.',
      items: ['Foundations, self-paced', 'The Zira Method, 8 weeks', 'Gold Mastery', 'Synthetics Weekend', 'TradingView from zero', 'Certificate on completion'] },
    { id: 'mentorship', name: 'Mentorship', word: 'Proximity', href: 'mentorship.html', from: 4800, unit: 'by application', img: 'portrait-16',
      line: 'Twelve weeks with me, one to one. Six seats a quarter, by application only.',
      items: ['Twelve weeks, one to one', 'Your plan, written together', 'Weekly chart reviews', 'Journal and mindset check-ins', 'A direct line to Zira', 'Six seats a quarter'] },
    { id: 'bootcamps', name: 'Bootcamps', word: 'Immersion', href: 'bootcamps.html', from: 650, unit: '', img: 'portrait-13',
      line: 'Two days in the room with me: live charts on the big screen, then dinner.',
      items: ['Two days in the room', 'Live trading on the big screen', 'Seven cities, 2026–27', 'Dinner with Zira (VIP)', 'Workbook and replays', 'Forty seats per city'] }
  ];

  /* Trading Room plans (sample prices). */
  KF.room = [
    { id: 'month', name: 'Monthly', usd: 99, per: 'a month', note: 'Cancel any time before renewal.' },
    { id: 'quarter', name: 'Quarterly', usd: 269, per: 'every 3 months', note: 'Saves $28 against monthly.' },
    { id: 'year', name: 'Yearly', usd: 890, per: 'a year', note: 'Three months on us.' }
  ];

  /* Academy programmes (sample prices and schedules). */
  KF.courses = [
    { id: 'foundations', name: 'Foundations', usd: 249, length: 'Self-paced, about 6 weeks', level: 'Beginner', img: 'portrait-20',
      line: 'Everything before your first live trade: how the market moves, how to read it, and how not to blow an account.',
      modules: ['How forex, gold and indices really move', 'Candlesticks and the confirmations that matter', 'Market structure and the break of structure', 'TradingView from zero', 'Risk: lot size, stop loss and the 1% rule', 'Your first demo month, with a journal'] },
    { id: 'method', name: 'The Zira Method', usd: 1250, length: '8 weeks, live, 2 evenings a week', level: 'Intermediate', img: 'event-1',
      line: 'My system, taught live: top-down analysis, break and retest, the 4-hour plan, and the discipline to repeat it.',
      modules: ['Top-down analysis, weekly to 15-minute', 'Break and retest, beginner to advanced', 'The 4-hour trading plan', 'Entries, stops and three targets', 'Revenge trading, overtrading and boredom', 'A written plan, reviewed by Zira'] },
    { id: 'gold', name: 'Gold Mastery', usd: 790, length: '4 weeks, live', level: 'Intermediate', img: 'portrait-21',
      line: 'XAUUSD is my market. How it trends, where it traps people, and how I size it.',
      modules: ['What moves gold: the dollar, yields, the news', 'Sessions: London, New York and the gold open', 'Riding the trend without chasing it', 'Sizing gold when it moves $50 a day', 'NFP and CPI days, planned in advance', 'Live gold sessions with Zira'] },
    { id: 'synthetics', name: 'Synthetics Weekend', usd: 199, length: '2 days, online', level: 'All levels', img: 'portrait-6',
      line: 'Volatility 75 and 25 without gimmicks, for the weekends when forex is closed.',
      modules: ['How synthetic indices work', 'Volatility 75, the simple way', 'Volatility 25, the super-easy strategy', 'Position size on synthetics', 'Weekend routine and limits'] }
  ];

  /* Bootcamp tour (SAMPLE dates and venues for the pitch: confirm with the client). */
  KF.tour = [
    { id: 'dubai', city: 'Dubai', country: 'United Arab Emirates', dates: '14–15 Nov', year: 2026, iso: '2026-11-14', venue: 'DIFC', seats: 40, left: 9, lat: 25.2048, lng: 55.2708 },
    { id: 'lagos', city: 'Lagos', country: 'Nigeria', dates: '5–6 Dec', year: 2026, iso: '2026-12-05', venue: 'Victoria Island', seats: 40, left: 17, lat: 6.5244, lng: 3.3792 },
    { id: 'accra', city: 'Accra', country: 'Ghana', dates: '16–17 Jan', year: 2027, iso: '2027-01-16', venue: 'Airport City', seats: 40, left: 22, lat: 5.6037, lng: -0.187 },
    { id: 'douala', city: 'Douala', country: 'Cameroon', dates: '13–14 Feb', year: 2027, iso: '2027-02-13', venue: 'Bonanjo', seats: 40, left: 31, lat: 4.0511, lng: 9.7679 },
    { id: 'kampala', city: 'Kampala', country: 'Uganda', dates: '13–14 Mar', year: 2027, iso: '2027-03-13', venue: 'Kololo', seats: 40, left: 34, lat: 0.3476, lng: 32.5825 },
    { id: 'joburg', city: 'Joburg', country: 'South Africa', dates: '10–11 Apr', year: 2027, iso: '2027-04-10', venue: 'Sandton', seats: 40, left: 36, lat: -26.2041, lng: 28.0473 },
    { id: 'london', city: 'London', country: 'United Kingdom', dates: '15–16 May', year: 2027, iso: '2027-05-15', venue: 'Canary Wharf', seats: 40, left: 38, lat: 51.5072, lng: -0.1276 }
  ];
  KF.bootcamp = { usd: 650, vipUsd: 1100 };
  KF.mentorship = { usd: 4800, weeks: 12, seats: 6 };

  /* Stages and recognition. */
  KF.stages = [
    ['Speaker, regional traders? summit', '2025'],
    ['Workshop host, African trading forum', '2025'],
    ['Guest educator, markets bootcamp', '2024'],
    ['Teaching across Ghana, Nigeria and Cameroon', 'Ongoing'],
    ['Teaching across Uganda, South Africa and beyond', 'Ongoing']
  ];
  KF.recognition = [
    ['Sample educator recognition', '2025'],
    ['Speaker, regional traders? summit', '2025'],
    ['Featured educator, finance forum', '2024'],
    ['Guest, African markets podcast', '2023'],
    ['Workshop host, trading community', '2025']
  ];
  KF.cities = ['Accra', 'Lagos', 'Douala', 'Kampala', 'Johannesburg', 'Dubai', 'London', 'Kumasi', 'Abuja', 'Cape Town', 'Nairobi', 'online every week'];

  /* Original sample trading-discipline lines and member notes. */
  KF.quotes = {
    lead: 'Protect your plan when the market tests your patience.',
    leadBy: 'Zira Adjei',
    system: 'A steady process outlasts the rush of a quick win.',
    risk: 'Your edge lives in the trades you take by plan, and the ones you let pass.',
    boredom: 'A quiet chart is a good reason to wait.',
    faith: 'Consistency grows when discipline leads.',
    members: [
      { text: 'The journal routine helped me slow down and follow my plan.', by: 'A Trading Room member (sample)', where: 'Sample member note' },
      { text: 'I wait for my setup now instead of chasing every move. Thank you.', by: 'A Trading Room member (sample)', where: 'Sample member note' }
    ]
  };

  /* Generic sample forecast titles and timings. */
  KF.videos = [
    { title: 'Gold this week: levels to watch', len: '15:03', when: '20 Oct', img: 'chart-1' },
    { title: 'Gold this week: structure and key levels', len: '15:23', when: '16 Oct', img: 'chart-2' },
    { title: 'Gold this week: a broader market view', len: '17:38', when: '13 Oct', img: 'chart-3' },
    { title: 'Gold this week: planning the session', len: '33:03', when: 'Sep', img: 'chart-4' },
    { title: 'Gold this week: working with the four-hour chart', len: '29:08', when: 'May', img: 'chart-2' }
  ];

  KF.faq = [
    ['Is this financial advice?', 'No. Everything here is education. Setups shared in the Trading Room show how Zira reads the market and sizes her own trades; you decide what you trade, with money you can afford to lose.'],
    ['I have never traded. Where do I start?', 'Start with Foundations and a demo account. Join the Trading Room once you can place a trade, set a stop and size it in your sleep. The free Sunday forecast on YouTube is a good weekly habit from day one.'],
    ['Which broker do I need?', 'Any regulated broker that offers gold and the majors on MetaTrader or cTrader. Check that the broker is licensed where you live. We will never ask you to send money to us to trade for you.'],
    ['How are setups delivered, and what if I miss one?', 'Instantly on Telegram and in the members’ area, with entry, stop and targets. Every setup stays in the archive with its outcome, losses included, so you can study it later.'],
    ['Can I cancel the Trading Room?', 'Yes, at any time before your next renewal, from your account or by message. Courses can be refunded within 7 days if you have watched less than a fifth of the lessons.'],
    ['Do you guarantee profits?', 'No one honest can. Trading on margin carries a high risk of loss. What we promise is structure: a plan, a risk rule, and a teacher who shows her losses as well as her wins.']
  ];

  KF.risk = 'Trading forex, gold, indices and crypto on margin carries a high risk of loss and is not suitable for everyone. You can lose all of your deposit, and with some brokers more. Past results do not guarantee future results. Everything on this site is education, not financial advice.';

  KF.lotSize = function(balance, risk, stopPips, pipValue) { return balance > 0 && risk > 0 && stopPips > 0 && pipValue > 0 ? Math.floor((balance * risk / 100 / (stopPips * pipValue)) * 100) / 100 : 0; };
  KF.photoAlt = {"portrait-1": "Member smiling in a white blouse", "portrait-2": "Member wearing glasses and a blue top", "portrait-3": "Student smiling in a patterned shirt", "portrait-4": "Member with braided hair and folded arms", "portrait-5": "Audience watching a conference presentation", "portrait-6": "Student in a yellow blouse working at a laptop", "portrait-7": "Member wearing glasses and a pale pink blouse", "portrait-8": "Member in a white collared shirt", "portrait-9": "Students seated together in a classroom", "portrait-10": "Audience in a large conference auditorium", "portrait-11": "Traveller seated in an airport lounge", "portrait-12": "Member with natural hair wearing a black top", "portrait-13": "Student in a hat working at a laptop", "portrait-14": "Student in a yellow blouse and hat at a laptop", "portrait-15": "Member with long braids wearing a white jacket", "portrait-16": "Zira Adjei in an orange blazer", "portrait-17": "Member outdoors wearing a tan coat", "portrait-18": "Member wearing glasses and a blue top", "portrait-19": "Member with braids wearing a black blazer", "portrait-20": "Zira Adjei in an orange blazer with folded arms", "portrait-21": "Zira Adjei in an orange blazer", "portrait-22": "Speaker addressing a seated outdoor gathering", "event-1": "Speaker holding a microphone at an event", "event-2": "Speaker addressing an audience in a red auditorium"};
  window.KF = KF;
})();
