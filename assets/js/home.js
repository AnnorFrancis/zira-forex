/* Zira Forex: home page.
   Intro (a gold thread swells into the I, Zira rises in it, the letters part, the gold sessions rise),
   the scaling monument, the story opening to full screen, and every section's content from data.js. */
(function () {
  'use strict';
  var KF = window.KF, UI = window.KFUI, $ = UI.$, $$ = UI.$$;
  var G = window.gsap;

  /* ---------------- content ---------------- */
  // ticker: last two real closes
  (function ticker() {
    var g = KF.gold, a = g[g.length - 1], b = g[g.length - 2];
    var ch = (a[4] - b[4]) / b[4] * 100;
    $('[data-tk-px]').textContent = a[4].toLocaleString('en-US', { minimumFractionDigits: 1 });
    var c = $('[data-tk-chg]'); c.textContent = (ch >= 0 ? '+' : '−') + Math.abs(ch).toFixed(2) + '%'; c.classList.add(ch >= 0 ? 'is-up' : 'is-down');
    var d = new Date(a[0] + 'T12:00:00Z');
    $('[data-tk-src]').textContent = 'COMEX gold futures, ' + d.getUTCDate() + ' ' + d.toLocaleString('en-GB', { month: 'short', timeZone: 'UTC' }) + ' close · This week’s forecast';
  })();

  // sessions
  function sessions() {
    var s = UI.sessionLine();
    var a = $('[data-session-a]'), b = $('[data-session-b]');
    if (a) { a.innerHTML = '<span class="dot' + (s.live ? '' : ' is-closed') + '"></span>' + s.text + (s.sub ? '.' : ''); b.textContent = s.sub; }
    var c = $('[data-cta-session]');
    if (c) c.textContent = s.live ? s.text + ' right now.' : s.text + '.';
  }
  sessions(); setInterval(sessions, 30000);

  // the desk button waits until the hero is mostly gone (it would sit on the ticker)
  (function deskGate() {
    var hero = $('.hero'); if (!hero) return;
    function f() { document.body.classList.toggle('at-hero', hero.getBoundingClientRect().bottom > window.innerHeight * 0.45); }
    UI.onScroll(f); f();
  })();

  // record lists
  function list(sel, rows) { var el = $(sel); if (el) el.innerHTML = rows.map(function (r) { return '<li><span>' + r[0] + '</span><span>' + r[1] + '</span></li>'; }).join(''); }
  list('[data-list="stages"]', KF.stages);
  list('[data-list="recognition"]', KF.recognition);

  // offers + the picture spot
  (function offers() {
    var host = $('[data-offers]'); if (!host) return;
    host.innerHTML = KF.offers.map(function (o) {
      var from = o.unit === 'by application' ? '<span data-usd="' + o.from + '">' + UI.money(o.from) + '</span>, by application' : 'From <span data-usd="' + o.from + '">' + UI.money(o.from) + '</span>' + (o.unit ? ' ' + o.unit : '');
      return '<div class="offer" data-offer="' + o.id + '" data-reveal><a class="offer__name link" href="' + o.href + '">' + o.name + '</a><span class="offer__from">' + from + '</span><p class="offer__line">' + o.line + '</p>' +
        '<ul class="offer__items">' + o.items.map(function (it) { return '<li>' + it + '</li>'; }).join('') + '</ul></div>';
    }).join('') +
      '<aside class="offers__spot" aria-live="polite"><div class="spot__frame" data-tilt="5">' +
      KF.offers.map(function (o, i) { return '<img src="' + UI.img(o.img) + '" alt="' + o.name + ': ' + o.line.replace(/"/g, '') + '" data-spot="' + o.id + '"' + (i === 0 ? ' class="is-on"' : '') + ' loading="lazy">'; }).join('') +
      '<div class="spot__chip glass"><div class="spot__word" data-spot-word>' + KF.offers[0].word + '</div><p class="spot__line" data-spot-line>' + KF.offers[0].line + '</p></div></div></aside>';
    var cols = $$('.offer', host), imgs = $$('[data-spot]', host), word = $('[data-spot-word]'), line = $('[data-spot-line]');
    var cur = 0, hoverT, auto, inView = false, held = false;
    function show(i) {
      if (i === cur && imgs[i].classList.contains('is-on')) return;
      cur = i; var o = KF.offers[i];
      imgs.forEach(function (im, k) { im.classList.toggle('is-on', k === i); });
      cols.forEach(function (c, k) { c.classList.toggle('is-on', k === i); });
      if (G && !UI.reduced) {
        G.fromTo([word, line], { y: 10, opacity: 0 }, { y: 0, opacity: 1, duration: 0.6, stagger: 0.06, ease: 'expo.out' });
      }
      word.textContent = o.word; line.textContent = o.line;
    }
    cols[0].classList.add('is-on');
    cols.forEach(function (c, i) {
      c.addEventListener('pointerenter', function () { held = true; clearTimeout(hoverT); hoverT = setTimeout(function () { show(i); }, 120); });
      c.addEventListener('pointerleave', function () { held = false; clearTimeout(hoverT); });
      c.addEventListener('focusin', function () { show(i); });
      $$('li', c).forEach(function (li) { li.addEventListener('pointerenter', function () { li.classList.add('is-on'); }); li.addEventListener('pointerleave', function () { li.classList.remove('is-on'); }); });
    });
    if ('IntersectionObserver' in window && !UI.reduced) {
      new IntersectionObserver(function (e) { inView = e[0].isIntersecting; }, { threshold: 0.3 }).observe(host);
      auto = setInterval(function () { if (inView && !held) show((cur + 1) % KF.offers.length); }, 3400);
    }
  })();

  // videos
  (function vids() {
    var el = $('[data-vids]'); if (!el) return;
    el.innerHTML = KF.videos.slice(0, 4).map(function (v) {
      return '<li data-reveal><a href="#/videos" target="_blank" rel="noopener"><span class="vt">' + v.title + '</span><span class="vm">' + v.when + '</span><span class="vl">' + v.len + '</span></a></li>';
    }).join('');
  })();

  // tour poster
  (function poster() {
    var el = $('[data-poster]'); if (!el) return;
    el.innerHTML = KF.tour.map(function (t) {
      return '<li data-reveal><a href="bootcamps.html#' + t.id + '"><span class="city">' + t.city + '</span><span class="meta">' + t.dates + ' ' + t.year + '<small>' + t.venue + ' &middot; ' + t.left + ' of ' + t.seats + ' seats left</small></span></a></li>';
    }).join('');
  })();

  // on the road
  (function road() {
    var frames = ['portrait-20', 'portrait-6', 'portrait-13', 'portrait-15', 'portrait-21', 'event-1', 'portrait-18', 'portrait-17', 'portrait-16', 'portrait-19', 'portrait-3'];
    var alts = { 'portrait-20': 'Your photo', 'portrait-13': 'Your photo', 'portrait-21': 'Your photo', 'portrait-16': 'Your photo', 'portrait-1': 'Your photo', 'portrait-8': 'Your photo', 'portrait-6': 'Your photo', 'event-2': 'Sample event photo', 'portrait-15': 'Your photo', 'portrait-3': 'Your photo', 'portrait-11': 'Your photo', 'portrait-17': 'Your photo', 'portrait-10': 'Your photo', 'portrait-7': 'Your photo', 'portrait-22': 'Your photo', 'event-1': 'Bootcamp photo', 'portrait-2': 'Your photo', 'portrait-18': 'Your photo', 'portrait-9': 'Your photo', 'portrait-12': 'Your photo', 'portrait-19': 'Your photo', 'portrait-4': 'Your photo' };
    var el = $('[data-road]'); if (!el) return;
    el.innerHTML = frames.map(function (f) { return '<figure><img src="' + UI.img(f, 'thumb') + '" alt="' + (alts[f] || 'Your photo') + '" loading="lazy" draggable="false"></figure>'; }).join('');
    $('[data-road-count]').textContent = frames.length + ' sample frames';
    // drag to scroll
    var down = false, sx = 0, sl = 0, moved = 0;
    el.addEventListener('pointerdown', function (e) { if (e.pointerType !== 'mouse') return; down = true; moved = 0; sx = e.clientX; sl = el.scrollLeft; el.classList.add('is-drag'); el.setPointerCapture(e.pointerId); });
    el.addEventListener('pointermove', function (e) { if (!down) return; var dx = e.clientX - sx; moved = Math.max(moved, Math.abs(dx)); el.scrollLeft = sl - dx; });
    function up() { down = false; el.classList.remove('is-drag'); }
    el.addEventListener('pointerup', up); el.addEventListener('pointercancel', up);
    el.addEventListener('wheel', function (e) { if (Math.abs(e.deltaY) > Math.abs(e.deltaX) && e.shiftKey) { el.scrollLeft += e.deltaY; e.preventDefault(); } }, { passive: false });
  })();

  // voices
  (function voices() {
    var el = $('[data-voices]'); if (!el) return;
    var q = KF.quotes;
    el.innerHTML = '<blockquote data-reveal><p>&ldquo;' + q.members[0].text + '&rdquo;</p><footer>' + q.members[0].by + '<br>' + q.members[0].where + '</footer></blockquote>' +
      '<p class="voices__mid" data-reveal>&ldquo;' + q.system + '&rdquo;<br>Zira Adjei</p>' +
      '<blockquote data-reveal><p>&ldquo;' + q.members[1].text + '&rdquo;</p><footer>' + q.members[1].by + '<br>' + q.members[1].where + '</footer></blockquote>';
  })();

  // faq
  (function faq() {
    var el = $('[data-faq]'); if (!el) return;
    el.innerHTML = KF.faq.map(function (f, i) { return '<details class="qa"' + (i === 0 ? ' open' : '') + ' data-reveal><summary>' + f[0] + '<span class="chev" aria-hidden="true"></span></summary><div class="ans"><p>' + f[1] + '</p></div></details>'; }).join('');
  })();

  // reach: one number at a time, tap a bar to jump, swipe on phones
  (function reach() {
    var host = $('[data-reach]'); if (!host) return;
    var slides = $$('.reach__slide', host), dots = $('[data-reach-dots]'), i = 0, timer, DUR = 3200, hold = false;
    host.style.setProperty('--dur', DUR + 'ms');
    dots.innerHTML = slides.map(function (s, k) { return '<button type="button" role="tab" aria-label="Slide ' + (k + 1) + '" aria-selected="' + (k === 0) + '"></button>'; }).join('');
    var bars = $$('button', dots);
    function go(k) {
      i = (k + slides.length) % slides.length;
      slides.forEach(function (s, n) { s.classList.toggle('is-on', n === i); s.setAttribute('aria-hidden', String(n !== i)); });
      bars.forEach(function (b, n) { b.setAttribute('aria-selected', 'false'); void b.offsetWidth; if (n === i) b.setAttribute('aria-selected', 'true'); });
    }
    function play() { clearInterval(timer); if (UI.reduced) return; timer = setInterval(function () { if (!hold) go(i + 1); }, DUR); }
    bars.forEach(function (b, n) { b.addEventListener('click', function () { go(n); play(); }); });
    host.addEventListener('pointerenter', function (e) { if (e.pointerType === 'mouse') hold = true; });
    host.addEventListener('pointerleave', function () { hold = false; });
    var sx = null;
    host.addEventListener('touchstart', function (e) { sx = e.touches[0].clientX; }, { passive: true });
    host.addEventListener('touchend', function (e) { if (sx == null) return; var dx = e.changedTouches[0].clientX - sx; if (Math.abs(dx) > 40) { go(i + (dx < 0 ? 1 : -1)); play(); } sx = null; });
    go(0); play();
  })();

  // proof: one city lit at a time
  (function cities() {
    var cs = $$('[data-cities] .c'); if (!cs.length) return;
    var i = 0; cs[0].classList.add('is-lit');
    if (UI.reduced) { cs.forEach(function (c) { c.classList.add('is-lit'); }); return; }
    setInterval(function () { cs[i].classList.remove('is-lit'); i = (i + 1) % cs.length; cs[i].classList.add('is-lit'); }, 2000);
  })();

  // the new nodes need reveals, tilt and currency
  UI.reveal(document);
  UI.setCcy(UI.ccy().code);
  (function tiltNew() {
    if (window.matchMedia('(hover: none)').matches || UI.reduced) return;
    $$('.spot__frame[data-tilt]').forEach(function (el) {
      el.addEventListener('pointermove', function (e) {
        var r = el.getBoundingClientRect(), x = (e.clientX - r.left) / r.width - 0.5, y = (e.clientY - r.top) / r.height - 0.5;
        el.style.transform = 'perspective(1200px) rotateY(' + (x * 6).toFixed(2) + 'deg) rotateX(' + (-y * 6).toFixed(2) + 'deg)';
      });
      el.addEventListener('pointerleave', function () { el.style.transition = 'transform .8s cubic-bezier(.16,1,.3,1)'; el.style.transform = ''; setTimeout(function () { el.style.transition = ''; }, 800); });
    });
  })();

  /* ---------------- motion ---------------- */
  var H = window.KFHero || {};
  var k = $('.l--k'), r = $('.l--r'), a = $('.l--a'), body = $('[data-body]'), zira = $('[data-zira]');
  var wt = $('[data-wick-top]'), wb = $('[data-wick-bot]'), parts = $$('[data-hero-part]');
  var mon = $('[data-monument]');

  function introFull() {
    var doc = document.documentElement;
    var tl = G.timeline({ defaults: { ease: 'expo.out' }, onComplete: function () { doc.classList.remove('is-intro'); G.set([k, r, a, body, zira, wt, wb, parts, UI.nav], { clearProps: 'all' }); } });
    G.set([k, r, a, zira, parts, UI.nav], { opacity: 0 });
    G.set(body, { scaleX: 0.012, scaleY: 0, opacity: 1 });
    G.set(wt, { scaleY: 0, transformOrigin: '50% 100%' }); G.set(wb, { scaleY: 0, transformOrigin: '50% 0%' });
    G.set(k, { xPercent: 70, filter: 'blur(14px)' }); G.set(r, { xPercent: -70, filter: 'blur(14px)' }); G.set(a, { xPercent: -110, filter: 'blur(14px)' });
    G.set(zira, { yPercent: 9 });
    doc.classList.remove('is-intro');
    tl.to(body, { scaleY: 1, duration: 0.85, ease: 'expo.inOut' }, 0.15)
      .to([wt, wb], { scaleY: 1, duration: 0.7, ease: 'expo.inOut' }, 0.35)
      .to(body, { scaleX: 1, duration: 0.85, ease: 'expo.inOut' }, 0.95)
      .to(zira, { opacity: 1, yPercent: 0, duration: 1.1 }, 1.3)
      .to([k, r, a], { opacity: 1, xPercent: 0, filter: 'blur(0px)', duration: 1.25, stagger: 0.06 }, 1.45)
      .add(function () { if (H.rise) H.rise(0); }, 1.55)
      .to(UI.nav, { opacity: 1, duration: 0.8, ease: 'power2.out' }, 2.1)
      .fromTo(parts, { y: 18 }, { opacity: 1, y: 0, duration: 0.9, stagger: 0.08 }, 2.15);
    function skip() { tl.progress(1); if (H.still) H.still(); window.removeEventListener('keydown', skip); }
    window.addEventListener('keydown', skip, { once: true });
    $('.hero').addEventListener('click', function once() { if (tl.isActive()) skip(); }, { once: true });
  }
  function introShort() {
    document.documentElement.classList.remove('is-intro');
    G.from([k, body, r, a], { opacity: 0, y: 24, duration: 1, stagger: 0.06, ease: 'expo.out' });
    G.from(zira, { opacity: 0, yPercent: 6, duration: 1.1, ease: 'expo.out', delay: 0.1 });
    G.from(parts, { opacity: 0, y: 14, duration: 0.8, stagger: 0.06, ease: 'expo.out', delay: 0.35 });
    if (H.rise) H.rise(0.15);
  }

  function scenes() {
    if (!G || !window.ScrollTrigger || UI.reduced) return;
    // the signature: the monument settles as the first screen leaves, Zira moves a touch faster
    G.to(mon, { scale: 0.93, yPercent: -10, ease: 'none', scrollTrigger: { trigger: '.hero', start: 'top top', end: 'bottom top', scrub: true } });
    G.to(zira, { yPercent: -5, ease: 'none', scrollTrigger: { trigger: '.hero', start: 'top top', end: 'bottom top', scrub: true } });
    G.to('.hero__inner', { opacity: 0.25, ease: 'none', scrollTrigger: { trigger: '.hero', start: '55% top', end: 'bottom top', scrub: true } });
    // the lounge opens to the whole screen
    var pic = $('[data-story-pic]');
    if (pic) {
      G.fromTo(pic, { clipPath: 'inset(13% 24% 13% 24%)' }, { clipPath: 'inset(0% 0% 0% 0%)', ease: 'none', scrollTrigger: { trigger: '[data-story]', start: 'top 80%', end: 'top top', scrub: true } });
      G.fromTo(pic.querySelector('img'), { scale: 1.22 }, { scale: 1, ease: 'none', scrollTrigger: { trigger: '[data-story]', start: 'top 80%', end: 'bottom bottom', scrub: true } });
    }
    // the slip drifts in its own time
    G.fromTo('.slip', { yPercent: 6, rotate: -1.2 }, { yPercent: -4, rotate: 0.6, ease: 'none', scrollTrigger: { trigger: '.slip-sec', start: 'top bottom', end: 'bottom top', scrub: true } });
    G.fromTo('.slip-sec__bg img', { scale: 1.15, xPercent: -3 }, { scale: 1, xPercent: 3, ease: 'none', scrollTrigger: { trigger: '.slip-sec', start: 'top bottom', end: 'bottom top', scrub: true } });
    // the forecast chart slides under its frame
    G.fromTo('.forecast__chart img', { yPercent: -4, scale: 1.08 }, { yPercent: 4, scale: 1.08, ease: 'none', scrollTrigger: { trigger: '.forecast', start: 'top bottom', end: 'bottom top', scrub: true } });
    // the road strip drifts sideways as the page scrolls
    G.fromTo('[data-road]', { x: '6vw' }, { x: '-6vw', ease: 'none', scrollTrigger: { trigger: '.road', start: 'top bottom', end: 'bottom top', scrub: true } });
    // the foundation picture
    G.fromTo('.found__pic img', { scale: 1.12 }, { scale: 1, ease: 'none', scrollTrigger: { trigger: '.found', start: 'top bottom', end: 'center center', scrub: true } });
    // CTA word rises
    G.fromTo('.cta__word', { yPercent: 30 }, { yPercent: 0, ease: 'none', scrollTrigger: { trigger: '.cta', start: 'top bottom', end: 'bottom bottom', scrub: true } });
  }

  function footerName() {
    if (!G || !window.ScrollTrigger || UI.reduced) return;
    var n = $('.foot__name span'); if (!n) return;
    G.fromTo(n, { scale: 0.94, yPercent: 12 }, { scale: 1, yPercent: 0, ease: 'none', scrollTrigger: { trigger: '.foot', start: 'top bottom', end: 'bottom bottom', scrub: true } });
  }

  function start() {
    var first = false;
    try { first = !sessionStorage.getItem('zf.intro'); sessionStorage.setItem('zf.intro', '1'); } catch (e) {}
    if (UI.reduced || !G) { document.documentElement.classList.remove('is-intro'); if (H.still) H.still(); return; }
    if (first && !sessionStorage.getItem('zf.curtain-skip')) introFull(); else introShort();
    scenes(); footerName();
    if (window.ScrollTrigger) setTimeout(function () { ScrollTrigger.refresh(); }, 400);
  }
  var started = false;
  function boot() { if (started) return; started = true; start(); }
  if (zira && !zira.complete) {
    zira.addEventListener('load', boot, { once: true });
    zira.addEventListener('error', boot, { once: true });
    setTimeout(boot, 2500);
  } else boot();
})();
