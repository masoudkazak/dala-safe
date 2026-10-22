# Dala Safe — Claims Register

| Field | Value |
|---|---|
| Document | Every claim Dala Safe may make, may not make, or may make only after human review |
| Session | P6-S1 (owner per plan §9.1); reconciliation with PDF/video is P6-S4 (Gate G5) |
| Governing rules | `prompt.md` §9 (safety, privacy, no false claims), §11, §12; `docs/scope.md` §7–§8; `docs/market-research.md` §15 |
| Last updated | 2026-10-21 |

## How to use this register

1. A claim is **allowed only if it has a witness** in the "Allowed" table —
   a file, an observed test run, or a dated document.
2. Test witnesses cited below come from the run recorded in
   `docs/testing-report.md` (30 files / 238 tests, 2026-10-21).
3. Anything in **Prohibited** must not appear in the app, README, PDF, video,
   narration, or any submission text — no exceptions without new evidence,
   which means adding a row here first.
4. Anything in **Requires human review** may be shown in the product only with
   its `human-review-required` label intact, and must never be voiced as a
   verified fact in the video or PDF.

---

## 1. Allowed claims

### 1.1 Product and architecture

| Allowed claim | Witness |
|---|---|
| "Dala Safe is a React/Vite/TypeScript PWA that runs entirely in the browser." | `package.json`, `src/main.tsx`, `vite.config.ts`; `npm run build` passes (observed 2026-10-21) |
| "There is no backend, no account system, and no server component." | No fetch/XHR/API code in `src/**`; runtime deps are `react`, `react-dom`, `react-router-dom` only (`package.json`) |
| "There is no cross-device sync; data lives in this browser profile." | `src/data/storage.ts` (`STORAGE_KEYS`, localStorage only); `docs/safety-and-privacy.md` §5 |
| "No analytics, tracking, or third-party data transmission." | `package.json` dependencies; `docs/safety-and-privacy.md` §9 |
| "The interface is available in Kazakh, Russian and English, with Kazakh as default." | `src/domain/types.ts` (`SUPPORTED_LANGUAGES`, `DEFAULT_LANGUAGE`), `src/locales/{kk,ru,en}/` (10 namespaces each) |
| "Translation key parity across the three languages is checked by a script." | `npm run check:i18n` → pass: 3 languages × 10 namespaces (observed 2026-10-21) |
| "Design tokens, keyboard navigation, visible focus and reduced-motion support exist from the start." | `src/styles/tokens.css`, `src/styles/global.css` (`:focus-visible`, `.skip-link`, `aria-current`) |

### 1.2 Trips, checklist, safety plan

| Allowed claim | Witness |
|---|---|
| "Create, edit, duplicate, delete and change the status of trips, with validation of required fields and dates." | `tripValidation.test.ts` (6), `TripFormPage.test.tsx` (4), `TripDetailPage.test.tsx` (4) |
| "Trips persist in local storage across reloads." | `TripsPersistence.test.tsx` (1); `src/data/tripRepository.ts` |
| "A readiness checklist with template and custom items, progress and local persistence." | `checklistHelpers.test.ts` (5), `ChecklistPage.test.tsx` (3) |
| "The safety plan is assembled in the browser from your readiness answers and trusted-contact fields." | `src/features/trips/SafetyPlanPage.tsx`; `SharePage.test.tsx` (9) shows contact fields persisting into the plan |
| "The safety plan can be printed/shared as a page." | `src/features/trips/SafetyPlanPage.tsx` — **behaviour claim only**; no dedicated automated test (see `docs/feature-status.md` §2) |

### 1.3 Guidance

| Allowed claim | Witness |
|---|---|
| "Rule-based guidance is generated from an editable JSON rules file." | `src/data/rules/hiking-guidance.json` (11 rules), `catalog.ts`, `catalog.test.ts` (5) |
| "Each recommendation shows why it appeared, its source, its last-reviewed date, and whether it is general advice or official information." | `engine.test.ts` (21), `GuidancePage.test.tsx` (5), `GuidelineReference` in `src/domain/types.ts` |
| "The app states that guidance is general preparation advice, not a legal requirement or a safety guarantee." | `sourceNote` in `hiking-guidance.json`; echoed in rule text and `docs/safety-and-privacy.md` §2 |
| **Only with the label shown:** "Guidance content is marked `human-review-required` and machine-assisted translation." | `hiking-guidance.json` → `reviewStatus: 'human-review-required'`, `translationStatus: 'machine-assisted'` |

