# Dala Safe — Feature Status

| Field | Value |
|---|---|
| Document | Every capability, in one status category, with its witness |
| Session | P6-S1 |
| Evidence basis | Repository inspection on 2026-10-21 plus one recorded test run (see `docs/testing-report.md`) |
| Sources | `prompt.md` §5–§7, `prompt-development-plan.md` §6–§7 and §11, `docs/scope.md`, `docs/safety-sources.md`, `docs/market-research.md`, `docs/product-definition.md` |

## How to read this document

**Category rule (highest applicable wins):**

1. **Tested** — implemented *and* covered by automated tests in this repository.
2. **Implemented** — implemented and reachable, but no dedicated automated test found.
3. **Simulated / demonstration** — interactive UI on clearly labelled sample data; not a real capability.
4. **Planned** — specified but not built.
5. **Integration-dependent** — cannot be delivered in-browser without an external service, backend, permission, agreement or licence.
6. **Unverified** — a fact, translation or content item pending authoritative/human verification. Listed separately, because it can apply *on top of* a tested behaviour.

**In-app labels** are the five `FeatureState` values rendered by
`src/ui/FeatureStatus.tsx` (`available`, `demo`, `planned`,
`requires-integration`, `needs-verification`) and aggregated at `/status`.
The six categories above are the acceptance-checklist grouping required by
`prompt.md` §15; the mapping is: Available → Tested/Implemented, Demo →
Simulated, Planned → Planned, Requires integration → Integration-dependent,
Needs verification → Unverified.

Live in-app registry: `src/features/demo/featureStatus.ts` — **20 entries**.
Live demo registry: `src/features/demo/registry.ts` — **7 demos**.

---

## 1. Tested

Automated coverage observed in the recorded run: **30 files / 238 tests, all
passing**. Breakdown per capability below (test counts are from
`npx vitest run` on 2026-10-21; the final gate also records 12/12 E2E, 14/14
offline checks and 0 accessibility findings — `docs/testing-report.md`).

| Capability | In-app label | Test evidence (file · tests) | Notes |
|---|---|---|---|
| Trip create / edit / duplicate / delete / status change, validation, date handling | Available | `tripValidation.test.ts` 6, `TripFormPage.test.tsx` 4, `TripDetailPage.test.tsx` 4, `tripGroups.test.ts` 5 | Required fields, date order, group size |
| Trip list persistence across reload | Available | `TripsPersistence.test.tsx` 1 | localStorage round-trip |
| Readiness checklist (templates, custom items, progress, persistence) | Available | `checklistHelpers.test.ts` 5, `ChecklistPage.test.tsx` 3 | |
| Rule-based guidance engine, catalog integrity, guidance page, rule i18n | Needs verification (content) | `engine.test.ts` 21, `catalog.test.ts` 5, `GuidancePage.test.tsx` 5, `i18n.test.ts` 3 | Behaviour tested; **rule content is `human-review-required`** → see §6 |
| Message generation (trusted contact, trip notice, email draft), copy/share/fallback, generated ≠ sent | Available | `messageGenerator.test.ts` 5, `shareActions.test.ts` 8, `contactPlan.test.ts` 4, `SharePage.test.tsx` 9 | `delivered` is asserted `false` |
| Calendar `.ics` generation, two alarms, timezone/encoding/escaping, filename | Available | `ics.test.ts` 14 | Whether alarms fire depends on the calendar client |
| Emergency screen: contacts, `tel:` links, source/`lastVerified`/review badges, offline visibility, demo mode | Needs verification (content) | `data.test.ts` 17, `EmergencyPage.test.tsx` 9 | Content status → §6 |
| Geolocation permission, accuracy, denied/timeout/unavailable states, coordinate copy/share | Available | `useGeolocation.test.tsx` 15 | Device answers **simulated** in tests |
| Phrasebook renders kk/ru/en with review flags | Needs verification (content) | `data.test.ts` 17, `EmergencyPage.test.tsx` 9 | Wording machine-assisted → §6 |
| GPX parse, validation errors, track summary, export, schematic route map | Available | `parseGpx.test.ts` 11, `exportGpx.test.ts` 3, `RouteMap.test.tsx` 2 | Map is a local drawing, not navigation |
| Data export format, import (5 MB limit, merge by id), delete-all, quota and corruption messaging | Available | `tripData.test.ts` 11, `DataManagementPage.test.tsx` 8 | |
| Feature-status system: registry, five states, rendering, status dashboard | Available | `featureStatus.test.tsx` 10, `registry.test.ts` 3, `pages.test.tsx` 11 | |
| Seven future-feature demos render with status labels, sample-data notice, production note, reset | Demo / Requires integration | `demos.test.tsx` 23, `pages.test.tsx` 11 | Content is simulated → §3 |
| Product tour: 11 steps, focus management, reset, no interference with real trips | Available | `TourPage.test.tsx` 9 | Uses real components + resettable sample trip |
| Translation-key completeness (kk/ru/en vs en) | Available | `scripts/check-i18n.mjs` — pass: 3 languages × 10 namespaces | Static parity, not human translation quality |

