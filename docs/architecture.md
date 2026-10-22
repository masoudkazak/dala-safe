# Dala Safe — Architecture

| Field | Value |
|---|---|
| Document | Layered architecture, contracts, routing, storage, i18n, UI, PWA, testing |
| Session | P6-S1 (documentation), on foundations built by P2-S1…S8 and P3-A…H |
| Source of truth | `prompt.md` §4; `prompt-development-plan.md` §4 (mandatory architecture decisions), §5.2 (file ownership) |
| Last updated | 2026-10-21 |

---

## 1. Shape of the application

React 19 + Vite 7 + TypeScript, client-only, no backend. Dependencies are
deliberately few: `react`, `react-dom`, `react-router-dom` at runtime;
Vite, TypeScript, ESLint, Vitest + Testing Library and Playwright as tooling.
Every new dependency requires justification and a licence review
(`prompt-development-plan.md` §4).

Four layers, each depending only on the layers below it:

```
presentation   src/ui/**  +  src/features/*/*.tsx  +  src/app/*
      │                        │
feature        src/features/*  (business flows per capability)
      │                        │
data-access    src/data/**  (storage envelope, repositories, TripsProvider)
      │
domain         src/domain/**  (types, models, validation, date helpers)
```

| Layer | Location | Contains | Must not contain |
|---|---|---|---|
| Domain | `src/domain/` | `types.ts` models, `trip.ts` creation/validation/date/checklist helpers | React, storage keys, i18n calls, network |
| Data access | `src/data/` | `storage.ts` (envelope, quota, quarantine), `tripRepository.ts`, `settingsRepository.ts`, `TripsProvider.tsx`, `rules/hiking-guidance.json` | UI, feature-specific rules |
| Feature | `src/features/*` | One folder per capability: page, logic modules, tests, feature-scoped CSS | Cross-feature imports of pages; new storage keys |
| Presentation | `src/ui/`, `src/app/` | Reusable components, design tokens, router, shell, layout, offline/update hooks | Business rules, direct `localStorage` access |

Supporting directories: `src/i18n/` + `src/locales/` (all user-facing text),
`src/styles/` (tokens and global CSS), `src/test/` (Vitest setup),
`public/` (PWA assets), `e2e/` (Playwright).

Data flow: pages read state from `TripsProvider` / `useI18n`, call domain or
feature functions, and persist through repositories. Nothing outside
`src/data/` touches `localStorage` directly.

---

## 2. Routing

Single `<BrowserRouter>`, all routes nested under a shared `AppShell`
(sidebar + bottom navigation, skip link, offline banner, update prompt) —
`src/app/router.tsx`.

| Path | Page | Feature folder |
|---|---|---|
| `/` | `HomePage` | `src/app` |
| `/trips` | `TripsPage` (list, empty/loading/error) | `trips` |
| `/trips/new` | `TripFormPage` (create) | `trips` |
| `/trips/:tripId` | `TripDetailPage` (dashboard) | `trips` |
| `/trips/:tripId/edit` | `TripFormPage` (edit) | `trips` |
| `/trips/:tripId/checklist` | `ChecklistPage` | `trips` |
| `/trips/:tripId/plan` | `SafetyPlanPage` | `trips` |
| `/trips/:tripId/guidance` | `GuidancePage` | `safety-rules` |
| `/trips/:tripId/share` | `SharePage` | `sharing` |
| `/trips/:tripId/reminder` | `ReminderPage` (`.ics`) | `calendar` |
| `/trips/:tripId/route` | `RoutePage` (GPX) | `gpx` |
| `/emergency` | `EmergencyPage` | `emergency` |
| `/future` | `FutureFeaturesPage` (demo index) | `demo` |
| `/future/:demoId` | `DemoDetailPage` | `demo` |
| `/status` | `FeatureStatusPage` (status dashboard) | `demo` |
| `/tour` | `TourPage` (11-step tour) | `tour` |
| `/settings` | `SettingsPage` (current language display, data, PWA, about); language switching lives in the header switcher | `src/app` |
| `/settings/data` | `DataManagementPage` (export/import/delete) | `data-management` |
| `*` | `NotFoundPage` | `src/app` |

