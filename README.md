# Zira Forex: general trader sample

A fictional demo brand and sample website plus management system by Perkins Creative (Francis Annor, Accra), intended for pitching websites, management systems and Telegram bots to forex traders and educators. Zira Adjei, known as Zira Forex, and Ziraforex Trading Academy are fictional placeholders.

Built with plain HTML, CSS and JavaScript; no build step. Open `index.html` or run `OPEN-WEBSITE.bat`. Add a prospect?s single optional hero cutout at the image hook in `index.html`; the rose candle stands alone when none is set. People and event images are real Unsplash photographs illustrating fictional roles; see CREDITS.md.

## Pages and features

The site retains its approved structure and functionality: home, Trading Room, Academy, mentorship, bootcamp tour, about, checkout, student portal, admin dashboard, policies, the desk concierge, 3D gold scene, globe, calculators and responsive layouts.

## Sample content

The Zira brand, fictional bio, foundation, social handles, round audience figures, quotes, member notes, video titles, stages, recognition, prices, plans, courses, schedules, tour dates, venues, and generated portal/admin records are sample content. Social destinations use `#`; the public handle placeholder is `@ziraforex`. Replace these with a client?s approved details before launch. Market data and risk warnings remain as supplied in the approved sample.

## Editing

Business content lives in `assets/js/data.js`; shared page behavior is in `assets/js/site.js`, page content generation in `assets/js/home.js` and `assets/js/inner.js`, and the rule-based desk answers in `assets/js/desk.js`. Real photographs are in `assets/img/full` and `assets/img/thumb`; chart images remain unchanged. Browser storage keys use the `zf.` prefix.

## Credits

See [CREDITS.md](CREDITS.md) for retained third-party and market-data credits.

## Ecosystem additions (Brief 5)

`results.html`, `app.html` and `verify.html` share the website shell. The student Trading Desk and new HQ tools share `zf.db.v2`, which migrates existing `own` data from v1. Certificate sample codes: `ZF-CERT-1001`, `ZF-CERT-1002`, `ZF-CERT-1003`. App sends, reports and payment processing are local demo flows. Run `node tests/brief5.test.cjs` for functional regression checks.

## Operational ecosystem (2026-10-27)
Start at `demo.html`, or open `admin/index.html#operations`. The five new HQ sections are Infrastructure, Account risk, EA maintenance, Copy diagnostics and Connected coaching. Coaching feedback for Ama appears in `portal.html#coach-feedback`.

All new workflows are simulations. Changes persist in this browser under `zf.operations.v1`. The suite overview contains a reset that clears only these new modules. Existing academy/order/journal data remains in `zf.db.v2`.

Use `OPEN-DEMO.bat` for a consistent local HTTP origin (requires Python), then visit http://127.0.0.1:8767/demo.html. Static hosting remains compatible with GitHub Pages. The existing GitHub Pages site publishes from main at the repository root; updates retain the same website and admin URLs.

See `DEMO-HANDOFF.md` for architecture and verification, and `DEMO-WALKTHROUGH.md` for a prospect presentation. Tests: `node tests/brief5.test.cjs` and `node tests/operations.test.cjs`.