**Not covered by any automated test found** (behaviour exists but is only
reachable manually): `HomePage`, `TripsPage` list UI, `SafetyPlanPage`
generate-and-save flow, `RoutePage` wrapper, `SettingsPage`, `AppShell`
navigation/banner chrome, `NotFoundPage`, the i18n provider itself, and the
service worker (Playwright runs with `serviceWorkers: 'block'`).

---

## 2. Implemented (no dedicated automated test)

| Capability | In-app label | Witness | Gap |
|---|---|---|---|
| Trip dashboard/list page (`TripsPage`) with empty state | Available | `src/features/trips/TripsPage.tsx`, linked from `HomePage` | No page-level test |
| Safety plan generation, print and share view (`SafetyPlanPage`) | **Needs verification** | `src/features/trips/SafetyPlanPage.tsx`; registry entry `safety-plan` states no dedicated test | Unit test + authoritative review of the recommendations it shows |
| Route page wrapper around the GPX track view (`RoutePage`) | Available | `src/features/gpx/RoutePage.tsx` | Route-level test |
| Language switch in Settings, persisted to the settings envelope | Available | `src/app/SettingsPage.tsx`, `src/i18n/I18nProvider.tsx`, `settingsRepository.ts` | No dedicated provider test (key parity is checked) |
| Offline banner and update-available prompt | Available (behaviour) / Needs verification (update prompt) | `src/app/AppShell.tsx`, `useOnlineStatus.ts`, `useServiceWorkerUpdate.ts`; `e2e/offline.spec.ts` ×3; `scripts/verify-offline.mjs` 14/14 | Banner show/clear verified in a real browser; the update-available banner has no automated test of its own |
| PWA manifest, icons, service worker, cache versioning, update flow | Needs verification | `public/manifest.webmanifest`, `public/sw.js`, `src/main.tsx` | **No real network-disconnect test in this repository** → §6 |
| Storage envelope, corruption quarantine, quota handling, memory fallback | Available | `src/data/storage.ts`; covered indirectly by `tripData.test.ts`, `DataManagementPage.test.tsx` | No standalone `storage.test.ts` |
| Demo state isolation and reset (separate storage key) | Available | `src/features/demo/demoStorage.ts`, `pages.test.tsx` | — |

---

## 3. Simulated / demonstration

Seven interactive demos under `/future/:demoId`, all built on visible sample
data with a status badge, a "what production needs" note, and a reset control
(`prompt.md` §6). Their in-app labels are shown in brackets.

| # | Prompt §6 item | Demo | In-app label |
|---|---|---|---|
| 1 | Advanced route planning and elevation profiles | `route-planning` | Demo |
| 2 | Weather dashboards and official hazard alerts | `weather` | Requires integration |
| 3 | Regional risk overviews and route-condition summaries | `regional-risk` | Requires integration |
| 5 | Group coordination and shared trip plans | `group` | Requires integration |
| 6 | Advanced first-aid and survival learning | `learning` | Demo |
| 7–8 | Missed-check-in escalation, server timers, trusted-contact SMS | `checkin-escalation` | Requires integration |
| 9–10 | Mesh SOS relay / store-and-forward, satellite integration | `satellite` | Requires integration |

