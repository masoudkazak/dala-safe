# Dala Safe — Product Definition

**Document:** P1-S3 deliverable
**Version:** 1.0
**Date:** 2026-10-20
**Owner:** P1-S3
**Status:** Hypothesis-driven definition. No user research has been completed (see `docs/user-research-plan.md`, status register: 0 participants).

---

## 0. Evidence status

Everything in this document about users, needs, and behavior is a **hypothesis** unless explicitly marked otherwise. Personas are illustrative composites, not real people. There are no validated findings, no adoption data, no testimonials, and no baselines. Market claims belong in `docs/market-research.md` (P1-S1) and are not assumed here.

The product promise is:

> **Prepare your trip. Share your safety plan. Know what to do when conditions change.**

Dala Safe is **not** an emergency dispatch service, **not** certified navigation, and **not** a rescue guarantee. It does not monitor users and does not contact anyone on their behalf in the MVP.

---

## 1. The three core problems

These are the problems the MVP is designed around. Each is a hypothesis to be tested with the plan in `docs/user-research-plan.md` (H1–H4, H10).

### P1 — Preparation is fragmented, and "ready" is judged by feel

Trip information is spread across chats, screenshots, maps, notes, memory, and other people. There is no single place that turns "we're going hiking" into a checked, trip-specific readiness state. The result is avoidable omissions: forgotten gear, mismatched return times, an unchecked forecast, or a route nobody else has seen.

**What would show this is real:** participants describe 3+ disconnected tools and at least one concrete omission or last-minute scramble in recent trips (H1).

**What would weaken it:** most participants have one stable routine with no meaningful gaps.

### P2 — The safety plan is rarely shared in a form a contact can act on

People often "tell someone", but the message omits the route, expected return time, group size, vehicle, and what the contact should do if the group is overdue. The plan exists in the hiker's head, not in a form the trusted contact can use at the moment it matters. Generating a message is not sending it; Dala Safe must make that distinction obvious.

**What would show this is real:** participants cannot state a return time or overdue instruction their contact would act on; messages are partial or buried (H2).

**What would weaken it:** most participants already send a complete plan with a clear overdue rule.

### P3 — When conditions change or connectivity fails, the right actions are hard to retrieve

Above the tree line, in a valley, or after a wrong turn, users may have no signal and limited time. Emergency numbers, current coordinates, useful Kazakh/Russian phrases, and simple decision rules ("if X by 15:00, turn back") are scattered or unavailable. The problem is not a lack of information in general; it is retrieving the right few things under stress and knowing which guidance is official.

**What would show this is real:** participants report connectivity gaps on their actual routes and rely on screenshots/downloads; they ask for offline emergency access unprompted (H4).

**What would weaken it:** connectivity is described as reliable on their routes and existing offline workarounds are sufficient.

### Priority

For the MVP, priority is **P2 → P1 → P3** in build order (sharing is the smallest complete loop with the clearest value), while all three share one journey. Revisit after Round 1 research; do not silently change priority without a dated changelog entry.

---

## 2. Target users

### Initial segment (primary)

Independent hikers and small hiking groups (1–10 people) around Almaty who:

- take day hikes or 1–3 day treks in the Almaty region;
- plan informally, often in chat and on their phones;
- may lose mobile connectivity on route;
- need Kazakh, Russian, or English;
- do not have a support team, dispatcher, or professional guide.

### Secondary segment

- Informal group organizers who feel responsible for 3–10 friends.
- Professional or club guides (needs are likely different: roster, group status, duty-of-care; the MVP is not designed for them).
- International visitors with limited Russian/Kazakh.
- Mountain clubs and tour operators (future partnership, not an MVP user).

Secondary segments are explicitly **not** used to justify MVP scope. Guide needs are tested (H9) to confirm they are out of scope for now.

### Explicitly not the primary user