### 1.4 Messages and sharing — the generated ≠ sent rule

| Allowed claim | Witness |
|---|---|
| "Generates a trusted-contact message, a trip-notice message and an email draft in the active language." | `messageGenerator.test.ts` (5) |
| "You copy or share the message yourself; Dala Safe never sends it for you." | `GeneratedMessage.delivered` is typed `false` (`src/domain/types.ts`) and asserted `false`; generated body contains "Generated only — not delivered" (`messageGenerator.test.ts`) |
| "Copying falls back gracefully when the clipboard or the native share sheet is unavailable." | `shareActions.test.ts` (8), `SharePage.test.tsx` (9) |
| "An email opens as a draft you still have to send." | `messageGenerator.test.ts` — draft marked not delivered |

### 1.5 Calendar

| Allowed claim | Witness |
|---|---|
| "Downloads a valid `.ics` calendar file with two display alarms (departure and return)." | `src/features/calendar/ics.ts` (two `VALARM` blocks), `ics.test.ts` (14) covering escaping, timezone, encoding, filename |
| **Caveat required:** "Whether the alarms actually fire depends on your calendar client." | `src/features/calendar/ReminderPage.tsx` copy; `docs/feature-status.md` |

### 1.6 Emergency and location

| Allowed claim | Witness |
|---|---|
| "An offline emergency screen lists numbers with a source URL, a last-verified date and a review status." | `EmergencyPage.test.tsx` (9), `data.test.ts` (17); sources recorded in `docs/safety-sources.md` §4 |
| "Every number shown is flagged `human-review-required`." | `src/features/emergency/data.ts` (`REVIEW_REQUIRED`), `EmergencyPage.test.tsx` |
| "Tapping a number opens your phone's dialler — it does not place or connect a call." | `telHref` in `src/features/emergency/coordinates.ts`; `EmergencyPage.test.tsx` ("keeps every real `tel:` link visible and enabled in demo mode") |
| "Location is requested only when you ask for it, never in the background; permission, accuracy, denied, timeout and unavailable states are handled." | `useGeolocation.test.tsx` (15) — device answers **simulated** in tests |
| "Coordinates can be copied or shared, and the accuracy shown is the browser's — not a rescue guarantee." | `useGeolocation.test.tsx`, `EmergencyPage.test.tsx`; `docs/safety-and-privacy.md` §11 |
| "A tri-lingual (kk/ru/en) emergency phrasebook is available." | `src/features/emergency/data.ts`, `EmergencyPage.test.tsx` (rendering covered) — wording itself requires review (§3) |
| "Emergency actions remain reachable in demo mode and while offline." | `EmergencyPage.test.tsx`: "keeps every real `tel:` link visible and enabled in demo mode", "keeps `tel:` links visible while offline" |

### 1.7 GPX and data management

| Allowed claim | Witness |
|---|---|
| "Imports a GPX file with clear validation errors and shows point count, distance and ascent when they can be computed." | `parseGpx.test.ts` (11), `RouteMap.test.tsx` (2) |
| "Exports GPX for stored data." | `exportGpx.test.ts` (3) |
| "Tracks are labelled by source (recorded / imported / estimated / verified); no safe route is claimed." | `TrackSource` in `src/domain/types.ts`; `docs/scope.md` §4 |
| "Exports all trips as documented JSON with a date-stamped filename." | `tripData.test.ts` (11), `DataManagementPage.test.tsx` (8) |
| "Imports merge by id, reject files over 5 MB, and write nothing on invalid input." | `tripData.test.ts` (11) |
| "Delete-all removes trips, settings, demo and quarantined keys after confirmation, and degrades safely if storage cannot be enumerated." | `tripData.test.ts` (11), `DataManagementPage.test.tsx` (8) |
| "Quota failures and corrupted stored data are reported to the user instead of losing the app." | `storage.ts` `writeEnvelope`/`readEnvelope`, `DataManagementPage.test.tsx` (quota and corruption cases) |

### 1.8 Demos, tour, status system