Navigation items in the shell: `/`, `/trips`, `/emergency`, `/future`,
`/settings`. Every trip-scoped route is unreachable without a `tripId`, and the
detail page links into checklist, plan, guidance, share, reminder and route.
Emergency access is a top-level route so it never depends on a trip.

---

## 3. Domain models (`src/domain/types.ts`, `src/domain/trip.ts`)

| Model | Purpose |
|---|---|
| `Trip` | id, name, destination, `departureAt`/`returnAt`, groupSize, notes, `status` (`draft`/`ready`/`completed`), timestamps, `checklist`, `readiness`, `safetyPlan`, `track` |
| `TripInput` + `validateTripInput()` | Required fields, date order, group size; returns `TripValidationIssue[]` |
| `ChecklistItem` | Template + custom items, `required`, `done`, `label: LocalizedText` |
| `ReadinessAnswers` | duration, group experience, connectivity, forecast checked, route type |
| `SafetyPlan` | generatedAt, answers, guidanceIds, trusted-contact fields, notes |
| `GeneratedMessage` | kind (`trusted-contact`/`trip-notice`/`email`), body, `delivered: false` — always false, by design |
| `GpxPoint` / `GpxTrack` / `TrackSummary` | Points, `source` ∈ `recorded`/`imported`/`estimated`/`verified`, distance/ascent, warnings |
| `EmergencyContact` / `PhrasebookEntry` | Number, label/description in kk/ru/en, `sourceUrl`, `lastVerified`, `reviewStatus` |
| `GuidelineReference` | sourceUrl, publisher, lastVerified, reviewStatus |
| `AppSettings` | language, units (`metric`), onboardingComplete |
| `Language` | `'kk' \| 'ru' \| 'en'`; `DEFAULT_LANGUAGE = 'kk'` |
| `FeatureState` | `available`/`demo`/`planned`/`requires-integration`/`needs-verification` |
| `ReviewStatus` | `unreviewed`/`machine-translated`/`human-review-required`/`human-reviewed` |

Helpers in `trip.ts`: `createTrip`, `duplicateTrip`, `validateTripInput`,
local↔ISO datetime conversion, `formatDateTime(language)`, `durationHours`,
`checklistProgress`, checklist templates.

---

## 4. Storage model (`src/data/storage.ts`)

**Versioned envelope.** Every key stores `{ version, savedAt, data }`;
`STORAGE_VERSION = 1`. Keys (`STORAGE_KEYS`):

| Key | Contents |
|---|---|
| `dala-safe:v1:trips` | All trips (checklist, readiness, plan, track) |
| `dala-safe:v1:settings` | Language, units, onboarding flag |
| `dala-safe:v1:demo` | Tour/demo state only, resettable, never mixed with real trips |
| `dala-safe:v1:trips:corrupt:<timestamp>` | Quarantined raw payload |

**Read path.** `readEnvelope()` → parse → structural check → migrate →
validate with a type guard. Any failure **quarantines** the raw payload under a
timestamped `:corrupt:` key instead of deleting it, returns
`{ data: null, corrupted: true }`, and the UI shows a safe corrupted-data
state (`TripsProvider.storageProblem`). App start is never blocked by bad
storage.

**Write path.** `writeEnvelope()` returns `{ ok: true } | { ok: false; error:
'quota' | 'unavailable' }`. `QuotaExceededError` (and the Firefox spelling) is
mapped to `quota`; everything else to `unavailable`. The UI surfaces the
difference so the user is told to export before deleting.

**Fallback.** `getBrowserStorage()` probes `localStorage` with a write/remove
and falls back to an in-memory store (`createMemoryStorage()`), so the app runs
in private/blocked-storage modes instead of crashing.

**Migration.** `migrate()` currently passes data through for `version === 1`
and is the single place future schema versions are handled.

**Delete/export primitives** live in
`src/features/data-management/tripData.ts`: JSON export envelope with
date-stamped filename, import limited to `MAX_IMPORT_BYTES = 5 MB` with a
structural validation, merge by `id` (imported copy wins, existing unique
trips kept), and `clearStoredLocalData()` which removes trips, settings, demo
and quarantined keys — degrading safely when storage cannot be enumerated.

---

## 5. Internationalisation

- **Exactly three languages:** `kk`, `ru`, `en`; default `kk`; no Persian in
  the product (`prompt.md` §3).