Professional rescue services, expedition teams with satellite communicators, and users who expect certified navigation or live dispatch. The product must not pretend to serve them.

---

## 3. Personas (hypotheses only)

All three are **illustrative composites**. They are not real individuals, their details are not research findings, and they must not be presented as customers or testimonials.

### Persona A — "Aigerim", 29, independent weekend hiker (primary)

**Label:** HYPOTHESIS — not validated.

- Lives in Almaty, works weekdays, hikes most weekends in summer and autumn; comfortable in Russian and Kazakh, reads English app text slowly.
- Usually goes with 1–3 friends; sometimes alone on familiar trails.
- Plans in Telegram, screenshots route notes, checks 2GIS and a weather site, packs from memory.
- Wants to feel prepared without spending an hour on admin; worries about battery and signal.
- **Hypothesized goals:** decide go/no-go confidently, not forget critical gear, leave a plan someone can use.
- **Hypothesized pains:** advice is scattered; "I told my roommate" feels flimsy; emergency numbers and phrases are not at hand offline.
- **Likely trigger:** a friend proposes a trip on Thursday for Saturday.
- **What would make her abandon it:** setup feels like paperwork, the app implies guarantees, or it drains battery.
- **What must be true:** the core loop takes a few minutes, works one-handed on a phone, and is readable in Kazakh.

### Persona B — "Daniyar", 36, informal group organizer (primary-adjacent)

**Label:** HYPOTHESIS — not validated.

- Organizes 4–8 friends or colleagues; not paid, but feels responsible for the group.
- Coordinates in a group chat; collects who is coming, who has a car, who has gear.
- Has had a trip run late and spent the evening answering "are you back?" messages.
- **Hypothesized goals:** get everyone aligned before departure, hand a credible plan to one trusted contact, reduce repetitive messages.
- **Hypothesized pains:** group readiness is invisible; the plan lives in chat scroll; no simple way to say "we returned".
- **Likely trigger:** monthly weekend trip; someone new joins.
- **What would make him abandon it:** re-entering data for each person, or a group feature that does not actually coordinate.
- **MVP fit:** partial. MVP supports trip size and one shareable plan, not per-person status. Do not promise group coordination.

### Persona C — "Elena", 41, part-time guide / club lead (secondary)

**Label:** HYPOTHESIS — not validated. Included to keep scope honest.

- Leads paid or club hikes of 6–15 people; carries responsibility for novices.
- Needs a participant list, emergency contacts, medical flags, and a defensible pre-trip briefing.
- **Hypothesized goals:** consistent briefing, group accountability, documented plan.
- **Hypothesized pains:** tools are fragmented; generic apps assume solo use; liability and privacy concerns.
- **MVP fit:** poor by design. No roster, no accounts, no group sync, no emergency-contact collection. Guides are a future segment requiring separate validation and legal review.
- **Why include her:** to prevent the team from claiming guide/operator readiness that the MVP does not have.

---

## 4. Jobs to be Done

### Main job

> When I am about to leave for an outdoor trip with limited time and unreliable connectivity, I want to turn a vague plan into a checked, shareable safety plan and keep the essential actions available offline, so I can leave with confidence and know what to do if conditions change.

### Functional jobs

1. Decide whether the trip is ready to start (route, timing, group, gear, forecast awareness).
2. Capture the plan once, in a form I can reuse and edit.
3. Give a trusted person enough information to act if we are overdue.
4. Put the return time into a reminder system I already check.
5. Reach emergency numbers, my coordinates, and basic phrases when I have no signal.
6. Understand which guidance is general advice and which is an official requirement.
7. Remove my data when I no longer need it.

### Emotional jobs

- Feel prepared rather than anxious.
- Feel that the plan is credible if something goes wrong.
- Avoid feeling judged or patronized by a safety app.
- Trust that the app is not overclaiming.

### Social jobs

