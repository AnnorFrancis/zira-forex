/* Zira HQ: the management system. One page, ten sections, all read from the sample database in store.js.
   Plain panels, one chart colour; every total is the sum of the rows it comes from. */
(function () {
  'use strict';
  var KF = window.KF, UI = window.KFUI, S = window.KFStore, $ = UI.$, $$ = UI.$$, esc = UI.esc;
  var viewEl = $('[data-view]'), navEl = $('[data-nav]'), side = $('[data-side]'), drawer = $('[data-drawer]');
  var TODAY = S.iso(new Date());
  var PRICE = { month: 99, quarter: 269, year: 890 }, PERIOD = { month: 1, quarter: 3, year: 12 };
  var PLAN = { month: 'Monthly', quarter: 'Quarterly', year: 'Yearly' };

  /* ---------------- small helpers ---------------- */
  function money(n) { return '$' + Math.round(n).toLocaleString('en-US'); }
  function num(n) { return Math.round(n).toLocaleString('en-US'); }
  function day(iso) { return new Date(iso + 'T12:00:00').toLocaleDateString('en-GB', { day: 'numeric', month: 'short' }); }
  function daysTo(iso) { return Math.round((new Date(iso + 'T12:00:00') - new Date(TODAY + 'T12:00:00')) / 864e5); }
  function addMonths(iso, n) { var d = new Date(iso + 'T12:00:00'); d.setMonth(d.getMonth() + n); return S.iso(d); }
  function dayY(iso) { return iso.slice(0, 4) === TODAY.slice(0, 4) ? day(iso) : new Date(iso + 'T12:00:00').toLocaleDateString('en-GB', { day: 'numeric', month: 'short', year: 'numeric' }); }
  function ini(n) { return n.split(/\s+/).map(function (w) { return w.charAt(0); }).slice(0, 2).join('').toUpperCase(); }
  function tint(n) { var h = 0; for (var i = 0; i < n.length; i++) h = (h * 31 + n.charCodeAt(i)) % 997; return h % 4; }
  function who(name, sub) { return '<div class="who"><span class="av av--' + tint(name) + '" aria-hidden="true">' + esc(ini(name)) + '</span><div><strong>' + esc(name) + '</strong>' + (sub ? '<span>' + esc(sub) + '</span>' : '') + '</div></div>'; }
  function st(label, tone) { return '<span class="st st--' + (tone || 'dim') + '">' + esc(label) + '</span>'; }
  function kpi(l, n, d, up) { return '<div class="kpi"><span class="kpi__l">' + l + '</span><span class="kpi__n">' + n + '</span>' + (d ? '<span class="kpi__d' + (up ? ' up' : '') + '">' + d + '</span>' : '') + '</div>'; }
  function head(title, sub, right) { var help=window.ZiraCopy && window.ZiraCopy.pages[cur()]; if(help && title!=='Could not load this view'){title=help[0];sub=help[1];} return '<header class="hq-head"><div><h1>' + title + '</h1>' + (sub ? '<p>' + sub + '</p>' : '') + '</div>' + (right ? '<div class="hq-head__r">' + right + '</div>' : '') + '</header>'; }
  function card(cls, title, meta, body, id) { var help=window.ZiraCopy && window.ZiraCopy.cards[title]; if(help){title=help[0];body='<p class="hq-help">'+help[1]+'</p>'+body;} return '<section class="c ' + (cls || '') + '"' + (id ? ' id="' + id + '"' : '') + '><div class="c__h"><h2>' + title + '</h2>' + (meta ? '<span class="mut">' + meta + '</span>' : '') + '</div>' + body + '</section>'; }
  function hbar(label, v, max, shown) { return '<div class="hb"><span>' + label + '</span><span class="hb__t"><span style="width:' + (max ? Math.max(1.5, v / max * 100) : 0).toFixed(1) + '%"></span></span><span class="hb__v">' + (shown == null ? num(v) : shown) + '</span></div>'; }
  function table(cols, rows) {
    return '<div class="tw"><table class="t"><thead><tr>' + cols.map(function (c) { return '<th' + (c[1] ? ' class="' + c[1] + '"' : '') + '>' + c[0] + '</th>'; }).join('') + '</tr></thead><tbody>' +
      rows.map(function (r) {
        return '<tr' + (r.open ? ' data-open="' + r.open + '"' : '') + (r.id ? ' data-id="' + r.id + '"' : '') + '>' + r.cells.map(function (c, i) { return '<td data-l="' + cols[i][0] + '" class="' + (i === 0 ? 'lead ' : '') + (cols[i][1] || '') + '">' + c + '</td>'; }).join('') + '</tr>';
      }).join('') + '</tbody></table></div>';
  }
  function live() { var s = UI.sessionLine(); return '<span class="hq-live' + (s.live ? '' : ' is-closed') + '"><i></i>' + esc(s.text) + '</span>'; }
  function save(fn) { var d = S.db(); fn(d); S.save(d); }

  /* ---------------- the data, as HQ sees it ---------------- */
  function members() {
    var d = S.db();
    // people who joined the Trading Room on the website today are members already
    var fresh = d.own.orders.filter(function (o) { return /^room-/.test(o.item); }).map(function (o) {
      var plan = o.item.slice(5);
      return { id: 'N' + o.ref.slice(3), name: o.name, country: o.country || 'Ghana', plan: plan, joined: o.date, active: o.status === 'Paid' || !!d.own.received[o.ref], renews: addMonths(o.date, PERIOD[plan]), telegram: true, email: o.email, phone: o.wa || '', progress: 0, course: null, isNew: true };
    });
    return fresh.concat(d.members).map(function (m) {
      var x = Object.assign({}, m);
      if (x.id in d.own.tg) x.telegram = d.own.tg[x.id];
      return x;
    });
  }
  function mstatus(m) { if (!m.active) return ['Lapsed', 'warn']; var n = daysTo(m.renews); return n <= 7 ? [n <= 0 ? 'Renews today' : 'Renews in ' + n + (n === 1 ? ' day' : ' days'), 'gold'] : ['Active', 'ok']; }
  function orders() {
    var d = S.db();
    return S.allOrders().map(function (o) { return o.status === 'Awaiting transfer' && d.own.received[o.ref] ? Object.assign({}, o, { status: 'Paid' }) : o; });
  }
  function kind(item) { return item.split('-')[0]; }
  function months(n) {
    var out = [], now = new Date();
    for (var i = n - 1; i >= 0; i--) { var d = new Date(now.getFullYear(), now.getMonth() - i, 1); out.push({ key: d.getFullYear() + '-' + String(d.getMonth() + 1).padStart(2, '0'), label: d.toLocaleDateString('en-GB', { month: 'short' }), total: 0, room: 0, course: 0, camp: 0, count: 0 }); }
    orders().forEach(function (o) { if (o.status !== 'Paid') return; var m = out.filter(function (x) { return x.key === o.date.slice(0, 7); })[0]; if (m) { m.total += o.usd; m[kind(o.item)] += o.usd; m.count++; } });
    return out;
  }
  function apps() { return S.allApps(); }
  function enquiries() { var d = S.db(); return d.enq.map(function (e) { return Object.assign({}, e, { status: d.own.enq[e.id] || e.status }); }); }
  function setups() {
    var d = S.db();
    var own = d.own.setups.map(function (s) { return { id: 'K' + s.at, date: s.at.slice(0, 10), pair: s.pair, dir: s.dir, entry: s.entry, stop: s.stop, tp: [s.tp, s.tp2 || '', s.tp3 || ''], result: 'Open', r: 0, mine: true }; });
    return own.concat(d.hist.slice().reverse()).map(function (s) { var r = d.own.results[s.id]; return r ? Object.assign({}, s, { result: r[0], r: r[1] }) : s; });
  }
  function nextLive(from) { var d = from || new Date(); for (var k = 0; k < 9; k++) { var c = new Date(Date.UTC(d.getUTCFullYear(), d.getUTCMonth(), d.getUTCDate() + k, 19, 0)); var wd = c.getUTCDay(); if ((wd === 2 || wd === 4) && c > d) return c; } return null; }
  function countdown(t) { var ms = Math.max(0, t - new Date()), dd = Math.floor(ms / 864e5), hh = Math.floor(ms % 864e5 / 36e5), mm = Math.floor(ms % 36e5 / 6e4), ss = Math.floor(ms % 6e4 / 1e3); return (dd ? dd + 'd ' : '') + String(hh).padStart(2, '0') + ':' + String(mm).padStart(2, '0') + ':' + String(ss).padStart(2, '0'); }
  function waiting() { var o = orders().filter(function (x) { return x.status === 'Awaiting transfer'; }); return { apps: apps().filter(function (a) { return a.status === 'New'; }).length, enq: enquiries().filter(function (e) { return e.status === 'New'; }).length, transfers: o }; }

  /* ---------------- views ---------------- */
  var V = {};
  var state = { mf: 'all', mq: '', mshow: 15, pq: '', pshow: 15, ef: 'all', camp: KF.tour[0].id, dir: 'Buy', aud: 'VIP room' };

  V.today = function () {
    var ms = members(), act = ms.filter(function (m) { return m.active; }), mon = months(6), cur = mon[5], prev = mon[4];
    var joined = act.filter(function (m) { return daysTo(m.joined) >= -30; }).length;
    var due = act.filter(function (m) { var n = daysTo(m.renews); return n >= 0 && n <= 7; }), dueUsd = due.reduce(function (a, m) { return a + PRICE[m.plan]; }, 0);
    var w = waiting(), wn = w.apps + w.enq + w.transfers.length;
    var h = new Date().getHours();
    // the six months, one colour; this month in rose because it is still running
    var max = Math.max.apply(null, mon.map(function (m) { return m.total; })) || 1, W = 640, H = 210, bw = 54, step = W / 6;
    var svg = '<svg class="mchart" viewBox="0 0 ' + W + ' ' + (H + 56) + '" role="img" aria-label="Revenue for the last six months">' + mon.map(function (m, i) {
      var bh = Math.max(3, m.total / max * H), x = i * step + (step - bw) / 2, y = 24 + H - bh;
      return '<rect x="' + x.toFixed(1) + '" y="' + y.toFixed(1) + '" width="' + bw + '" height="' + bh.toFixed(1) + '" rx="4" fill="' + (i === 5 ? '#e8b9b0' : '#062a20') + '"/>' +
        '<text class="v" x="' + (x + bw / 2) + '" y="' + (y - 8) + '" text-anchor="middle">$' + (m.total / 1000).toFixed(1) + 'k</text>' +
        '<text x="' + (x + bw / 2) + '" y="' + (H + 48) + '" text-anchor="middle">' + m.label + (i === 5 ? ' so far' : '') + '</text>';
    }).join('') + '</svg>';
    var todo = [
      [w.transfers.length + ' payment' + (w.transfers.length === 1 ? '' : 's') + ' to confirm', money(w.transfers.reduce(function (a, o) { return a + o.usd; }, 0)) + ' waiting', '#payments', 'Confirm'],
      [w.apps + ' mentorship application' + (w.apps === 1 ? '' : 's'), 'Two of six January seats left', '#mentorship', 'Review'],
      [w.enq + ' new enquir' + (w.enq === 1 ? 'y' : 'ies'), 'From the website, WhatsApp and Telegram', '#enquiries', 'Reply'],
      [due.length + ' renewals this week', 'The bot reminds them three days before', '#members', 'See them']
    ];
    var lv = nextLive();
    var last = orders().slice(0, 6);
    return head((h < 12 ? 'Good morning' : h < 17 ? 'Good afternoon' : 'Good evening') + ', Zira', new Date().toLocaleDateString('en-GB', { weekday: 'long', day: 'numeric', month: 'long', year: 'numeric' }), live() + '<a class="b" href="#setups">Share a trade idea</a>') +
      '<div class="hq-kpis">' +
      kpi('Active members', num(act.length), '+' + joined + ' joined in the last 30 days', true) +
      kpi('Revenue this month', money(cur.total), 'Last month ' + money(prev.total)) +
      kpi('Renewing this week', String(due.length), money(dueUsd) + ' due in the next 7 days') +
      kpi('Waiting for you', String(wn), 'Transfers, applications, enquiries') + '</div>' +
      '<div class="hq-grid">' +
      card('c--7', 'Revenue, last six months', 'Paid orders, US dollars', '<p class="find">' + cur.label + ' so far: <strong>' + money(cur.total) + '</strong> from ' + cur.count + ' payments. The Trading Room brings in ' + Math.round(mon.reduce(function (a, m) { return a + m.room; }, 0) / Math.max(1, mon.reduce(function (a, m) { return a + m.total; }, 0)) * 100) + '% of it.</p>' + svg) +
      card('c--5 todo', 'To do today', '', '<div class="rows">' + todo.map(function (t) { return '<div class="row"><p>' + t[0] + '<br><span>' + t[1] + '</span></p><a class="b b--soft b--sm" href="' + t[2] + '">' + t[3] + '</a></div>'; }).join('') + '</div>') +
      card('c--7', 'Latest payments', '<a class="link" href="#payments">All payments</a>', '<div class="rows">' + last.map(function (o) { var it = S.item(o.item) || { name: o.item }; return '<div class="row">' + who(o.name, it.name) + '<div class="row__r"><span class="amt">' + money(o.usd) + '</span>' + st(o.status === 'Paid' ? 'Paid' : 'Waiting', o.status === 'Paid' ? 'ok' : 'warn') + '</div></div>'; }).join('') + '</div>') +
      '<section class="c c--5 next"><span class="mut" style="color:var(--on-dark-soft)">Next live session</span><span class="big" data-count>' + countdown(lv) + '</span><p>' + lv.toLocaleString('en-GB', { weekday: 'long', hour: '2-digit', minute: '2-digit' }) + ', Accra time. The bot reminds members an hour before.</p><div class="acts"><a class="b b--rose" href="#live">Plan the session</a></div></section>' +
      '</div>';
  };

  V.members = function () {
    var ms = members(), q = state.mq.toLowerCase();
    var counts = { all: ms.length, active: 0, soon: 0, lapsed: 0 }, plans = { month: 0, quarter: 0, year: 0 };
    ms.forEach(function (m) { if (!m.active) counts.lapsed++; else { counts.active++; plans[m.plan]++; if (daysTo(m.renews) <= 7) counts.soon++; } });
    var list = ms.filter(function (m) {
      if (state.mf === 'active' && !m.active) return false;
      if (state.mf === 'soon' && !(m.active && daysTo(m.renews) <= 7)) return false;
      if (state.mf === 'lapsed' && m.active) return false;
      return !q || (m.name + ' ' + m.country + ' ' + m.email).toLowerCase().indexOf(q) > -1;
    });
    if (state.mf === 'soon') list.sort(function (a, b) { return a.renews < b.renews ? -1 : 1; });
    var F = [['all', 'All'], ['active', 'Active'], ['soon', 'Renewing this week'], ['lapsed', 'Lapsed']];
    return head('Members', num(counts.active) + ' active in the Trading Room · ' + plans.month + ' monthly, ' + plans.quarter + ' quarterly, ' + plans.year + ' yearly', '<a class="b b--soft" href="#telegram">Telegram room</a>') +
      '<section class="c"><div class="tools"><div class="chips" role="group" aria-label="Filter">' + F.map(function (f) { return '<button type="button" data-act="mf" data-v="' + f[0] + '" aria-pressed="' + (state.mf === f[0]) + '">' + f[1] + '<span class="k">' + counts[f[0]] + '</span></button>'; }).join('') + '</div>' +
      '<label class="search"><span class="sr-only">Search members</span><input type="search" data-q="mq" value="' + esc(state.mq) + '" placeholder="Search by name, country or email"></label></div>' +
      table([['Member'], ['Plan'], ['Member since', 'hide-ph'], ['Renews'], ['Telegram', 'hide-ph'], ['Status']], list.slice(0, state.mshow).map(function (m) {
        var s = mstatus(m);
        return { open: 'm:' + m.id, cells: [who(m.name, m.country + (m.isNew ? ' · joined today' : '')), PLAN[m.plan], dayY(m.joined), m.active ? day(m.renews) : 'Lapsed ' + day(m.lapsed), m.telegram ? st('In the room', 'ok') : st('Removed', 'dim'), st(s[0], s[1])] };
      })) +
      (list.length > state.mshow ? '<button type="button" class="b b--soft more" data-act="mmore">Show more (' + (list.length - state.mshow) + ' left)</button>' : '') + '</section>';
  };

  V.payments = function () {
    var o = orders(), mon = months(2), cur = mon[1], prev = mon[0], w = waiting().transfers, q = state.pq.toLowerCase();
    var by = { 'Mobile Money': 0, Card: 0, 'Bank transfer': 0, USDT: 0 }, n = 0;
    o.forEach(function (x) { if (x.date.slice(0, 7) === cur.key && x.status === 'Paid') { by[x.method]++; n++; } });
    var kmax = Math.max(cur.room, cur.course, cur.camp), list = o.filter(function (x) { return !q || (x.name + ' ' + x.ref).toLowerCase().indexOf(q) > -1; });
    return head('Payments', 'Mobile Money, card, bank transfer and USDT, in one place', '') +
      '<div class="hq-kpis hq-kpis--3">' + kpi('This month', money(cur.total), cur.count + ' payments') + kpi('Last month', money(prev.total), prev.count + ' payments') + kpi('Waiting for you', String(w.length), money(w.reduce(function (a, x) { return a + x.usd; }, 0)) + ' awaiting payment') + '</div>' +
      '<div class="hq-grid">' +
      card('c--6', 'This month, by product', money(cur.total), '<div class="hbars">' + hbar('Trading Room', cur.room, kmax, money(cur.room)) + hbar('Courses', cur.course, kmax, money(cur.course)) + hbar('Bootcamps', cur.camp, kmax, money(cur.camp)) + '</div>') +
      card('c--6', 'How they pay', n + ' payments this month', '<div class="hbars">' + Object.keys(by).map(function (k) { return hbar(k, by[k], n, Math.round(by[k] / Math.max(1, n) * 100) + '%'); }).join('') + '</div>') +
      card('', 'Bank and USDT payments to confirm', 'Seats and memberships are held for 48 hours', w.length ? '<div class="rows">' + w.map(function (x) { var it = S.item(x.item) || { name: x.item }; return '<div class="row">' + who(x.name, it.name + ' · ' + x.ref + ' · ' + day(x.date)) + '<div class="row__r"><span class="amt">' + money(x.usd) + '</span><button type="button" class="b b--sm" data-act="recv" data-v="' + x.ref + '">Mark as received</button></div></div>'; }).join('') + '</div>' : '<p class="mut">All transfers are confirmed.</p>') +
      '<section class="c" id="all"><div class="c__h"><h2>All payments</h2><label class="search"><span class="sr-only">Search payments</span><input type="search" data-q="pq" value="' + esc(state.pq) + '" placeholder="Search by name or reference"></label></div>' +
      table([['Customer'], ['Reference', 'hide-ph'], ['Date'], ['Item'], ['Paid with'], ['Amount', 'r'], ['Status']], list.slice(0, state.pshow).map(function (x) { var it = S.item(x.item) || { name: x.item }; return { cells: [who(x.name, x.country || ''), '<span class="nw">' + x.ref + '</span>', '<span class="nw">' + day(x.date) + '</span>', it.name, x.method, '<span class="amt">' + money(x.usd) + '</span>', st(x.status === 'Paid' ? 'Paid' : 'Waiting', x.status === 'Paid' ? 'ok' : 'warn')] }; })) +
      (list.length > state.pshow ? '<button type="button" class="b b--soft more" data-act="pmore">Show more</button>' : '') + '</section></div>';
  };

  V.setups = function () {
    var all = setups(), open = all.filter(function (s) { return s.result === 'Open'; }), closed = all.filter(function (s) { return s.result !== 'Open' && daysTo(s.date) >= -30; });
    var wins = closed.filter(function (s) { return s.r > 0; }).length, loss = closed.filter(function (s) { return s.r < 0; }).length, be = closed.length - wins - loss, net = closed.reduce(function (a, s) { return a + s.r; }, 0);
    var P = ['XAUUSD', 'GBPJPY', 'GBPAUD', 'USDJPY', 'BTCUSD', 'Volatility 75'];
    return head('Setups', 'Post once: it reaches the student area, the app and the VIP room on Telegram', '') +
      '<div class="hq-grid">' +
      card('c--5', 'Post a setup', 'Education, not advice', '<form class="f" data-setup>' +
        '<div class="f2"><label>Pair<select name="pair">' + P.map(function (p) { return '<option>' + p + '</option>'; }).join('') + '</select></label><label>Direction<span class="hseg" role="group">' + ['Buy', 'Sell'].map(function (d) { return '<button type="button" data-act="dir" data-v="' + d + '" aria-pressed="' + (state.dir === d) + '">' + d + '</button>'; }).join('') + '</span></label></div>' +
        '<div class="f2"><label>Starting price (entry)<input name="entry" inputmode="decimal" placeholder="4028.30" required></label><label>Price to limit losses (stop loss)<input name="stop" inputmode="decimal" placeholder="4001.80" required></label></div>' +
        '<div class="f3"><label>Target 1<input name="tp" inputmode="decimal" placeholder="4054.80" required></label><label>Target 2<input name="tp2" inputmode="decimal" placeholder="4081.30"></label><label>Target 3<input name="tp3" inputmode="decimal" placeholder="4107.80"></label></div>' +
        '<button class="b" type="submit" style="justify-self:start">Send to members</button><p class="note" data-setup-msg>Members see it in the student area and on Telegram at once.</p></form>') +
      card('c--7', 'The last 30 days', 'Every result stays in the archive, losses included', '<div class="recs"><div><b>' + closed.length + '</b><span>Finished trade ideas</span></div><div><b class="pos">' + wins + '</b><span>Reached a target</span></div><div><b class="neg">' + loss + '</b><span>Reached the loss limit</span></div><div><b class="' + (net >= 0 ? 'pos' : 'neg') + '">' + (net >= 0 ? '+' : '−') + Math.abs(net) + 'R</b><span>Total result compared with risk</span></div></div>' +
        '<div class="strip" aria-label="Results, oldest to newest">' + closed.slice().reverse().map(function (s) { return '<i class="' + (s.r > 0 ? 'w' : s.r < 0 ? 'l' : 'e') + '" title="' + esc(s.pair + ' ' + s.result) + '"></i>'; }).join('') + '</div><p class="mut">Oldest to newest: green reached a target, rose was stopped, sand broke even (' + be + ').</p>') +
      card('', 'Open setups', open.length + ' open', open.length ? '<div class="rows">' + open.map(function (s) { return '<div class="row"><div class="who"><span class="st ' + (s.dir === 'Buy' ? 'st--ok' : 'st--warn') + '">' + s.dir + '</span><div><strong>' + esc(s.pair) + '</strong><span>Entry ' + esc(s.entry) + ' · Stop ' + esc(s.stop) + ' · TP1 ' + esc(s.tp[0]) + ' · ' + day(s.date) + '</span></div></div><div class="row__r">' + '<button type="button" class="b b--sm" data-act="picture" data-v="' + esc(s.id) + '">Make a picture</button>' + [['TP1', 1, 'Target 1 reached'], ['TP2', 2, 'Target 2 reached'], ['Break-even', 0, 'Break-even'], ['Stopped', -1, 'Stopped']].map(function (r) { return '<button type="button" class="b b--soft b--sm" data-act="res" data-v="' + s.id + '|' + r[0] + '|' + r[1] + '">' + r[2] + '</button>'; }).join('') + '</div></div>'; }).join('') + '</div>' : '<p class="mut">No active ideas. Share a trade idea above.</p>') +
      card('', 'Archive', closed.length + ' in the last 30 days', table([['Pair'], ['Date'], ['Direction'], ['Entry', 'hide-ph'], ['Stop', 'hide-ph'], ['Target 1', 'hide-ph'], ['Result'], ['R', 'r']], closed.slice(0, 12).map(function (s) { return { cells: ['<strong>' + s.pair + '</strong>', day(s.date), s.dir, s.entry, s.stop, s.tp[0], st(s.result, s.r > 0 ? 'ok' : s.r < 0 ? 'warn' : 'dim'), '<span class="amt ' + (s.r > 0 ? 'pos' : s.r < 0 ? 'neg' : '') + '">' + (s.r > 0 ? '+' : s.r < 0 ? '−' : '') + Math.abs(s.r) + 'R</span>'] }; }))) +
      '</div>';
  };

  V.academy = function () {
    var ms = members(), o = orders(), d = S.db();
    var students = ms.filter(function (m) { return m.course; });
    var cs = KF.courses.map(function (c) {
      var mine = students.filter(function (m) { return m.course === c.id; });
      var rev = o.filter(function (x) { return x.item === 'course-' + c.id && x.status === 'Paid'; }).reduce(function (a, x) { return a + x.usd; }, 0);
      var avg = mine.length ? Math.round(mine.reduce(function (a, m) { return a + m.progress; }, 0) / mine.length) : 0;
      return '<article class="course-c"><h3>' + c.name + '</h3><div class="kv"><span>Price</span><span class="amt">' + money(c.usd) + '</span></div><div class="kv"><span>Students</span><span class="amt">' + mine.length + '</span></div><div class="kv"><span>Earned to date</span><span class="amt">' + money(rev) + '</span></div><div class="kv"><span>Average progress</span><span class="amt">' + avg + '%</span></div><div class="meter"><span style="width:' + avg + '%"></span></div></article>';
    }).join('');
    var name = {}; KF.courses.forEach(function (c) { name[c.id] = c.name; });
    var rows = students.slice().sort(function (a, b) { return b.progress - a.progress; }).slice(0, 14);
    return head('Academy', students.length + ' students across four courses', '<a class="b b--soft" href="../academy.html">View the courses</a>') +
      '<div class="courses">' + cs + '</div>' +
      card('', 'Students', 'Finish the course, pass the plan review, get the certificate', table([['Student'], ['Course'], ['Progress'], ['Certificate']], rows.map(function (m) {
        var done = m.progress >= 100, sent = d.own.certs[m.id] || S.certificates().some(function(c){return c.member===m.id;});
        return { cells: [who(m.name, m.country), name[m.course], '<span style="display:flex;align-items:center;gap:10px;justify-content:inherit"><span class="meter" style="width:120px"><span style="width:' + m.progress + '%"></span></span>' + m.progress + '%</span>', done ? (sent ? st('Sent', 'ok') : '<button type="button" class="b b--sm" data-act="cert" data-v="' + m.id + '">Issue certificate</button>') : st('In progress', 'dim')] };
      })));
  };

  V.live = function () {
    var d = S.db(), lv = nextLive(), up = [], t = new Date(lv.getTime() - 60000);
    var PLANNED = ['Gold and the New York open', 'Your journal, reviewed live', 'The week ahead on gold', 'Break and retest on GBPJPY'];
    for (var i = 0; i < 4; i++) { t = nextLive(new Date(t.getTime() + 60000)); up.push(t); }
    var sent = d.own.reminders.live;
    return head('Live sessions', 'Tuesday and Thursday, 19:00 Accra time, on Telegram', '') +
      '<div class="hq-grid">' +
      '<section class="c c--5 next"><span class="mut" style="color:var(--on-dark-soft)">Next session starts in</span><span class="big" data-count>' + countdown(lv) + '</span><p>' + lv.toLocaleString('en-GB', { weekday: 'long', day: 'numeric', month: 'long', hour: '2-digit', minute: '2-digit' }) + '. ' + PLANNED[0] + '. Members get a reminder an hour before, automatically.</p>' +
      '<div class="acts"><button type="button" class="b b--rose" data-act="remind">' + (sent ? 'Reminder sent' : 'Send a reminder now') + '</button><a class="b b--soft" href="#" target="_blank" rel="noopener">Open the room</a></div></section>' +
      card('c--7', 'Coming up', '', '<div class="rows">' + up.map(function (u, i) { return '<div class="row"><div class="who"><span class="av av--' + (i % 4) + '" aria-hidden="true">' + u.toLocaleDateString('en-GB', { day: 'numeric' }) + '</span><div><strong>' + PLANNED[i] + '</strong><span>' + u.toLocaleString('en-GB', { weekday: 'long', day: 'numeric', month: 'short', hour: '2-digit', minute: '2-digit' }) + '</span></div></div>' + st(i === 0 ? 'Next' : 'Planned', i === 0 ? 'gold' : 'dim') + '</div>'; }).join('') + '</div>') +
      card('', 'Past sessions', 'Recordings go to the members’ area', table([['Session'], ['Date'], ['Members who came', 'r'], ['Recording']], d.sess.map(function (s) { return { cells: ['<strong>' + esc(s.topic) + '</strong>', day(s.date), '<span class="amt">' + s.came + '</span>', s.rec ? st('Ready', 'ok') : st('Processing', 'gold')] }; }))) +
      '</div>';
  };

  V.mentorship = function () {
    var a = apps(), taken = 2 + a.filter(function (x) { return x.status === 'Accepted'; }).length;
    var cols = [['New', 'New applications'], ['Call booked', 'Call booked'], ['Accepted', 'Accepted']];
    function acts(x) {
      if (x.status === 'New') return '<button type="button" class="b b--sm" data-act="app" data-v="' + x.ref + '|Call booked">Book the call</button><button type="button" class="b b--soft b--sm" data-act="app" data-v="' + x.ref + '|Declined">Decline</button>';
      if (x.status === 'Call booked') return '<button type="button" class="b b--sm" data-act="app" data-v="' + x.ref + '|Accepted">Accept</button><button type="button" class="b b--soft b--sm" data-act="app" data-v="' + x.ref + '|Declined">Decline</button>';
      return st('Seat confirmed', 'ok');
    }
    return head('Mentorship', 'Twelve weeks one to one, ' + money(KF.mentorship.usd) + ', six seats a quarter', '<span class="hq-live"><i></i>' + Math.max(0, 6 - taken) + ' of 6 January seats left</span>') +
      '<div class="pipe">' + cols.map(function (c) {
        var list = a.filter(function (x) { return x.status === c[0]; });
        return '<div class="pipe__col"><div class="pipe__h"><span>' + c[1] + '</span><span class="mut">' + list.length + '</span></div>' + list.map(function (x) {
          return '<article class="card">' + who(x.name, x.country + ' · ' + day(x.date) + (x.own ? ' · from the website today' : '')) + '<q>' + esc(x.goal) + '</q><p class="meta">' + esc(x.exp) + ' live · ' + esc(x.market) + ' · ' + esc(x.size) + '</p><div class="acts">' + acts(x) + '</div></article>';
        }).join('') + '</div>';
      }).join('') + '</div>';
  };

  V.bootcamps = function () {
    var d = S.db(), sold = 0, rev = 0;
    KF.tour.forEach(function (t) { d.att[t.id].forEach(function (p) { sold++; rev += p.seat === 'VIP' ? KF.bootcamp.vipUsd : KF.bootcamp.usd; }); });
    var t0 = KF.tour[0], camp = KF.tour.filter(function (t) { return t.id === state.camp; })[0], people = d.att[camp.id], ins = people.filter(function (p) { return d.own.checkin[p.id]; }).length;
    return head('Bootcamps', 'The 2026–27 tour: seven cities, forty seats each', '') +
      '<div class="hq-kpis hq-kpis--3">' + kpi('Seats sold', sold + ' of ' + KF.tour.length * 40, 'Across seven cities') + kpi('Ticket sales', money(rev), 'Standard ' + money(KF.bootcamp.usd) + ', VIP ' + money(KF.bootcamp.vipUsd)) + kpi('Next bootcamp', t0.city, t0.dates + ' · in ' + daysTo(t0.iso) + ' days') + '</div>' +
      '<div class="hq-grid">' +
      card('c--7', 'Seats by city', '', table([['City'], ['Dates'], ['Seats sold'], ['VIP', 'r'], ['']], KF.tour.map(function (t) {
        var p = d.att[t.id], vip = p.filter(function (x) { return x.seat === 'VIP'; }).length;
        return { cells: ['<strong>' + t.city + '</strong>', t.dates + ' ' + t.year, '<span style="display:flex;align-items:center;gap:10px;justify-content:inherit"><span class="meter" style="width:110px"><span style="width:' + (p.length / t.seats * 100).toFixed(0) + '%"></span></span>' + p.length + '/' + t.seats + '</span>', '<span class="amt">' + vip + '</span>', '<button type="button" class="b b--soft b--sm" data-act="camp" data-v="' + t.id + '"' + (t.id === camp.id ? ' aria-pressed="true"' : '') + '>Guest list</button>'] };
      }))) +
      card('c--5', camp.city + ' guest list', ins + ' of ' + people.length + ' checked in', '<p class="mut">Check people in at the door. VIP seats sit at the front table and come to dinner.</p><div class="rows">' + people.slice(0, 10).map(function (p) {
        var on = !!d.own.checkin[p.id];
        return '<div class="row">' + who(p.name, p.seat + ' seat · ' + p.paid) + '<button type="button" class="b b--sm' + (on ? '' : ' b--soft') + '" data-act="in" data-v="' + p.id + '">' + (on ? 'Checked in' : 'Check in') + '</button></div>';
      }).join('') + '</div>' + (people.length > 10 ? '<p class="mut">And ' + (people.length - 10) + ' more.</p>' : '')) +
      '</div>';
  };

  V.telegram = function () {
    var d = S.db(), ms = members(), inRoom = ms.filter(function (m) { return m.telegram; }).length;
    var added = ms.filter(function (m) { return m.active && daysTo(m.joined) >= -7; }).length, removed = ms.filter(function (m) { return !m.active && m.lapsed && daysTo(m.lapsed) >= -7; }).length;
    var JOBS = [['invite', 'Adds members to the VIP room when they pay', 'Mobile Money, card or bank, the invite goes out in seconds'], ['remove', 'Removes members when a plan runs out', 'After a three-day grace period, with a friendly note'], ['post', 'Posts every setup to the VIP room', 'The moment you press Send in Setups'], ['remind', 'Sends renewal reminders', 'Three days before, with a one-tap renew link'], ['faq', 'Answers the common questions', 'Prices, brokers, bootcamp dates; hands over to you when needed']];
    var on = function (k) { return d.own.bot[k] !== false; };
    return head('Telegram bot', '<span class="tg-on"><i></i>Your own bot runs the VIP room and the free channel</span>', st('Sample: part of the build', 'gold')) +
      '<div class="hq-kpis">' + kpi('In the VIP room', num(inRoom), 'Paying members only') + kpi('Free channel', '25K', 'On t.me/ziraforex') + kpi('Added this week', String(added), 'Invited the minute they paid', true) + kpi('Removed this week', String(removed), 'Plans that ran out') + '</div>' +
      '<div class="hq-grid">' +
      card('c--7', 'What the bot does for you', '', JOBS.map(function (j) { return '<div class="sw"><p>' + j[1] + '<span>' + j[2] + '</span></p><button type="button" class="tgl" role="switch" aria-checked="' + on(j[0]) + '" aria-label="' + j[1] + '" data-act="bot" data-v="' + j[0] + '"></button></div>'; }).join('')) +
      '<section class="c c--5 chat" aria-label="What a member sees"><div class="chat__h"><span class="av av--1" aria-hidden="true">KF</span><div><strong>Ziraforex Bot</strong><span>bot · what a new member sees</span></div></div>' +
        '<div class="msg-b msg-b--me">/start<small>18:02</small></div>' +
        '<div class="msg-b">Welcome to Ziraforex. The Trading Room is $99 a month, $269 a quarter or $890 a year.<div class="k"><span>Join monthly</span><span>Join yearly</span></div><small>18:02</small></div>' +
        '<div class="msg-b msg-b--me">I have paid with MoMo<small>18:05</small></div>' +
        '<div class="msg-b">Payment confirmed, thank you. Here is your invite to the VIP room. Next live session: Thursday, 19:00.<div class="k"><span>Open the VIP room</span></div><small>18:05</small></div>' +
        '<div class="msg-b">Your plan renews in 3 days. Renew in one tap so you keep your seat.<div class="k"><span>Renew now</span></div><small>3 days before</small></div>' +
      '</section>' +
      card('', 'Send a message', 'From your phone or from here', '<form class="f" data-cast><label>Message<textarea name="msg" placeholder="Live session tonight at 19:00. We go through gold and the New York open." required></textarea></label>' +
        '<div class="tools"><span class="hseg" role="group" aria-label="Send to">' + ['VIP room', 'Free channel', 'Both'].map(function (x) { return '<button type="button" data-act="aud" data-v="' + x + '" aria-pressed="' + (state.aud === x) + '">' + x + '</button>'; }).join('') + '</span><button class="b" type="submit">Send</button></div></form>' +
        (d.own.casts.length ? '<div class="rows">' + d.own.casts.slice(0, 3).map(function (c) { return '<div class="row"><p>' + esc(c.msg) + '<br><span>' + esc(c.aud) + ' · ' + new Date(c.at).toLocaleTimeString('en-GB', { hour: '2-digit', minute: '2-digit' }) + '</span></p>' + st('Sent', 'ok') + '</div>'; }).join('') + '</div>' : '')) +
      '</div>';
  };

  V.enquiries = function () {
    var e = enquiries(), c = { all: e.length, New: 0, Replied: 0, Joined: 0 };
    e.forEach(function (x) { c[x.status]++; });
    var list = e.filter(function (x) { return state.ef === 'all' || x.status === state.ef; });
    var qs = [['How much is the Trading Room?', 148], ['I am a complete beginner', 121], ['Next bootcamp?', 96], ['Which broker do I need?', 74], ['Do you guarantee profit?', 52], ['How do I join mentorship?', 41]];
    var F = [['all', 'All'], ['New', 'New'], ['Replied', 'Replied'], ['Joined', 'Joined']];
    return head('Enquiries', 'Everyone who asked, from the website desk, WhatsApp, Instagram and the Telegram bot', '') +
      '<div class="hq-grid">' +
      '<section class="c c--8"><div class="tools"><div class="chips" role="group" aria-label="Filter">' + F.map(function (f) { return '<button type="button" data-act="ef" data-v="' + f[0] + '" aria-pressed="' + (state.ef === f[0]) + '">' + f[1] + '<span class="k">' + c[f[0]] + '</span></button>'; }).join('') + '</div></div>' +
      '<div class="rows">' + list.map(function (x) {
        return '<div class="row">' + who(x.name, x.channel + ' · ' + x.country + ' · ' + (daysTo(x.date) === 0 ? 'today' : day(x.date))) + '<p style="flex:1 1 220px;font-size:15px">' + esc(x.text) + '</p><div class="row__r">' +
          (x.status === 'New' ? '<button type="button" class="b b--sm" data-act="enq" data-v="' + x.id + '|Replied">Reply on WhatsApp</button>' : x.status === 'Replied' ? '<button type="button" class="b b--soft b--sm" data-act="enq" data-v="' + x.id + '|Joined">Mark as joined</button>' : st('Joined', 'ok')) + '</div></div>';
      }).join('') + '</div></section>' +
      card('c--4', 'Asked most this week', 'Website desk', '<div class="hbars">' + qs.map(function (q) { return hbar(q[0], q[1], qs[0][1]); }).join('') + '</div><p class="mut">Good topics for your next post or live session.</p>') +
      '</div>';
  };


  /* Brief 5: connected business tools. */
  V.referrals = function(){var rows=S.referrals().filter(function(r){return r.friends>0;}).sort(function(a,b){return b.friends-a.friends;}), friends=rows.reduce(function(n,r){return n+r.friends;},0),monthsGiven=rows.reduce(function(n,r){return n+r.months;},0);return head('Referrals','A friend joins. A member gets a free month.')+'<div class="hq-kpis hq-kpis--3">'+kpi('Members referring',rows.length)+kpi('Friends joined',friends)+kpi('Free months given',monthsGiven)+'</div>'+card('','Top referrers','Sample members, ranked by friends joined',table([['Member'],['Invite code'],['Friends joined'],['Free months given']],rows.map(function(r){return {cells:[who(r.name),esc(r.code),r.friends,r.months]};})));};
  V.brokers = function(){var b=S.db().brokers;return head('Broker links','Last 30 days · Sample partner links')+card('','Partner performance','Track which partner pays best','<p class="mut">Sample tracking figures. Partner destinations are placeholders.</p><div class="hbars">'+b.map(function(x){return '<div class="row"><a class="link" href="'+esc(x.url)+'" target="_blank" rel="noopener">'+esc(x.name)+'</a><span>'+x.clicks+' clicks · '+x.signups+' sign-ups · '+(x.signups/x.clicks*100).toFixed(1)+'% conversion</span></div>'+hbar('Clicks',x.clicks,Math.max.apply(null,b.map(function(p){return p.clicks;})))+hbar('Sign-ups',x.signups,Math.max.apply(null,b.map(function(p){return p.signups;})))+hbar(x.name+' conversion',x.signups/x.clicks,1,(x.signups/x.clicks*100).toFixed(1)+'%');}).join('')+'</div>');};
  V.app = function(){var d=S.db();return head('App','Members buy on the website and use everything in the app.',st('Sample · coming soon','gold'))+'<div class="hq-kpis hq-kpis--3">'+kpi('Android installs',d.app.android)+kpi('iPhone installs',d.app.iphone)+kpi('Active this week',d.app.active)+'</div>'+card('','Push notification','Setups posted in Setups go to the app automatically.','<form class="f" data-push><label>Title<input name="title" maxlength="80" required></label><label>Message<textarea name="message" maxlength="500" required></textarea></label><label>Audience<select name="audience"><option>All members</option><option>Trading Room</option><option>Academy students</option></select></label><button class="b" type="submit">Send notification</button><p class="note">Demo delivery, saved in this browser.</p></form>')+card('','Sent',d.own.pushes.length+' notifications',d.own.pushes.length?'<div class="rows">'+d.own.pushes.map(function(p){return '<article class="row"><div><strong>'+esc(p.title)+'</strong><p>'+esc(p.msg)+'</p><p class="mut">'+esc(p.aud)+' · '+esc(new Date(p.at).toLocaleString())+(p.automatic?' · Automatic setup':'')+'</p></div>'+st('Sent','ok')+'</article>';}).join('')+'</div>':'<p class="mut">No notifications sent yet.</p>');};
  var originalToday=V.today;
  V.today=function(){var d=S.db(),ms=members(),week=orders().filter(function(o){return o.status==='Paid'&&daysTo(o.date)>=-7;}),best=d.sess.slice().sort(function(a,b){return b.came-a.came;})[0],due=ms.filter(function(m){return m.active&&daysTo(m.renews)>=0&&daysTo(m.renews)<=7;}).length;return originalToday()+card('','Monday report','A weekly message for Zira','<div class="sw"><p>Send my Monday report<span>WhatsApp · Every Monday, 08:00 Accra · Sample preview</span></p><button class="tgl" role="switch" aria-label="Monday report" aria-checked="'+d.own.monday+'" data-act="monday"></button></div><div class="chat"><div class="chat__h"><strong>Zira HQ · Your week</strong></div><div class="msg-b msg-b--me"><p>Good morning, Zira.</p><p>New members: '+ms.filter(function(m){return daysTo(m.joined)>=-7;}).length+'</p><p>Money in: '+money(week.reduce(function(n,o){return n+o.usd;},0))+'</p><p>Renewals due: '+due+'</p><p>Best content: '+esc(best.topic)+' ('+best.came+' attended)</p><p>Next live: '+esc(nextLive().toLocaleString('en-GB',{timeZone:'Africa/Accra'}))+' Accra</p><small>Last 7 days · preview</small></div></div>');};
  var originalAcademy=V.academy;
  V.academy=function(){var certs=S.certificates();return originalAcademy()+card('','Certificates issued',certs.length+' verified records',table([['Student'],['Course'],['Date'],['Verify code']],certs.map(function(c){return {cells:[esc(c.name),esc(c.course),esc(c.date),'<a class="link" href="../verify.html?code='+esc(c.code)+'">'+esc(c.code)+'</a>']};})));};
  var originalLive=V.live;
  V.live=function(){return originalLive()+card('','Class reminders',S.reminderCount()+' members switched reminders on','<p>Reminders go out one hour before, on Telegram and WhatsApp.</p>');};
  function signalPicture(id){var s=setups().find(function(s){return s.id===id;});if(!s)return;openDrawer('<h2>Signal picture</h2><p class="mut">1080 × 1350 · Education, not advice</p><canvas data-signal-canvas width="1080" height="1350" role="img" aria-label="'+esc(s.dir+' '+s.pair+' setup picture')+'"></canvas><a class="b" data-picture-download download="zira-'+esc(s.pair)+'-'+s.date+'.png">Download PNG</a><p data-picture-status role="status"></p>');var canvas=$('[data-signal-canvas]'),ctx=canvas.getContext('2d');if(!ctx){$('[data-picture-status]').textContent='Canvas is unavailable in this browser.';return;}
    function draw(){if(!canvas.isConnected)return;ctx.fillStyle='#062a20';ctx.fillRect(0,0,1080,1350);ctx.fillStyle='#dcc391';ctx.fillRect(80,80,6,1190);ctx.fillStyle='#e8b9b0';ctx.font='600 80px Montserrat';ctx.fillText('ZIRA',130,190);ctx.font='500 25px Montserrat';ctx.fillText('THE TRADING ROOM / SAMPLE SETUP',130,245);ctx.fillStyle='#f3eff0';ctx.font='600 85px Montserrat';ctx.fillText(s.pair,130,405,850);ctx.font='500 42px Montserrat';ctx.fillText(s.dir.toUpperCase(),130,480);var lines=[['ENTRY',s.entry],['STOP LOSS',s.stop],['TARGET 1',s.tp[0]||'Not set'],['TARGET 2',s.tp[1]||'Not set'],['TARGET 3',s.tp[2]||'Not set']];lines.forEach(function(l,i){var y=610+i*105;ctx.fillStyle='#dcc391';ctx.font='500 22px Montserrat';ctx.fillText(l[0],130,y);ctx.fillStyle='#f3eff0';ctx.font='500 42px Montserrat';ctx.fillText(String(l[1]),530,y,450);});ctx.fillStyle='#e8b9b0';ctx.font='500 28px Montserrat';ctx.fillText(s.date,130,1190);ctx.fillText('Education, not advice',130,1245);try{$('[data-picture-download]').href=canvas.toDataURL('image/png');}catch(e){$('[data-picture-status]').textContent='Could not export this picture. Please try again.';}}
    draw();if(document.fonts&&document.fonts.ready)document.fonts.ready.then(draw);
  }
  document.addEventListener('submit',function(e){var f=e.target;if(!f.hasAttribute('data-push'))return;e.preventDefault();var title=f.elements.title.value.trim(),msg=f.elements.message.value.trim();if(!title||!msg)return;save(function(d){d.own.pushes.unshift({title:title,msg:msg,aud:f.elements.audience.value,at:new Date().toISOString()});});UI.toast('Notification saved to Sent');render();});

  /* ---------------- the shell: nav, routing, drawer ---------------- */
  var NAV = [['Manage the business', [['today', 'Today'], ['members', 'Members'], ['payments', 'Payments'], ['enquiries', 'Enquiries'], ['referrals', 'Referrals'], ['brokers', 'Broker links']]],
    ['Teach students', [['setups', 'Setups'], ['academy', 'Academy'], ['live', 'Live sessions'], ['mentorship', 'Mentorship'], ['bootcamps', 'Bootcamps']]],
    ['Messages & app', [['telegram', 'Telegram bot'], ['app', 'App']]]];
  if (window.ZiraOperations) { window.ZiraOperations.install(V, function () { render(); }); NAV.unshift(['Trading tools', [['operations', 'Suite overview'], ['infrastructure', 'Infrastructure'], ['risk', 'Account risk'], ['software', 'EA maintenance'], ['copying', 'Copy diagnostics'], ['coaching', 'Connected coaching']]]); }
  if(window.ZiraCopy) NAV.forEach(function(g){g[1].forEach(function(i){var help=window.ZiraCopy.pages[i[0]];if(help)i[1]=help[0];});});
  var TITLE = {}; NAV.forEach(function (g) { g[1].forEach(function (i) { TITLE[i[0]] = i[1]; }); });
  function cur() { var h = location.hash.slice(1); return V[h] ? h : 'today'; }
  function drawNav() {
    var w = waiting(), counts = { payments: w.transfers.length, mentorship: w.apps, enquiries: w.enq };
    navEl.innerHTML = NAV.map(function (g) { return '<p class="hq-nav__g">' + g[0] + '</p>' + g[1].map(function (i) { return '<a href="#' + i[0] + '"' + (cur() === i[0] ? ' class="is-on" aria-current="page"' : '') + '><span>' + i[1] + '</span>' + (counts[i[0]] ? '<span class="n">' + counts[i[0]] + '</span>' : '') + '</a>'; }).join(''); }).join('');
  }
  function render(fresh) {
    var v = cur(), y = window.scrollY;
    try { viewEl.innerHTML = V[v](); } catch(e) { viewEl.innerHTML = head('Could not load this view', 'Please reload to try again.'); console.error(e); }
    viewEl.querySelectorAll('.c,.kpi,.course-c').forEach(function(el){el.setAttribute('data-reveal','');}); UI.reveal(viewEl);
    drawNav();
    document.title = TITLE[v] + ' | Zira HQ';
    if (fresh) { viewEl.classList.remove('is-in'); void viewEl.offsetWidth; viewEl.classList.add('is-in'); window.scrollTo(0, 0); }
    else window.scrollTo(0, y);
  }
  window.addEventListener('hashchange', function () { side.classList.remove('is-open'); $('[data-menu]').setAttribute('aria-expanded', 'false'); render(true); });
  $('[data-menu]').addEventListener('click', function () { var o = side.classList.toggle('is-open'); this.setAttribute('aria-expanded', String(o)); });

  function openDrawer(html) { $('[data-drawer-body]').innerHTML = html; drawer.hidden = false; }
  function closeDrawer() { drawer.hidden = true; }
  function memberDrawer(id) {
    var m = members().filter(function (x) { return x.id === id; })[0]; if (!m) return;
    var d = S.db(), s = mstatus(m), pays = orders().filter(function (o) { return o.name === m.name; }).slice(0, 5);
    var course = m.course ? KF.courses.filter(function (c) { return c.id === m.course; })[0] : null;
    openDrawer('<div style="margin-top:6px">' + who(m.name, m.country) + '</div>' +
      '<div class="kvs"><div><span>Status</span>' + st(s[0], s[1]) + '</div><div><span>Plan</span><span>' + PLAN[m.plan] + ', ' + money(PRICE[m.plan]) + '</span></div><div><span>Member since</span><span>' + dayY(m.joined) + '</span></div><div><span>' + (m.active ? 'Renews' : 'Lapsed') + '</span><span>' + day(m.active ? m.renews : m.lapsed) + '</span></div><div><span>VIP room on Telegram</span><span>' + (m.telegram ? 'In the room' : 'Removed') + '</span></div><div><span>Email</span><span>' + esc(m.email || '') + '</span></div>' + (m.phone ? '<div><span>WhatsApp</span><span>' + esc(m.phone) + '</span></div>' : '') + (course ? '<div><span>' + course.name + '</span><span>' + m.progress + '% done</span></div>' : '') + '</div>' +
      '<div class="c__h"><h2>Payments</h2></div><div class="rows">' + (pays.length ? pays.map(function (o) { var it = S.item(o.item) || { name: o.item }; return '<div class="row"><p style="font-size:14px">' + it.name + '<br><span class="mut">' + day(o.date) + ' · ' + o.method + '</span></p><span class="amt">' + money(o.usd) + '</span></div>'; }).join('') : '<p class="mut">No payments on record yet.</p>') + '</div>' +
      '<div class="acts" style="display:flex;gap:8px;flex-wrap:wrap"><button type="button" class="b" data-act="remindm" data-v="' + m.id + '">' + (d.own.reminders[m.id] ? 'Reminder sent' : 'Send a renewal reminder') + '</button><button type="button" class="b b--soft" data-act="tg" data-v="' + m.id + '">' + (m.telegram ? 'Remove from the VIP room' : 'Add to the VIP room') + '</button></div>');
  }

  /* ---------------- actions ---------------- */
  document.addEventListener('click', function (e) {
    if (e.target.closest('[data-close]')) { closeDrawer(); return; }
    var row = e.target.closest('tr[data-open]');
    if (row && !e.target.closest('button, a')) { var o = row.getAttribute('data-open'); if (o.indexOf('m:') === 0) memberDrawer(o.slice(2)); return; }
    var b = e.target.closest('[data-act]'); if (!b) return;
    var a = b.getAttribute('data-act'), v = b.getAttribute('data-v') || '', p = v.split('|');
    if (a === 'picture') { signalPicture(v); return; }
    else if(a === 'monday') { save(function(d){d.own.monday = !d.own.monday;}); }
    else if (a === 'mf') { state.mf = v; state.mshow = 15; }
    else if (a === 'mmore') state.mshow += 15;
    else if (a === 'pmore') state.pshow += 15;
    else if (a === 'ef') state.ef = v;
    else if (a === 'dir') { state.dir = v; $$('[data-act="dir"]').forEach(function (x) { x.setAttribute('aria-pressed', String(x === b)); }); return; }
    else if (a === 'aud') { state.aud = v; $$('[data-act="aud"]').forEach(function (x) { x.setAttribute('aria-pressed', String(x === b)); }); return; }
    else if (a === 'camp') state.camp = v;
    else if (a === 'recv') { save(function (d) { d.own.received[v] = true; }); UI.toast('Payment ' + v + ' marked as received'); }
    else if (a === 'res') { save(function (d) { d.own.results[p[0]] = [p[1], +p[2]]; }); UI.toast('Result saved to the archive'); }
    else if (a === 'cert') { save(function (d) { d.own.certs[v] = true; var m=d.members.find(function(m){return m.id===v;}); if(m && !S.certificates().some(function(c){return c.member===v;})) { var c=KF.courses.find(function(c){return c.id===m.course;}); d.own.issued.push({member:v,name:m.name,course:c.name,date:TODAY,code:'ZF-CERT-'+(Number(v.slice(1))+1000)}); } }); UI.toast('Certificate sent'); }
    else if (a === 'remind') { save(function (d) { d.own.reminders.live = true; }); UI.toast('Reminder sent to the VIP room'); }
    else if (a === 'app') { S.setApp(p[0], p[1]); UI.toast(p[1] === 'Declined' ? 'Application declined, with a kind note' : p[1] === 'Accepted' ? 'Seat confirmed. Welcome pack sent' : 'Intro call booked'); }
    else if (a === 'in') { save(function (d) { d.own.checkin[v] = !d.own.checkin[v]; }); }
    else if (a === 'bot') { save(function (d) { d.own.bot[v] = d.own.bot[v] === false; }); }
    else if (a === 'enq') { save(function (d) { d.own.enq[p[0]] = p[1]; }); UI.toast(p[1] === 'Replied' ? 'Opened in WhatsApp, marked as replied' : 'Marked as joined'); }
    else if (a === 'remindm') { save(function (d) { d.own.reminders[v] = true; }); UI.toast('Reminder sent on WhatsApp and Telegram'); memberDrawer(v); return; }
    else if (a === 'tg') { var m = members().filter(function (x) { return x.id === v; })[0]; save(function (d) { d.own.tg[v] = !m.telegram; }); UI.toast(m.telegram ? 'Removed from the VIP room' : 'Invite to the VIP room sent'); memberDrawer(v); render(); return; }
    else return;
    render();
  });
  document.addEventListener('input', function (e) {
    var k = e.target.getAttribute && e.target.getAttribute('data-q'); if (!k) return;
    state[k] = e.target.value; state.mshow = state.pshow = 15;
    var pos = e.target.selectionStart; render();
    var i = $('[data-q="' + k + '"]'); if (i) { i.focus(); try { i.setSelectionRange(pos, pos); } catch (er) {} }
  });
  document.addEventListener('submit', function (e) {
    var f = e.target;
    if (f.hasAttribute('data-setup')) {
      e.preventDefault();
      if (!f.entry.value || !f.stop.value || !f.tp.value) { $('[data-setup-msg]').textContent = 'Add the entry, the stop and the first target.'; return; }
      S.postSetup({ pair: f.pair.value, dir: state.dir, entry: f.entry.value, stop: f.stop.value, tp: f.tp.value, tp2: f.tp2.value, tp3: f.tp3.value });
      UI.toast('Sent to the student area and the VIP room'); render();
      var m = $('[data-setup-msg]'); if (m) m.textContent = 'Sent. Members can see it now.';
    } else if (f.hasAttribute('data-cast')) {
      e.preventDefault(); if (!f.msg.value.trim()) return;
      save(function (d) { d.own.casts.unshift({ msg: f.msg.value.trim(), aud: state.aud, at: new Date().toISOString() }); });
      UI.toast('Sent to the ' + (state.aud === 'Both' ? 'VIP room and the free channel' : state.aud)); render();
    }
  });
  document.addEventListener('keydown', function (e) { if (e.key === 'Escape') closeDrawer(); });
  setInterval(function () { var c = $$('[data-count]'); if (c.length) { var t = countdown(nextLive()); c.forEach(function (x) { x.textContent = t; }); } }, 1000);
  // an order placed or a setup posted in another tab shows up here without a reload
  S.onChange = function () { if (drawer.hidden && !(document.activeElement && /INPUT|TEXTAREA|SELECT/.test(document.activeElement.tagName))) render(); };
  render(true);
})();
