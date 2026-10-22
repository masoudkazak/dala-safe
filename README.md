# Dala Safe

Mobile-first outdoor trip preparation and safety-planning PWA for Kazakhstan.
Prepare a trip, work through a readiness checklist, generate a safety plan and
trusted-contact messages, keep essential guidance available offline, and know
what to do when conditions change.

Interface languages: **Kazakh (`kk`), Russian (`ru`), English (`en`)**. Kazakh
is the default. Persian is not part of the product.

## What Dala Safe is — and is not

**It is:**

- A browser application (React + Vite + TypeScript) that runs entirely on your
  device.
- A preparation and communication aid: checklists, safety plans, generated
  messages, calendar files, emergency reference information.
- An installable PWA that keeps working after the first load without a network.

**It is not:**

- **Not a dispatch service.** It never calls, messages or alerts emergency
  services on your behalf.
- **Not a rescue guarantee.** No content in this app guarantees safety, rescue,
  response time, or coverage.
- **Not a monitoring service.** It does not track you, notice a missed
  check-in, or escalate to anyone.
- **No backend, no accounts, no server.** There is no API, no database, and no
  account system.
- **No sync.** Data lives in one browser profile on one device. Clearing site
  data removes it. Cross-device sync is not implemented and is not claimed.
- **Not navigation.** The route view is a local schematic drawing, not a
  navigation or positioning tool.

The full safety model, data inventory and privacy stance are in
[`docs/safety-and-privacy.md`](docs/safety-and-privacy.md); the emergency
content register is in [`docs/safety-sources.md`](docs/safety-sources.md).

## Requirements

- Node.js 20.19+ or 22+ (Vite 7 requirement). Verified in this repository with
  Node `v22.22.1`, npm `9.2.0`.
- npm (ships with Node).
- A Chromium-based browser for the Playwright E2E suite.

## Install

```bash
npm install
```

## Development

```bash
npm run dev        # dev server on http://localhost:5173
```

## Build and preview

```bash
npm run build      # tsc -b && vite build → dist/
npm run preview    # serves dist/ on http://localhost:4173
```

Deployment: serve the `dist/` directory as static files. **HTTPS is required**
for the service worker and install prompt to work outside localhost. There is
no server component to deploy.

## Tests and checks

```bash
npm test              # unit tests (vitest run)
npm run lint          # eslint .
npm run typecheck     # tsc -b --pretty false
npm run check:i18n    # translation key parity across kk/ru/en
npm run test:e2e      # Playwright end-to-end suite (builds and previews first)

# Verifiers that need `npm run preview` running on port 4173 first:
npm run verify:offline  # real service-worker offline reload check (14 checks)
npm run verify:a11y     # accessibility audit over 10 routes x 3 languages
```

Recorded results for this repository — including exact counts, the commands
used, and what was *not* verified — are in
[`docs/testing-report.md`](docs/testing-report.md). The E2E suite is being
written by a parallel session; see that report for its status.

## Project structure

```
├── index.html                 # HTML entry (lang="kk", manifest link)
├── public/
│   ├── manifest.webmanifest   # PWA manifest (name, icons, colours, scope)
│   ├── sw.js                  # hand-written service worker, cache versioning
│   └── icons/                 # SVG/PNG icons incl. maskable 512
├── scripts/
│   └── check-i18n.mjs         # translation parity check (kk/ru/en vs en)
├── e2e/                       # Playwright specs
├── docs/                      # product, safety, research and status documents
├── src/
│   ├── app/                   # router, shell, home, settings, offline/update hooks
│   ├── domain/                # types, trip model, validation, date helpers
│   ├── data/                  # storage envelope, repositories, rules JSON, providers
│   ├── features/              # one folder per capability
│   │   ├── trips/             # trip CRUD, checklist, safety plan
│   │   ├── safety-rules/      # rule engine, catalog, guidance page
│   │   ├── sharing/           # message generation, copy/share/email draft
│   │   ├── calendar/          # .ics generation with two alarms
│   │   ├── emergency/         # emergency screen, geolocation, phrasebook
│   │   ├── gpx/               # GPX parse/export, schematic route view
│   │   ├── data-management/   # export, import, delete-all
│   │   ├── demo/              # future-feature demos + feature-status system
│   │   └── tour/              # 11-step product tour
│   ├── i18n/                  # provider, key resolution, resource registry
│   ├── locales/{kk,ru,en}/    # 10 namespace JSON files per language
│   ├── styles/                # global.css + design tokens (tokens.css)
│   ├── ui/                    # reusable components (Button, Card, Badge, …)
│   └── test/                  # vitest setup
└── vite.config.ts             # app + vitest config
```

## PWA: install and offline behaviour

**Install.** `public/manifest.webmanifest` supplies name, description,
`lang`, colours, display mode and icons (192/512/maskable). The service worker
registers only in production builds (`src/main.tsx`).

**Offline behaviour.** `public/sw.js` precaches the shell (`/`, `index.html`,
manifest, icons) under a versioned cache (`dala-safe-v1.0.0`), serves cached
assets when the network fails, refreshes `index.html` and `/assets/*` when online,
and deletes old cache versions on activation. The shell shows an offline banner
(`src/app/AppShell.tsx`) driven by `online`/`offline` events, and an
"update available" prompt that posts `SKIP_WAITING` and reloads. Trip data,
checklists, plans and guidance live in localStorage, so they remain available
without a network.

**Its real limits:**