- Be seen as a responsible trip leader or companion.
- Give family/partners a concrete answer instead of "we'll be fine".
- Communicate across Kazakh/Russian/English without awkward translation in the moment.

### Job stories

- **Aigerim:** "When a friend invites me on a Saturday hike, I want to confirm the route, timing, and gear in one pass, so I can say yes without spending the evening cross-checking five sources."
- **Aigerim:** "When I leave, I want to send my partner a plan that includes when to worry, so they are not guessing."
- **Daniyar:** "When I organize a group, I want one plan I can paste into the group chat and send to one contact, so I stop repeating myself."
- **Daniyar:** "When the group is late, I want my contact to have a clear next step, so they are not calling around."
- **Elena (future):** "When I lead a group, I want a consistent briefing and a record of who is with me, so I can meet my duty of care." — explicitly outside MVP.

---

## 5. Main end-to-end user journey

The MVP is one loop: **prepare → share → remind → act → clean up**. Every stage must work offline after first load, except actions that inherently require the OS or network (native share targets, calls).

| # | Stage | User goal | What the user does | What Dala Safe (MVP) does | Key failure / edge case |
|---|---|---|---|---|---|
| 0 | Trigger | Decide to go | Friend proposes a trip; user opens the app | Shows trips and a clear "new trip" action; no account required | Empty state must explain value in one screen |
| 1 | Plan | Capture the trip | Enters name, destination, departure, expected return, group size, notes | Validates required fields and date/time order; saves locally; allows edit/duplicate | Return before departure; missing timezone; storage unavailable |
| 2 | Prepare | Know what is missing | Answers readiness questions; completes/customizes checklist; reads recommendations | Rule-based guidance with "why this appeared"; checklist state persists; safe defaults for missing inputs | Contradictory answers; recommendation with no source; user treats score as guarantee (must be prevented) |
| 3 | Plan safety | Produce a usable plan | Reviews generated safety plan; edits notes; prints or saves | Safety plan summary with route, times, group, contact, decision rules, emergency info | Plan looks official; must be labeled as user-generated |
| 4 | Share | Tell a trusted person | Generates message; copies, shares natively, or opens an email draft; optionally adds official links | Message generator (kk/ru, plus active UI language); copy, native share, fallback; explicit "not sent" state | Clipboard denied; no share target; user believes it was delivered (release blocker) |
| 5 | Remind | Have a return trigger | Generates `.ics`; imports to calendar | Valid `.ics` with two alarms; explains client limitations | Calendar ignores alarms; wrong timezone; user expects app monitoring (must be prevented) |
| 6 | Depart | Leave with essentials | Checks offline readiness; opens emergency screen once; loads GPX if available | Offline app shell; cached essential guidance; emergency screen reachable in ≤2 taps | No install; first load never happened online; stale guidance not labeled |
| 7 | During | Adapt to conditions | Consults rule-based "if…then" guidance and the plan | Shows user-authored plan and general guidance; does not show live weather or hazards | User expects live conditions; guidance is mistaken for official instruction |
| 8 | Incident | Act fast | Opens emergency screen; taps `tel:`; copies coordinates with accuracy; uses phrasebook | Shows verified numbers, geolocation states, copy/share coordinates, trilingual phrases, offline guidance | Permission denied; timeout; poor accuracy; no signal; user believes coordinates guarantee rescue |
| 9 | Return | Close the loop | Marks the trip complete | Updates local trip state/history | No automatic "I'm safe" message in MVP (would require sending) |
| 10 | After | Control data | Exports JSON; deletes trip or all data | Documented export; confirmation before deletion; safe behavior on corrupt storage | User assumes export is a backup/sync; deletion is irreversible |

**Journey invariants**

- Emergency access is never gated by onboarding, demo mode, storage errors, or language selection.
- The app never implies that a generated artifact was delivered, registered, or monitored.
- The plan is always editable by the user; Dala Safe does not invent route or weather facts.
- Every screen that could be mistaken for official guidance carries the appropriate label and source/limitations.