- **Flat dotted keys inside namespace files.** `src/locales/{kk,ru,en}/` holds
  ten identical namespaces: `common`, `trips`, `checklist`, `safety`,
  `sharing`, `emergency`, `gpx`, `data`, `demo`, `tour`.
- **Two key forms, auto-resolved** (`src/i18n/translate.ts`):
  `namespace:path` (e.g. `emergency.call`) selects the namespace directly; a
  bare dotted path (e.g. `featureStatus.available`) is searched in `common`
  first, then every other namespace. Missing keys fall back to English, then
  to the key itself, and warn once in dev.
- **Interpolation:** `{name}` placeholders via `interpolate()`.
- **Localized objects:** domain records carry `LocalizedText`
  (`Record<'kk'|'ru'|'en', string>`), rendered with `td()`.
- **Persistence:** the chosen language is stored in the settings envelope and
  restored on load; `document.documentElement.lang` is updated on change.
- **Parity check:** `npm run check:i18n` (`scripts/check-i18n.mjs`) compares
  every language against English — missing keys, extra keys, empty values —
  and exits non-zero on any issue. Current result: `3 languages × 10
  namespaces`, pass.
- **No hardcoded user-facing strings** in components; the single known
  exception (update banner) is recorded in `docs/testing-report.md`.

---

## 6. UI system

- **Tokens** in `src/styles/tokens.css`: colour roles (steppe/juniper/clay/
  mountain-sky palette, semantic success/warning/danger/accent), type scale
  (`--text-xs` … `--text-3xl` using `clamp()`), spacing, radii, focus ring,
  motion durations. Components consume tokens only and never redefine them.
- **Global CSS** (`src/styles/global.css`): layout shell, mobile bottom nav +
  desktop sidebar, `.stack`/`.cluster`/`.grid` utilities, visible
  `:focus-visible` ring, `.skip-link`, `aria-current` navigation states,
  `aria-invalid` field states, reduced-motion handling, touch-friendly targets.
- **Reusable components** (`src/ui/`): `Button`, `ButtonLink`, `Card`,
  `PageHeader`, `Field` (input/select/textarea with label + error), `Badge`,
  `FeatureStatus`, `ConfirmDialog`, `States` (`EmptyState`, `LoadingState`,
  `ErrorState`), `Icons`. Features consume these and add only feature-scoped
  CSS (e.g. `sharing.css`, `tour.css`).
- **Feature-status component** (`src/ui/FeatureStatus.tsx`) renders the five
  `FeatureState` badges with tone mapping and an optional description/note;
  the registry in `src/features/demo/featureStatus.ts` drives the `/status`
  dashboard.
- **Accessibility baseline from the start:** landmarks, skip link, labelled
  controls, live regions for status messages, keyboard-reachable dialogs,
  focus moved to the step heading in the tour, contrast-checked tokens, and
  reduced-motion support.

---

## 7. PWA

| Piece | File | Behaviour |
|---|---|---|
| Manifest | `public/manifest.webmanifest` | name/short_name/description, `lang: kk`, `dir: ltr`, standalone, theme/background colours, SVG + 192 + 512 + maskable icons |
| Service worker | `public/sw.js` | Hand-written, no build plugin. `CACHE_NAME = 'dala-safe-v1.0.0'` |
| Registration | `src/main.tsx` | Registers `/sw.js` only in production builds, on `load` |
| Update flow | `src/app/useServiceWorkerUpdate.ts` | Detects a waiting worker, exposes `updateAvailable`/`applyUpdate()`, posts `SKIP_WAITING`, reloads on `controllerchange` |
| Online state | `src/app/useOnlineStatus.ts` | `online`/`offline` listeners, initial `navigator.onLine` |
| Shell UI | `src/app/AppShell.tsx` | Offline banner (`role="status"`) and update banner with an apply button |

**Caching strategy.** Precache: `/`, `/index.html`, manifest, icons.
Navigations: network first, falling back to cached `index.html` (single-page
app), and refresh the cached copy on success. `/assets/*`: cache-first with
background revalidation. Icons and manifest: cache with network fallback.
Non-GET and cross-origin requests are ignored; no API calls exist to cache.

**Cache versioning and updates.** On `activate`, every cache except the
current `CACHE_NAME` is deleted, so bumping the version string is the update
mechanism. The user is prompted rather than force-reloaded.

