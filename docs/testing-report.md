# Dala Safe — Testing Report

| Field | Value |
|---|---|
| Document | Commands actually executed, their real results, and what was **not** verified |
| Session | P6-S1 (documentation) + integration run (final gate). Unit tests: P5-S1 + `SafetyPlanPage.test.tsx` added at the gate; E2E: P5-S2; offline: `scripts/verify-offline.mjs`; accessibility: `scripts/verify-a11y.mjs` |
| Date of this run | 2026-10-21 |
| Honesty rule | Every number below was produced by a command executed in this session. Nothing else is reported as a result. |

---

## 1. Environment observed

| Item | Value |
|---|---|
| Node.js | `v22.22.1` |
| npm | `9.2.0` |
| TypeScript | `5.9.3` (`tsc -b`) |
| ESLint | `9.39.5` |
| Vitest | `3.2.7` |
| Vite | `7.3.7` |
| Playwright | `1.64.1` (Chromium 1248 installed; **executed** — §3) |
| OS | Linux |

---

## 2. Commands run and results

### 2.1 `npm run typecheck`

```
> dala-safe@0.1.0 typecheck
> tsc -b --pretty false
```

**Result: PASS — exit code 0, no diagnostics printed.**

### 2.2 `npm run lint`

```
> dala-safe@0.1.0 lint
> eslint .
```

**Result: PASS — exit code 0, no warnings or errors printed.**

### 2.3 `npx vitest run`

```
 Test Files  30 passed (30)
      Tests  238 passed (238)
   Start at  11:12:07
   Duration  6.13s (transform 2.79s, setup 6.70s, collect 12.24s,
                    tests 22.50s, environment 27.00s, prepare 5.26s)
```

**Result: PASS — 30 files, 238 tests, 0 failed, 0 skipped.** Run repeatedly
during the gate (234 tests before `SafetyPlanPage.test.tsx` was added, 238
after); every run passed.

Per-file inventory (from the recorded output):

| File | Tests |
|---|---|
| `src/features/calendar/ics.test.ts` | 14 |
| `src/features/data-management/DataManagementPage.test.tsx` | 8 |
| `src/features/data-management/tripData.test.ts` | 11 |
| `src/features/demo/demos.test.tsx` | 23 |
| `src/features/demo/featureStatus.test.tsx` | 10 |
| `src/features/demo/pages.test.tsx` | 11 |
| `src/features/demo/registry.test.ts` | 3 |
| `src/features/emergency/data.test.ts` | 17 |
| `src/features/emergency/EmergencyPage.test.tsx` | 9 |
| `src/features/emergency/useGeolocation.test.tsx` | 15 |
| `src/features/gpx/exportGpx.test.ts` | 3 |
| `src/features/gpx/parseGpx.test.ts` | 11 |
| `src/features/gpx/RouteMap.test.tsx` | 2 |
| `src/features/safety-rules/catalog.test.ts` | 5 |
| `src/features/safety-rules/engine.test.ts` | 21 |
| `src/features/safety-rules/GuidancePage.test.tsx` | 5 |
| `src/features/safety-rules/i18n.test.ts` | 3 |
| `src/features/sharing/contactPlan.test.ts` | 4 |
| `src/features/sharing/messageGenerator.test.ts` | 5 |
| `src/features/sharing/shareActions.test.ts` | 8 |
| `src/features/sharing/SharePage.test.tsx` | 9 |
| `src/features/tour/TourPage.test.tsx` | 9 |
| `src/features/trips/checklistHelpers.test.ts` | 5 |
| `src/features/trips/ChecklistPage.test.tsx` | 3 |
| `src/features/trips/SafetyPlanPage.test.tsx` | 4 |
| `src/features/trips/TripDetailPage.test.tsx` | 4 |
| `src/features/trips/TripFormPage.test.tsx` | 4 |
| `src/features/trips/tripGroups.test.ts` | 5 |
| `src/features/trips/TripsPersistence.test.tsx` | 1 |
| `src/features/trips/tripValidation.test.ts` | 6 |
| **Total** | **238** |

Environment: jsdom, `src/test/setup.ts`, mocks restored between tests
(`vite.config.ts`). `e2e/**` is excluded from Vitest.

### 2.4 `npm run check:i18n`

```
i18n check passed: 3 languages × 10 namespaces.
```

