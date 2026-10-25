/* Zira Forex: the trade slip.
   Balance and risk in, lot size and the money at each target out.
   Lot maths: risk money / (stop distance in pips x pip value per lot), rounded down to 0.01. */
(function () {
  'use strict';
  var KF = window.KF, UI = window.KFUI;

  function fmt(n, dp) { return Number(n).toLocaleString('en-US', { minimumFractionDigits: dp, maximumFractionDigits: dp }); }
  function usd(n) { var s = n < 0 ? '−$' : '$'; return s + fmt(Math.abs(n), 2); }

  function mount(form, slip) {
    if (!form || !slip) return;
    var pairs = form.querySelector('[data-pairs]');
    var bal = form.querySelector('[data-bal]');
    var risk = form.querySelector('[data-risk]');
    var riskN = form.querySelector('[data-risk-n]');
    var warn = form.querySelector('[data-warn]');
    var current = UI.store.get('zf.slip.pair', 'XAUUSD');
    if (!KF.setups[current]) current = 'XAUUSD';
    var saved = UI.store.get('zf.slip', null);
    if (saved) { bal.value = saved.bal; risk.value = saved.risk; riskN.value = saved.risk; }

    pairs.innerHTML = Object.keys(KF.setups).map(function (k) {
      return '<button type="button" data-pair="' + k + '" aria-pressed="' + (k === current) + '">' + KF.setups[k].label + '</button>';
    }).join('');
    pairs.addEventListener('click', function (e) {
      var b = e.target.closest('[data-pair]'); if (!b) return;
      current = b.getAttribute('data-pair'); UI.store.set('zf.slip.pair', current);
      pairs.querySelectorAll('button').forEach(function (x) { x.setAttribute('aria-pressed', String(x === b)); });
      render(true);
    });
    function num(el) { var v = parseFloat(String(el.value).replace(/[^0-9.]/g, '')); return isNaN(v) ? 0 : v; }
    bal.addEventListener('input', function () { render(false); });
    risk.addEventListener('input', function () { riskN.value = risk.value; render(false); });
    riskN.addEventListener('input', function () { var v = num(riskN); if (v) risk.value = Math.min(3, Math.max(0.25, v)); render(false); });

    var prevLots = null;
    function render(pairChanged) {
      var s = KF.setups[current];
      var B = num(bal), R = Math.min(10, num(riskN));
      UI.store.set('zf.slip', { bal: B || 5000, risk: R || 1 });
      var riskMoney = B * R / 100;
      var stopPips = Math.abs(s.entry - s.stop) / s.pip;
      var perLot = stopPips * s.pipValueUSD;
      var lots = KF.lotSize(B, R, stopPips, s.pipValueUSD);
      var actual = lots * perLot;
      var sell = s.dir === 'Sell';

      var msg = '';
      if (!B) msg = 'Put in your account balance to size the trade.';
      else if (lots < 0.01) msg = 'At this balance and risk the trade is smaller than 0.01 lots. Zira would wait, or take a closer stop.';
      else if (R > 2) msg = 'Above 2% is more than Zira risks on one idea. A losing week gets expensive quickly.';
      warn.textContent = msg;

      var tps = s.tps.map(function (tp, i) {
        var pips = Math.abs(tp - s.entry) / s.pip;
        var money = lots * pips * s.pipValueUSD;
        var rr = pips / stopPips;
        return '<div class="row"><span>Target ' + (i + 1) + ' <span class="t-soft">' + fmt(tp, s.dp) + ' &middot; ' + fmt(rr, 1) + 'R</span></span><span class="dots"></span><span class="v pos">+' + usd(money).replace('$', '$') + '</span></div>';
      }).join('');

      slip.innerHTML =
        '<div class="slip__head"><span class="slip__brand">ZIRAFOREX</span><span class="slip__meta">Trade slip<br>Worked example</span></div>' +
        '<div class="slip__title"><span class="dir' + (sell ? ' is-sell' : '') + '">' + s.dir + '</span> ' + s.pair + '</div>' +
        '<h4>The setup</h4>' +
        '<div class="row"><span>Entry</span><span class="dots"></span><span class="v">' + fmt(s.entry, s.dp) + '</span></div>' +
        '<div class="row"><span>Stop loss</span><span class="dots"></span><span class="v neg">' + fmt(s.stop, s.dp) + '</span></div>' +
        '<div class="row"><span>Distance to stop</span><span class="dots"></span><span class="v">' + fmt(stopPips, 1) + ' pips</span></div>' +
        '<h4>The targets</h4>' + tps +
        '<h4>Your size</h4>' +
        '<div class="row"><span>Balance</span><span class="dots"></span><span class="v">' + usd(B) + '</span></div>' +
        '<div class="row"><span>Risk at ' + fmt(R, 2).replace(/\.?0+$/, '') + '%</span><span class="dots"></span><span class="v">' + usd(riskMoney) + '</span></div>' +
        '<div class="row"><span>If the stop is hit</span><span class="dots"></span><span class="v neg">' + usd(-actual) + '</span></div>' +
        '<div class="slip__total"><span>Lot size</span><strong data-lots>' + fmt(lots, 2) + ' lots</strong></div>' +
        '<p class="slip__note">' + s.note + ' Education, not a live signal. Pip values use ' + KF.ratesDate + ' rates; check your broker&rsquo;s contract size.</p>' +
        '<div class="slip__actions"><button type="button" class="link" data-copy>Copy this slip</button><a class="link" href="' + UI.root + 'trading-room.html#join">Get Zira&rsquo;s live setups</a></div>';

      if (prevLots !== null && (prevLots !== lots || pairChanged)) {
        var t = slip.querySelector('.slip__total'); t.classList.add('flash');
      }
      if (pairChanged && window.gsap && !UI.reduced) gsap.fromTo(slip, { y: -10, opacity: 0.4 }, { y: 0, opacity: 1, duration: 0.6, ease: 'expo.out' });
      prevLots = lots;
      slip.querySelector('[data-copy]').addEventListener('click', function () {
        var txt = s.dir + ' ' + s.pair + '\nEntry ' + fmt(s.entry, s.dp) + '\nStop ' + fmt(s.stop, s.dp) + '\n' + s.tps.map(function (tp, i) { return 'TP' + (i + 1) + ' ' + fmt(tp, s.dp); }).join('\n') + '\nLots ' + fmt(lots, 2) + ' (risk ' + usd(actual) + ')\nEducation only. Zira Forex.';
        if (navigator.clipboard) navigator.clipboard.writeText(txt).then(function () { UI.toast('Slip copied'); }, function () { UI.toast('Copy is not allowed here'); });
        else UI.toast('Copy is not allowed here');
      });
    }
    render(false);
  }
  window.KFSlip = { mount: mount };
  document.querySelectorAll('[data-slip-form]').forEach(function (f) {
    var slip = document.querySelector('[data-slip]');
    mount(f, slip);
  });
})();
