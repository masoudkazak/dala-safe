# Dala Safe — Roadmap

| Field | Value |
|---|---|
| Document | Dependency-aware phase plan with honest status |
| Session | P6-S1 |
| Basis | `prompt-development-plan.md` §1 (phases, dependency graph, session counts), `prompt.md` §14 |
| Status date | 2026-10-21 |
| Estimation unit | **Relative sessions (S)**, as defined in the plan — not calendar dates, not milestones. One session ≈ one focused work unit of a single owner. |

> **Evidence rule:** an item is marked **DONE in this repository** only when the
> artifact exists here and was observed during this session. Plans, intentions and
> session reports are not evidence. `docs/session-reports/` is **empty**, so no
> formal gate sign-off (G0–G6) is recorded anywhere in the repository — gates below
> are shown with their *evidence state*, not as declared passes.

---

## 1. Dependency graph (from plan §1)

```
P0-S1 rules ─┐
P0-S2 audit ─┴─> G0 ─> P1 (research/definition) ─> G0/G1
                             │
                             ├─> P2 (technical foundation) ─> G1
                             │        ├─> P3-A trips/readiness
                             │        ├─> P3-B rules engine
                             │        ├─> P3-C sharing
                             │        ├─> P3-D calendar
                             │        ├─> P3-E emergency
                             │        ├─> P3-F GPX
                             │        ├─> P3-G data management
                             │        └─> P3-H content/localisation (continuous)
                             │                    └─> P4 demos + tour ─> P5 test/release ─> P6 PDF/video/docs ─> P7 submission
```

Critical path: **P0 → P1 (scope freeze) → P2 (contracts) → P3-A/E → P4 (tour) → P5 → P6 (video/PDF) → P7**.

Planned capacity: max 3–4 coding sessions in parallel plus one integrator per
wave. Under time pressure the plan's own priority order is:
P2 complete → P3-A/B/C/D/E → P3-G → P3-H → P3-F → P4 → P5 → P6.

---

## 2. Phase status

