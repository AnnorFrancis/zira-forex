/* Zira Forex: the Desk. A rule-based concierge, so it is reliable on camera.
   window.KFDesk.answer(text) returns HTML. Content comes from data.js. */
(function () {
  'use strict';
  var KF = window.KF, UI = window.KFUI;
  if (!KF || !UI || document.body.hasAttribute('data-no-desk')) return;
  var R = UI.root;

  function m(usd) { return UI.money(usd); }
  function nextCamp() { var t = KF.tour[0]; return t.city + ' on ' + t.dates + ' ' + t.year; }

  var rules = [
    { k: /(price|cost|how much|fee|pay|subscription|monthly|\$|cedi|naira|rand)/i, a: function () {
      return 'The Trading Room is ' + m(99) + ' a month, ' + m(269) + ' a quarter or ' + m(890) + ' a year. Courses start at ' + m(249) + ' (Foundations), The Zira Method is ' + m(1250) + ', and private mentorship is ' + m(4800) + ' by application. <a href="' + R + 'trading-room.html#plans">See the plans</a>'; } },
    { k: /(begin|beginner|start|new to|never traded|zero|basics)/i, a: function () {
      return 'Start with <a href="' + R + 'academy.html#foundations">Foundations</a> and a demo account. Watch the free Sunday forecast on YouTube every week. Join the Trading Room once you can place, stop and size a trade without thinking.'; } },
    { k: /(signal|setup|telegram|vip|elites|room)/i, a: function () {
      return 'Trading Room members get Zira&rsquo;s setups on gold and the majors with entry, stop and three targets, live on Telegram and in the members&rsquo; area, plus two live sessions a week. Every setup is archived with its result, losses included. <a href="' + R + 'trading-room.html">Inside the room</a>'; } },
    { k: /(broker|platform|mt4|mt5|metatrader|account|deposit)/i, a: function () {
      return 'Use any regulated broker that offers gold and the majors on MetaTrader or cTrader, licensed where you live. Nobody from Zira&rsquo;s team will ever ask you to send money for them to trade on your behalf.'; } },
    { k: /(mentor|1:1|one to one|one-on-one|private|coach)/i, a: function () {
      return 'Mentorship is twelve weeks one to one with Zira, ' + m(4800) + ', six seats a quarter, by application. <a href="' + R + 'mentorship.html#apply">Apply here</a>, it takes about four minutes.'; } },
    { k: /(bootcamp|event|tour|seminar|dubai|lagos|accra|london|kampala|douala|joburg|johannesburg|city)/i, a: function () {
      return 'Next bootcamp: ' + nextCamp() + '. Seven cities on the 2026&ndash;27 tour, forty seats each, from ' + m(650) + '. <a href="' + R + 'bootcamps.html">See every date</a>'; } },
    { k: /(refund|cancel|money back|stop paying)/i, a: function () {
      return 'You can cancel the Trading Room any time before renewal. Courses are refundable within 7 days if you have watched less than a fifth of the lessons. <a href="' + R + 'policies.html#refunds">Refund policy</a>'; } },
    { k: /(guarantee|profit|safe|lose|risk|scam|legit)/i, a: function () {
      return 'No honest teacher guarantees profit. Trading on margin can lose you all of your deposit. What Zira teaches is structure: a plan, a 1 to 2% risk rule, and showing the losses with the wins. <a href="' + R + 'index.html#size">Size a trade the Zira way</a>'; } },
    { k: /(gold|xau|xauusd)/i, a: function () {
      var g = KF.gold[KF.gold.length - 1], p = KF.gold[KF.gold.length - 2];
      var ch = (g[4] - p[4]) / p[4] * 100;
      return 'Gold closed at ' + g[4].toLocaleString('en-US', { minimumFractionDigits: 1 }) + ' on ' + g[0].slice(8) + ' Oct, ' + (ch >= 0 ? 'up ' : 'down ') + Math.abs(ch).toFixed(1) + '% on the day. Zira&rsquo;s full read is in the <a href="#" target="_blank" rel="noopener">weekly forecast</a>.'; } },
    { k: /(foundation|charity|donate|school)/i, a: function () {
      return 'The Zira Foundation teaches budgeting, saving and how markets work to young people, free, in schools and community halls. <a href="' + R + 'about.html#foundation">Support a classroom</a>'; } },
    { k: /(contact|whatsapp|call|email|talk|human|speak)/i, a: function () {
      return 'The desk replies on WhatsApp from 9 to 6, Accra time. <a href="' + KF.brand.whatsapp + '" target="_blank" rel="noopener">Message the desk</a>'; } },
    { k: /(hello|hi|hey|good (morning|afternoon|evening))/i, a: function () {
      return 'Hello, welcome to the desk. Ask about the Trading Room, courses, mentorship, bootcamp dates or how to size a trade.'; } }
  ];
  function answer(t) {
    for (var i = 0; i < rules.length; i++) if (rules[i].k.test(t)) return rules[i].a();
    return 'Good question. A member of Zira&rsquo;s team will answer it on <a href="' + KF.brand.whatsapp + '" target="_blank" rel="noopener">WhatsApp</a>. Meanwhile, the <a href="' + R + 'index.html#faq">questions page</a> covers the basics.';
  }

  var ava = R + 'assets/img/thumb/portrait-16.jpg';
  var btn = document.createElement('button');
  btn.className = 'desk-btn glass'; btn.type = 'button'; btn.setAttribute('aria-expanded', 'false'); btn.setAttribute('aria-controls', 'desk');
  btn.innerHTML = '<img class="ava" src="' + ava + '" alt="" width="32" height="32"><span class="txt">Ask the desk</span><span class="live" aria-hidden="true"></span>';
  var panel = document.createElement('section');
  panel.className = 'desk glass'; panel.id = 'desk'; panel.setAttribute('aria-label', 'Zira’s desk');
  panel.innerHTML = '<div class="desk__head"><img src="' + ava + '" alt="" width="40" height="40"><div><strong>Zira&rsquo;s desk</strong><small>Usually replies in a minute</small></div><button class="desk__x" type="button" aria-label="Close the desk">&times;</button></div>' +
    '<div class="desk__log" data-log role="log" aria-live="polite"></div>' +
    '<div class="desk__chips"><button type="button">How much is the Trading Room?</button><button type="button">I&rsquo;m a complete beginner</button><button type="button">Next bootcamp?</button><button type="button">Do you guarantee profit?</button></div>' +
    '<form class="desk__form"><label class="sr-only" for="desk-q">Your question</label><input id="desk-q" autocomplete="off" placeholder="Ask anything about trading with Zira"><button type="submit">Send</button></form>';
  document.body.appendChild(btn); document.body.appendChild(panel);
  var log = panel.querySelector('[data-log]');
  function say(html, who) {
    var d = document.createElement('div'); d.className = 'msg msg--' + who; d.innerHTML = html; log.appendChild(d); log.scrollTop = log.scrollHeight;
  }
  var greeted = false;
  var hideT;
  function open(o) {
    clearTimeout(hideT); btn.setAttribute('aria-expanded', String(o));
    if (o) { panel.classList.add('is-show'); requestAnimationFrame(function () { panel.classList.add('is-open'); }); }
    else { panel.classList.remove('is-open'); hideT = setTimeout(function () { panel.classList.remove('is-show'); }, 420); }
    if (o && !greeted) { greeted = true; say('Hello, I&rsquo;m the desk at Ziraforex Trading Academy. What would you like to know?', 'k'); }
    if (o) setTimeout(function () { panel.querySelector('input').focus(); }, 200);
  }
  btn.addEventListener('click', function () { open(!panel.classList.contains('is-open')); });
  panel.querySelector('.desk__x').addEventListener('click', function () { open(false); btn.focus(); });
  function ask(q) {
    if (!q) return; say(UI.esc(q), 'u');
    var typing = document.createElement('div'); typing.className = 'msg msg--k'; typing.textContent = '…'; log.appendChild(typing);
    setTimeout(function () { typing.remove(); say(answer(q), 'k'); }, 520);
  }
  panel.querySelector('form').addEventListener('submit', function (e) { e.preventDefault(); var i = panel.querySelector('input'); ask(i.value.trim()); i.value = ''; });
  panel.querySelector('.desk__chips').addEventListener('click', function (e) { var b = e.target.closest('button'); if (b) ask(b.textContent); });
  document.addEventListener('keydown', function (e) { if (e.key === 'Escape' && panel.classList.contains('is-open')) open(false); });
  window.KFDesk = { answer: answer, open: open, ask: ask };
})();