**Result: PASS — exit code 0.** Compares `kk` and `ru` against `en` for
missing keys, extra keys and empty values across 10 namespaces
(`common, trips, checklist, safety, sharing, emergency, gpx, data, demo, tour`).

### 2.5 `npm run build`

```
vite v7.3.7 building client environment for production...
✓ 147 modules transformed.
dist/index.html                        0.98 kB │ gzip:   0.49 kB
dist/assets/index-C8njTpdT.css        16.56 kB │ gzip:   3.99 kB
dist/assets/chunk-router-XLmkvrbD.js  37.61 kB │ gzip:  13.58 kB
dist/assets/chunk-react-CrowJ5J7.js  221.70 kB │ gzip:  68.89 kB
dist/assets/index-B8_vqIUe.js        457.17 kB │ gzip: 116.49 kB
✓ built in 1.13s
```

**Result: PASS — exit code 0** (`tsc -b && vite build`), **no size warning**.

The original single 716.26 kB chunk (gzip 198.48 kB) was split at the gate via
`rollupOptions.output.manualChunks` in `vite.config.ts` into the app chunk
(457.17 kB / 116.49 kB gzipped) plus `chunk-react` and `chunk-router`.
Honest scope note: **total bytes transferred on first load are unchanged** —
this removes the advisory warning and lets the framework chunks be cached
independently; there is still **no route-level lazy loading**. Hashes change on
every rebuild.

### 2.6 Commands NOT executed in this session

| Command | Status |
|---|---|
| `npm run dev` | Not run (no dev-server or browser check performed) |
| `npm run preview` | Run directly on port 4173 to host the offline verification (§4) |
| `npm test` | Not run as such — it is the alias of `npx vitest run`, which was run (§2.3) |
| `npm run test:e2e` (`npx playwright test`) | **Run — see §3** |
| `npm run verify:offline` (`node scripts/verify-offline.mjs`) | **Run — see §4** |
| `npm run verify:a11y` (`node scripts/verify-a11y.mjs`) | **Run — see §5** |

---

## 3. End-to-end tests — executed

`playwright.config.ts` (Chromium, `testDir: ./e2e`, web server =
`npm run build && npm run preview -- --port 4173`, `serviceWorkers: 'block'`).

```
$ npx playwright test
  ✓ e2e/journey.spec.ts   10-step journey: open → language → trip → checklist →
                           plan → share → reminder → emergency → export → delete (1.4s)
  ✓ e2e/offline.spec.ts   ×3   offline banner / SPA navigation / back online
  ✓ e2e/errors.spec.ts    ×8   denied+unsupported geolocation, no navigator.share,
                               empty storage, malformed import, 320×568 no overflow,
                               kk→ru→en switch, reload persistence
  12 passed (9.5s)
```

**Result: PASS — 12/12, 0 failed.** Confirmed on two consecutive runs (9.5s and
9.2s). Zero uncaught `pageerror` events are asserted by the specs.

Specs assert accessible roles/labels only (no test ids), never navigate a `tel:`
link, and never claim a message was delivered.

---

## 4. Offline verification with the service worker — executed

`playwright.config.ts` sets `serviceWorkers: 'block'`, so the suite in §3
deliberately cannot verify SW caching; it only covers the SPA's offline UI logic
(banner, no white screen, `tel:` links reachable). True app-shell offline
behaviour was therefore verified separately, against `vite preview` with service
workers **allowed**, using `scripts/verify-offline.mjs`:

```
$ npm run build && npm run preview -- --port 4173
$ node scripts/verify-offline.mjs
PASS  online: app shell loaded
PASS  online: no offline banner
PASS  service worker active and controlling — http://127.0.0.1:4173/sw.js
PASS  cache exists — dala-safe-v1.0.0
PASS  index.html precached
PASS  app assets cached — 2 asset URL(s)
PASS  offline full reload: app shell rendered
PASS  offline full reload: offline banner shown
PASS  offline: emergency route reachable
PASS  offline: emergency numbers rendered
PASS  offline: tel: links present and real — tel:112, tel:101, …
PASS  offline: emergency page offline note
PASS  recovery: offline banner cleared
PASS  recovery: navigation works

14/14 checks passed
```