---

## 6. MVP scope

Exactly the feature set below. Anything not listed is out of scope (Section 7). Feature status labels (`Available`, `Demo`, `Planned`, `Requires integration`, `Needs verification`) are applied in the product and in `docs/feature-status.md`.

| # | Feature | Included in MVP | Explicit limits |
|---|---|---|---|
| 1 | Trip planning and readiness | Create/edit/duplicate/complete/delete trip; name, destination, departure, expected return, group size, notes; validation; local history; empty/loading/error states | No accounts; one device; no route booking; no participant roster |
| 2 | Readiness checklist | Trip-specific questionnaire; customizable items; completion state; persists locally | Not a certification; no safety score presented as a guarantee; no professional medical screening |
| 3 | Safety plan | Generated, editable, printable/shareable plan with route, times, group, contact, decision rules, emergency info | User-generated document, not an official registration; no automatic delivery |
| 4 | Rule-based guidance | Editable JSON rules over duration, route characteristics, forecast availability, group experience, connectivity, preparedness; "why this appeared"; general vs. official distinction; source and review date; safe defaults; boundary tests | No live weather/hazard feed; no invented legal requirements or thresholds; no guarantee |
| 5 | Sharing messages | Trusted-contact message; trip-notification message in kk/ru with active-language rendering; copy to clipboard; native share; fallback; email draft; verified official links where appropriate; explicit generated ≠ sent | No SMS sending; no delivery confirmation; no contact book integration; no server |
| 6 | Calendar `.ics` | Valid event for return reminder; two alarms; timezone/escaping/encoding handled; client limitations explained | No guarantee alarms fire on every device; no server-side timer |
| 7 | Emergency screen | Verified emergency numbers with `tel:`; geolocation with accuracy and permission/timeout/unavailable handling; copy/share coordinates; kk/ru/en dispatcher phrasebook; essential offline guidance; instruction to follow official services | No call connection proof; no rescue dispatch; no live location tracking; phrasebook marked for human review |
| 8 | GPX (where feasible) | Import with validation and clear errors; basic track visualization; distance/elevation summary only when reliably computable; export where supported; source labels (recorded/imported/estimated/verified) | Not a certified safe route; no offline topo map download; no turn-by-turn navigation; omitted features are documented, not faked |
| 9 | Local data export/delete | Documented JSON export; delete trip/all data with confirmation; safe handling of unavailable/corrupt/quota-exceeded storage | Export is not a cloud backup and does not sync; deletion is irreversible |
| 10 | PWA offline | Manifest, icons, theme, service worker, cache versioning, update flow, online/offline indicator, offline access to essential guidance | Offline only after a successful first load; no background sync; private data not cached beyond local storage |
| 11 | Three languages | Kazakh (`kk`) primary, Russian (`ru`), English (`en`); full UI coverage; persisted choice; LTR layouts; no hardcoded strings; missing-key checks | No Persian or other languages; unreviewed translations marked; emergency terminology requires human review |

### MVP technical boundaries

- **No backend.** All functionality runs in the browser.
- **No cross-device sync.** Data lives in this browser/profile on this device. The UI must say so.
- **No SMS, satellite, or official integration.** No eQonaq registration, no emergency-service API, no rescue dispatch.
- Local storage only, with export as the user-controlled escape hatch.
- No analytics or third-party tracking in the MVP.

---

## 7. Out of scope (explicit)