**Deliberate exclusions.** Nothing private or user-specific is cached — trips,
settings and demo state live in localStorage, never in the Cache API — and
there are no live warnings or live data of any kind to serve stale copies of.

**Limits.** Requires HTTPS/localhost. Verified in this repository only at the
code level plus unit tests of offline UI logic; no real network-disconnect
test has been run here (see `docs/testing-report.md`), and Playwright runs
with `serviceWorkers: 'block'`.

---

## 8. Testing strategy

| Level | Tool | Scope | Command |
|---|---|---|---|
| Unit + component | Vitest 3 + Testing Library, jsdom, `src/test/setup.ts` | Business logic, validation, rules engine, message/calendar/GPX/data generation, feature-status rendering, page flows | `npm test` (`vitest run`) |
| Static | TypeScript, ESLint | Types and lint rules | `npm run typecheck`, `npm run lint` |
| i18n parity | Node script | Key completeness across kk/ru/en | `npm run check:i18n` |
| End-to-end | Playwright (Chromium) | 10-step main journey + failure scenarios against `vite preview` | `npm run test:e2e` |

Conventions: `src/**/*.{test,spec}.{ts,tsx}` only (`e2e/**` excluded from
Vitest); external services are mocked — geolocation, clipboard, storage and
device responses are simulated and clearly separated from live verification;
no test may trigger a real emergency call or message (`prompt.md` §10).
Mock/simulated and live verification are reported separately in
`docs/testing-report.md`.

---

## 9. Key architectural decisions

1. **No backend.** Everything that can run in the browser runs in the browser.
   No accounts, no API, no server state (`prompt-development-plan.md` §4).
2. **No cross-device sync, and no claim of it.** Single-device localStorage
   with export/import as the only portability path.
3. **No unnecessary dependencies.** Three runtime dependencies total; new ones
   need justification and licence review.
4. **Accessibility and keyboard navigation from the start**, not retrofitted:
   focus management, visible focus, landmarks, reduced motion, large targets.
5. **Contracts before features.** Domain types, storage envelope, i18n key
   conventions and UI tokens were fixed in phase 2 so parallel feature sessions
   could not collide.
6. **Honesty as a design constraint.** `delivered: false` is a type-level
   guarantee on messages; feature states and `ReviewStatus` are first-class
   domain values; demos are labelled by construction; no fake background
   services are created for backend-dependent features.
7. **Local-first safety content.** Guidance JSON and emergency data ship in the
   bundle with source, `lastVerified` and `reviewStatus`, so emergency
   information never depends on connectivity.

---

## 10. File-ownership boundaries

Per `prompt-development-plan.md` §5.2. Owners change files only in their own
scope; shared files go through the integrator session.

| Scope | Owner | Rule |
|---|---|---|
| `src/domain/**` | P2-S2 | Changes only with a new contract, notifying consumers |
| `src/data/**` | P2-S3 | Adapters and migrations |
| `src/i18n/**`, `src/locales/**` | P2-S4 + P3-H | One namespace per feature, filled in all three languages |
| `src/ui/**`, tokens | P2-S5 | Features consume, never redefine |
| `src/app/router*` | P2-S1 / integrator | New routes get a unique id/path |
| `src/features/trips/**` | P3-A | — |
| `src/features/safety-rules/**` | P3-B | — |
| `src/features/sharing/**` | P3-C | — |
| `src/features/calendar/**` | P3-D | — |
| `src/features/emergency/**` | P3-E | — |
| `src/features/gpx/**` | P3-F | — |
| `src/features/data-management/**` | P3-G | — |
| `src/features/demo/**` | P4-B* | Each session owns its own subfolder |
| `src/features/tour/**` | P4-C | — |
| `package.json`, configs | P2-S1 / integrator | Dependencies requested through the session report |
| `docs/**` | Producing session | Unique filename per document |
| `public/**` | P2-S6 | PWA icons and assets |
| `README.md`, `docs/architecture.md`, `docs/feature-status.md`, `docs/roadmap.md`, `docs/claims-register.md`, `docs/testing-report.md` | P6-S1 (this session) | Written from observed repository state only |

The E2E suite in `e2e/` is owned by session P5-S2 and is not modified here.