| Phase | Planned sessions | Gate | Status in this repository | Evidence observed |
|---|---|---|---|---|
| **P0** — governance, repo audit, competition rules | 3 | G0 | **DONE** | `docs/competition-rules.md` (sources + 2026-10-20 check date, verified/unverified split), `docs/repo-audit.md`, `docs/scope.md` |
| **P1** — market research, user-validation plan, product definition, safety sources, scope freeze | 5 | G0/G1 (product) | **DONE (research phase)** — *user validation itself not started* | `docs/market-research.md` (17-row matrix, source register, evidence labels), `docs/user-research-plan.md`, `docs/product-definition.md`, `docs/safety-sources.md`, final `docs/scope.md` |
| **P2** — foundation: skeleton, domain contracts, storage, i18n, design system, PWA, test harness, integration | 8 (plan §4 lists S1–S8; phase table says 6) | G1 | **DONE (code state)** | `src/domain`, `src/data`, `src/i18n` + 3×10 locale files, `src/ui`, `src/styles/tokens.css`, `public/manifest.webmanifest` + `sw.js`, `vite.config.ts` test setup; `npm run build` and `npm run typecheck` pass |
| **P3** — MVP implementation (A trips, B rules, C sharing, D calendar, E emergency, F GPX, G data, H content) | 9 | G2 | **DONE (gaps closed at the gate)** | All eight feature folders implemented with tests; `npx vitest run` → **30 files / 238 tests pass**. The two former gaps (`SafetyPlanPage` test, stale `tour` label) were closed in the integration run |
| **P4** — feature-status system, 7 demos, product tour | 8 | G2/G3 | **DONE except one demo** | Status component + 20-entry registry + `/status` dashboard; 7 demo pages with sample-data labels; 11-step `TourPage` with 9 tests. Missing: prompt §6 item 4 (offline topo maps/shelters) |
| **P5-S1** — unit tests | part of 6 | G3 | **DONE** | All 10 areas of plan §8.1 have evidence: 8 map to Vitest files; "localisation key completeness" is covered by `scripts/check-i18n.mjs`, "offline-state logic" by the `EmergencyPage` offline test plus `verify:offline`. 238 tests pass |
| **P5-S2** — integration + E2E | part of 6 | G3 | **DONE** | `npx playwright test` → **12/12 passed** (journey + offline×3 + errors×8), repeated run confirms; `e2e/{journey,offline,errors}.spec.ts`, zero `pageerror`s (`docs/testing-report.md` §3) |
| **P5-S3** — offline / PWA verification | part of 6 | G3 | **DONE (automated)** | `scripts/verify-offline.mjs` against `vite preview` with SW allowed → **14/14**, including a genuine `setOffline` + full `page.reload()` served by `sw.js` (`docs/testing-report.md` §4). Device-level airplane mode still open |
| **P5-S4** — accessibility and UI quality | part of 6 | G3 | **DONE (script audit)** | `npm run verify:a11y` → **0 findings** over 10 routes × 3 languages after fixing 4 real defects (footer landmark, badge contrast 4.23→5.21:1, 404 `h1`, i18n key). No screen-reader pass — see `docs/testing-report.md` §5 |
| **P5-S5** — safety-content verification | part of 6 | G3 | **NOT STARTED** | Human-review checklist in `docs/safety-and-privacy.md` §12 is unticked; every shipped number still `human-review-required` |
| **P5-S6** — release | part of 6 | G4 | **DONE (automated gates)** | Full gate green: typecheck, lint, i18n, 238 unit, build (no size warning), 12/12 E2E, 14/14 offline, 0 a11y findings — all in `docs/testing-report.md` |
| **P6-S1** — project documentation | part of 5 | G5 input | **DONE (this session)** | `README.md`, `docs/architecture.md`, `docs/feature-status.md`, `docs/roadmap.md`, `docs/claims-register.md`, `docs/testing-report.md` |
| **P6-S2** — project-description PDF (15 sections) | part of 5 | G5 | **DONE (source + PDF)** | `deliverables/project-description.html` + `deliverables/dala-safe-project-description.pdf` (216 KB, 15 A4 pages, produced with Playwright Chromium), rebuildable via `deliverables/build-pdf.mjs` |
| **P6-S3** — two-minute video, shot list, narration | part of 5 | G5 | **PARTIAL (script only)** | `deliverables/video-script.md` (298 words, six timed sections), `shot-list.md`, `edit-plan.md`. **No MP4 exists** — no screen recording in this environment; recording must happen on the applicant's machine |
| **P6-S4** — claims reconciliation | part of 5 | G5 | **PARTIAL** | `docs/claims-register.md` written and used to align PDF/README/feature-status; final cross-check must be repeated after the video is recorded |
| **P7** — final alignment and submission | 1–2 | G6 | **PARTIAL** | `docs/submission-checklist.md` exists with real file statuses; open items are the video file, human safety review and re-verification of the official rules before sending |

**Totals:** plan budget ≈ 43–44 sessions across all phases. Observed complete:
P0, P1, P2, P3, P4, P5-S1, P5-S2, P5-S3 (automated), P6-S1, P6-S2, P6-S4
(draft). Partial: P5-S4, P5-S6, P6-S3, P7. Not started: P5-S5 (human safety
review), P7 submission send. Blocked externally: video recording (user machine),
official-rules confirmation (email).

---

## 3. Remaining work, dependency-aware

Estimates are relative sessions for a single owner, at the same granularity as
the plan's session counts. They assume the foundation stays frozen.

