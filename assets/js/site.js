/* Zira Forex: the shell shared by every page.
   Nav, drawer, footer, page curtain, smooth scroll, reveals, glass light,
   magnetic buttons, currency, the trading-session clock and toasts. */
(function () {
  'use strict';
  var KF = window.KF;
  var doc = document.documentElement;
  var qs = new URLSearchParams(location.search);
  var POSE = qs.has('pose');
  var REDUCED = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  doc.classList.add('js');
  if (POSE) doc.classList.add('pose');

  var UI = window.KFUI = { pose: POSE, reduced: REDUCED || POSE };
  var page = document.body.getAttribute('data-page') || 'home';
  var inAdmin = /\/admin\//.test(location.pathname.replace(/\\/g, '/'));
  var root = inAdmin ? '../' : '';
  UI.root = root;

  /* ---------------- helpers ---------------- */
  UI.$ = function (s, el) { return (el || document).querySelector(s); };
  UI.$$ = function (s, el) { return Array.prototype.slice.call((el || document).querySelectorAll(s)); };
  UI.img = function (name, size) { return root + 'assets/img/' + (size || 'full') + '/' + name + '.jpg'; };
  UI.esc = function (s) { return String(s).replace(/[&<>"']/g, function (c) { return ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' })[c]; }); };
  var store = {
    get: function (k, d) { try { var v = localStorage.getItem(k); return v === null ? d : JSON.parse(v); } catch (e) { return d; } },
    set: function (k, v) { try { localStorage.setItem(k, JSON.stringify(v)); } catch (e) {} }
  };
  UI.store = store;

  /* ---------------- currency ---------------- */
  UI.ccy = function () { var c = store.get('zf.ccy', 'USD'); return KF.currencies.filter(function (x) { return x.code === c; })[0] || KF.currencies[0]; };
  UI.money = function (usd, opts) {
    var c = (opts && opts.code) ? KF.currencies.filter(function (x) { return x.code === opts.code; })[0] : UI.ccy();
    var v = usd * c.rate;
    var round = v >= 10000 ? 100 : (v >= 1000 ? 10 : 1);
    if (c.code === 'USD' || c.code === 'GBP' || c.code === 'EUR') round = 1;
    v = Math.round(v / round) * round;
    return c.sym + v.toLocaleString('en-US', { maximumFractionDigits: 0 });
  };
  UI.setCcy = function (code) {
    store.set('zf.ccy', code);
    UI.$$('[data-usd]').forEach(function (el) {
      el.textContent = UI.money(parseFloat(el.getAttribute('data-usd')));
      el.classList.remove('flash'); void el.offsetWidth; el.classList.add('flash');
    });
    UI.$$('.ccy button').forEach(function (b) { b.setAttribute('aria-pressed', String(b.getAttribute('data-ccy') === code)); });
    UI.$$('[data-ccy-note]').forEach(function (el) {
      el.textContent = code === 'USD' ? 'Billed in US dollars.' : 'Shown in ' + code + ' at ' + KF.ratesDate + ' rates. Billed in US dollars.';
    });
  };
  UI.mountCcy = function (el) {
    if (!el) return;
    el.innerHTML = KF.currencies.map(function (c) { return '<button type="button" data-ccy="' + c.code + '" aria-pressed="false">' + c.code + '</button>'; }).join('');
    el.addEventListener('click', function (e) { var b = e.target.closest('button[data-ccy]'); if (b) UI.setCcy(b.getAttribute('data-ccy')); });
  };

  /* ---------------- trading sessions (real local hours, DST-safe) ---------------- */
  var SESS = [
    { id: 'sydney', city: 'Sydney', tz: 'Australia/Sydney', open: 7, close: 16 },
    { id: 'tokyo', city: 'Tokyo', tz: 'Asia/Tokyo', open: 9, close: 18 },
    { id: 'london', city: 'London', tz: 'Europe/London', open: 8, close: 17 },
    { id: 'newyork', city: 'New York', tz: 'America/New_York', open: 8, close: 17 }
  ];
  function partsIn(tz, d) {
    var f = new Intl.DateTimeFormat('en-GB', { timeZone: tz, weekday: 'short', hour: 'numeric', minute: 'numeric', hourCycle: 'h23' });
    var o = {}; f.formatToParts(d).forEach(function (p) { o[p.type] = p.value; });
    return { wd: o.weekday, h: parseInt(o.hour, 10), m: parseInt(o.minute, 10) };
  }
  function marketClosed(d) {
    var ny = partsIn('America/New_York', d);
    var mins = ny.h * 60 + ny.m;
    if (ny.wd === 'Sat') return true;
    if (ny.wd === 'Fri' && mins >= 17 * 60) return true;
    if (ny.wd === 'Sun' && mins < 17 * 60) return true;
    return false;
  }
  function isOpen(s, t) {
    if (marketClosed(t)) return false;
    var p = partsIn(s.tz, t), mins = p.h * 60 + p.m;
    if (p.wd === 'Sat' || p.wd === 'Sun') return false;
    return mins >= s.open * 60 && mins < s.close * 60;
  }
  UI.sessions = function (now) {
    now = now || new Date();
    return SESS.map(function (s) {
      var p = partsIn(s.tz, now), open = isOpen(s, now), toOpen = null;
      if (!open) {
        // walk forward in 15-minute steps to the next moment the session is trading
        var base = Math.ceil(now.getTime() / 900000) * 900000;
        for (var k = 0; k < 4 * 24 * 5; k++) { var t = new Date(base + k * 900000); if (isOpen(s, t)) { toOpen = Math.round((t - now) / 60000); break; } }
      }
      function hh(x) { return (x < 10 ? '0' : '') + x + ':00'; }
      return { id: s.id, city: s.city, tz: s.tz, open: open, toOpen: toOpen, local: (p.h < 10 ? '0' : '') + p.h + ':' + (p.m < 10 ? '0' : '') + p.m, hours: hh(s.open) + '–' + hh(s.close) };
    });
  };
  UI.dur = function (mins) { if (mins == null) return ''; var d = Math.floor(mins / 1440), h = Math.floor(mins % 1440 / 60), m = mins % 60; if (d) return d + 'd ' + h + 'h'; return (h ? h + 'h ' : '') + m + 'm'; };
  UI.nextOpen = function () {
    var list = UI.sessions().filter(function (s) { return !s.open && s.toOpen != null; }).sort(function (a, b) { return a.toOpen - b.toOpen; });
    var openNow = UI.sessions().filter(function (s) { return s.open; });
    return { open: openNow, next: list[0] || null };
  };
  UI.sessionLine = function () {
    var n = UI.nextOpen();
    if (n.open.length) {
      var names = n.open.map(function (s) { return s.city; }).join(' and ');
      return { live: true, text: names + ' session open', sub: n.next ? n.next.city + ' opens in ' + UI.dur(n.next.toOpen) : '' };
    }
    return { live: false, text: n.next ? n.next.city + ' opens in ' + UI.dur(n.next.toOpen) : 'Market closed', sub: 'Markets reopen Sunday evening, New York time' };
  };

  /* ---------------- icons ---------------- */
  var MARK = '<svg class="brand__mark" viewBox="0 0 26 34" aria-hidden="true"><path d="M13 0v7M13 27v7" stroke="currentColor" stroke-width="1.5"/><rect x="7.5" y="7" width="11" height="20" rx="1.4" fill="currentColor"/><path d="M10.3 11.6h5.4M15.7 11.6l-5.4 10.8M10.3 22.4h5.4" stroke="var(--bg-mark,#062a20)" stroke-width="1.3" fill="none"/></svg>';
  UI.mark = MARK;
  var ARROW = '<svg viewBox="0 0 48 48" fill="none" aria-hidden="true"><path d="M12 36L36 12M16 12h20v20" stroke="currentColor" stroke-width="2"/></svg>';
  UI.arrow = ARROW;

  /* ---------------- nav + drawer ---------------- */
  var LINKS = [
    ['trading-room.html', 'Trading Room', 'room'],
    ['academy.html', 'Academy', 'academy'],
    ['mentorship.html', 'Mentorship', 'mentorship'],
    ['bootcamps.html', 'Bootcamps', 'bootcamps'],
    ['about.html', 'About', 'about']
  ];
  function buildNav() {
    if (document.querySelector('.nav') || document.body.hasAttribute('data-no-shell')) return;
    var nav = document.createElement('header');
    nav.className = 'nav'; nav.setAttribute('data-tone-nav', 'dark');
    nav.innerHTML = '<a class="brand" href="' + root + 'index.html" aria-label="Zira Forex, home">' + MARK + '<span><span class="brand__word">ZIRA</span></span></a>' +
      '<nav class="nav__links" aria-label="Main">' + LINKS.map(function (l) { return '<a class="link" href="' + root + l[0] + '"' + (page === l[2] ? ' aria-current="page"' : '') + '>' + l[1] + '</a>'; }).join('') + '</nav>' +
      '<a class="btn nav__cta" data-magnetic href="' + root + 'trading-room.html#join">Join the Trading Room</a>' +
      '<button class="nav__menu" type="button" aria-expanded="false" aria-controls="drawer">Menu<span class="bars"></span></button>';
    document.body.insertBefore(nav, document.body.firstChild);
    var skip = document.createElement('a'); skip.className = 'skip'; skip.href = '#main'; skip.textContent = 'Skip to content';
    document.body.insertBefore(skip, document.body.firstChild);

    var dr = document.createElement('div');
    dr.className = 'drawer'; dr.id = 'drawer'; dr.setAttribute('role', 'dialog'); dr.setAttribute('aria-modal', 'true'); dr.setAttribute('aria-label', 'Menu');
    dr.innerHTML = '<button class="drawer__close" type="button">Close</button>' +
      '<a class="big" href="' + root + 'index.html">Home</a>' + LINKS.map(function (l) { return '<a class="big" href="' + root + l[0] + '">' + l[1] + '</a>'; }).join('') +
      '<div class="drawer__foot"><a class="btn btn--full" style="--b-bg:var(--rose);--b-fg:var(--deep)" href="' + root + 'trading-room.html#join">Join the Trading Room</a>' +
      '<button type="button" class="link" data-open-desk style="justify-self:start">Ask the desk</button><a class="link" href="' + root + 'portal.html">Student sign-in</a><span class="t-small t-soft">' + KF.brand.social.map(function (s) { return '<a class="link" href="' + s.url + '" target="_blank" rel="noopener">' + s.label + '</a>'; }).join(' &nbsp; ') + '</span></div>';
    document.body.appendChild(dr);
    var btn = nav.querySelector('.nav__menu');
    var hideT;
    function setOpen(o) {
      clearTimeout(hideT); btn.setAttribute('aria-expanded', String(o));
      if (o) { dr.classList.add('is-show'); requestAnimationFrame(function () { dr.classList.add('is-open'); dr.querySelector('a').focus(); }); }
      else { dr.classList.remove('is-open'); hideT = setTimeout(function () { dr.classList.remove('is-show'); }, 450); btn.focus(); }
    }
    btn.addEventListener('click', function () { setOpen(true); });
    dr.addEventListener('click', function (e) { if (e.target.closest('[data-open-desk]') && window.KFDesk) { setOpen(false); setTimeout(function () { window.KFDesk.open(true); }, 300); } });
    dr.querySelector('.drawer__close').addEventListener('click', function () { setOpen(false); });
    document.addEventListener('keydown', function (e) { if (e.key === 'Escape' && dr.classList.contains('is-open')) setOpen(false); });
    UI.nav = nav;
  }

  /* nav contrast follows the section under it */
  function navTone() {
    if (!UI.nav) return;
    var secs = UI.$$('[data-tone]').filter(function (el) { return !el.closest('.nav') && el.offsetParent !== null; });
    var y = 36;
    function tick() {
      var hit = null;
      for (var i = 0; i < secs.length; i++) { var r = secs[i].getBoundingClientRect(); if (r.top <= y && r.bottom > y) hit = secs[i]; }
      var t = hit ? hit.getAttribute('data-tone') : 'malachite';
      var v = (t === 'malachite' || t === 'deep') ? 'dark' : (t === 'rose' || t === 'blush') ? 'rose' : 'light';
      if (UI.nav.getAttribute('data-tone-nav') !== v) UI.nav.setAttribute('data-tone-nav', v);
    }
    UI.onScroll(tick); tick();
  }

  /* ---------------- footer ---------------- */
  function buildFooter() {
    var slot = document.querySelector('[data-footer]');
    if (!slot) return;
    var s = KF.brand.social;
    slot.outerHTML = '<footer class="foot" data-tone="pearl"><div class="wrap">' +
      '<div class="foot__top"><div class="foot__inv"><h2 data-split>Trade with me.</h2><p>See you in the community.</p>' +
      '<a class="btn" data-magnetic href="' + root + 'trading-room.html#join">Join the Trading Room</a></div>' +
      '<div class="foot__links">' + s.map(function (x) { return '<a class="link" href="' + x.url + '" target="_blank" rel="noopener">' + x.label + ' <span class="t-soft">' + x.count + '</span></a>'; }).join('') +
      '<a class="link" href="' + KF.brand.whatsapp + '" target="_blank" rel="noopener">WhatsApp the desk</a></div></div>' +
      '<p class="foot__risk"><strong>Risk warning.</strong> ' + KF.risk + '</p>' +
      '<div class="foot__legal"><span>&copy; 2026 ' + KF.brand.academy + ', ' + KF.brand.city + '</span>' +
      '<nav aria-label="Legal"><a class="link" href="' + root + 'policies.html#risk">Risk disclosure</a><a class="link" href="' + root + 'policies.html#terms">Terms</a><a class="link" href="' + root + 'policies.html#refunds">Refunds</a><a class="link" href="' + root + 'policies.html#privacy">Privacy</a><a class="link" href="' + root + 'admin/index.html">Zira HQ</a></nav>' +
      '<span class="t-soft">Sample website by Perkins Creative</span><span class="t-soft">Zira Forex is a sample brand; names, figures and photos are placeholders.</span></div></div>' +
      '<div class="foot__name" aria-hidden="true"><span>ZIRA</span></div></footer>';
  }

  /* ---------------- curtain (page transitions) ---------------- */
  function buildCurtain() {
    var c = document.createElement('div'); c.className = 'curtain'; c.setAttribute('aria-hidden', 'true');
    c.innerHTML = '<div class="curtain__body"></div><div class="curtain__wick"></div><div class="curtain__word">ZIRA</div>';
    document.body.appendChild(c);
    UI.curtain = c;
    var arriving = sessionStorage.getItem('zf.curtain') === '1';
    try { sessionStorage.removeItem('zf.curtain'); } catch (e) {}
    var body = c.querySelector('.curtain__body'), wick = c.querySelector('.curtain__wick'), word = c.querySelector('.curtain__word');
    if (arriving && window.gsap && !UI.reduced) {
      gsap.set(body, { scaleX: 1 }); gsap.set(word, { autoAlpha: 1 }); gsap.set(wick, { scaleY: 1 });
      gsap.timeline({ delay: 0.05 })
        .to(word, { autoAlpha: 0, duration: 0.25, ease: 'power2.out' })
        .to(body, { scaleX: 0, duration: 0.75, ease: 'expo.inOut' }, 0.1)
        .to(wick, { scaleY: 0, transformOrigin: '50% 100%', duration: 0.5, ease: 'expo.in' }, 0.55);
    }
    document.addEventListener('click', function (e) {
      var a = e.target.closest('a');
      if (!a || e.defaultPrevented || e.metaKey || e.ctrlKey || e.shiftKey || e.button !== 0) return;
      var href = a.getAttribute('href');
      if (!href || href.charAt(0) === '#' || a.target === '_blank' || /^(mailto|tel|https?|javascript):/i.test(href) || a.hasAttribute('download')) return;
      var url = new URL(a.href, location.href);
      if (url.pathname === location.pathname && url.hash) return;
      if (!window.gsap || UI.reduced) return;
      e.preventDefault();
      try { sessionStorage.setItem('zf.curtain', '1'); } catch (er) {}
      gsap.timeline({ onComplete: function () { location.href = a.href; } })
        .set(wick, { scaleY: 0, transformOrigin: '50% 0%' })
        .to(wick, { scaleY: 1, duration: 0.32, ease: 'expo.out' })
        .fromTo(body, { scaleX: 0 }, { scaleX: 1, duration: 0.62, ease: 'expo.inOut' }, 0.12)
        .to(word, { autoAlpha: 1, duration: 0.25 }, 0.5);
    });
    window.addEventListener('pageshow', function (ev) { if (ev.persisted && window.gsap) { gsap.set(body, { scaleX: 0 }); gsap.set(wick, { scaleY: 0 }); gsap.set(word, { autoAlpha: 0 }); } });
  }

  /* ---------------- smooth scroll ---------------- */
  var scrollFns = [];
  UI.onScroll = function (fn) { scrollFns.push(fn); };
  function runScroll() { for (var i = 0; i < scrollFns.length; i++) scrollFns[i](); }
  function initScroll() {
    var useLenis = window.Lenis && !UI.reduced && !window.__noLenis && !inAdmin && !navigator.webdriver;
    if (useLenis) {
      var lenis = new Lenis({ duration: 1.15, easing: function (t) { return Math.min(1, 1.001 - Math.pow(2, -10 * t)); }, smoothWheel: true });
      UI.lenis = lenis;
      lenis.on('scroll', function () { if (window.ScrollTrigger) ScrollTrigger.update(); runScroll(); });
      if (window.gsap) { gsap.ticker.add(function (t) { lenis.raf(t * 1000); }); gsap.ticker.lagSmoothing(0); }
      else { (function raf(t) { lenis.raf(t); requestAnimationFrame(raf); })(); }
      UI.$$('a[href^="#"]').forEach(function (a) {
        a.addEventListener('click', function (e) { var id = a.getAttribute('href'); if (id.length > 1 && document.querySelector(id)) { e.preventDefault(); lenis.scrollTo(id, { offset: -UI.navH() }); } });
      });
    } else {
      window.addEventListener('scroll', runScroll, { passive: true });
    }
    if (window.gsap && window.ScrollTrigger) gsap.registerPlugin(ScrollTrigger);
  }
  UI.navH = function () { return UI.nav ? UI.nav.offsetHeight : 0; };

  /* ---------------- reveals and split headings ---------------- */
  function split(el) {
    if (el.__split) return; el.__split = true;
    var words = el.textContent.trim().split(/\s+/);
    el.setAttribute('aria-label', el.textContent.trim());
    el.innerHTML = words.map(function (w, i) { return '<span class="w" aria-hidden="true"><span style="--i:' + i + '">' + UI.esc(w) + '</span></span>'; }).join(' ');
  }
  UI.reveal = function (scope) {
    var els = UI.$$('[data-split]', scope);
    els.forEach(split);
    var all = UI.$$('[data-reveal], [data-split]', scope);
    if (UI.reduced || navigator.webdriver || !('IntersectionObserver' in window)) { all.forEach(function (el) { el.classList.add('is-in'); }); return; }
    var io = new IntersectionObserver(function (ents) {
      ents.forEach(function (en) { if (en.isIntersecting) { en.target.classList.add('is-in'); io.unobserve(en.target); } });
    }, { rootMargin: '0px 0px -8% 0px', threshold: 0.08 });
    all.forEach(function (el) {
      var grp = el.closest('[data-stagger]');
      if (grp && !el.style.getPropertyValue('--d')) {
        var sibs = UI.$$('[data-reveal]', grp); var k = sibs.indexOf(el);
        if (k > -1) el.style.setProperty('--d', (k * 0.075) + 's');
      }
      io.observe(el);
    });
  };

  /* ---------------- glass light + magnetic + tilt ---------------- */
  function pointerFx() {
    if (window.matchMedia('(hover: none)').matches) return;
    document.addEventListener('pointermove', function (e) {
      var g = e.target.closest && e.target.closest('.glass');
      if (g) { var r = g.getBoundingClientRect(); g.style.setProperty('--mx', (e.clientX - r.left) + 'px'); g.style.setProperty('--my', (e.clientY - r.top) + 'px'); }
    }, { passive: true });
    if (UI.reduced) return;
    UI.$$('[data-magnetic]').forEach(function (el) {
      el.addEventListener('pointermove', function (e) {
        var r = el.getBoundingClientRect();
        var x = (e.clientX - r.left - r.width / 2) / r.width, y = (e.clientY - r.top - r.height / 2) / r.height;
        el.style.transform = 'translate(' + (x * 8).toFixed(2) + 'px,' + (y * 6).toFixed(2) + 'px)';
      });
      el.addEventListener('pointerleave', function () { el.style.transform = ''; });
    });
    UI.$$('[data-tilt]').forEach(function (el) {
      var max = parseFloat(el.getAttribute('data-tilt')) || 6;
      el.addEventListener('pointermove', function (e) {
        var r = el.getBoundingClientRect();
        var x = (e.clientX - r.left) / r.width - 0.5, y = (e.clientY - r.top) / r.height - 0.5;
        el.style.transform = 'rotateY(' + (x * max).toFixed(2) + 'deg) rotateX(' + (-y * max).toFixed(2) + 'deg)';
      });
      el.addEventListener('pointerleave', function () { el.style.transition = 'transform .8s cubic-bezier(.16,1,.3,1)'; el.style.transform = ''; setTimeout(function () { el.style.transition = ''; }, 800); });
    });
  }

  /* ---------------- toast ---------------- */
  var toastEl, toastT;
  UI.toast = function (msg) {
    if (!toastEl) { toastEl = document.createElement('div'); toastEl.className = 'toast'; toastEl.setAttribute('role', 'status'); document.body.appendChild(toastEl); }
    toastEl.textContent = msg; toastEl.classList.add('is-on');
    clearTimeout(toastT); toastT = setTimeout(function () { toastEl.classList.remove('is-on'); }, 2600);
  };

  /* ---------------- boot ---------------- */
  buildNav();
  buildFooter();
  buildCurtain();
  initScroll();
  navTone();
  UI.$$('.ccy').forEach(UI.mountCcy);
  document.addEventListener('DOMContentLoaded', function () {});
  UI.reveal(document);
  pointerFx();
  UI.setCcy(UI.ccy().code);
  window.addEventListener('load', function () { if (window.ScrollTrigger) ScrollTrigger.refresh(); });
})();