**Result: PASS — 14/14.** The decisive check is a genuine disconnect:
`context.setOffline(true)` followed by a full `page.reload()`, which only
succeeds if `public/sw.js` serves the cached app shell and assets (network-first
navigation with `/index.html` fallback; cache-first `/assets/*`).

What this does **not** cover: a device-level airplane-mode test on real
hardware, installability on a real phone, and behaviour with an empty cache on a
cold offline first visit (which is not expected to work — first load needs the
network by design).

---

## 5. Accessibility audit — executed

`npm run verify:a11y` (`scripts/verify-a11y.mjs`) runs a real Chromium against
`vite preview` over **10 routes × 3 languages (30 page loads)** and inspects the
rendered DOM and computed styles: landmarks and their accessible names, one-h1
and no-skipped-heading order, accessible names on controls, label associations,
positive `tabindex`, focusable elements inside `aria-hidden`, WCAG AA colour
contrast of every rendered text node (4.5:1 normal / 3:1 large), the
`prefers-reduced-motion` rule, the language switcher's `aria-pressed` state, and
12 consecutive Tab stops (non-zero size for each focused element).

```
$ npm run verify:a11y
{
  "total": 0,
  "byCheck": {},
  "findings": []
}
```

**Result: PASS — 0 findings.** This was not the first run: the audit was written
at the gate and its first run reported **64 findings**, which were triaged into
four real defects (now fixed) and two script bugs (fixed in the script):

| First-run finding | Verdict |
|---|---|
| 30 × no `contentinfo` landmark | **Real** → `<footer class="app-footer">` added to `AppShell` with translated tagline + `/status` link (kk/ru/en) |
| 18 × `.badge--accent` text 4.23:1 on 4.5:1 | **Real** → `--color-accent-ink: #964a28` (5.21:1) applied to `.badge--accent` |
| 6 × no `h1` on the 404 route (`/guidance` in the audit was a non-existent path that falls through to it) | **Real** → `NotFoundPage` now renders `PageHeader` (`h1`) instead of `EmptyState` |
| 12 × "input with no accessible name" | **Script bug** — the check ignored `<label for>` associations; the inputs were labelled |
| 7 × "only 0 elements reachable by Tab" | **Script bug** — the audit inspected focus before pressing Tab |

Honest limits: this is a **custom script**, not axe-core and not a test with a
screen reader; it verifies machine-observable properties, not what a blind user
experiences. Colour contrast was measured on the rendered page; no print-stylesheet
audit was run.

---

## 6. Mock / simulated verification vs live verification

### 6.1 Mocked or simulated (what the 238 tests actually prove)

| Area | How it is simulated |
|---|---|
| Geolocation | Device permission/accuracy/timeout answers injected into the hook (`useGeolocation.test.tsx`) |
| Clipboard and native share | Stubbed; fallback paths exercised (`shareActions.test.ts`, `SharePage.test.tsx`) |
| Storage | jsdom `localStorage` and `createMemoryStorage()`; corruption and quota injected |
| Calendar/GPX/message outputs | Asserted on generated strings — no real calendar client or mapping service involved |
| Demo and tour data | Explicitly labelled sample data with a reset key |
| Rendering | jsdom, not a real browser: no real layout, paint, touch, viewport or service worker |

### 6.2 Live verification performed (non-mock)

| Check | Nature |
|---|---|
| `tsc -b` | Real type-check of the whole project |
| `eslint .` | Real lint pass |
| `vite build` | Real production bundle |
| `check-i18n.mjs` | Real filesystem parity check of locale files |
| `npx playwright test` | Real Chromium, real `vite preview` server, 12 scenarios (§3) |
| `scripts/verify-offline.mjs` | Real SW install/activate, real offline reload, 14 checks (§4) |
| `scripts/verify-a11y.mjs` | Real Chromium, 30 page loads, DOM + computed-style audit, 0 findings (§5) |

### 6.3 Not verified anywhere yet

Real browser rendering, a 320×568 no-horizontal-overflow check, console-error-free
startup (`pageerror` assertions), a partial keyboard-only pass (12 Tab stops on
two routes) and a colour-contrast audit are now covered by §3, §4 and §5.

Still **not** verified anywhere: an assistive-technology test (screen reader,
switch device), a full keyboard walkthrough of every route, print/PDF output
from the safety plan, PWA install prompt on a real device, device-level airplane
mode, layout on physical handsets, and any external service (none exist). No live
emergency call, message or notification was triggered — none can be.

