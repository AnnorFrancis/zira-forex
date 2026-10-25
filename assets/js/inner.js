/* Zira Forex: inner pages. One file, switched on body[data-page]. */
(function () {
  'use strict';
  var KF = window.KF, UI = window.KFUI, $ = UI.$, $$ = UI.$$, S = window.KFStore;
  var page = document.body.getAttribute('data-page');
  var G = window.gsap;
  function fmt(n, dp) { return Number(n).toLocaleString('en-US', { minimumFractionDigits: dp || 0, maximumFractionDigits: dp || 0 }); }
  function m(usd) { return '<span data-usd="' + usd + '">' + UI.money(usd) + '</span>'; }

  /* ---------- shared pieces ---------- */
  function lists() {
    $$('[data-list]').forEach(function (el) {
      var rows = KF[el.getAttribute('data-list')] || [];
      el.innerHTML = rows.map(function (r) { return '<li><span>' + r[0] + '</span><span>' + r[1] + '</span></li>'; }).join('');
    });
  }
  function faq(items) {
    var el = $('[data-faq]'); if (!el) return;
    el.innerHTML = items.map(function (f, i) { return '<details class="qa"' + (i === 0 ? ' open' : '') + ' data-reveal><summary>' + f[0] + '<span class="chev" aria-hidden="true"></span></summary><div class="ans"><p>' + f[1] + '</p></div></details>'; }).join('');
  }
  function road(frames) {
    var el = $('[data-road-list]'); if (!el) return;
    el.innerHTML = frames.map(function (f) { return '<figure><img src="' + UI.img(f[0], 'thumb') + '" alt="' + (KF.photoAlt[f[0]] || f[1]) + '" loading="lazy" draggable="false"></figure>'; }).join('');
    var c = $('[data-road-count]'); if (c) c.textContent = frames.length + ' frames';
    var down = false, sx = 0, sl = 0;
    el.addEventListener('pointerdown', function (e) { if (e.pointerType !== 'mouse') return; down = true; sx = e.clientX; sl = el.scrollLeft; el.classList.add('is-drag'); el.setPointerCapture(e.pointerId); });
    el.addEventListener('pointermove', function (e) { if (down) el.scrollLeft = sl - (e.clientX - sx); });
    el.addEventListener('pointerup', function () { down = false; el.classList.remove('is-drag'); });
  }
  function nextSeat() { var t = KF.tour[0]; return t.left + ' of ' + t.seats + ' seats left in ' + t.city + '.'; }

  /* ---------- Trading Room ---------- */
  function room() {
    var host = $('[data-sessions]');
    function sess() {
      var list = UI.sessions();
      host.innerHTML = list.map(function (s) {
        return '<div class="sess' + (s.open ? ' is-open' : '') + '"><span class="sess__city">' + s.city + '</span><span class="sess__time">' + s.local + ' now · trades ' + s.hours + '</span><span class="sess__state"><span class="pip"></span>' + (s.open ? 'Open now' : 'Opens in ' + UI.dur(s.toOpen)) + '</span></div>';
      }).join('');
      var line = UI.sessionLine(); $('[data-sess-note]').textContent = line.live ? line.text + '. ' + line.sub + '.' : line.text + '. ' + line.sub + '.';
    }
    sess(); setInterval(sess, 30000);
    var feed = $('[data-feed]');
    feed.className = 'slip'; feed.setAttribute('data-ui', ''); feed.style.width = 'min(100%, 560px)';
    feed.innerHTML = '<div class="slip__head"><span class="slip__brand">ZIRAFOREX</span><span class="slip__meta">Free channel<br>October 2026</span></div>' +
      Object.keys(KF.setups).filter(function (k) { return k !== 'USDJPY'; }).map(function (k) {
        var s = KF.setups[k];
        return '<h4>' + s.dir + ' ' + s.pair + ' <span class="t-soft" style="font-weight:400">targets at ' + s.tps.map(function (t) { return fmt(Math.abs(t - s.entry) / Math.abs(s.entry - s.stop), 1) + 'R'; }).join(', ') + '</span></h4>' +
          '<div class="row"><span>Entry</span><span class="dots"></span><span class="v">' + fmt(s.entry, s.dp) + '</span></div>' +
          '<div class="row"><span>Stop loss</span><span class="dots"></span><span class="v neg">' + fmt(s.stop, s.dp) + '</span></div>' +
          '<div class="row"><span>Targets</span><span class="dots"></span><span class="v pos">' + s.tps.map(function (t) { return fmt(t, s.dp); }).join(' &middot; ') + '</span></div>';
      }).join('') + '<div class="slip__total"><span>In the room</span><strong>Every day</strong></div>';
    var plans = $('[data-plans]');
    plans.innerHTML = KF.room.map(function (p, i) {
      return '<div class="plan' + (i === 2 ? ' plan--hi' : '') + '"><span><span class="plan__name">' + p.name + '</span><span class="plan__per">' + p.per + '</span></span><span class="plan__price">' + m(p.usd) + '</span>' +
        '<span class="t-small t-soft">' + p.note + '</span><a class="btn" data-magnetic href="checkout.html?item=room-' + p.id + '">Join ' + p.name.toLowerCase() + '</a></div>';
    }).join('');
    faq([KF.faq[3], KF.faq[4], KF.faq[0], KF.faq[5], ['Can I join from outside Ghana?', 'Yes. Members join from across Africa, the Emirates and Europe. Prices are billed in US dollars; Mobile Money and cards both work.']]);
  }

  /* ---------- Academy ---------- */
  function academy() {
    var steps = [['Foundations', 'Self-paced', 0.32], ['The Zira Method', '8 weeks, live', 0.55], ['Gold Mastery', '4 weeks, live', 0.76], ['Mentorship', '12 weeks, one to one', 1]];
    $('[data-path]').innerHTML = steps.map(function (s) {
      return '<li class="up" data-reveal style="--h:' + s[2] + '"><span class="up__candle" aria-hidden="true"><i></i></span><span class="up__name">' + s[0] + '</span><span class="up__len t-soft">' + s[1] + '</span></li>';
    }).join('');
    $('[data-courses]').innerHTML = KF.courses.map(function (c) {
      return '<article class="course" id="' + c.id + '" data-reveal><figure class="course__pic"><img src="' + UI.img(c.img) + '" alt="' + KF.photoAlt[c.img] + '" loading="lazy"></figure>' +
        '<div class="course__main"><h3>' + c.name + '</h3><p class="meta">' + c.level + ' &middot; ' + c.length + '</p><p>' + c.line + '</p><ul class="course__mods">' + c.modules.map(function (x) { return '<li>' + x + '</li>'; }).join('') + '</ul></div>' +
        '<div class="course__buy"><span class="plan__price">' + m(c.usd) + '</span><span class="t-small t-soft">One payment, lifetime access</span><a class="btn" data-magnetic href="checkout.html?item=course-' + c.id + '">Enrol</a></div></article>';
    }).join('');
    var inp = $('[data-cert-name]'), out = $('[data-cert-out]');
    inp.addEventListener('input', function () { out.textContent = inp.value.trim() || 'Your name'; });
    $('[data-cert-date]').textContent = new Date().toLocaleDateString('en-GB', { day: 'numeric', month: 'long', year: 'numeric' });
    faq([['Do I need any experience?', 'Not for Foundations. The Zira Method expects you to have placed trades on a demo account; Gold Mastery expects three months of live trading.'], ['What do I need to install?', 'A free TradingView account and a demo account with a regulated broker. Every lesson shows the charts step by step.'], KF.faq[4], ['Are the live classes recorded?', 'Yes. Every live class is in the members&rsquo; area within a day, with the charts Zira drew.']]);
  }

  /* ---------- Mentorship ---------- */
  function mentorship() {
    var sl = $('[data-seat-line]'); if (sl) sl.textContent = 'Two of six seats left for the January intake.';
    var weeks = [['Weeks 1 and 2', 'An audit of your last 50 trades, then your trading plan, written together'], ['Weeks 3 to 6', 'You trade the plan. Weekly calls and a chart review between calls'], ['Weeks 7 to 10', 'Psychology: revenge trading, overtrading, sizing up after a win'], ['Weeks 11 and 12', 'Independence: you run the week and Zira only watches']];
    $('[data-weeks]').innerHTML = weeks.map(function (w) { return '<li data-reveal><span class="weeks__w">' + w[0] + '</span><span class="weeks__d">' + w[1] + '</span></li>'; }).join('');
    // intro call slots: next 6 weekdays, 3 times each, shown in the visitor's own time
    var slots = $('[data-slots]'), out = [], d = new Date(), n = 0;
    while (out.length < 6 && n < 14) { d = new Date(d.getTime() + 86400000); n++; if (d.getDay() === 0 || d.getDay() === 6) continue; out.push(new Date(d)); }
    slots.innerHTML = out.map(function (day) {
      var label = day.toLocaleDateString('en-GB', { weekday: 'short', day: 'numeric', month: 'short' });
      var times = [10, 14, 18].map(function (h) { var t = new Date(Date.UTC(day.getFullYear(), day.getMonth(), day.getDate(), h, 0)); return '<button type="button" data-slot="' + t.toISOString() + '" aria-pressed="false">' + t.toLocaleTimeString('en-GB', { hour: '2-digit', minute: '2-digit' }) + '</button>'; }).join('');
      return '<div class="slots__day"><span>' + label + '</span><div class="seg">' + times + '</div></div>';
    }).join('');
    var chosen = null;
    slots.addEventListener('click', function (e) { var b = e.target.closest('[data-slot]'); if (!b) return; chosen = b.getAttribute('data-slot'); $$('[data-slot]', slots).forEach(function (x) { x.setAttribute('aria-pressed', String(x === b)); }); });
    var form = $('[data-apply]'), stepEls = $$('.step', form), bars = $$('.steps span'), back = $('[data-back]', form), next = $('[data-next]', form), msg = $('[data-apply-msg]');
    var cur = 0;
    function show(i) {
      cur = i; stepEls.forEach(function (s, k) { s.hidden = k !== i; }); bars.forEach(function (b, k) { b.classList.toggle('is-on', k <= i); });
      back.hidden = i === 0; next.textContent = i === stepEls.length - 1 ? 'Send my application' : 'Continue'; msg.textContent = '';
      if (G && !UI.reduced) G.fromTo(stepEls[i], { opacity: 0, x: 24 }, { opacity: 1, x: 0, duration: 0.5, ease: 'expo.out' });
    }
    function valid(i) {
      var s = stepEls[i];
      if (i === 0 && !form.querySelector('input[name="exp"]:checked')) return 'Choose how long you have traded live.';
      if (i === 1 && !form.goal.value.trim()) return 'Tell Zira what should be different in twelve weeks.';
      if (i === 2 && !chosen) return 'Pick a time for the intro call.';
      if (i === 3) { if (!form.name.value.trim() || !form.country.value.trim()) return 'Add your name and country.'; if (!/^\S+@\S+\.\S+$/.test(form.email.value)) return 'Add an email address Zira can reply to.'; if (!form.risk.checked) return 'Please confirm you understand the risk.'; }
      return '';
    }
    back.addEventListener('click', function () { show(Math.max(0, cur - 1)); });
    form.addEventListener('submit', function (e) {
      e.preventDefault(); var err = valid(cur); if (err) { msg.textContent = err; return; }
      if (cur < stepEls.length - 1) { show(cur + 1); return; }
      var rec = S.apply({ name: form.name.value.trim(), country: form.country.value.trim(), email: form.email.value.trim(), wa: form.wa.value.trim(), exp: form.querySelector('input[name="exp"]:checked').value, market: form.market.value, size: form.size.value, goal: form.goal.value.trim(), call: chosen });
      form.hidden = true; $('.steps').hidden = true;
      var done = $('[data-done]'); done.hidden = false;
      $('[data-ref]').textContent = rec.ref;
      $('[data-done-line]').textContent = 'Thank you, ' + rec.name.split(' ')[0] + '. Your intro call is held for ' + new Date(chosen).toLocaleString('en-GB', { weekday: 'long', day: 'numeric', month: 'long', hour: '2-digit', minute: '2-digit' }) + '. Zira will confirm on email' + (rec.wa ? ' and WhatsApp' : '') + '.';
      if (G && !UI.reduced) G.from(done, { opacity: 0, y: 20, duration: 0.7, ease: 'expo.out' });
    });
  }

  /* ---------- Bootcamps ---------- */
  function bootcamps() {
    var list = $('[data-camps]');
    list.innerHTML = KF.tour.map(function (t) {
      var sold = t.seats - t.left, pct = sold / t.seats * 100;
      return '<article class="camp" id="' + t.id + '" data-city="' + t.id + '" data-reveal><div class="camp__city">' + t.city + '</div>' +
        '<div class="camp__meta"><span class="num">' + t.dates + ' ' + t.year + '</span><span class="t-soft">' + t.venue + ', ' + t.country + '</span></div>' +
        '<div class="camp__seats"><div class="bar"><span style="width:' + pct.toFixed(0) + '%"></span></div><span class="t-small">' + t.left + ' of ' + t.seats + ' seats left</span></div>' +
        '<div class="camp__buy"><a class="btn" data-magnetic href="checkout.html?item=camp-' + t.id + '">Standard ' + m(KF.bootcamp.usd) + '</a><a class="link" href="checkout.html?item=camp-' + t.id + '-vip">VIP ' + m(KF.bootcamp.vipUsd) + '</a></div></article>';
    }).join('');
    var card = $('[data-city-card]'), i = 0, timer, held = false;
    function setCity(id) {
      var t = KF.tour.filter(function (x) { return x.id === id; })[0]; if (!t) return;
      i = KF.tour.indexOf(t);
      $('[data-cc-city]').textContent = t.city;
      $('[data-cc-line]').textContent = t.dates + ' ' + t.year + ', ' + t.venue + '. ' + (t.id === 'accra' ? 'Home: where the academy began.' : 'Flying out from Accra.');
      $('[data-cc-seats]').innerHTML = t.left + ' of ' + t.seats + ' seats left &middot; from ' + UI.money(KF.bootcamp.usd);
      $('[data-cc-book]').setAttribute('href', 'checkout.html?item=camp-' + t.id);
      if (window.KFGlobe) window.KFGlobe.focus(t.id);
      if (G && !UI.reduced) G.fromTo(card.children, { opacity: 0.75, y: 6 }, { opacity: 1, y: 0, duration: 0.5, stagger: 0.04, ease: 'expo.out' });
    }
    card.addEventListener('pointerenter', function () { held = true; }); card.addEventListener('pointerleave', function () { held = false; });
    setCity(KF.tour[0].id);
    timer = setInterval(function () { if (!held && !UI.reduced) setCity(KF.tour[(i + 1) % KF.tour.length].id); }, 4200);
    $$('.camp', list).forEach(function (el) { el.addEventListener('pointerenter', function () { setCity(el.getAttribute('data-city')); }); });
    if (location.hash) { var id = location.hash.slice(1); if (KF.tour.some(function (t) { return t.id === id; })) setCity(id); }
    road([['event-1', 'Speaker at an event'], ['portrait-13', 'Community photograph'], ['portrait-1', 'Community photograph'], ['portrait-21', 'Community photograph'], ['portrait-3', 'Community photograph'], ['portrait-17', 'Community photograph'], ['portrait-11', 'Community photograph']]);
  }

  /* ---------- About ---------- */
  function about() {
    lists();
    road([['portrait-20', 'Community photograph'], ['portrait-16', 'Community photograph'], ['portrait-15', 'Community photograph'], ['portrait-18', 'Community photograph'], ['portrait-6', 'Community photograph'], ['portrait-13', 'Community photograph'], ['portrait-19', 'Community photograph'], ['portrait-17', 'Community photograph']]);
    var f = $('[data-found-form]');
    f.addEventListener('submit', function (e) {
      e.preventDefault(); var msg = $('[data-found-msg]');
      if (!f.name.value.trim() || !f.org.value.trim() || !f.contact.value.trim()) { msg.textContent = 'Add your name, your school or group, and how to reach you.'; return; }
      msg.textContent = 'Thank you. The Foundation team will reach out within a week.'; f.reset();
    });
  }

  /* ---------- Checkout ---------- */
  function checkout() {
    var q = new URLSearchParams(location.search);
    var id = q.get('item') || 'room-month';
    var it = S.item(id) || S.item('room-month');
    var sum = $('[data-co-sum]');
    function render() {
      sum.innerHTML = '<h2 class="t-lead">Your order</h2><div class="co-item"><span class="co-name">' + it.name + '</span><span class="t-soft t-small">' + it.per + '</span></div>' +
        '<div class="row"><span>Price</span><span class="dots"></span><span class="v">' + m(it.usd) + '</span></div>' +
        '<div class="row"><span>Billed in</span><span class="dots"></span><span class="v">US dollars, $' + fmt(it.usd) + '</span></div>' +
        '<div class="slip__total" style="margin:20px -26px 0;padding:0 26px"><span>Total</span><strong>' + m(it.usd) + '</strong></div>' +
        '<div class="price__ccy" style="margin-top:22px"><div class="ccy" role="group" aria-label="Currency"></div><span class="t-small t-soft" data-ccy-note></span></div>' +
        '<p class="t-small t-soft" style="margin-top:16px">' + (it.kind === 'room' ? 'Renews ' + it.per + '. Cancel any time before renewal.' : it.kind === 'camp' ? 'Full refund up to 21 days before the first day.' : 'Refundable within 7 days if you have watched less than a fifth of the lessons.') + '</p>';
      UI.mountCcy($('.ccy', sum)); UI.setCcy(UI.ccy().code);
      $('[data-co-total]').innerHTML = m(it.usd); UI.setCcy(UI.ccy().code);
    }
    render();
    var form = $('[data-co]'), detail = $('[data-pay-detail]');
    function method() { return form.querySelector('input[name="method"]:checked').value; }
    function payDetail() {
      var v = method();
      detail.innerHTML = v === 'Mobile Money' ? '<label>Mobile Money number <span class="hint">You will get a prompt to approve on your phone</span><input name="momo" type="tel" inputmode="tel" placeholder="024 000 0000"></label>'
        : v === 'USDT' ? '<p class="t-small t-soft">Network TRC20. Your order is confirmed when the payment arrives. Demo checkout: no live wallet is connected.</p>' : v === 'Card' ? '<p class="t-small t-soft">You will finish on the payment provider&rsquo;s secure page. This site never sees your card.</p>'
          : '<p class="t-small t-soft">You will get the account details and a payment reference. Your seat or membership is held for 48 hours.</p>';
    }
    form.addEventListener('change', function (e) { if (e.target.name === 'method') payDetail(); });
    payDetail();
    form.addEventListener('submit', function (e) {
      e.preventDefault(); var msg = $('[data-co-msg]');
      if (!form.name.value.trim()) { msg.textContent = 'Add your full name.'; return; }
      if (!/^\S+@\S+\.\S+$/.test(form.email.value)) { msg.textContent = 'Add a valid email for your receipt.'; return; }
      if (method() === 'Mobile Money' && form.momo && form.momo.value.replace(/\D/g, '').length < 9) { msg.textContent = 'Add the Mobile Money number to send the prompt to.'; return; }
      if (!form.risk.checked) { msg.textContent = 'Please confirm you understand the risk and accept the terms.'; return; }
      msg.textContent = '';
      var btn = $('[data-pay]'); btn.disabled = true; btn.textContent = method() === 'Mobile Money' ? 'Waiting for approval on your phone…' : 'Processing…';
      setTimeout(function () {
        var rec = S.placeOrder({ item: it.id, name: form.name.value.trim(), email: form.email.value.trim(), wa: form.wa.value.trim(), country: form.country.value.trim(), usd: it.usd, method: method(), referral: q.get('ref') });
        form.hidden = true;
        var done = $('[data-co-done]'); done.hidden = false;
        done.innerHTML = '<h2 class="t-head" style="margin-top:32px">' + (rec.status === 'Paid' ? 'You&rsquo;re in, ' + UI.esc(rec.name.split(' ')[0]) + '.' : 'Order held, ' + UI.esc(rec.name.split(' ')[0]) + '.') + '</h2>' +
          '<p class="t-lead" style="margin-top:16px">' + (rec.status === 'Paid' ? 'Your receipt and ' + (it.kind === 'room' ? 'Telegram invite' : it.kind === 'camp' ? 'ticket' : 'course access') + ' are on their way to ' + UI.esc(rec.email) + '.' : rec.method === 'USDT' ? 'Your USDT order is awaiting payment on TRC20. It is confirmed when the payment arrives. This demo does not collect crypto.' : 'Transfer $' + fmt(it.usd) + ' with the reference below within 48 hours.') + '</p>' +
          '<div class="slip" data-ui style="margin:36px 0 0;width:min(100%,470px)"><div class="slip__head"><span class="slip__brand">ZIRAFOREX</span><span class="slip__meta">Receipt<br>' + rec.date + '</span></div>' +
          '<div class="row"><span>Reference</span><span class="dots"></span><span class="v">' + rec.ref + '</span></div><div class="row"><span>' + it.name + '</span><span class="dots"></span><span class="v">$' + fmt(it.usd) + '</span></div>' +
          '<div class="row"><span>Paid with</span><span class="dots"></span><span class="v">' + rec.method + '</span></div><div class="slip__total"><span>Status</span><strong>' + rec.status + '</strong></div></div>' +
          '<div style="display:flex;gap:22px;align-items:center;margin-top:32px;flex-wrap:wrap"><a class="btn" href="portal.html">Go to the Atelier</a><a class="link" href="index.html">Back to the home page</a></div>';
        if (G && !UI.reduced) G.from(done.children, { opacity: 0, y: 20, duration: 0.7, stagger: 0.07, ease: 'expo.out' });
        UI.toast('Order ' + rec.ref + ' placed');
      }, 1600);
    });
  }

  /* ---------- The Atelier (student area) ---------- */
  function portal() {
    var now = new Date(), h = now.getHours();
    $('[data-at-date]').textContent = now.toLocaleDateString('en-GB', { weekday: 'long', day: 'numeric', month: 'long' });
    $('[data-at-hello]').textContent = (h < 12 ? 'Good morning' : h < 17 ? 'Good afternoon' : 'Good evening') + ', Ama';
    var db = S.db(), mine = S.allOrders().filter(function(o){return o.own;});
    var roomO = mine.filter(function (o) { return /^room-/.test(o.item); })[0];
    var plan = roomO ? S.item(roomO.item) : S.item('room-month');
    $('[data-at-plan]').textContent = plan.name.replace('Trading Room, ', 'Trading Room, ');
    var ren = new Date(); ren.setDate(ren.getDate() + 19);
    $('[data-at-renew]').textContent = 'Renews ' + ren.toLocaleDateString('en-GB', { day: 'numeric', month: 'short' }) + ' · Active';
    // next live session: Tue/Thu 19:00 Accra (GMT)
    function nextLive() { var d = new Date(); for (var k = 0; k < 8; k++) { var c = new Date(Date.UTC(d.getUTCFullYear(), d.getUTCMonth(), d.getUTCDate() + k, 19, 0)); var wd = c.getUTCDay(); if ((wd === 2 || wd === 4) && c > d) return c; } return null; }
    var live = nextLive();
    function tick() {
      var ms = live - new Date(); var dd = Math.floor(ms / 86400000), hh = Math.floor(ms % 86400000 / 3600000), mm = Math.floor(ms % 3600000 / 60000), ss = Math.floor(ms % 60000 / 1000);
      $('[data-at-count]').textContent = (dd ? dd + 'd ' : '') + (hh < 10 ? '0' : '') + hh + ':' + (mm < 10 ? '0' : '') + mm + ':' + (ss < 10 ? '0' : '') + ss;
    }
    $('[data-at-when]').textContent = live.toLocaleString('en-GB', { weekday: 'long', hour: '2-digit', minute: '2-digit' }) + ' your time. Gold and the New York open, live.';
    tick(); setInterval(tick, 1000);
    // setups: Zira's own posts from HQ first, then the worked examples
    function setups(fresh) {
      var own = S.db().own.setups;
      var posted = own.map(function (s, i) { return '<div class="feed__item' + (fresh && i === 0 ? ' is-new' : '') + '"><span class="tag">' + UI.esc(s.dir + ' ' + s.pair) + '</span><span>Entry ' + UI.esc(s.entry) + ' &middot; Stop ' + UI.esc(s.stop) + ' &middot; TP ' + UI.esc(s.tp) + '</span><span class="res">New</span></div>'; }).join('');
      $('[data-at-setups]').innerHTML = posted + Object.keys(KF.setups).slice(0, Math.max(1, 3 - own.length)).map(function (k) {
        var s = KF.setups[k]; return '<div class="feed__item"><span class="tag">' + s.dir + ' ' + s.pair + '</span><span>Entry ' + fmt(s.entry, s.dp) + ' &middot; Stop ' + fmt(s.stop, s.dp) + ' &middot; TP1 ' + fmt(s.tps[0], s.dp) + '</span><span class="res">Open</span></div>';
      }).join('');
      var first = $('[data-at-setups] .is-new');
      if (first && G && !UI.reduced) G.fromTo(first, { opacity: 0, y: -14, backgroundColor: 'rgba(232,185,176,0.55)' }, { opacity: 1, y: 0, backgroundColor: 'rgba(232,185,176,0)', duration: 1.6, ease: 'expo.out' });
    }
    setups(false);
    // a setup Zira posts in HQ arrives here while the page is open
    var seen = db.own.setups.length;
    S.onChange = function () { var n = S.db().own.setups.length; if (n !== seen) { seen = n; setups(true); UI.toast('New setup from Zira'); } };
    // course progress
    var mods = KF.courses[0].modules, done = UI.store.get('zf.mods', [true, true, true, false, false, false]);
    function course() {
      var n = done.filter(Boolean).length, pct = Math.round(n / mods.length * 100);
      $('[data-at-pct]').textContent = pct + '% complete';
      $('[data-at-bar]').style.width = pct + '%';
      $('[data-at-mods]').innerHTML = mods.map(function (x, i) { return '<li><label><input type="checkbox" data-mod="' + i + '"' + (done[i] ? ' checked' : '') + '> ' + x + '</label></li>'; }).join('');
    }
    course();
    $('[data-at-mods]').addEventListener('change', function (e) { var i = e.target.getAttribute('data-mod'); if (i == null) return; done[+i] = e.target.checked; UI.store.set('zf.mods', done); course(); });
    // journal
    var jl = $('[data-at-journal]');
    function journal() {
      var j = S.journal();
      if (!j.length) j = [{ date: S.iso(new Date(Date.now() - 86400000)), pair: 'XAUUSD', res: 'No trade, waited', note: 'No retest at London open, so no trade. Boredom is not a setup.' }];
      jl.innerHTML = j.slice(0, 5).map(function (x) { return '<li><span class="num t-small t-soft">' + x.date + '</span><strong>' + UI.esc(x.pair) + ' &middot; ' + UI.esc(x.res) + (x.emotion ? ' / ' + UI.esc(x.emotion) + ' / ' + Number(x.r || 0) + 'R' : '') + '</strong><span>' + UI.esc(x.note) + '</span></li>'; }).join('');
    }
    journal();
    var jf = $('[data-at-jform]');
    jf.addEventListener('submit', function (e) { e.preventDefault(); if (!jf.note.value.trim()) return; S.journal({ pair: jf.pair.value, res: jf.res.value, note: jf.note.value.trim(), emotion: jf.emotion.value, r: Number(jf.r.value) }); jf.reset(); journal(); document.dispatchEvent(new Event('journalchange')); UI.toast('Added to your journal'); });
    // orders, tickets and applications
    var apps = db.own.apps;
    var rows = mine.map(function (o) { var it = S.item(o.item) || { name: o.item }; return '<div class="row"><span>' + it.name + ' <span class="t-soft">' + o.ref + '</span></span><span class="dots"></span><span class="v">' + o.status + '</span></div>'; }).join('') +
      apps.map(function (a) { return '<div class="row"><span>Mentorship application <span class="t-soft">' + a.ref + '</span></span><span class="dots"></span><span class="v">' + a.status + '</span></div>'; }).join('');
    $('[data-at-orders]').innerHTML = rows || '<p class="t-soft">Nothing yet. Orders and bootcamp tickets you buy on this site appear here.</p><div class="row"><span>Foundations <span class="t-soft">KF-240117</span></span><span class="dots"></span><span class="v">Paid</span></div><div class="row"><span>Trading Room, monthly <span class="t-soft">KF-240368</span></span><span class="dots"></span><span class="v">Active</span></div>';
  }

  /* ---------- scroll motion shared by inner pages ---------- */
  function motion() {
    if (!G || !window.ScrollTrigger || UI.reduced) return;
    $$('.page-hero__pic img, .m-hero__pic img').forEach(function (img) {
      G.fromTo(img, { scale: 1.14, yPercent: -2 }, { scale: 1, yPercent: 4, ease: 'none', scrollTrigger: { trigger: img.closest('section'), start: 'top top', end: 'bottom top', scrub: true } });
    });
    G.from('.page-hero__in, .m-hero__copy', { y: 30, opacity: 0, duration: 1, ease: 'expo.out', delay: 0.1 });
    $$('figure img, .course__pic img').forEach(function (img) {
      if (img.closest('.page-hero__pic, .m-hero__pic, .road__strip')) return;
      G.fromTo(img, { scale: 1.1 }, { scale: 1, ease: 'none', scrollTrigger: { trigger: img, start: 'top bottom', end: 'bottom top', scrub: true } });
    });
    $$('.slip, .cert').forEach(function (el) {
      G.fromTo(el, { yPercent: 5, rotate: -1 }, { yPercent: -3, rotate: 0.6, ease: 'none', scrollTrigger: { trigger: el, start: 'top bottom', end: 'bottom top', scrub: true } });
    });
    $$('[data-road-list]').forEach(function (el) { G.fromTo(el, { x: '5vw' }, { x: '-5vw', ease: 'none', scrollTrigger: { trigger: el, start: 'top bottom', end: 'bottom top', scrub: true } }); });
    $$('.plan, .camp, .course, .weeks li, .sess').filter(function (el) { return !el.hasAttribute('data-reveal'); }).forEach(function (el, i) {
      G.from(el, { y: 26, opacity: 0, duration: 0.9, ease: 'expo.out', delay: (i % 4) * 0.06, scrollTrigger: { trigger: el, start: 'top 92%' } });
    });
  }

  var run = { room: room, academy: academy, mentorship: mentorship, bootcamps: bootcamps, about: about, checkout: checkout, portal: portal }[page];
  if (run) run();
  UI.reveal(document);
  motion();
  UI.setCcy(UI.ccy().code);
})();