| Out of scope | Reason |
|---|---|
| Backend, accounts, authentication | Not needed for the browser-feasible MVP; adds privacy and operational burden |
| Cross-device sync, cloud backup | Requires backend and identity; would create false expectations about data safety |
| SMS delivery, automated messages to contacts | Requires backend, consent handling, cost, and delivery guarantees |
| Satellite / mesh / SOS hardware integration | Requires hardware, partners, certification, and real operational support |
| Automatic missed-check-in escalation, server timers, monitoring | Implies a monitoring service the product does not operate |
| Dispatch, rescue coordination, "rescuers notified" | Dala Safe is not an emergency service |
| Live weather, official hazard alerts, route-condition feeds | Requires verified sources and freshness guarantees; unsafe to fake |
| Certified navigation, turn-by-turn routing, offline topo maps | Different product category; requires map licensing and accuracy validation |
| Route safety certification or "safe route" claims | Cannot be verified; would be misleading |
| Group real-time coordination, per-person status, rosters | Requires sync/accounts; not validated as MVP need |
| Guide/operator dashboards, liability workflows | Separate segment with legal and privacy requirements |
| eQonaq or government trip registration | Official process; a generated itinerary is not a registration |
| Rescue-point, shelter, or facility databases | Must be verified and maintained; demo data cannot imply operational facilities |
| Medical diagnosis, first-aid certification, survival training | Requires competent human authoring and review |
| Additional languages (including Persian) | MVP scope is exactly kk/ru/en |
| Native iOS/Android apps, app-store distribution | PWA is the delivery mechanism for the MVP |
| Payments, subscriptions, ads, affiliate links | Not needed to validate the core loop |
| Social feed, gamification, streaks, badges | Does not serve the safety job; risks trivializing it |
| Production analytics/tracking | Privacy-first MVP; measurement is study-based (Section 9) |

---

## 8. Positioning and differentiation (hypothesis)

**Positioning statement (hypothesis):** For independent hikers and small groups around Almaty who plan informally and lose connectivity, Dala Safe is a local-first mobile web app that turns a trip into a checked readiness state, a shareable safety plan, a return reminder, and offline emergency essentials — in Kazakh, Russian, and English.

**Differentiation hypothesis:** the value is the *integrated, low-friction loop with honest boundaries*, not any single feature. Copying a message, generating a calendar file, and showing emergency numbers all exist elsewhere; the hypothesis is that doing them in one short, offline-capable, trilingual flow is meaningfully better than the current patchwork.

**Status:** unproven. It must be checked against `docs/market-research.md` and against actual user behavior. Do not claim uniqueness, market leadership, or official endorsement. If research shows the patchwork is good enough, the differentiation must change before scaling the feature set.

**What Dala Safe will never claim:** guaranteed safety, continuous monitoring, automatic rescue contact, verified live hazards, certified routes, or official partnership without evidence.

---

## 9. Success metrics

No baseline exists, and the MVP has no analytics. All metrics below are **targets to be measured in moderated studies or build verification**, not results. Do not report improvement percentages, retention, DAU, or conversion — the product cannot measure them honestly at this stage.

### 9.1 Build and quality gates (must pass before release)

| ID | Metric | Target | Method |
|---|---|---|---|
| M1 | MVP translation coverage (kk/ru/en) | 100% of user-facing keys; 0 hardcoded strings in feature components | Key-completeness script + manual review |
| M2 | Core offline path | App shell, saved trip, and emergency guidance load after a real network disconnection following one successful load | Manual test in airplane mode + Playwright |
| M3 | Emergency reachability | Verified numbers reachable in ≤2 taps from any MVP screen; demo mode never blocks them | Design inspection + E2E test |
| M4 | Calendar validity | Generated `.ics` parses with 2 alarms and correct times in 2 tested calendar clients | Unit tests + manual import |
| M5 | Data control | Export produces a valid documented JSON; delete removes all local records; corrupted storage yields a safe recoverable state | Unit/integration tests |
| M6 | Safety-claim integrity | 0 strings implying message delivery, monitoring, rescue guarantee, or verified routes | String audit + comprehension test |
| M7 | Narrow-viewport usability | Core flow completes at 360×640 with no horizontal scroll or clipped primary action | Manual + screenshot check |
| M8 | Test suite | Named unit/E2E tests pass in CI; failures documented, not hidden | Test run log |