| Allowed claim | Witness |
|---|---|
| "Twenty capabilities are listed with five status labels; seven of them are interactive demonstrations on sample data." | `src/features/demo/featureStatus.ts` (20 entries), `registry.ts` (7 demos), `featureStatus.test.tsx` (10), `pages.test.tsx` (11) |
| "Each demo shows a sample-data notice, a status badge and a note on what production would need." | `DemoFrame.tsx`, `demos.test.tsx` (23) |
| "An 11-step product tour runs over the real components with resettable sample data and never touches your own trips." | `TourPage.test.tsx` (9), including "never changes a real trip created in TripsProvider while the whole tour runs" |
| "Demo state is stored under a separate key and can be reset." | `demoStorage.ts`, `pages.test.tsx` (reset tests) |

### 1.9 Quality — only as observed

| Allowed claim | Witness |
|---|---|
| "238 unit tests in 30 files pass." | `npx vitest run` → `Test Files 30 passed (30)`, `Tests 238 passed (238)`, 2026-10-21, `docs/testing-report.md` |
| "The accessibility audit reports 0 findings." | `npm run verify:a11y` → `total: 0`, 2026-10-21, `docs/testing-report.md` §5 (custom script, not a screen-reader test) |
| "A real network-disconnect offline check passes 14/14." | `npm run verify:offline` → `14/14 checks passed`, 2026-10-21, `docs/testing-report.md` §4 (desktop Chromium only) |
| "TypeScript compiles with no errors." | `npm run typecheck` → exit 0, 2026-10-21 |
| "ESLint passes with no findings." | `npm run lint` → exit 0, 2026-10-21 |
| "The production build succeeds." | `npm run build` → exit 0, 147 modules, 2026-10-21 (with a chunk-size warning — mention it or stay silent, never claim optimisation) |
| "The app ships as an installable PWA with a versioned cache and an update prompt." | `public/manifest.webmanifest`, `public/sw.js` (`dala-safe-v1.0.0`), `useServiceWorkerUpdate.ts` |

**Offline — allowed only with the caveat:** "the app is built to work after the
first load without a network" is acceptable as a *design statement*;
**"works offline, tested" is NOT allowed** until a real network-disconnect check
is recorded. Witness for the gap: `docs/testing-report.md` (offline caveat),
`playwright.config.ts` (`serviceWorkers: 'block'`).

---

## 2. Prohibited claims

### 2.1 The eight forbidden safety claims — `prompt.md` §9

| # | Prohibited claim | Reason |
|---|---|---|
| 1 | "Dala Safe guarantees safety" (or guarantees a safe trip, a safe route, or rescue) | No product can; `docs/scope.md` §8, `prompt.md` §9 |
| 2 | "Dala Safe continuously monitors users" / "we watch your trip" | No monitoring service exists; no backend, no timers (`docs/scope.md` §5) |
| 3 | "Dala Safe automatically calls or contacts rescuers / sends an SOS" | No integration of any kind exists; `docs/safety-sources.md` UNS-07 |
| 4 | "The message was sent / the contact was notified" because it was generated | `delivered` is `false` by type; generation is not delivery (`prompt-development-plan.md` §6.3 acceptance) |
| 5 | "Live weather / live hazard data / current forecast" | No source, no feed; only labelled sample data (`docs/safety-sources.md` §3.4, §5) |
| 6 | "Official partnership, approval, API access, or registration with eQonaq / emergency services" | No evidence of any agreement; `docs/market-research.md` §15 |
| 7 | "Accurate rescue facilities / safe routes / rescue-point locations / response times" | Sources conflict or are absent; `docs/safety-sources.md` UNS-04, UNS-06, C-01 |
| 8 | "Guaranteed GPS reception, offline navigation, or emergency connectivity" | Browser/terrain dependent; `docs/safety-and-privacy.md` §11, `docs/safety-sources.md` UNS-08 |

### 2.2 Additional product prohibitions