**What these are not:** none of them sends anything, monitors anything, contacts
a rescuer, shows a live forecast, or implies operational facilities. Sample data
is labelled as sample; simulated SMS never appears delivered; the satellite demo
has no connection; the check-in demo has no server. No fake background service
exists for any of them (`prompt-development-plan.md` §7.1 rules).

**Prompt §6 item 11 and 12** (official eQonaq/emergency-service integration;
guide/club/tour-operator partnerships) are *not* separate demo pages — they
appear only as clearly labelled roadmap rows inside the satellite demo
(`SATELLITE_ROADMAP`: eQonaq, Kazhydromet, rescue notifications, satellite
messenger), each marked "Requires integration / unverified — no partnership
claimed". Source: `docs/market-research.md` §15, `docs/safety-sources.md` §5.

---

## 4. Planned

| Item | Source | Witness |
|---|---|---|
| Demo for **offline topographic maps, shelters and rescue points** (prompt §6 item 4) — no page exists | `prompt.md` §6; `prompt-development-plan.md` §7.2 P4-B2 | No `topo`/`shelter` keys in `src/locales/en/demo.json`; registry has 7 entries, not 8 |
| Dedicated unit test for the safety-plan generate-and-save flow | `prompt-development-plan.md` §6.1 P3-A5 | Registry entry `safety-plan` = Needs verification |
| Device-level offline verification (airplane mode on a real handset; cold offline first visit) | `prompt.md` §4, §10; plan §8.3 P5-S3 | Automated real-disconnect check now passes: `scripts/verify-offline.mjs` → 14/14 (`docs/testing-report.md` §4). Only the hardware scenarios remain |
| Real-user validation: interviews and usability sessions | `docs/user-research-plan.md`, `docs/market-research.md` §12 | No findings recorded; no participant data exists |
| Human review/sign-off of kk/ru safety wording and emergency numbers | `docs/safety-sources.md` §7–§8; `docs/safety-and-privacy.md` §12 | Checklist in §12 is entirely unticked |
| Written project description PDF (15 sections) | `prompt.md` §13; plan §9.2 P6-S2 | `deliverables/` is empty |
| Two-minute competition video + shot list + narration script | `prompt.md` §12; plan §9.3 P6-S3 | `deliverables/` is empty |
| Claims reconciliation across product/PDF/video/docs (Gate G5) | Plan §9.4 P6-S4 | This document is the input, not the gate |
| Submission send + archive | Plan §10 P7-S1 | `docs/submission-checklist.md` is complete; the actual send (and rule re-verification) is a human step before the 2026-10-30 deadline |
| Route-level lazy loading | Performance | Bundle is now split into `chunk-react` / `chunk-router` / app (457 kB, no warning), but every route still loads in the initial payload |

---

## 5. Integration-dependent

None of these can honestly be delivered by a browser-only app without an
external dependency. All are labelled in-app; none is claimed as working.

| Capability | Required for production | Source |
|---|---|---|
| Live weather forecast and official warnings | Licensed forecast source, timestamped offline cache, attribution | `docs/safety-sources.md` §3.4; plan §7.2 P4-B1; `docs/market-research.md` §3.4 |
| Official hazard / regional risk feeds | Verified publisher, dated updates | `docs/safety-sources.md` §3.4, §5 (UNS-06) |
| Missed-check-in escalation, server-side timers, SMS to a trusted contact | Backend, push/SMS delivery, contacts who consent to be alerted | `docs/scope.md` §5; `prompt.md` §6 items 7–8 |
| Mesh SOS relay and store-and-forward | Radio hardware/protocol, operators | `docs/scope.md` §5; `docs/safety-sources.md` §5 (UNS-07) |
| Satellite emergency communication | Provider agreement, compatible hardware, delivery receipts | `docs/safety-sources.md` §5 (UNS-07); `docs/market-research.md` §6.7 |
| eQonaq / emergency-service integration | Official agreement and procedure | `docs/market-research.md` §6.1, §15; `docs/safety-sources.md` §5 (UNS-03) |
| Guide / mountain-club / tour-operator partnerships | Written agreements — none exist | `docs/market-research.md` §15 |
| Group coordination and shared trip plans | Accounts, consent, privacy handling, conflict resolution | `docs/scope.md` §5 |
| Offline topographic maps, shelters, rescue points | Map data licence + verified facility list (counts currently conflict) | `docs/safety-sources.md` §6 (C-01), §5 (UNS-04) |
| Real message/SMS/email delivery, push notifications | Transport providers | `docs/scope.md` §5 |
| Cross-device sync / backup | Backend — explicitly out of scope | `docs/scope.md` §5 |