| # | Work item | Depends on | Phase / owner | Estimate | Why this size |
|---|---|---|---|---|---|
| 1 | Safety-content verification: named human review of numbers, kk/ru wording, phrasebook, guidance rules; record reviewer + date in `docs/safety-sources.md` | G2 (done) | P5-S5 | **2–3 S** (most is human review time, not build time) | 14-point checklist × 4 content sets; blocked on an actual qualified reviewer |
| 2 | ~~Offline verification~~ — **DONE**: `npm run verify:offline` → 14/14 incl. a real disconnect + full reload; device-level airplane mode still open | G2 (done) | P5-S3 | **DONE (automated)** | `docs/testing-report.md` §4 |
| 3 | ~~E2E suite + first recorded run~~ — **DONE**: 12/12 (`journey`, `offline` ×3, `errors` ×8) | #2 | P5-S2 | **DONE** | `docs/testing-report.md` §3 |
| 4 | ~~Defect sweep~~ — **DONE**: tour label, banner i18n key, badge contrast, 404 `h1`, footer landmark, chunk split | G2 (done) | P5-S4/S6 + integrator | **DONE** | `docs/testing-report.md` §7 fixed table |
| 5 | ~~Dedicated `SafetyPlanPage` test~~ — **DONE**: 4 tests (generate + persist + contact preservation + print) | G2 (done) | P3-A follow-up | **DONE** | `src/features/trips/SafetyPlanPage.test.tsx` |
| 6 | ~~Accessibility audit report~~ — **DONE**: 0 findings over 30 page loads | #4 | P5-S4 | **DONE** | `docs/testing-report.md` §5 |
| 7 | ~~Product-description PDF~~ — **DONE**: HTML source + 15-page PDF (216 KB) | #1, #4 | P6-S2 | **DONE** | `deliverables/project-description.html`, `.pdf` |
| 8 | Two-minute horizontal video: **record** the MP4 from the script/shot-list/edit-plan (cannot be produced in this environment) then verify duration ≤120 s, audio, subtitles | #4, #7 (script + PDF exist) | P6-S3 | **2–3 S** | `deliverables/video-script.md` (298 words), `shot-list.md` (17 shots), `edit-plan.md` ready |
| 9 | Claims reconciliation (product ↔ PDF ↔ video ↔ README ↔ feature status) and gate G5 | #7, #8 | P6-S4 | **1 S** | `docs/claims-register.md` is the checklist input |
| 10 | Competition re-verification of the 16 open rule questions, tick every box, send + archive — **checklist and final report already written** (`docs/submission-checklist.md`, `docs/final-report.md`) | #9 | P7 | **0.5–1 S** + external e-mail confirmations | Rules re-read and eligibility confirmed personally immediately before sending |
| 11 | Optional: prompt §6 item 4 demo (offline topo maps/shelters) | #9 optional | P4-B2 | **1–2 S** | Only if time remains; must not imply operational facilities (`docs/safety-sources.md` C-01, UNS-04) |
| 12 | Optional: real user validation round 1 (8–12 interviews) | Scope freeze (done) | P1-S2 / P4 | **2–3 S** + participant availability | Cannot be fabricated; results may change scope |

**Remaining total (items 1, 8-recording, 9, 10 — required): ≈ 6–9 sessions.**
Optional items 11–12: ≈ 3–5 sessions more. Items 2–7 are done and retained
above only as evidence.

Constraint worth stating: the official competition deadline recorded as
*verified* in `docs/competition-rules.md` §2 is **2026-10-30** (checked
2026-10-20). Items 7–10 are hard-gated by it; items 1 and 4 are the cheapest
way to keep every deliverable honest. The deadline itself is a fact from the
official source, not a project milestone invented here.

---

## 4. What will *not* be on this roadmap's critical path

Deliberately excluded, per `docs/scope.md` §5: backend/accounts, SMS/email/push
delivery, live weather or hazard feeds, satellite/mesh, official integrations or
partnership claims, analytics, navigation, and any fourth language. These remain
**integration-dependent** capabilities shown as labelled demos
(`docs/feature-status.md` §5) and must not be scheduled as if they were build
tasks.

---

## 5. Next 3 priority actions

1. **Close the safety-content review gap (P5-S5).** Obtain a named human
   reviewer for emergency numbers and kk/ru safety wording, complete the
   14-point checklist in `docs/safety-and-privacy.md` §12, and record
   reviewer/date/evidence in `docs/safety-sources.md`. Until then every
   shipped number and rule stays `human-review-required` and must be
   presented that way in the PDF and video.
2. **Record the video (P6-S3, only externally-created deliverable left).**
   Run the recorded script, shot list and edit plan in `deliverables/` against
   the real app (`npm run build && npm run preview`), then verify ≤120 s,
   horizontal, clear audio, accurate kk/ru/en subtitles, sample-data overlays —
   and re-run the claims reconciliation in `docs/claims-register.md` so video,
   PDF, README and app all state the same status.
3. **Re-verify the official rules and send (P7).** Re-read
   `docs/competition-rules.md` (deadline 2026-10-30 as verified on 2026-10-20),
   confirm eligibility/format personally, check every box in
   `docs/submission-checklist.md`, confirm the PDF opens and the video plays,
   then submit and archive.
