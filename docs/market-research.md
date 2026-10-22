# Dala Safe — Kazakhstan Market and Competitor Research

| Field | Value |
|---|---|
| Project | Dala Safe |
| Session | P1-S1 |
| Document status | Research synthesis — not a scope decision, not a partnership record, not user evidence |
| Research date | 2026-10-20 |
| Last source check | 2026-10-20 |
| Geographic focus | Almaty mountains first; Kazakhstan as context |
| Product stage assumed | Pre-build / early MVP; see `docs/product-definition.md` |
| User evidence | **0 interviews, 0 usability sessions, 0 surveys, 0 testimonials** |
| Companion documents | `docs/product-definition.md` (P1-S3), `docs/user-research-plan.md` (P1-S2), `docs/safety-sources.md` (P1-S4) |

> This document answers: *what already exists, what is actually live, where the gaps are, and which gaps are worth testing.* It does not prove demand. Every statement about user behaviour is a hypothesis unless it is explicitly tied to a source. No market share, revenue, active-user count, partnership, or survey result is inferred or invented here.

---

## 0. How to read this document

### 0.1 Evidence labels

The four labels are applied to products, features, and official rules — not to companies as a whole.

| Label | Meaning in this document |
|---|---|
| `VERIFIED LIVE` | A currently operating product, service, feature, or rule confirmed by a current official, state-media, or app-store source checked on 2026-10-20. Details may still be unverified. |
| `ANNOUNCED` | A credible official or state-media announcement exists, but no live consumer product/feature was found. Do not present it as available. |
| `SIMULATED` | A prototype, demo, or explicitly simulated capability. **No simulated competitor capability was counted in this research.** |
| `UNVERIFIED` | A single weak/indirect source, an inaccessible primary document, or a claim that could not be confirmed. Treat as unknown, not as false. |

Absence of evidence is not evidence of absence. “No app-store listing found” means exactly that, not “the product does not exist.”

### 0.2 Confidence conventions

| Confidence | Use in this document |
|---|---|
| High | Multiple independent current sources, or a primary official/store source with consistent details. |
| Medium | One credible source, state media, or a store listing; details may change. |
| Low | A single secondary/indirect source, an inaccessible primary source, or an inference from adjacent evidence. |

### 0.3 Relationship to the other Phase 1 documents

- This document supplies market and competitor evidence. `docs/product-definition.md` owns the MVP scope and explicitly excludes maps, live tracking, automatic escalation, SMS, satellite integration, eQonaq registration, and rescue dispatch. Nothing here overrides that scope.
- `docs/user-research-plan.md` owns the interview and usability method. This document only adds market-specific validation questions; it does not create a second research plan.
- `docs/safety-sources.md` is the canonical register for emergency numbers and safety wording. This document discusses the *market role* of 112 and official notification but does not create a second emergency-number list.
- Two items in `docs/safety-sources.md` deserve re-review after this research: `UNS-03` (“register your hike with 112”) and `UNS-05` (433.450 MHz). State-media reports of the September 2025 MChS order are stronger than the earlier “secondary news” note, but the primary legal text was still JavaScript-blocked. Re-review the register; do not silently change it, and do not publish a registration or radio guarantee until the legal text and procedure are read and human-reviewed.

---

## 1. Executive summary

1. **The market is being pushed toward trip notification, not pulled by a mature safety-planning category.** A September 2025 MChS order, as reported by state media, requires travellers to notify territorial emergency authorities before entering listed high-risk mountain/water/cave areas, with route, group, and overnight details, via eQonaq, email, or 112 [S2][S5]. This creates awareness and a recurring administrative job, but it does not create a consumer habit by itself.
2. **Official digitisation is real but fragmented.** eQonaq is live and is also used for route notification; the government plans to move eQonaq to full production in autumn 2026 and is building a national `Kazakhstan.travel` portal for December 2026 [S1][S8]. Tau Go was announced in 2023 as a DChS-integrated, 2GIS-linked offline navigator, but no live app listing was found [S12]. TravelStan was announced for end-2025, but no live app was verified [S13][S14].
3. **Local maps are strong; local trip-safety workflow is not.** 2GIS, Yandex Maps, Organic Maps, and OsmAnd provide credible offline maps [S15]–[S21], [S33]. We did not verify a reviewed product that combines a pre-trip readiness check, a structured trusted-contact plan, a return reminder, and offline emergency essentials for the Kazakh/Russian/English Almaty audience.
4. **Global trail apps are strong but poorly localised for this job.** AllTrails lists only 31 trails in Almaty and 38 in Kazakhstan; its KZ App Store listing offers English plus 10 languages, excluding Russian and Kazakh; offline maps require a paid tier [S22]–[S25]. Komoot, Wikiloc, and Gaia are capable global products, but they are route/activity platforms first, not local safety-planning workflows [S27]–[S30].
5. **Live-location sharing is not a safety system.** Telegram live location is capped at 8 hours [S34]; WhatsApp live location is user-timed and needs data/permission [S35]; Strava Beacon needs cell service [S31]; OsmAnd Tracker is Android-only and depends on Telegram/internet [S20]. Apple’s satellite SOS is not available in Kazakhstan [S36], and Garmin inReach is a niche hardware subscription with country-specific regulatory caveats [S37].
6. **On current evidence, the strongest wedge is P2 in the product definition: make the plan shareable and actionable.** The official notification requirement, the weakness of chat-based sharing, and the absence of a verified structured local artifact all point to the same job: turn “we’re going hiking” into a plan a contact can act on, with a return reminder and offline essentials. P3 (offline retrieval) is the second-strongest gap. P1 (fragmented preparation) is plausible but the least directly evidenced by desk research.
7. **Do not build maps, live tracking, dispatch, or automatic escalation.** Those categories are occupied by stronger incumbents, conflict with the MVP’s no-backend/no-monitoring scope, and create liability. Build the thin local workflow that sits between maps, messaging, official notification, and 112.
8. **Confidence:** medium on the competitive gap and official context; **low on demand, willingness to pay, and actual user behaviour** until the P1-S2 interviews are completed.

---

## 2. Research questions, scope, and method

### 2.1 Questions

1. Which products and official channels do Almaty-area hikers and small groups actually have available for preparation, sharing, offline navigation, and emergency contact?
2. Which of those are live, announced, simulated, or unverified?
3. Where are the concrete gaps between those tools and the jobs in `docs/product-definition.md`?
4. Which gap is narrow enough for a browser-feasible MVP and defensible against incumbents?
5. What must be validated before the product claims a differentiated position?

### 2.2 Scope

**In scope:** eQonaq and the September 2025 notification rule; 112 and the rescue ecosystem; 2GIS; Yandex Maps; Organic Maps; OsmAnd; AllTrails; Komoot; Wikiloc; Gaia GPS; Strava Beacon; Telegram/WhatsApp live location; Apple satellite SOS; Garmin inReach; announced government platforms Tau Go and TravelStan/Kazakhstan.travel.

**Out of scope:** commercial expedition operators, helicopter/insurance markets, professional rescue procurement, hardware manufacturing, and a full map-data audit. Adjacent weather sources (Kazhydromet, Windy) were reviewed only to confirm that weather is a separate job, not a Dala Safe feature [S32].

### 2.3 Method

- Desk research in English and Russian, including Kazakh/Russian search terms for official rules and local reporting.
- Priority to primary official sources (gov.kz, eGov, adilet), then state media (BAQ.KZ, Kazinform), then local media (Zakon.kz, Xnews), then app-store listings and vendor documentation.
- Every product claim was checked against a current listing or official documentation where possible.
- No app was installed and subjected to hands-on field testing. Feature claims are therefore documentation claims, not observed behaviour.
- No interviews, intercept surveys, usability tests, or price tests were conducted. Those belong to P1-S2 and later rounds.