---

## 6. Unverified

Facts, translations or content that must not be presented as confirmed. These
are recorded with sources and dates, but the verification itself has not
happened.

| Item | Why unverified | Source |
|---|---|---|
| Emergency numbers as shipped (112, 101, 102, 103, 104, 109, ROSO) | Every shipped contact carries `reviewStatus: 'human-review-required'`; `lastVerified: 2026-10-20` with source URLs, but no named human reviewer has signed off | `src/features/emergency/data.ts`; `docs/safety-sources.md` §4, §8 |
| Exact emergency-response facts: response times, helicopter availability, rescue-point lists | No official service-level statement found — **must never be published** | `docs/safety-sources.md` §5 (UNS-06), §6 (C-01) |
| "112 works with no network at all" | Official page says it can work without SIM/balance; not a coverage guarantee — quote narrowly, human review | `docs/safety-sources.md` §5 (UNS-08) |
| Guidance rule content (11 rules in `hiking-guidance.json`) | Catalog `reviewStatus: 'human-review-required'`, `translationStatus: 'machine-assisted'` | `src/data/rules/hiking-guidance.json`; `docs/safety-and-privacy.md` §10 |
| Kazakh and Russian safety wording and phrasebook phrasing | Machine-assisted translation; 14-point human-review checklist unticked | `docs/safety-and-privacy.md` §12; `docs/safety-sources.md` §7 |
| Rule thresholds and advice as "official" | Rules are general planning advice; 10 of 11 are classified `general`, 1 `official` (emergency numbers). Not legal obligations | `src/data/rules/hiking-guidance.json`; `prompt.md` §9 |
| Off-line behaviour under a real network disconnect | Not tested in this repository; Playwright blocks service workers | `docs/testing-report.md` |
| GPS/geolocation accuracy | Browser/OS-dependent; shown with an explicit accuracy caveat, never a rescue guarantee | `docs/safety-and-privacy.md` §11 |
| Rescue facility counts, hut and KSP locations | Sources conflict (2024 memo vs Dec 2025 akimat) — publish neither | `docs/safety-sources.md` §6 (C-01) |
| Competition rules ambiguities (video container, deadline time, page limits, judging criteria…) | 16 open questions with the organizer | `docs/competition-rules.md` §7 (U-01…U-16) |
| Target audience, differentiation, adoption | Hypotheses; no interviews or user counts exist | `docs/product-definition.md` §10; `docs/scope.md` §2 |
| Any claim of live weather, live hazards, or official partnership | No source, no integration | `prompt.md` §9 |

---

## 7. Summary counts

| Category | Count |
|---|---|
| Automated tests passing (observed 2026-10-21) | 238 tests / 30 files |
| In-app feature registry entries | 20 |
| Interactive demos | 7 of 12 prompt §6 items; items 4, 11, 12 not built as pages |
| Tour steps | 11 |
| Interface languages | 3 (`kk`, `ru`, `en`), 10 namespaces each |
| Capabilities needing human review before release | Emergency numbers, guidance rules, kk/ru safety wording, phrasebook |

**Former inconsistency (resolved 2026-10-21):** the in-app registry entry for
`tour` used to read `planned` while `src/features/tour/TourPage.tsx` implemented
all 11 steps with 9 passing tests. The registry now reads `available` with an
accurate note, `FeatureStatusPage` shows "what production would require" only
for capabilities that are not yet available, and `featureStatus.test.tsx`
asserts per non-empty state group.
