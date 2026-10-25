/* Zira Forex: the sample business database (localStorage).
   Seeds believable SAMPLE members, orders and applications relative to today, so the student area and
   Zira HQ always look alive on camera. Real orders placed on the site are kept as own:true. */
(function () {
  'use strict';
  var KF = window.KF;
  var KEY = 'zf.db.v2', memoryDB = null;
  function rng(seed) { return function () { seed = (seed * 1664525 + 1013904223) % 4294967296; return seed / 4294967296; }; }
  function pick(r, a) { return a[Math.floor(r() * a.length)]; }
  function iso(d) { return d.toISOString().slice(0, 10); }
  function addDays(d, n) { var x = new Date(d); x.setDate(x.getDate() + n); return x; }

  var FIRST = ['Ama', 'Kwame', 'Akosua', 'Kofi', 'Efua', 'Yaw', 'Abena', 'Kojo', 'Adjoa', 'Kwesi', 'Chiamaka', 'Tunde', 'Ngozi', 'Emeka', 'Aisha', 'Ifeoma', 'Brenda', 'Samuel', 'Mercy', 'Joel', 'Thandi', 'Sipho', 'Naledi', 'Achieng', 'Wanjiru', 'Grace', 'Fatou', 'Moussa', 'Aminata', 'Esther', 'Daniel', 'Priscilla', 'Rita', 'Selorm', 'Elikem', 'Nana', 'Afia', 'Dela', 'Joyce', 'Prince'];
  var LAST = ['Mensah', 'Owusu', 'Boateng', 'Asante', 'Addo', 'Ofori', 'Agyeman', 'Darko', 'Quaye', 'Tetteh', 'Okafor', 'Adeyemi', 'Eze', 'Balogun', 'Nkosi', 'Dlamini', 'Ndlovu', 'Otieno', 'Kamau', 'Mukasa', 'Nakato', 'Diallo', 'Traore', 'Fofana', 'Mbeki', 'Ansah', 'Amoah', 'Frimpong', 'Acheampong', 'Sarpong'];
  var COUNTRIES = [['Ghana', 38], ['Nigeria', 24], ['Cameroon', 9], ['South Africa', 7], ['United Kingdom', 5], ['Uganda', 5], ['Kenya', 4], ['United Arab Emirates', 4], ['Other', 4]];
  function country(r) { var x = r() * 100, a = 0; for (var i = 0; i < COUNTRIES.length; i++) { a += COUNTRIES[i][1]; if (x < a) return COUNTRIES[i][0]; } return 'Ghana'; }

  KF.catalog = function () {
    var c = {};
    KF.room.forEach(function (p) { c['room-' + p.id] = { id: 'room-' + p.id, kind: 'room', name: 'Trading Room, ' + p.name.toLowerCase(), usd: p.usd, per: p.per }; });
    KF.courses.forEach(function (x) { c['course-' + x.id] = { id: 'course-' + x.id, kind: 'course', name: x.name, usd: x.usd, per: x.length }; });
    KF.tour.forEach(function (t) {
      c['camp-' + t.id] = { id: 'camp-' + t.id, kind: 'camp', name: 'Bootcamp, ' + t.city + ', standard seat', usd: KF.bootcamp.usd, per: t.dates + ' ' + t.year };
      c['camp-' + t.id + '-vip'] = { id: 'camp-' + t.id + '-vip', kind: 'camp', name: 'Bootcamp, ' + t.city + ', VIP seat', usd: KF.bootcamp.vipUsd, per: t.dates + ' ' + t.year };
    });
    return c;
  };

  function seed() {
    var r = rng(20261023), today = new Date(); today.setHours(12, 0, 0, 0);
    var members = [], orders = [], apps = [];
    for (var i = 0; i < 260; i++) {
      var name = pick(r, FIRST) + ' ' + pick(r, LAST);
      var joined = addDays(today, -Math.floor(r() * 420));
      var plan = r() < 0.62 ? 'month' : (r() < 0.6 ? 'quarter' : 'year');
      var active = r() < 0.86;
      members.push({ id: 'M' + (1000 + i), name: name, country: country(r), plan: plan, joined: iso(joined), active: active, course: r() < 0.34 ? pick(r, KF.courses).id : null });
    }
    var cat = KF.catalog(), ids = Object.keys(cat);
    var LAM = 0.0015, SPAN = 1 - Math.exp(-LAM * 360);
    for (var j = 0; j < 760; j++) {
      var d = addDays(today, -Math.floor(-Math.log(1 - r() * SPAN) / LAM));
      var m = members[Math.floor(r() * members.length)];
      var it = r() < 0.66 ? 'room-' + m.plan : (r() < 0.7 ? 'course-' + pick(r, KF.courses).id : 'camp-' + pick(r, KF.tour).id + (r() < 0.25 ? '-vip' : ''));
      orders.push({ ref: 'ZF-' + (240000 + j * 7 + Math.floor(r() * 7)), date: iso(d), item: it, name: m.name, country: m.country, usd: cat[it].usd, method: j % 19 === 0 ? 'USDT' : pick(r, ['Mobile Money', 'Mobile Money', 'Card', 'Card', 'Bank transfer']), status: 'Paid' });
    }
    var goals = ['Stop revenge trading after a loss', 'Pass a prop firm challenge', 'Trade gold with a written plan', 'Size positions properly', 'Trade around a full-time job', 'Stop overtrading on Fridays'];
    for (var k = 0; k < 14; k++) {
      apps.push({ ref: 'AP-' + (7100 + k * 3), date: iso(addDays(today, -Math.floor(r() * 18))), name: pick(r, FIRST) + ' ' + pick(r, LAST), country: country(r), exp: pick(r, ['6-12 months', '1-3 years', '3+ years']), market: pick(r, ['Gold (XAUUSD)', 'GBPJPY and the majors', 'Synthetic indices', 'Indices']), size: pick(r, ['$1,000 to $5,000', '$5,000 to $25,000', 'Prop firm account', 'Over $25,000']), goal: pick(r, goals), status: k < 9 ? 'New' : (k < 12 ? 'Call booked' : 'Accepted') });
    }
    // the newest bank transfers wait for Zira to confirm them
    var wait = 0; orders.slice().sort(function (a, b) { return a.date < b.date ? 1 : -1; }).forEach(function (o) { if (wait < 3 && o.method === 'Bank transfer') { o.status = 'Awaiting transfer'; wait++; } });

    // members: renewal dates, Telegram room, contact, course progress
    var PERIOD = { month: 1, quarter: 3, year: 12 };
    members.forEach(function (m) {
      var p = PERIOD[m.plan], nx = new Date(m.joined + 'T12:00:00');
      do { nx.setMonth(nx.getMonth() + p); } while (nx <= today);
      if (m.active) { m.renews = iso(nx); m.telegram = true; }
      else { m.lapsed = iso(addDays(today, -1 - Math.floor(r() * 50))); m.telegram = false; }
      m.email = m.name.toLowerCase().replace(/\s+/g, '.') + '@example.com';
      m.phone = m.country === 'Ghana' ? '+233 ' + pick(r, ['24', '54', '20', '50', '27']) + ' ' + (100 + Math.floor(r() * 900)) + ' ' + (1000 + Math.floor(r() * 9000)) : '';
      m.progress = m.course ? Math.min(100, 8 + Math.floor(r() * 100)) : 0;
    });
    // a month of setups with their results, losses included
    var LV = { XAUUSD: [4040, 4130, 24, 2], GBPJPY: [201.2, 203.8, 0.42, 3], GBPAUD: [1.902, 1.928, 0.0062, 5], USDJPY: [155.1, 156.9, 0.48, 3], BTCUSD: [80200, 88400, 1450, 2] };
    var PAIRS = ['XAUUSD', 'XAUUSD', 'XAUUSD', 'XAUUSD', 'GBPJPY', 'GBPAUD', 'USDJPY', 'BTCUSD'];
    var OUT = [['TP1', 1], ['TP1', 1], ['TP1', 1], ['TP2', 2], ['TP2', 2], ['TP3', 3], ['Break-even', 0], ['Stopped', -1], ['Stopped', -1], ['Stopped', -1], ['Stopped', -1]];
    var hist = [], d0 = addDays(today, -30);
    for (var s = 0; s < 34; s++) {
      var dd = addDays(d0, Math.floor(s * 30 / 34)); if (dd.getDay() === 0) dd = addDays(dd, 1);
      var pr = pick(r, PAIRS), L = LV[pr], dir = r() < 0.62 ? 'Buy' : 'Sell', en = L[0] + r() * (L[1] - L[0]), rk = L[2] * (0.8 + r() * 0.4), sg = dir === 'Buy' ? 1 : -1;
      var oc = s >= 32 ? ['Open', 0] : pick(r, OUT);
      hist.push({ id: 'S' + (500 + s), date: iso(dd), pair: pr, dir: dir, entry: en.toFixed(L[3]), stop: (en - sg * rk).toFixed(L[3]), tp: [1, 2, 3].map(function (x) { return (en + sg * rk * x).toFixed(L[3]); }), result: oc[0], r: oc[1] });
    }
    // what people asked, and where they asked it
    var Q = ['How much is the Trading Room?', 'I am a complete beginner, where do I start?', 'When is the next bootcamp in Lagos?', 'Which broker should I use?', 'Can I pay with Mobile Money?', 'Do you guarantee profit?', 'How do I join mentorship?', 'Is there a payment plan for the Zira Method?', 'Do you teach synthetics?', 'Can I get the Sunday forecast on Telegram?'];
    var CH = ['Website desk', 'Website desk', 'WhatsApp', 'Instagram', 'Telegram bot'];
    var enq = [];
    for (var q = 0; q < 16; q++) enq.push({ id: 'E' + (900 + q), date: iso(addDays(today, -Math.floor(q / 3))), name: pick(r, FIRST) + ' ' + pick(r, LAST), country: country(r), channel: pick(r, CH), text: pick(r, Q), status: q < 6 ? 'New' : (q < 12 ? 'Replied' : 'Joined') });
    // live sessions: Tuesday and Thursday, 19:00 Accra
    var TOP = ['Gold and the New York open', 'Break and retest, live', 'The NFP Friday plan', 'Journal review with members', 'GBPJPY at the London open', 'Sizing gold when it moves $50', 'Your questions, live charts', 'The week ahead on gold'];
    var sess = [], c = new Date(today);
    while (sess.length < 8) { c = addDays(c, -1); if (c.getDay() === 2 || c.getDay() === 4) sess.push({ date: iso(c), topic: TOP[sess.length], came: 140 + Math.floor(r() * 120), rec: sess.length > 0 }); }
    // bootcamp attendees, city by city
    var att = {};
    KF.tour.forEach(function (t) {
      att[t.id] = [];
      for (var a = 0; a < t.seats - t.left; a++) att[t.id].push({ id: t.id + '-' + a, name: pick(r, FIRST) + ' ' + pick(r, LAST), seat: r() < 0.24 ? 'VIP' : 'Standard', paid: r() < 0.88 ? 'Paid' : 'Deposit' });
    });
    members[0].name = 'Ama Mensah'; members[0].course = 'foundations'; members[0].progress = 100;
    var certificates = [0, 1, 2].map(function (i) { var m = members[i]; m.course = KF.courses[i].id; m.progress = 100; return { member: m.id, name: m.name, course: KF.courses[i].name, date: iso(addDays(today, -14-i)), code: 'ZF-CERT-' + (1001+i) }; });
    var referrals = members.map(function (m, i) { return { member: m.id, name: m.name, code: 'ZF-' + m.id, friends: Math.max(0,8-i), months: Math.max(0,8-i) }; });
    var brokers = [{name:'Partner A',url:'https://example.com/broker-a',clicks:420,signups:42},{name:'Partner B',url:'https://example.com/broker-b',clicks:280,signups:21},{name:'Partner C',url:'https://example.com/broker-c',clicks:160,signups:8}];
    members.forEach(function(m,i){ m.liveReminder = i % 3 === 0; });
    return { certificates: certificates, referrals: referrals, brokers: brokers, app: {android:184,iphone:126,active:218}, seeded: iso(today), members: members, orders: orders, apps: apps, hist: hist, enq: enq, sess: sess, att: att, own: blank() };
  }
  function blank() { return { orders: [], apps: [], journal: [], setups: [], results: {}, received: {}, enq: {}, tg: {}, checkin: {}, certs: {}, bot: {}, casts: [], reminders: {}, liveReminders: {}, pushes: [], issued: [], monday: true }; }

  function load() {
    var db = null;
    try { db = JSON.parse(localStorage.getItem(KEY)); } catch (e) {}
    if (!db) { try { var legacy = JSON.parse(localStorage.getItem('zf.db.v1')); if (legacy) { db = seed(); db.own = legacy.own || blank(); save(db); } } catch (e) {} }
    if (!db && memoryDB) db = memoryDB;
    var today = iso(new Date());
    if (!db || db.seeded !== today) { var own = db && db.own; db = seed(); if (own) db.own = own; save(db); }
    var b = blank(); for (var k in b) if (!(k in db.own)) db.own[k] = b[k];
    return db;
  }
  function save(db) { memoryDB = db; try { localStorage.setItem(KEY, JSON.stringify(db)); } catch (e) {} }

  var S = window.KFStore = {
    db: load,
    save: save,
    iso: iso,
    item: function (id) { return KF.catalog()[id] || null; },
    placeOrder: function (o) {
      var db = load();
      var ref = 'ZF-' + String(Date.now()).slice(-6);
      var rec = { ref: ref, date: iso(new Date()), item: o.item, name: o.name, email: o.email, wa: o.wa, country: o.country, usd: o.usd, method: o.method, referral: o.referral || null, status: (o.method === 'Bank transfer' || o.method === 'USDT') ? 'Awaiting transfer' : 'Paid', own: true };
      db.own.orders.unshift(rec); save(db); return rec;
    },
    apply: function (a) {
      var db = load();
      var ref = 'AP-' + String(Date.now()).slice(-5);
      var rec = Object.assign({ ref: ref, date: iso(new Date()), status: 'New', own: true }, a);
      db.own.apps.unshift(rec); save(db); return rec;
    },
    journal: function (entry) { var db = load(); if (entry) { db.own.journal.unshift(Object.assign({ date: iso(new Date()) }, entry)); save(db); } return db.own.journal; },
    postSetup: function (s) { var db = load(); db.own.setups.unshift(Object.assign({ at: new Date().toISOString() }, s)); db.own.pushes.unshift({ title: s.dir + ' ' + s.pair, msg: 'Entry ' + s.entry + ' / Stop ' + s.stop + ' / Targets ' + [s.tp, s.tp2, s.tp3].filter(Boolean).join(', '), aud: 'Trading Room', at: new Date().toISOString(), automatic: true }); save(db); return db.own.setups; },
    referrals: function () { var d=load(); return d.referrals.map(function(r){var extra=d.own.orders.filter(function(o){return o.referral===r.code && /^room-/.test(o.item) && (o.status==='Paid'||d.own.received[o.ref]);}).length;return Object.assign({},r,{friends:r.friends+extra,months:r.months+extra});}); },
    certificates: function () { var d = load(); return d.certificates.concat(d.own.issued).concat(d.members.filter(function(m){ return d.own.certs[m.id] && !d.certificates.concat(d.own.issued).some(function(c){return c.member === m.id;}); }).map(function(m){var c = KF.courses.filter(function(c){return c.id === m.course;})[0]; return {member:m.id,name:m.name,course:c ? c.name : 'Foundations',date:d.seeded,code:'ZF-CERT-'+(Number(m.id.slice(1))+1000)};})); },
    reminderCount: function () { var d=load(); return d.members.filter(function(m){return m.id in d.own.liveReminders ? d.own.liveReminders[m.id] : m.liveReminder;}).length; },
    history: function () { var d=load(); return d.own.setups.map(function(s){return {id:'K'+s.at,date:s.at.slice(0,10),pair:s.pair,dir:s.dir,entry:s.entry,stop:s.stop,tp:[s.tp,s.tp2||'',s.tp3||''],result:'Open',r:0};}).concat(d.hist).map(function(s){var r=d.own.results[s.id];return r ? Object.assign({},s,{result:r[0],r:r[1]}) : s;}); },
    allOrders: function () { var db = load(); return db.own.orders.concat(db.orders).map(function(o){return db.own.received[o.ref] ? Object.assign({},o,{status:'Paid'}) : o;}).sort(function (a, b) { return a.date < b.date ? 1 : -1; }); },
    allApps: function () { var db = load(); return db.own.apps.concat(db.apps).sort(function (a, b) { return a.date < b.date ? 1 : -1; }); },
    setApp: function (ref, status) {
      var db = load(); [db.own.apps, db.apps].forEach(function (l) { l.forEach(function (a) { if (a.ref === ref) a.status = status; }); }); save(db);
    }
  };
  window.addEventListener('storage', function (e) { if (e.key === KEY && S.onChange) S.onChange(); });
})();