### 2.4 What this research cannot establish

- The number of hikers, the size of the addressable market, or app spending in Kazakhstan.
- Which apps Almaty hikers actually use, how often, or why they switch.
- Whether users would share a plan, pay for it, or trust a new brand.
- Whether eQonaq route notification works well in practice, whether it produces a receipt, or whether DChS acts on the submitted return time.
- Whether the 433.450 MHz radio recommendation is operationally useful or legally usable by ordinary hikers.

Those are validation questions, not research findings.

---

## 3. Market context: five forces that matter

### 3.1 A new official notification duty (September 2025)

The MChS order approved a list of hard-to-access mountain, water, and cave objects and a procedure for informing territorial authorities before travel [S2][S5]. The reported requirements are specific:

- Notify the regional DChS (for example, Almaty) before entering a listed high-risk area.
- Provide full name, contact details, and route information.
- For a group, provide the number of participants, their details, the start and end of the route, its length, and intended overnight/rest places.
- Send via eQonaq and its mobile app, the territorial authority’s email, or 112.
- One participant may notify on behalf of the group.
- Territorial authorities register all notifications [S2].

The order was reported as registered with the Ministry of Justice under No. 36696 and based on the Civil Protection Law [S2]. A gov.kz Almaty DChS release says the order took effect on 9 September 2025, repeats the registration requirement, and recommends the 433.450 MHz radio used by guides and volunteer rescuers [S3]. A related adilet document (`V2500036696`) was JavaScript-blocked and could not be read directly [S4]; its exact correspondence to this order is `UNVERIFIED`. The requirement is therefore **verified through official/state-media reporting, with the primary legal text still `UNVERIFIED`**.

**Market implication:** a recurring, information-heavy job has been created on paper. But the official channels are administrative, not a consumer planning experience. A product that helps a user assemble the required information, understand the rule, and keep the same plan for their trusted contact has a natural adjacency — provided it does not claim to register on the user’s behalf.

### 3.2 Rescue demand is visible, but incident statistics are not a market size

State media reported 291 rescue operations, 396 people rescued (including 77 children), and 10 deaths in the mountains between 1 January and 20 August 2025 [S5]. Zakon.kz, citing Almaty DChS, reported 1,247 rescued over three years, including 173 teenagers and 174 injuries [S6]. These figures are period-specific and not directly comparable. They show that mountain incidents are a real public-safety concern; they do **not** measure demand for a planning app.

A separate April 2026 report quoted an Almaty tourism official saying tourists did not yet have a registration practice and that a group-registration system was still being developed with DChS and the Almaty climbing federation [S7]. Read alongside the September 2025 order, this suggests an **implementation and awareness gap**, not the absence of a rule. That gap is an opportunity for education and workflow support, but it is also a warning: official processes can change while a product is being built.

### 3.3 Government digitalisation is both an opportunity and a substitute

- **eQonaq** is live. It was built as a tourist-flow and migration registration system, launched in November 2020, recognises passports from 190+ countries, and integrates with the Migration Police via SmartBridge [S1]. The government says more than 900,000 users were registered in the system by June 2026 [S8]. These are registered users, not active users.
- Since September 2025, eQonaq has also been used for route notification, according to the tourism minister [S8]. This is a direct overlap with the “tell the authorities” job.
- The government plans full production operation for eQonaq in autumn 2026 and a national `Kazakhstan.travel` portal in December 2026, with eight languages and routes, events, publications, a photo bank, and 3D tours [S8].
- **Tau Go** was announced in February 2023 as a unified tourist-navigation system and mobile smart navigator, integrated with DChS databases, with mountain routes digitised and linked to 2GIS for offline use [S12]. No live app-store listing or official launch page was found as of 2026-10-20. Label: `ANNOUNCED`.
- **TravelStan** was announced in April 2025 as an all-in-one travel app planned for end-2025 [S13][S14]. No live app was verified. Label: `ANNOUNCED`.

**Market implication:** the government is not a blank space. It already owns registration, emergency numbers, and a future national travel portal. Dala Safe should complement those channels, not compete with them on registration or official data. The risk of absorption is real; the mitigation is to own the user-side workflow and trust, not the government database.

### 3.4 Localisation and local coverage are weak in global products

AllTrails is available in Kazakhstan and lists 38 trails nationally, 31 in Almaty (23 hiking, 7 backpacking, 5 walking) [S23][S24]. That is a thin catalogue for a mountain region with many routes. Its KZ App Store listing offers English and 10 more languages — Danish, Dutch, French, German, Italian, Norwegian, Polish, Portuguese, Spanish, Swedish — **not Russian or Kazakh** [S25]. Offline maps are a paid feature [S22][S25][S26].

Komoot, Wikiloc, and Gaia have broader global libraries and strong navigation/tracking features, but they are not built around Kazakh/Russian official notification, 112, or the local trusted-contact workflow [S27]–[S30]. 2GIS is a major local map product with offline maps and a “Friends on Map” live-location feature, but it is a directory/navigation product first; trail-specific safety planning is not its core job [S15][S16].

**Market implication:** local language and local workflow are real differentiators, but they are not a moat by themselves. A global app could add Russian tomorrow. Speed, partnerships, and a workflow that is genuinely better than “2GIS + Telegram + a screenshot” matter more than translation alone.

### 3.5 Connectivity and satellite reality

- Telegram live location stops after a maximum of 8 hours [S34].
- WhatsApp live location is user-timed, end-to-end encrypted, and requires location permission; it is a chat feature, not a monitored safety service [S35].
- Strava Beacon shares with up to three contacts and updates about every 15 seconds, depending on cell service; it requires cell service [S31].
- OsmAnd Tracker shares through Telegram, is Android-only, and requires internet; contacts do not need OsmAnd [S20].
- Apple Emergency SOS via satellite requires iPhone 14 or later; Apple’s availability list does **not** include Kazakhstan [S36].
- Garmin inReach uses Iridium and offers global coverage and 24/7 SOS with a subscription, but some countries require prior permission/registration or prohibit satellite communicators; Kazakhstan-specific status was not verified [S37].
- The MChS advises hikers not to go alone, to tell relatives the route and expected return time, to carry a map, compass, GPS, communications, and first aid, and to stay put and signal if lost [S39].

**Market implication:** the connectivity gap is real, but it is not solved by another live-location map. It is solved by preparation, a plan that survives offline, and a clear fallback to 112. That is compatible with Dala Safe’s offline-first, no-monitoring scope. It is not compatible with promising satellite, mesh, or automatic rescue.

---

## 4. What users have to do today

This table is a job-level synthesis, not a claim about how any individual behaves. It shows why the current patchwork is fragile.

| Job | Current workaround | Failure mode | Sources |
|---|---|---|---|
| Decide the route and check conditions | AllTrails/Komoot/Wikiloc/2GIS, Telegram links, guide advice, weather sites | KZ trail coverage is thin; global apps are not localised; weather is a separate check; route notes are scattered | [S23]–[S30], [S32] |
| Navigate offline | 2GIS, Organic Maps, OsmAnd, AllTrails Plus; screenshots; GPX | Offline maps are passive; paid tiers; trail/backcountry detail varies; no accountability layer | [S15]–[S26] |
| Tell a trusted person | Telegram/WhatsApp message, live location, Strava Beacon, Komoot Live Tracking, phone call | Messages omit route/return/overdue instructions; live location expires or needs data; no structured artifact | [S28], [S31], [S34], [S35] |
| Notify the authorities | eQonaq/email/112, as reported for the September 2025 order | Manual, information-heavy, unclear receipt/UX; separate from the plan the user already made | [S2], [S3], [S8] |
| Remember the return time | Mental note, phone alarm, message to a friend, calendar | No shared expectation; contact may not know what to do; no reliable follow-up | [S39] |
| Act in an emergency | 112, 433.450 MHz radio, inReach, Apple satellite (not KZ) | Reactive; coverage/charging; radio licensing unverified; satellite not available/affordable | [S3], [S11], [S36], [S37] |