### 9.2 Study-based outcome targets (Round 1 / Round 2)

| ID | Metric | Target | Method |
|---|---|---|---|
| O1 | Core task success | ≥4 of 5 participants complete trip creation, checklist, message generation, and emergency-number retrieval without help | Moderated usability, per-task scoring |
| O2 | Time to first shareable plan | Median ≤4 minutes from opening the app to a copied message, with sample trip data | Timed usability task |
| O3 | Safety comprehension | 5 of 5 participants correctly state: the message is not sent, the app does not monitor, the route is not certified, data is local | Post-task comprehension questions |
| O4 | Checklist changes a decision | ≥3 of 5 participants report the checklist or guidance surfaced a concrete action they would otherwise skip | Post-test interview |
| O5 | Stated intent for a real trip | ≥4 of 8 participants name a specific upcoming trip they would use it for and accept a follow-up | Interview close |

These targets are decision thresholds for a small qualitative sample. They are not statistical significance, and O5 is stated intent, not adoption.

### 9.3 Guardrails (any failure blocks release or triggers redesign)

- G1: No participant believes a generated message reached their contact after seeing the share screen.
- G2: No participant believes Dala Safe is monitoring their trip or will alert anyone automatically.
- G3: Emergency numbers and guidance remain reachable when storage is full, corrupted, or the app is offline.
- G4: No PII beyond the user's own trip notes is collected or transmitted.
- G5: Every demo or simulated capability is labeled and cannot be mistaken for a live operation.

### 9.4 Metrics deliberately not used

Downloads, installs, "users", market share, NPS, retention, session length, and conversion. The MVP has no accounts, no analytics, and no user base; reporting these would be fabricated.

---

## 10. Assumptions requiring validation

Each assumption is a bet. If it fails, the indicated part of the product must change; do not defend the current design.

| ID | Assumption | Risk if wrong | How to test | Status |
|---|---|---|---|---|
| A1 | Users will spend 2–4 minutes setting up a trip before departure. | The core loop is too heavy; abandonment at trip creation. | Timed usability (O2), interview about patience. | Unvalidated |
| A2 | A copyable message plus native share is an acceptable substitute for automatic sending. | Users expect delivery; the product feels incomplete or misleading. | Interview H2, comprehension test, observe share behavior. | Unvalidated |
| A3 | Local-only storage without sync is acceptable for the MVP. | Users demand multi-device access; local data feels unsafe. | H6; ask about phone replacement and sharing with family. | Unvalidated |
| A4 | Kazakh-first interface materially improves trust for part of the audience. | Wasted localization effort, or Russian-only would suffice. | H5; language switch observation and interviews. | Unvalidated |
| A5 | A short checklist is useful, not bureaucratic. | Users skip it; the readiness feature is dead weight. | H3; usability T2 and follow-up. | Unvalidated |
| A6 | Users understand and value transparent "why this recommendation" guidance. | Guidance is ignored or over-trusted as official. | T2 comprehension, think-aloud. | Unvalidated |
| A7 | A calendar reminder is a meaningful return-time trigger. | Feature unused; users rely on phone alarms. | H7; observe `.ics` import and stated use. | Unvalidated |
| A8 | The emergency screen is usable under stress and poor conditions. | Critical failure in the moment that matters. | Task under time pressure, one-handed, low battery simulation; expert review. | Unvalidated |
| A9 | GPX is used by a meaningful subset, not just enthusiasts. | Effort spent on a niche feature. | Ask about GPX use; count in screening; measure task interest. | Unvalidated |
| A10 | Three languages cover the initial Almaty audience. | Some users cannot use the product safely. | Screening language data; report gaps; do not add languages silently. | Unvalidated |
| A11 | Users have at least one trusted contact willing to receive a plan. | The share loop has no recipient; product value collapses. | Interview; ask who they would send to. | Unvalidated |
| A12 | Users read and understand the safety boundary labels. | False beliefs about delivery/monitoring/rescue. | O3 and G1/G2; iterate until comprehension is clean. | Unvalidated |
| A13 | Guides are a secondary segment, not the wedge. | Building for guides would change the architecture and scope. | H9; 2 guide interviews per round. | Unvalidated |