- The cache covers the app shell and assets, not the internet. Nothing in this
  app fetches live weather, hazards, maps or alerts — so there is nothing of
  that kind to serve offline.
- Offline is verified by cached-shell and offline-banner logic under test and
  by the build; **a real network-disconnect test has not been performed in this
  repository**. Treat "works offline after first load" as unverified until that
  manual check is done (see `docs/testing-report.md`).
- The Playwright config sets `serviceWorkers: 'block'`, so E2E runs do not
  exercise the service worker at all.
- A service worker only works over HTTPS (or localhost) and needs a browser
  that supports it. Private-mode or storage-disabled browsing can block both
  the cache and localStorage.
- The app cannot restore data the browser has already deleted; manual export is
  the only backup.

## Privacy summary

- All trip data stays in this browser's localStorage. There is no account, no
  server, no analytics, no tracking, and no third-party data transmission.
- The app asks for nothing beyond what a feature needs (for example, location
  only when you use the emergency location action, and never in the
  background).
- You can export all trips as JSON and delete everything from
  **Settings → Data** (`/settings/data`). Exports are plain, unencrypted JSON —
  treat the file as sensitive.
- Demo content contains no real personal data.

Details, the exact export/import/delete behaviour, storage limitations and the
emergency-content review rules:
[`docs/safety-and-privacy.md`](docs/safety-and-privacy.md).

## Known limitations

1. **Local-only storage.** No sync, no backup; clearing site data or using
   another device/browser means the data is not there.
2. **No delivery of any kind.** Messages are generated and copied/shared by
   you. An email opens as a draft. A `tel:` link only starts a dial attempt.
   A downloaded `.ics` file depends on your calendar client actually firing the
   alarms.
3. **No live data.** No weather, no hazard feed, no maps, no alerts, no official
   registration.
4. **Offline not proven under real disconnect** in this repository (see above).
5. **Safety content needs human review.** Emergency numbers, guidance rules and
   the phrasebook carry recorded sources and `lastVerified` dates, but every
   shipped item is flagged `human-review-required`; the Kazakh/Russian wording
   is machine-assisted.
6. **Geolocation is the browser's, not ours.** Permission can be denied,
   accuracy can be poor, and nothing about a coordinate is a rescue guarantee.
7. **Import is limited** to 5 MB Dala Safe export files, merged by `id`.
8. **No route-level lazy loading.** The bundle is split into app / React /
   router chunks (largest 457 kB minified, 116 kB gzipped, no Vite warning), but
   every route still ships in the initial payload.
9. **Accessibility is script-verified only.** `npm run verify:a11y` reports 0
   findings (landmarks, headings, names, labels, contrast, focus, reduced
   motion), but no screen-reader or full keyboard walkthrough has been run.
10. **No real user testing has been done.** Audience and differentiation remain
    hypotheses (`docs/user-research-plan.md`, `docs/product-definition.md`).

## Demo vs available

Every capability in the app and in
[`docs/feature-status.md`](docs/feature-status.md) is labelled with one of
five in-app states — **Available**, **Demo**, **Planned**, **Requires
integration**, **Needs verification** — and grouped in that document into the
six acceptance categories: implemented, tested, simulated/demonstration,
planned, integration-dependent, unverified.

Short version:

- **Available and unit-tested:** trip CRUD, checklist, rule-based guidance,
  message generation/copy/share, calendar `.ics`, emergency screen and
  geolocation states, phrasebook rendering, GPX import/export, data
  export/import/delete, feature-status system, product tour, seven interactive
  demos, three-language parity.
- **Demonstration on sample data:** the seven future-feature demos (route
  planning, weather, regional risk, group coordination, practice mode,
  check-in escalation, satellite/mesh) — always labelled, never presented as
  real operations.
- **Integration-dependent:** live weather, official hazard feeds, check-in
  escalation with server timers and SMS, mesh/satellite SOS, eQonaq or
  emergency-service integration, partnerships, shared group state, offline
  topographic maps.
- **Unverified:** emergency-response facts, rescue facilities/counts, and
  human-reviewed Kazakh/Russian safety wording.

## Documentation

| Document | Contents |
|---|---|
| [`docs/architecture.md`](docs/architecture.md) | Layers, routing, storage, i18n, UI, PWA, tests, ownership |
| [`docs/feature-status.md`](docs/feature-status.md) | Every capability by status category |
| [`docs/roadmap.md`](docs/roadmap.md) | Phases P0–P7, dependencies, session-count estimates |
| [`docs/claims-register.md`](docs/claims-register.md) | Allowed / prohibited / human-review claims |
| [`docs/testing-report.md`](docs/testing-report.md) | Commands actually run and their results |
| [`docs/safety-and-privacy.md`](docs/safety-and-privacy.md) | Safety model, data, export/delete, privacy |
| [`docs/safety-sources.md`](docs/safety-sources.md) | Emergency sources, review register |
| [`docs/scope.md`](docs/scope.md) | Frozen scope and explicit non-claims |
| [`docs/product-definition.md`](docs/product-definition.md) | Problems, audience, hypotheses, metrics |
| [`docs/market-research.md`](docs/market-research.md) | Kazakhstan market and competitor research |
| [`docs/competition-rules.md`](docs/competition-rules.md) | OQ Startup rules with sources and dates |

## Repository

Source code: <https://github.com/masoudkazak/dala-safe>

## License

[MIT](LICENSE) © 2026 masoudkazak. Third-party dependencies keep their own
licenses.