**Key observation:** the market is rich in *maps* and *messages*, but thin in the artifact that connects them: a trip-specific plan that a contact can read, a reminder that the traveller controls, and offline guidance that is available when the map is not.

---

## 5. Comparison matrix

Status is for the product/feature as checked on 2026-10-20. “No” means not verified in the reviewed sources, not necessarily impossible. Store ratings/downloads are not active users.

| Product / channel | Status | KZ availability | Offline capability | Plan / share | Live location / reminder | Emergency / official role | Languages / price | Main gap for Dala Safe | Sources |
|---|---|---|---|---|---|---|---|---|---|
| **eQonaq** | `VERIFIED LIVE` | Official KZ system; Android/iOS | No offline maps; route notification is an online/admin flow | Migration/accommodation registration; route notification via app per MChS order | No consumer live tracking or return reminder verified | Official registration and route-notification channel; not dispatch | kk/ru/en; free | Registration-first UX; low store ratings; route flow undocumented; not a trip-planning companion | [S1], [S2], [S8], [S9], [S10] |
| **MChS notification (eQonaq / email / 112)** | `VERIFIED LIVE` | KZ official | No | Requires names, contacts, route, group, overnight details | No | Official notification; authorities register submissions | Languages of the notification flow unverified | Manual and separate from the user’s plan; receipt/response unverified | [S2], [S3], [S5] |
| **Tau Go** | `ANNOUNCED` | Planned KZ government app | Planned offline/2GIS integration | Planned navigation and DChS integration | Unknown | Planned DChS database integration | Unknown | Announced 2023; no live listing found; scope may overlap | [S12] |
| **TravelStan / Kazakhstan.travel** | `ANNOUNCED` | Planned national platform | Unknown | Travel discovery/planning, not safety workflow | Unknown | Not an emergency channel | 8 languages planned for the national portal | Not a safety check-in product; status/scope unverified | [S8], [S13], [S14] |
| **2GIS** | `VERIFIED LIVE` | KZ; free | Offline city/region maps and navigator | Route/POI search, guidebook, directory | “Friends on Map” live location; connectivity requirement not stated | No 112 integration or trip registration | English + 10 languages; free | Urban-first; trail/backcountry safety unverified; no structured safety plan | [S15], [S16] |
| **Yandex Maps** | `VERIFIED LIVE` | KZ/global; price not reviewed | Offline maps supported | Navigation product; planning/share not reviewed | Live-location feature not verified in this review | No 112 integration | Languages/pricing not reviewed | Navigation-first; no verified safety workflow | [S33] |
| **Organic Maps** | `VERIFIED LIVE` | Global; free | Full offline OSM maps/GPS; features work without internet | Route planning/tracks; GPX support not verified | No live share/check-in verified | No | Many languages; free; no ads/tracking | No accountability layer; KZ trail quality depends on OSM; no official guidance | [S17], [S18] |
| **OsmAnd** | `VERIFIED LIVE` | Global; freemium | Full offline maps; global navigation | Route planning/tracks; GPX | Tracker plugin: Android-only, via Telegram, requires internet | No | Many languages; in-app purchases | Complex UI; live sharing is fragile; no return reminder or check-in | [S19], [S20], [S21] |
| **AllTrails** | `VERIFIED LIVE` | KZ; free + paid Plus/Peak | Offline maps with paid Plus | Trail discovery, reviews, planning, activity recording | No current live tracking verified in this review | No 112/official registration | EN + 10; no RU/KK; Plus 11,290₸, Peak 25,000₸ (billing period not shown) | 31 Almaty trails; paid offline; not local-language; not a safety-plan artifact | [S22]–[S26] |
| **Komoot** | `VERIFIED LIVE` | Global; freemium | Offline maps with Premium | Route planning, turn-by-turn, voice, rerouting | Live Tracking shares location, route, battery, ETA with safety contacts (Premium) | No | Premium subscription; KZ localisation unverified | Global product; live tracking needs connection; no overdue escalation or KZ official workflow | [S27], [S28] |
| **Wikiloc** | `VERIFIED LIVE` | Global; freemium | Offline navigation; internet needed to search/save/download | Trail search, planning, navigation | Live tracking under Premium; internet required | No | 14-day trial; 21.97M members self-reported | KZ localisation/density unverified; no check-in | [S29] |
| **Gaia GPS** | `VERIFIED LIVE` | Global; free + Premium | Offline maps with Premium; Gaia Topo free | Planning, tracking, layered maps | Live/emergency features not verified | No | Subscription; languages not reviewed | No KZ safety workflow; exact live/emergency capability unverified | [S30] |
| **Strava Beacon** | `VERIFIED LIVE` | Global; subscription | Not a primary offline map product | Activity recording; share live location with up to 3 contacts | ~15-second updates depending on cell service; requires cell service | No dispatch | Subscription; languages not reviewed | Not a trip plan; no return-time reminder; no overdue action | [S31] |
| **Telegram / WhatsApp live location** | `VERIFIED LIVE` | Global; free | No | Chat-based coordination | Telegram max 8h; WhatsApp user-selected duration; both need data/permission | No | Free; chat languages vary by user | Ephemeral, unstructured, contact must monitor manually; no offline plan | [S34], [S35] |
| **Apple Emergency SOS via satellite** | `VERIFIED LIVE` globally; **not available in KZ** | iPhone 14+ | Satellite SOS outside cellular/Wi-Fi | No trip planning | No | Contacts emergency services via satellite in supported countries | Hardware; supported-country list | Not available in Kazakhstan; not a planning/sharing product | [S36] |
| **Garmin inReach** | `VERIFIED LIVE` globally; KZ regulatory status `UNVERIFIED` | Hardware + subscription | Offline GPS/navigation on device | Route/tracking; messaging | Live tracking and two-way messaging via Iridium | SOS dispatch with subscription; no cost/insurance coverage | Hardware + subscription | Expensive/niche; KZ permission unclear; no local workflow | [S37] |
| **112** | `VERIFIED LIVE` | KZ | No | No | No | Unified 24/7 emergency dispatch; 101/102/103/104; free | Language support not documented in source | Reactive only; no consumer app verified; no trip plan | [S11] |

---

## 6. Detailed profiles

### 6.1 eQonaq and the official notification layer

**What it is.** eQonaq is a state tourist-flow and migration system, launched in November 2020. It supports passport recognition for 190+ countries, integration with the Migration Police via SmartBridge, a stay-location register, tourist-flow analytics, and BedTax infrastructure [S1]. It is not a hiking app.

**What changed.** Since September 2025, the MChS order makes eQonaq one of the channels for notifying authorities about routes in high-risk areas, alongside territorial email and 112 [S2][S8]. The required data is detailed: identity, contacts, group size, route start/end, length, overnight/rest places [S2].

**What is verified.** eQonaq is live; the order and its channels are reported by state media and a gov.kz release; the minister confirmed the route-notification use in June 2026 [S2][S3][S8]. The app is free, available on Android/iOS, and supports kk/ru/en [S9][S10].

**What is not verified.** The exact in-app route-notification flow, whether it produces a receipt, how DChS uses the data, whether the return time is monitored, and whether English is usable in that flow. The primary legal text was inaccessible [S4].

