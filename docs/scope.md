# Dala Safe — Scope (P0-S3 initial, frozen in P1-S5)

Date: 2026-10-20
Status: **Scope frozen for MVP build** (revisit only with recorded evidence; no silent expansion)

## 1. Product goal

Help independent hikers and small hiking groups in Kazakhstan prepare for a trip, organise essential information, share a safety plan with a trusted contact, keep essential guidance available offline, and know what to do in an emergency.

Central promise: **"Prepare your trip. Share your safety plan. Know what to do when conditions change."**

Explicit non-claims: Dala Safe is not an emergency dispatch service, a certified navigation system, a rescue guarantee, or a substitute for official instructions. It does not monitor users, send SMS, contact rescuers, or register trips officially.

## 2. Primary audience

Hypothesis until validated by interviews:

- Independent hikers and small groups (2–8 people) visiting mountains and outdoor destinations around Almaty.
- People who plan informally and want a simple, shareable trip plan.
- People who expect unreliable mobile connectivity.

Secondary: guides, mountain clubs, tour operators, international tourists. Not the primary design target for the MVP.

## 3. Main journey (MVP)

1. Open the app and choose Kazakh, Russian or English.
2. Create a trip (name, destination, departure, return, group size, notes).
3. Complete the readiness checklist and answer readiness questions.
4. Read rule-based guidance with explanations and sources.
5. Generate a printable/shareable safety plan.
6. Generate trusted-contact and trip-notice messages; copy or share them manually.
7. Download an `.ics` return reminder with two alarms.
8. Open the emergency screen: official numbers, optional geolocation, phrasebook, offline guidance.
9. Optionally import/export a GPX route.
10. Export or delete local data.

## 4. Inside MVP scope

- Local-first trip CRUD, checklist, readiness questionnaire, safety plan.
- Rule-based guidance from editable JSON, with "why", source, review date, and general-vs-official distinction.
- Message generation (kk/ru + active language), copy, native share with fallback, email draft. Generated ≠ sent.
- Calendar `.ics` with two alarms; documented client limitations.
- Emergency screen with verified numbers, `tel:` links, geolocation states, coordinate copy/share, tri-lingual phrasebook, offline guidance, and non-blocking demo mode.
- GPX import/export and basic summary, labelled by source; no claim of route safety.
- Data export, import, deletion, corruption/quota handling, local-storage privacy documentation.
- PWA manifest, service worker, offline cache, update flow, installability where supported.
- Exactly three interface languages: `kk`, `ru`, `en`. No Persian in product UI.
- Interactive future-feature demos with five-state labels and sample-data disclosure.
- 11-step product tour using real components and reset-able sample data.
- Automated tests for business logic, integration flow, offline/error scenarios.

## 5. Explicitly outside scope

- Backend, accounts, authentication, cloud sync, cross-device sync.
- Real SMS, email delivery, push notifications, server-side timers or missed-check-in monitoring.
- Live weather, live hazard feeds, official alerts without a verified source.
- Satellite communication, mesh networking, SOS relay.
- Official eQonaq/emergency-service integrations or partnership claims.
- Medical advice, first-aid certification, or authoritative emergency terminology.
- Live navigation, turn-by-turn routing, guaranteed GPX accuracy.
- Analytics/tracking without explicit justification and disclosure.
- Persian or any fourth language in the product.

## 6. Priority order if capacity is limited

1. G0/G1 and contracts.
2. Foundation + i18n.
3. Trips/readiness + safety plan.
4. Sharing + calendar.
5. Emergency + offline.
6. Data management.
7. Localisation and tri-lingual tests.
8. Product tour.
9. Testing/release.
10. PDF and video.
11. GPX.
12. Future demos (route/weather, alerts/check-in, maps/rescue, group, training, mesh/satellite, official integrations).

## 7. Allowed claims

- "Works offline after the first load" only if tested with a real network disconnect.
- "Generates messages" — never "sends messages".
- "Downloads a calendar file" — never "guarantees a reminder".
- "Shows coordinates reported by the browser" — never "accurate enough for rescue".
- "Demo" for every simulated capability.

## 8. Forbidden claims

- Safety guarantee, rescue guarantee, live monitoring, automatic rescue contact.
- Verified live weather/hazard data without a source.
- Official partnership, approval, API access, or registration without evidence.
- User counts, market share, testimonials, survey results, or adoption/traction.
- "Unique" positioning without research evidence; differentiation stays a labelled hypothesis.

## 9. Open decisions (non-blocking)

- Exact wording of final Kazakh/Russian safety phrases after human review.
- Whether GPX visualisation ships in the first release or is documented as a limitation.
- Final competition eligibility and deliverable format re-check (see `docs/competition-rules.md` §8).