---

## 7. Unresolved limitations and defects

| # | Item | Severity | Evidence |
|---|---|---|---|
| 1 | Safety content unreviewed: every emergency number, guidance rule and kk/ru phrase is `human-review-required`; review checklist unticked | Blocking for release | `docs/safety-and-privacy.md` §12; `src/features/emergency/data.ts` |
| 2 | No assistive-technology verification: the accessibility audit (§5) is a custom script, not axe-core and not a screen-reader/switch-device test; no full keyboard walkthrough of every route | Medium | §5 limits; plan §8.4 |
| 3 | Pages without dedicated automated tests: `HomePage`, `TripsPage`, `RoutePage`, `SettingsPage`, `AppShell`, `NotFoundPage`, plus `I18nProvider` and `useServiceWorkerUpdate` (they are exercised indirectly by the E2E journey) | Medium (coverage gap) | No `*.test.*` files reference them |
| 4 | No real user testing; audience and differentiation remain hypotheses | Product risk, not a code defect | `docs/user-research-plan.md` (plan only) |
| 5 | No standalone unit test file for `src/data/storage.ts` (covered indirectly via data-management tests) | Low | File list |
| 6 | Storage migration path (`migrate()`) is a pass-through for v1; no schema-change test exists | Low | `src/data/storage.ts` |
| 7 | PWA installability, offline reload and colour contrast verified in desktop Chromium only; no real handset, no print-stylesheet audit | Medium | §4 and §5 limitations |
| 8 | Safety-plan print/PDF output (the `Print` button's result) has no automated check of the rendered document | Low | `SafetyPlanPage.test.tsx` only asserts `window.print()` is called |

### Defects found earlier and FIXED in the integration run of 2026-10-21

| Was | Fix | Verified by |
|---|---|---|
| Single 716.26 kB JS chunk over Vite's 500 kB advisory, no splitting | `rollupOptions.output.manualChunks` splits `chunk-react` (221.70 kB) and `chunk-router` (37.61 kB); app chunk 457.17 kB, warning gone | `npm run build` |
| No `contentinfo` landmark on any route | `<footer class="app-footer">` with translated tagline + `/status` link (kk/ru/en) | `verify:a11y` (was 30 findings, now 0) |
| `.badge--accent` text at 4.23:1 (below 4.5:1) | New token `--color-accent-ink: #964a28` → 5.21:1 on `--color-accent-soft` | `verify:a11y` contrast check |
| 404 page had no `h1` (and `/guidance` is not a route — it fell through to it) | `NotFoundPage` now renders `PageHeader` | `verify:a11y` heading check |
| Hardcoded English update banner at `src/app/AppShell.tsx:49` (`— new version available.`) | Replaced with the `settings.pwa.updateAvailable` key in all three locales; `check:i18n` passes | `check:i18n`, unit suite |
| Stale registry entry `tour` = `planned` ("renders only a page heading") while `TourPage` implements 11 steps and passes 9 tests | Set to `available` with an accurate note; `featureStatus.test.tsx` updated to stop assuming every state group is non-empty, and `FeatureStatusPage` now shows "what production would require" only for capabilities that are not yet available | `featureStatus.test.tsx` (10) |
| `translate()` failed to resolve keys without a `namespace:` prefix | Fixed to fall back to `common`, then all namespaces | `check:i18n`, unit suite |
| `SafetyPlanPage` had no test at all | New `SafetyPlanPage.test.tsx` (4 tests: not-found, generate+persist+sections, contact preservation on regenerate, print) | `vitest` → 238 |

No defect found in this session caused `typecheck`, `lint`, `vitest`,
`check:i18n` or `build` to fail.

---

## 8. What would change this report

- Signed human review (P5-S5) is the only way emergency content may be
  described as verified.
- A screen-reader or axe-core pass would be needed before defect #2 can close;
  the current audit (§5) is script-based only.
- Any code change requires re-running §2, §3, §4 and §5 in full (`npm run
  typecheck && npm run lint && npx vitest run && npm run check:i18n && npm run
  build && npm run test:e2e && npm run verify:offline && npm run verify:a11y`);
  the numbers above are valid for the tree of 2026-10-21 only.
- Recording the video and confirming the official competition rules are the two
  remaining externally-blocked items (see `docs/submission-checklist.md`).