**Market signal.** The Google Play listing shows 100K+ downloads but a 1.9-star rating from 504 reviews; the KZ App Store shows 1.6 from 68 ratings [S9][S10]. Reviews visible in the listings describe login/registration failures, including an SMS-code issue [S9][S10]. This is a signal of UX friction in the registration product, not proof that the route flow is bad. Do not generalise it into “users hate eQonaq.”

**Implication.** Do not build a registration backend or claim integration. The user-side opportunity is to help assemble the plan and provide a checklist/link to the official channel, subject to the scope freeze. The official process is a reason users need a plan artifact, not a reason to clone eQonaq.

### 6.2 Tau Go, TravelStan, and Kazakhstan.travel

**Tau Go.** Announced in February 2023 by the then first vice-minister for emergency situations. The stated plan was a unified tourist-navigation system and mobile smart navigator integrated with DChS databases, with mountain routes digitised and tied to 2GIS for offline operation [S12]. No live app listing, launch page, or updated official product page was found as of 2026-10-20. Label `ANNOUNCED`. Treat it as a strategic risk, not a current competitor.

**TravelStan.** Announced in April 2025 as a unified travel app planned for end-2025 [S13][S14]. No live app was verified. Label `ANNOUNCED`.

**Kazakhstan.travel.** The government says a national portal is planned for December 2026, with eight languages, routes, events, publications, a photo bank, and 3D tours [S8]. This is a discovery/portfolio platform, not a safety-planning or check-in product. Label `ANNOUNCED`.

**Implication.** The government’s direction is consolidation: one portal, one registration system, more digital tourism services. A small product that depends on being the official registration layer is fragile. A product that owns the pre-trip preparation and trusted-contact workflow, and links out to official systems, is more defensible — but still exposed if the government builds the same UX.

### 6.3 2GIS

**Strengths.** A major local map product: free, offline maps and navigation, a guidebook, and a “Friends on Map” live-location feature [S15][S16].

**Limits.** It is a directory/navigation product. The reviewed listing does not present a structured pre-trip safety plan, a trusted-contact artifact, a return reminder, or an official notification workflow. Offline maps are strong for cities and known places; backcountry/trail detail was not verified.

Yandex Maps also supports offline maps [S33]; its live-location feature was not verified in this review, so it is not counted as a safety tool. It reinforces the same point: offline navigation is a commodity, not the gap.

**Implication.** Do not compete on map coverage. Assume the user may keep 2GIS or Yandex Maps. Dala Safe should accept a place/route name or GPX, not attempt to replace the map. “Works alongside 2GIS” is a more credible position than “better than 2GIS.”

### 6.4 Organic Maps and OsmAnd

**Organic Maps.** Free, privacy-oriented, OpenStreetMap-based, no ads/tracking, and explicitly designed to work fully offline [S17]. It reached 6M installs in December 2025 [S18]. Installs are not active users.

**OsmAnd.** Full offline maps and navigation on Android/iOS, with a large feature set, 10M+ downloads, and in-app purchases [S19][S21]. The OsmAnd Tracker plugin shares live location through Telegram, is Android-only, and requires internet; contacts do not need OsmAnd [S20].

**Implication.** Offline maps are a solved problem for motivated users. The unmet job is not “show my position on a map”; it is “make sure someone has the plan, the return time, and the right emergency actions.” Dala Safe should interoperate with GPX and link out, not rebuild either app.

### 6.5 AllTrails, Komoot, Wikiloc, and Gaia GPS

**AllTrails.** A large global trail-discovery product in the reviewed set. In Kazakhstan it has 38 trails, 31 in Almaty; offline maps require Plus; the KZ listing is EN + 10 languages without Russian or Kazakh [S22]–[S26]. The paid tiers are listed at 11,290₸ (Plus) and 25,000₸ (Peak), with the billing period not shown in the captured listing [S25]. It is a discovery/recording product, not a local safety-planning artifact.

**Komoot.** Route planning, turn-by-turn, offline maps under Premium, and Live Tracking that shares location, route, battery level, and ETA with safety contacts [S27][S28]. It is the closest global product to the “share my progress” job, but it requires a connection, is route/activity-centric, and does not provide a KZ official-notification workflow or an overdue action.

**Wikiloc.** Large global trail library, offline navigation, internet required for search/save/download, 14-day trial, live tracking under Premium, and a self-reported 21.97M members [S29]. Members are not active users. KZ-specific trail density and localisation were not verified.

**Gaia GPS.** Offline maps with Premium, Gaia Topo free, layered maps, and tracking [S30]. Specific live/emergency features were not verified; the dedicated offline-maps help page returned 403. It is a mapping tool, not a local safety workflow.

**Implication.** Global apps validate willingness to pay for offline maps and live tracking, but they leave a gap in local language, official context, and a simple trusted-contact artifact. The gap is real but narrow; it is not a “better AllTrails” opportunity.

### 6.6 Strava Beacon, Telegram, and WhatsApp

**Strava Beacon.** Shares real-time location with up to three safety contacts via a unique URL/text, updating about every 15 seconds depending on cell service; it requires cell service and does not dispatch help [S31]. It is tied to an activity recording, not a trip plan.

**Telegram.** Live location can be broadcast to any chat in real time, for a maximum of 8 hours, and requires internet [S34]. It is free, familiar, and good enough for a day hike with coverage. It is not a structured plan, a return reminder, or an offline artifact.

**WhatsApp.** Live location is end-to-end encrypted, user-timed, and requires location permission; the help page does not state a fixed maximum duration [S35]. Like Telegram, it depends on the contact watching the chat and on connectivity.

**Implication.** Messaging is the default competitor, not a feature to clone. Dala Safe should generate the message/artifact that users paste into Telegram/WhatsApp, rather than trying to replace the chat. The differentiator is structure and offline availability, not real-time chat.

### 6.7 Apple satellite SOS, Garmin inReach, and 112

**Apple.** Emergency SOS via satellite requires iPhone 14 or later and is available only in supported countries; Kazakhstan is not on Apple’s availability list [S36]. International travellers may use it only in supported countries. It is not a solution for the initial Almaty segment.

**Garmin inReach.** Iridium global coverage, two-way messaging, live tracking, and 24/7 SOS with a subscription; Garmin notes that some countries require prior permission/registration or prohibit satellite communicators, and SOS does not cover rescue/medical costs [S37]. Kazakhstan-specific permission and pricing were not verified. It is a valuable tool for a niche, not a mass-market substitute.

**112.** The unified 24/7 emergency number, free from any phone; 101 fire/rescue, 102 police, 103 ambulance, 104 gas [S11]. The canonical number list and scope labels are maintained in `docs/safety-sources.md`. No dedicated Kazakhstan 112 consumer app was verified.

Almaty’s rescue services respond to mountain incidents, and local media report such rescues [S38]. That is relevant context, not a product integration. Dala Safe does not coordinate, dispatch, or notify rescuers.

**Implication.** The emergency layer is official and reactive. Dala Safe should route to 112, not pretend to be a dispatch or satellite service. Its contribution is making the first two minutes easier: plan, location, contacts, phrases, and the instruction to call 112.

---

## 7. Three most important problems

These are candidate problems, aligned with `docs/product-definition.md` P1–P3. They are **not validated user findings**. Confidence reflects desk evidence only.

### P1 — Preparation is fragmented, and “ready” is judged by feel

**Problem statement (hypothesis).** Trip information is spread across chats, screenshots, maps, notes, memory, and other people. There is no single place that turns “we’re going hiking” into a checked, trip-specific readiness state, so avoidable omissions happen.