| Prohibited claim | Reason |
|---|---|
| "Sends SMS" / "delivers email" / "push notifications" | No transport integration (`docs/scope.md` §5) |
| "Registers your hike officially / notifies the authorities" | UNS-03 unverified; building a registration claim on it is forbidden (`docs/safety-sources.md` §6 C-04) |
| "Works via satellite" / "mesh relay" / "store-and-forward" as a working feature | Demo only; hardware and agreements do not exist (UNS-07) |
| "Cloud sync / works on all your devices" | Local-only by design |
| "Tracks you when you have no signal" | Nothing tracks the user at all |
| "Turn-by-turn navigation" / "the map is accurate" | The route view is a local schematic drawing |
| "Reminders will definitely fire" | Calendar-client dependent |
| "Coordinates are accurate enough for rescue" | Explicitly forbidden in `docs/scope.md` §7 |
| "The app is certified / approved / medically reviewed" | No certification exists |
| Presenting a demo (sample weather, simulated SMS, demo countdown, demo satellite link) as a real operation | `prompt.md` §6 rules; `prompt-development-plan.md` §7.1 |
| "Unique / first / only / market-leading" positioning | Research does not establish it; differentiation is a labelled hypothesis (`docs/market-research.md` §15) |

### 2.3 Prohibited research and business claims

No fabricated numbers of any kind (`prompt.md` §9, §11–§13; plan §0 immutable rules):

| Prohibited | Reason |
|---|---|
| User counts, downloads, active users, growth, traction, adoption | No users have used the product; no interviews conducted |
| Market share, market size figures, TAM/SAM/SOM | Not established by `docs/market-research.md`; it explicitly says incident statistics are not a market size (§3.2) |
| Testimonials, quotes, reviews, "users say" | None exist |
| Survey findings, interview results, percentages of hikers | `docs/user-research-plan.md` is a plan only; no findings recorded |
| Partnerships, sponsors, letters of support, MoUs | None exist |
| Founder story, awards, press coverage, funding secured | No evidence |
| Budget items, costs or commitments not stated in the official rules | Costs must not be invented (`prompt.md` §13) |
| Completed milestones that did not happen | `prompt.md` §14: do not invent completed milestones |

---

## 3. Requires human review before it may be stated as fact

These items may appear in the product **only with their review status visible**,
and must be framed as pending review in the PDF and video.

| Item | Current status | Required review | Register |
|---|---|---|---|
| Emergency numbers 112, 101, 102, 103, 104, 109, ROSO duty phone | `human-review-required`, `lastVerified: 2026-10-20`, sources recorded | Named reviewer, date, evidence per number | `docs/safety-sources.md` §4, §8 |
| All Kazakh and Russian safety wording (emergency descriptions, guidance, plan text) | Machine-assisted translation | 14-point checklist, native/competent kk+ru speaker | `docs/safety-and-privacy.md` §12; `docs/safety-sources.md` §7 |
| Dispatcher phrasebook phrasing | Machine-assisted; labelled in-app | Speaker review against official emergency terminology | `docs/safety-sources.md` §7.2–§7.3 |
| Guidance rules (11) and their thresholds | `reviewStatus: human-review-required` | Qualified specialist review of each rule | `hiking-guidance.json`; `docs/feature-status.md` §6 |
| First-aid / survival learning content | Not implemented; demo only | Competent medical/first-aid reviewer before anything is taught | `prompt.md` §9 ("do not invent emergency instructions"); plan §7.2 P4-B4 |
| "112 without network" wording | Quotable only narrowly with a caveat | Human review before publication | `docs/safety-sources.md` UNS-08 |
| Rescue facility counts and locations (KSP, huts) | Conflicting sources | Current official list + human review; otherwise publish nothing | `docs/safety-sources.md` C-01, UNS-04 |
| Radio frequency 433.450 MHz | Operational availability unconfirmed | Human review; never present as guaranteed channel | `docs/safety-sources.md` UNS-05 |
| Competition rule ambiguities (container format, deadline time, page limits…) | 16 open questions | Written confirmation from the organizer | `docs/competition-rules.md` §7 |

---

## 4. Reconciliation checklist (input to Gate G5 / P6-S4)

Before submission, confirm each artifact tells the same story:

- [ ] `README.md` — no claim beyond §1 above.
- [ ] `docs/feature-status.md` — matches the in-app registry and demo labels.
- [ ] Project-description PDF (P6-S2) — statuses identical to this register.
- [ ] Video script, narration and on-screen text (P6-S3) — no simulated success presented as real; no personal data.
- [ ] Product tour and demo banners — sample data always labelled.
- [ ] Nothing from §2 appears anywhere.
- [ ] Nothing from §3 appears without its review status.
- [ ] Re-verify official competition rules before sending (plan §10, `docs/competition-rules.md` §8).