**Rule:** no assumption may be described as validated in the product, PDF, or video until the findings log contains the evidence and `docs/user-research-plan.md` Section 14 reflects completed sessions.

---

## 11. Scope decisions and constraints

1. **Local-first, no backend.** Chosen because the core loop is feasible in the browser and because a backend would add privacy, cost, and false expectations of sync or delivery.
2. **One device, one browser profile.** Data loss on storage clear is a real limitation; export is the mitigation. The UI must state this plainly, not bury it.
3. **Generating is not sending.** Every sharing surface must show what happened and what did not. A copied message is not a delivered message.
4. **No live data in the MVP.** No weather, hazard, or route-condition feeds. Rule-based guidance uses user inputs and static, sourced general advice with review dates.
5. **No safety score as a guarantee.** A readiness indicator may summarize checklist completion, but must not imply safety, competence, or rescue readiness.
6. **Emergency actions are always available.** No login, onboarding, demo mode, storage error, or missing translation may block the emergency screen.
7. **GPX is conditional.** Implement import/visualize/export where feasible; if not feasible, document the limitation. Never fake a track summary or elevation.
8. **Translations require review.** Machine-generated or unreviewed kk/ru safety text is marked until a competent human reviews it.
9. **Demo is labeled.** Future features (SMS, satellite, monitoring, official integration) appear only as clearly labeled demo/planned/requires-integration surfaces.
10. **Scope freeze after P1-S5.** Changes require a dated note in this document and a corresponding update to research findings or a new hypothesis.

---

## 12. Traceability: problem → feature → hypothesis → metric

| Problem | MVP features | Hypotheses | Primary metrics |
|---|---|---|---|
| P1 Fragmented preparation | Trip planning, checklist, safety plan, rule-based guidance | H1, H3, H5 | O2, O4, A1, A5 |
| P2 Plan not shareable/actionable | Safety plan, message generator, copy/native share/email draft, `.ics` | H2, H6, H7 | O1, O2, O3, A2, A11 |
| P3 Hard to act when conditions change | Emergency screen, geolocation + accuracy, phrasebook, offline guidance, offline PWA, GPX where feasible | H4, H10 | O1, O3, M2, M3, A8, A12 |
| Trust and honesty (cross-cutting) | Labels, sources, review dates, "not sent" states, data export/delete, 3 languages | H10, H5, H6 | M1, M6, M8, G1–G5 |

---

## 13. Open questions

1. Which single moment triggers use: Thursday planning, Friday packing, or Saturday departure? (Affects the home screen and notification model.)
2. Is the trusted contact usually a partner, a friend, or a parent — and what do they actually want to receive?
3. Do users prefer one long message or a short message plus a link/file? (No link hosting exists in the MVP.)
4. Is a return-time reminder more useful as `.ics`, a phone alarm instruction, or an in-app countdown? (In-app countdown must not imply monitoring.)
5. How much guidance is enough before it becomes ignored? Which recommendations change behavior?
6. Does the Kazakh interface need different terminology for emergency concepts, and who can review it?
7. Would users pay, and for what, once the free MVP proves useful? (Out of MVP; do not assume willingness to pay.)
8. What would make a guide or club recommend it without implying official endorsement or liability transfer?

These questions are inputs to `docs/scope.md` (P1-S5) and the research rounds. They are not resolved here.

---

## 14. Changelog

| Date | Change | Evidence |
|---|---|---|
| 2026-10-20 | Initial hypothesis-driven definition; 0 research sessions completed | None (pre-research) |