**Desk evidence.**
- Official guidance asks hikers to plan, study the route and difficulty, check weather, tell relatives the route and return time, carry map/compass/GPS/communications/first aid, and not go alone [S39].
- The tools that support those tasks are separate: 2GIS/Organic/OsmAnd for maps, AllTrails/Komoot/Wikiloc for routes, Telegram/WhatsApp for coordination, weather sites for forecasts [S15]–[S35].
- AllTrails’ KZ catalogue is thin and not localised in Russian/Kazakh [S23]–[S25], increasing the chance that local knowledge lives outside the app.

**Confidence:** Low–medium. The fragmentation is plausible and visible in the tool landscape, but no user has been observed.

**What would falsify it:** most target users describe one stable routine with no meaningful omissions; existing tools are sufficient; preparation problems are rare or trivial.

### P2 — The safety plan is rarely shared in a form a contact can act on

**Problem statement (hypothesis).** People often “tell someone,” but the message omits the route, expected return time, group size, vehicle, and what the contact should do if the group is overdue. The plan exists in the hiker’s head, not in a form the trusted contact can use at the moment it matters. The official notification process is separate and more administrative.

**Desk evidence.**
- The September 2025 order requires a detailed notification: identity, contacts, group size, route start/end, length, overnight/rest places [S2]. That is a strong signal that the information matters, but it is not evidence that users share it well informally.
- Mainstream sharing tools are chat-based and ephemeral: Telegram live location max 8h [S34], WhatsApp live location user-timed [S35], Strava Beacon tied to an activity and cell service [S31].
- We did not verify a reviewed consumer product that combines a structured trusted-contact plan, a return reminder, and offline emergency essentials for this audience.
- eQonaq is registration-first, with low store ratings and visible login/registration complaints [S9][S10]; it is not a consumer plan-sharing UX.

**Confidence:** Medium. The official requirement and tool gaps are well sourced; the user behaviour is not.

**What would falsify it:** most target users already send a complete plan with a clear return time and overdue instruction; contacts know what to do; registration is easy and widely completed.

### P3 — When conditions change or connectivity fails, the right actions are hard to retrieve

**Problem statement (hypothesis).** Above the tree line, in a valley, or after a wrong turn, users may have no signal and limited time. Emergency numbers, coordinates, useful Kazakh/Russian phrases, and simple decision rules are scattered or unavailable. The problem is not a lack of information; it is retrieving the right few things under stress and knowing which guidance is official.

**Desk evidence.**
- Live-location tools depend on connectivity and/or expire: Telegram 8h [S34], WhatsApp data/permission [S35], Strava Beacon cell service [S31], OsmAnd Tracker internet/Telegram [S20].
- Apple satellite SOS is not available in Kazakhstan [S36]; inReach is a niche hardware subscription with country-specific caveats [S37].
- Offline maps are passive: 2GIS, Organic Maps, OsmAnd, and AllTrails Plus can show a map, but do not provide a trip-specific emergency script or a trusted-contact artifact [S15]–[S26].
- Official guidance includes a lost-person procedure and advises carrying communications and first aid, but it is not packaged as an offline, trip-specific action card [S39].

**Confidence:** Medium–high on the tool limitation; low on how often the target segment actually loses connectivity.

**What would falsify it:** connectivity is reliable on the routes users actually take; existing screenshots/downloads are sufficient; users do not prioritise offline emergency access.

### 7.1 Priority implication

`docs/product-definition.md` sets the build order as **P2 → P1 → P3**. Market evidence is strongest for P2 and P3; P1 is the least directly evidenced. That does not justify changing the product definition now. It does justify testing P2 and P3 first in the P1-S2 interviews, and revisiting the order only with recorded evidence.

### 7.2 Adjacent problem not in the MVP

There is a broader gap in **overdue check-in and escalation**: live-location tools show where someone is, but they do not reliably answer “what happens if the group does not return?” The MVP deliberately excludes automatic missed-check-in escalation, server timers, SMS, and monitoring because those require a backend and create a monitoring promise the product cannot keep. Record this as a future opportunity, not an MVP feature.

---

## 8. Initial target segment (hypothesis)

Aligned with `docs/product-definition.md` §2, and still unvalidated:

**Primary:** independent hikers and small groups (1–10 people) around Almaty who take day hikes or 1–3 day treks, plan informally on phones and in chats, may lose connectivity, need Kazakh/Russian/English, and do not have a professional guide or support team.

**Secondary, not MVP:** informal group organizers; international visitors with limited Russian/Kazakh; guides, clubs, and tour operators (future partnership, separate needs).

**Explicitly not primary:** professional rescue services, expedition teams with satellite communicators, and users who expect certified navigation or live dispatch.

**Market note.** No reliable public estimate of this segment’s size, app spend, or willingness to pay was found. Do not use eQonaq tourist arrivals, app downloads, or store ratings as a proxy. Those measure different populations.

---

## 9. Proposed differentiation (hypothesis)

### 9.1 Positioning statement

> For independent hikers and small groups around Almaty who plan informally and lose connectivity, Dala Safe is a local-first mobile web app that turns a trip into a checked readiness state, a shareable safety plan, a return reminder, and offline emergency essentials — in Kazakh, Russian, and English.

This is the positioning already recorded in `docs/product-definition.md` §8. Market research supports it as a **hypothesis**, not a proven position.

### 9.2 What the differentiation is — and is not

**It is:**
- An integrated, low-friction loop: prepare → share → remind → act.
- A local-language, local-context workflow aligned with official guidance, 112, and the September 2025 notification rule.
- Offline-capable after first load, with honest labels about what is cached and what is not.
- A complement to maps, eQonaq, Telegram/WhatsApp, and 112 — not a replacement.

**It is not:**
- A map, navigator, or trail database.
- A live-tracking or monitoring service.
- An emergency dispatch, rescue guarantee, or satellite/SMS integration.
- An official registration system or a claimed government partner.
- A social network, guide marketplace, or trip-booking platform.

### 9.3 Why this wedge, not maps or live tracking

- **Maps are occupied.** 2GIS, Organic Maps, and OsmAnd are strong, free/cheap, and offline [S15]–[S21]. Building map coverage would be expensive and undifferentiated.
- **Live tracking is occupied or fragile.** Telegram/WhatsApp are free and familiar; Strava/Komoot/Wikiloc have live sharing; all depend on connectivity and none solves the return-time/overdue job [S28][S31][S34][S35].
- **The official process creates a plan-shaped need.** The September 2025 order requires detailed route/group information [S2]. A user who assembles that information already has most of a safety plan; the missing step is making it usable for a trusted contact and for the user offline.
- **Localisation is a real but temporary advantage.** AllTrails lacks Russian/Kazakh in KZ [S25]. That is an opening, not a moat.

### 9.4 Why now

- The September 2025 notification rule created a new awareness and administrative moment [S2][S3].
- Government digitisation (eQonaq production, Kazakhstan.travel, Tau Go) is increasing attention to tourism safety, but the user-side workflow remains fragmented [S8][S12].
- Global apps have thin KZ trail coverage and weak localisation [S23]–[S25].
- Apple satellite SOS is not available in Kazakhstan, so the “satellite will save me” fallback is not available to the mass market [S36].
- The MVP can be built as a local-first PWA without a backend, matching the product definition’s constraints.

### 9.5 Defensibility

The defensibility is **not** technology. It is:
- A trustworthy, localised workflow that users repeat before every trip.
- Relationships with guides, clubs, tourism bodies, and safety organisations (only if real and written).
- A track record of honest boundaries and comprehension, which matters in a safety category.
- Speed of learning about a narrow segment.

The moat is weak. A government app, 2GIS, or a global trail app could copy the workflow. The response is to validate the job quickly, stay complementary, and avoid building assets that incumbents already own.

---

## 10. Competitive risks and opportunities

| Risk / opportunity | Evidence | Impact | Mitigation / test |
|---|---|---|---|
| **Government absorption** | eQonaq route notification [S2][S8]; Tau Go planned with DChS/2GIS [S12]; Kazakhstan.travel planned [S8] | High | Do not build registration or official data. Position as user-side preparation/planning; seek written partnership only if real; keep the product useful even without integration. |
| **Map incumbents** | 2GIS, Organic Maps, and OsmAnd are free or freemium and strong offline [S15]–[S21] | High | Do not rebuild maps. Accept GPX/place names; link out; focus on plan/share/reminder/offline essentials. |
| **Global trail apps** | AllTrails, Komoot, Wikiloc, Gaia have route libraries and tracking [S22]–[S30] | Medium | Compete on local language, official context, and the trusted-contact artifact — not on trail volume. |
| **Messaging substitutes** | Telegram/WhatsApp live location is free and familiar [S34][S35] | High | Generate the message/artifact users paste into chat; do not clone chat or live tracking. |
| **Satellite expectations** | Apple SOS not in KZ [S36]; inReach niche/regulatory [S37] | Medium | Never imply satellite/SOS. Route to 112 and recommend appropriate devices only as general information. |
| **False sense of safety** | Product could be mistaken for monitoring/dispatch | High | Explicit “not sent / not monitored / not a rescue guarantee” labels; comprehension tests are release gates (see `docs/user-research-plan.md` H10). |
| **Liability** | Safety claims can create duty-of-care expectations | High | Legal review; terms; no rescue guarantee; no automatic alerts; incident protocol; insurance assessment. |
| **Privacy** | Location, contacts, route, group data are sensitive | High | Local-first; data minimisation; no analytics in MVP; consent; export/delete; no contact upload. |
| **Cold start** | Contacts should not need the app | Medium | Message/calendar artifact works without recipient onboarding; no network effect required. |
| **Monetisation** | No evidence of willingness to pay | High | Free core; test paid pro for guides/operators; B2B before consumer subscription. |
| **Content accuracy** | Rules and guidance change | Medium | Date-stamped sources; review workflow; link to official pages; no invented thresholds. |
| **Language quality** | kk/ru/en safety wording is high-stakes | Medium | Human review of all safety strings; no machine-only release (see `docs/safety-sources.md`). |
| **Regulatory ambiguity** | eQonaq integration, radio licensing, satellite permission are unverified | Medium | No claims; legal review; ask officials; record answers. |
| **Opportunity: P2 wedge** | Official notification + weak sharing tools | High | Prototype the shareable plan/return reminder; test with real upcoming trips. |
| **Opportunity: localisation** | AllTrails lacks RU/KK in KZ [S25] | Medium | kk/ru/en from day one; human-reviewed terminology. |
| **Opportunity: B2B** | Hypothesis: guides/clubs may need group accountability; the MVP is not built for them | Medium | Interview guides; test a separate pro workflow later; do not distort MVP. |
| **Opportunity: partnerships** | DChS, eQonaq, 2GIS, tourism bodies, clubs | Medium | Discovery conversations; no partnership claim until written; start with distribution/education, not API dependency. |

---

## 11. Open research questions

Priorities are for the next validation round, not a claim that all must be answered before building.

### P0 — answers change the wedge

1. Do target users already share a complete plan with a trusted contact? What exactly do they send, and what does the contact do if they are late? (P2)
2. What do users actually keep offline, and what do they wish they had when signal drops? (P3)
3. Is the September 2025 notification requirement known, understood, and completed? What is the actual eQonaq/email/112 experience, including receipt and follow-up? (Official context)
4. Would users use a return reminder (.ics or phone alarm)? Would they share a plan with a partner/friend/parent? (P2)
5. Is the target segment willing to change any part of its routine for this, or is “2GIS + Telegram + a screenshot” good enough? (Differentiation)

### P1 — answers change scope or business model

6. Which languages are actually used for planning and emergency information, and by whom? Is Kazakh-first materially different from Russian-first?
7. Is local-only storage (no account/sync) acceptable, or does it block real use?
8. Would users pay, and who pays: consumers, guides, clubs, operators, tourism bodies? At what price?
9. Can Dala Safe partner with DChS, eQonaq/Kazakh Tourism, 2GIS, or guide associations? Under what data/legal terms?
10. What is the current status and scope of Tau Go, TravelStan, and Kazakhstan.travel? Do they intend to cover planning/sharing?
11. What is the legal/operational status of 433.450 MHz radio and satellite communicators in Kazakhstan?
12. What map/GPX licensing and route-data quality are feasible without rebuilding maps?
13. What liability, insurance, and emergency-alert rules apply to a product that shares plans and reminders?
14. What are the battery, connectivity, and device patterns on the actual routes?
15. What do guides/operators need, and is that a separate product or a distribution channel?

---

## 12. Validation plan (market-specific)

Execute the interview/usability method in `docs/user-research-plan.md`; do not create a parallel study. Add these market checks:

### 12.1 Secondary verification (1–2 days)

- Read the full MChS order on adilet or obtain a readable copy; confirm the exact obligations, scope, and effective date.
- Ask DChS Almaty / eQonaq for the route-notification procedure and a walkthrough. **Do not submit a false route notification.**
- Re-check Tau Go, TravelStan, and Kazakhstan.travel for live listings/launch updates.
- Confirm Apple satellite availability and Garmin inReach Kazakhstan rules from official sources.
- Re-review `docs/safety-sources.md` UNS-03 and UNS-05 with the new sources.

### 12.2 Problem interviews (8–12, via P1-S2)

- Recruit independent hikers and small-group organizers; include at least 3 Russian-first and 3 Kazakh-first sessions, and 2 guides as a secondary segment.
- Ask for the **last real trip**: what they used, what they sent, what they forgot, what happened when connectivity dropped.
- Ask them to draft the message they would send to a trusted contact, then compare it with the official notification fields and the “what if overdue” instruction. Record omissions.
- Do not describe Dala Safe until after elicitation. Do not ask “would you use this?” as the primary evidence.

### 12.3 Artifact comprehension test

- Show a paper/clickable mock of a one-page safety plan, a share message, and an offline emergency card.
- Test whether users can state: what was sent, who has it, when they are expected back, what the contact should do, and that the app does not monitor.
- Any belief that the app monitors or contacts rescuers is a severity-1 failure, consistent with the existing research plan.

### 12.4 Landing-page / fake-door test (optional)

- Two value propositions: “a plan your contact can act on” vs “offline emergency essentials.”
- Measure sign-ups/requests for a pilot; do not use fake testimonials, fake user counts, or false scarcity.
- Treat sign-ups as interest, not adoption.

### 12.5 Price and B2B discovery (after problem validation)

- 5–8 interviews with guides/clubs/operators; ask about group accountability, liability, and willingness to pay.
- Test a free core + paid pro concept; do not assume a consumer subscription.
- Ask tourism bodies about distribution/education partnerships, not endorsement.

### 12.6 Decision gates

- **Proceed with P2 as the wedge** if at least half of 8+ participants describe a concrete plan-sharing gap and cannot state an actionable return/overdue instruction.
- **Prioritise P3** if connectivity/offline retrieval is mentioned unprompted by at least half and existing workarounds are insufficient.
- **Do not change the P2 → P1 → P3 build order** without a recorded finding and a dated update to `docs/product-definition.md`.
- **Stop or reframe** if most participants have a stable routine, complete sharing, and no offline pain; the differentiation would not be credible.

---

## 13. Research limitations

- **No primary user evidence.** Zero interviews, zero usability sessions, zero surveys. Every user-behaviour statement is a hypothesis.
- **Desk research only.** No app was installed or field-tested; feature claims come from listings and documentation.
- **Store data are volatile and non-representative.** Ratings, downloads, and prices change by storefront/date; downloads are not active users. One eQonaq Google Play capture showed 1.9★/504 reviews, while a later search snippet showed 1.8★/573; treat both as directional only.
- **Primary legal text inaccessible.** adilet was JavaScript-blocked; the order is verified through official/state-media reporting, not a direct read. Exact wording, scope, and enforcement remain `UNVERIFIED`.
- **Official pages are JavaScript-rendered.** The Almaty DChS release was read through a search snippet and corroborated by state media; the radio recommendation is not independently verified.
- **No market-size estimate.** No reliable public data on the number of Almaty hikers, app spend, or willingness to pay was found. Do not use tourism arrivals or downloads as a proxy.
- **No competitor financials or usage data.** The analysis is product/feature-based, not a market-share study.
- **Language coverage.** English/Russian sources were searched; Kazakh-language sources were not exhaustively reviewed. Translation nuances may affect interpretation.
- **Dynamic sources.** Government plans, app features, and prices can change after 2026-10-20.
- **Conflicting local details.** Reports on mountain huts and rescue points conflict (see `docs/safety-sources.md` C-01); this document does not use those counts.
- **No legal advice.** Liability, privacy, satellite, radio, and registration conclusions require qualified review.

---

## 14. Source register

All URLs checked 2026-10-20 unless otherwise stated. “Used for” is the factual scope, not an endorsement.

| ID | Publisher / type | Title or page | URL | Published | Used for | Verification |
|---|---|---|---|---|---|---|
| S1 | Government of Kazakhstan / official | Information system eQonaq | https://www.gov.kz/activities/15805?lang=en | Undated; says launched Nov 2020 | eQonaq functions, 190+ passports, 54% recognition, SmartBridge, BedTax | Official; high |
| S2 | BAQ.KZ / state media | Приказ МЧС: казахстанцы обязаны информировать о маршрутах в горах | https://rus.baq.kz/prikaz-mchs-kazahstantsy-obyazany-informirovat-o-marshrutah-v-gorah_300021858/ | 2025-09-08 | MChS order, MoJ No. 36696, notification channels and required data | State media; high for reported content; primary text not read |
| S3 | Gov.kz / Almaty DChS | Алматы усиливает меры безопасности туристов в горах | https://www.gov.kz/memleket/entities/emer-almaty/press/news/details/1212915?lang=ru | Undated; checked 2026-10-20 | Effective 2025-09-09, 433.450 MHz recommendation, 10 safety rules | Official page JS-rendered; snippet used; medium |
| S4 | Adilet / official legal portal | Document V2500036696 | https://adilet.zan.kz/rus/docs/V2500036696 | Undated | Related legal document; exact correspondence to the MChS order not confirmed | `UNVERIFIED` — JS-blocked |
| S5 | Xnews / local media | В Казахстане вводят правило для туристов на фоне трагедий в горах | https://xnews.kz/2025/09/v-kazahstane-vvodiat-pravilo-dlia-turistov-na-fone-tragedij-v-gorah | 2025-09-09 | Order details; 291 operations/396 rescued/77 children/10 deaths Jan–20 Aug 2025; huts/rescue points (not used due conflict) | Local media; medium |
| S6 | Zakon.kz / local media | Регистрация перед походом: спасет ли это туристов в горах Алматы | https://www.zakon.kz/stati/6514904-registratsiya-pered-pokhodom-spaset-li-eto-turistov-v-gorakh-almaty.html | 2026-04-17 | 1,247 rescued/3 years, 173 teenagers, 174 injuries; registration via 112/rescue; post-return notification; digital plans | Local media; medium |
| S7 | Inform.kz / state media | Обязательную регистрацию туристов планируют ввести в Алматы | https://www.inform.kz/ru/obyazatelnuyu-registratsiyu-turistov-planiruyut-vvesti-v-almati-dbef7e | 2026-04-13 | Almaty group-registration system still being developed; official quote on lack of practice | State media; medium |
| S8 | BAQ.KZ / state media | Систему eQonaq планируют ввести в промышленную эксплуатацию осенью 2026 года | https://rus.baq.kz/sistemu-eqonaq-planiruyut-vvesti-osenyu-2026-goda-320030188/ | 2026-06-09 | eQonaq production autumn 2026; 900K registered users; route notification since Sept 2025; Kazakhstan.travel Dec 2026, 8 languages | State media; high for reported statements |
| S9 | Google Play / app store | eQonaq | https://play.google.com/store/apps/details?id=kz.eqonaq.app | Updated 2026-01-12 | 100K+ downloads, 1.9★/504 reviews, government, kk/ru/en, free, migration purpose | Store listing; medium; not active users |
| S10 | Apple App Store KZ / app store | eQonaq | https://apps.apple.com/kz/app/eqonaq/id1555481976 | Version 2.1.9; checked 2026-10-20 | 1.6★/68 ratings, free, English listing, reviews mention non-working/login issues | Store listing; medium; not representative |
| S11 | eGov / official | 112 emergency number | https://egov.kz/cms/ru/articles/emergency_number_112 | Undated; checked 2026-10-20 | 112 unified 24/7; 101/102/103/104; free; what to say | Official; high |
| S12 | Newshub.kz / media | В Казахстане для любителей походов в горы запускают мобильное приложение | https://newshub.kz/en/post/v-kazaxstane-dlya-lyubitelei-poxodov-v-gory-zapukayut-mobilnoe-prilozenie-1675423512 | 2023-02-03 | Tau Go announcement; DChS integration; 2GIS offline route digitisation | Media; medium; no live app found |
| S13 | Astana Times / media | Kazakhstan to Launch TravelStan All-in-One Travel App This Year | https://astanatimes.com/2025/04/kazakhstan-to-launch-travelstan-all-in-one-travel-app-this-year | 2025-04-23 | TravelStan announcement/end-2025 plan | Media; medium; no live app verified |
| S14 | Kazinform / state media | Kazakhstan to launch unified TravelStan travel app by year-end | https://qazinform.com/news/kazakhstan-to-launch-unified-travelstan-travel-app-by-yearend-3033ab | 2025 | TravelStan announcement | State media; medium |
| S15 | Apple App Store KZ / app store | 2GIS: Map, Navigation, Tracker | https://apps.apple.com/kz/app/2gis-map-navigation-tracker/id481627348 | Checked 2026-10-20 | Free; 501K ratings/4.9; offline navigator; Friends on Map; EN + 10; guidebook | Store listing; medium; ratings not active users |
| S16 | 2GIS / vendor | 2GIS Kazakhstan | https://2gis.kz/ | Checked 2026-10-20 | Maps, routes, friends, guide, housing | Vendor site; medium |
| S17 | Organic Maps / vendor | Organic Maps | https://organicmaps.app/ | Checked 2026-10-20 | Free offline GPS, no ads/tracking, OSM, 100% features offline | Vendor site; medium |
| S18 | Organic Maps / vendor | 2025 year in review | https://organicmaps.app/news/2025-12-31/organic-maps-2025-year-in-review/ | 2025-12-31 | 6M installs (not active users) | Vendor blog; medium |
| S19 | OsmAnd / vendor docs | User guide | https://osmand.net/docs/user/ | Checked 2026-10-20 | Global offline maps/navigation on Android/iOS | Vendor docs; high for feature claims |
| S20 | OsmAnd / vendor docs | OsmAnd Tracker plugin | https://docs.osmand.net/docs/user/plugins/osmand-tracker | Checked 2026-10-20 | Android-only; Telegram; internet; contacts do not need OsmAnd | Vendor docs; high |
| S21 | Google Play / app store | OsmAnd | https://play.google.com/store/apps/details?id=net.osmand&hl=en | Checked 2026-10-20 | 4.4★/253K reviews; 10M+ downloads; in-app purchases | Store listing; medium; not active users |
| S22 | AllTrails / vendor press | AllTrails introduces Offline Parks | https://www.alltrails.com/press/alltrails-introduces-offline-parks | 2024-11-21 | Offline full park map/routes/reviews for AllTrails+ paid | Vendor press; high for claim |
| S23 | AllTrails / vendor | Best trails and hikes in Kazakhstan | https://www.alltrails.com/kazakhstan | Checked 2026-10-20 | 38 hiking trails nationally | Vendor page; medium |
| S24 | AllTrails / vendor | Trails in Almaty | https://www.alltrails.com/kazakhstan/almaty | Checked 2026-10-20 | 31 trails: 23 hiking, 7 backpacking, 5 walking; 4.4/912 | Vendor page; medium |
| S25 | Apple App Store KZ / app store | AllTrails: Hike, Run & Walk | https://apps.apple.com/kz/app/alltrails-hike-run-walk/id405075943 | Checked 2026-10-20 | EN + 10 (no RU/KK); Plus 11,290₸; Peak 25,000₸; free + IAP | Store listing; medium; billing period not shown |
| S26 | Google Play / app store | AllTrails: Hike, Bike & Run | https://play.google.com/store/apps/details?id=com.alltrails.alltrails&hl=en_US | Updated 2026-10-14 | 4.1★/382K; offline maps/wrong-turn under subscription; 10M+ downloads | Store listing; medium |
| S27 | Komoot / vendor | Features | https://www.komoot.com/features | Checked 2026-10-20 | Turn-by-turn, offline maps, voice, rerouting; Premium planning | Vendor site; medium |
| S28 | Komoot / vendor | Live Tracking | https://www.komoot.com/premium/live | Checked 2026-10-20 | Shares location, route, battery, ETA with safety contacts; Premium | Vendor site; high for claim |
| S29 | Wikiloc / vendor | Premium | https://www.wikiloc.com/premium | Checked 2026-10-20 | Offline navigation; internet for search/save/download; 14-day trial; live tracking; 21.97M members self-reported | Vendor site; medium; members not active users |
| S30 | Gaia GPS / vendor help | How to Use Gaia GPS | https://help.gaiagps.com/hc/en-us/articles/9067661557399-How-to-Use-Gaia-GPS | Checked 2026-10-20 | Offline maps with Premium; Gaia Topo free; layers; tracking | Vendor help; medium |
| S31 | Strava / vendor help | Strava Beacon | https://support.strava.com/en-us/articles/15401829-strava-beacon | Updated 2026-08-17 | Up to 3 contacts; unique URL/text; ~15s updates; cell service required; no dispatch | Vendor help; high for claim |
| S32 | Windy / vendor | Windy articles | https://www.windy.com/articles/23730 | Checked 2026-10-20 | Weather forecast; some features Premium; ad-free | Vendor site; low–medium; not a safety app |
| S33 | Yandex / vendor docs | Offline maps (MapKit iOS) | https://yandex.com/maps-api/docs/mapkit/ios/generated/tutorials/map_offline.html | Checked 2026-10-20 | Offline maps support | Vendor docs; medium; not central |
| S34 | Telegram / vendor | Live Locations | https://telegram.org/blog/live-locations | Checked 2026-10-20 | Real-time location; max 8 hours; internet required | Vendor blog; high for claim |
| S35 | WhatsApp / vendor help | How to use live location | https://faq.whatsapp.com/480865177351335 | Checked 2026-10-20 | User-selected duration; E2E; permission; stop anytime; no fixed max stated | Vendor help; high for claim |
| S36 | Apple / vendor support | Emergency SOS via satellite | https://support.apple.com/en-is/101573 | Checked 2026-10-20 | iPhone 14+; availability list does not include Kazakhstan; international travellers only in supported countries | Vendor support; high for availability |
| S37 | Garmin / vendor support | inReach FAQ | https://support.garmin.com/en-US/?faq=BPr8T6bFcN3uxv59Cfqmq9 | Checked 2026-10-20 | Iridium global coverage; 24/7 SOS with subscription; some countries require permission/prohibit; no cost/insurance coverage | Vendor support; high for claim; KZ status unverified |
| S38 | Todayinfo / local media | Almaty mountains incident: teenager rescued | https://todayinfo.kz/en/article/almaty-mountains-incident-teenager-falls-from-cliff-rescued-by-emergency-services | 2026-05-02 | Example mountain rescue response; not used for statistics | Local media; low–medium |
| S39 | Gov.kz / MChS | МЧС рекомендует не выходить в горы в одиночку | https://www.gov.kz/memleket/entities/emer/press/news/details/599760?lang=ru | Undated; checked 2026-10-20 | Don’t go alone; tell relatives route/return; map/compass/GPS/comms/first aid; lost procedure; ~160 rescued/year, 152 this year | Official; medium; undated |

### 14.1 Blocked or unusable sources

| Source | URL | Issue | Handling |
|---|---|---|---|
| AllTrails pricing | https://www.alltrails.com/pricing | HTTP 403 | Used KZ App Store prices instead; billing period unverified |
| OsmAnd pricing | https://osmand.net/pricing | JavaScript-only | Exact pricing `UNVERIFIED`; used Play listing for IAP |
| Gaia offline maps help | https://help.gaiagps.com/hc/en-us/articles/360047131513-Download-Maps-for-Offline-Use | HTTP 403 | Used general Gaia help article; exact offline limits unverified |
| Adilet legal text | https://adilet.zan.kz/rus/docs/V2500036696 | JavaScript-blocked | Marked `UNVERIFIED`; do not quote as primary text |
| Almaty DChS release | https://www.gov.kz/memleket/entities/emer-almaty/press/news/details/1212915?lang=ru | JavaScript-rendered | Used search snippet + state-media corroboration; radio recommendation medium confidence |
| Tengrinews link from search | Not captured | Did not resolve to intended article | Not used; no citation |
| Third-party Lifeline review | https://outsideresource.com/the-best-hiking-apps-that-make-every-trail-easier-and-safer | Third-party, 2026; AllTrails official 2026 materials do not verify Lifeline | Not used as evidence; AllTrails live tracking marked “not verified” |

---

## 15. Claims that are allowed and forbidden

| Allowed (with source/date) | Forbidden without new evidence |
|---|---|
| “A September 2025 MChS order requires notification before entering listed high-risk areas, via eQonaq, email, or 112, according to state media.” | “Dala Safe registers your hike with the government.” |
| “eQonaq is a live official tourist-registration system with route-notification use reported since September 2025.” | “eQonaq is our partner / we integrate with eQonaq.” |
| “2GIS, Yandex Maps, Organic Maps, and OsmAnd offer offline maps.” | “Dala Safe has better offline maps than 2GIS.” |
| “AllTrails lists 31 trails in Almaty and is not localised in Russian/Kazakh in the KZ App Store.” | “Most Almaty hikers use AllTrails.” |
| “Telegram live location is capped at 8 hours; WhatsApp and Strava Beacon require connectivity.” | “Dala Safe tracks you when you have no signal.” |
| “Apple satellite SOS is not available in Kazakhstan.” | “Dala Safe works via satellite.” |
| “No reviewed product was verified to combine a readiness check, a shareable plan, a return reminder, and offline essentials for this audience.” | “Dala Safe is the first/only/market-leading product.” |
| “The proposed differentiation is a hypothesis to be tested.” | “Users want this” / “X% of hikers…” without research. |

---

## 16. Changelog

| Date | Change | By |
|---|---|---|
| 2026-10-20 | Initial market and competitor research: official notification context, 17-row comparison matrix, detailed profiles, three problem hypotheses, differentiation hypothesis, risks, open questions, validation plan, source register, blocked sources | P1-S1 |
