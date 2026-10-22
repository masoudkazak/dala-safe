# Safety Sources and Review Register

| Field | Value |
|---|---|
| Project | Dala Safe |
| Session | P1-S4 |
| Document status | Working register — not approved safety content |
| Last checked | 2026-10-20 |
| Scope | Kazakhstan emergency numbers, Almaty mountain rescue, official mountain-safety guidance, official weather/hazard warnings |
| Default review status | `human-review-required` for every item until a named reviewer signs off |
| Product rule | No safety item may ship as authoritative without `sourceUrl`, `lastVerified`, `verifiedBy`, and a reviewed `reviewStatus` |

> Dala Safe is not an emergency dispatch service and does not guarantee rescue,
> connectivity, GPS accuracy, response time, or the continued accuracy of any
> number below. This register separates what an official publisher actually says
> from what is secondary, conflicting, or unverified. Nothing here authorizes a
> claim of official partnership or integration.

---

## 1. Non-negotiable rules

1. **Never invent** a phone number, response time, rescue location, rescue
   capability, satellite/SMS integration, or official approval.
2. **Never publish** a number that appears only in a secondary or volunteer
   source. Secondary numbers stay out of the app.
3. **Always show** the source and `lastVerified` date next to safety content.
4. **Never cache live weather or hazard data** as if it were current. Show
   `fetchedAt` and an explicit “not live” state when offline.
5. **Never test** by calling a real emergency number. Use published sources and,
   if a live check is unavoidable, use an administrative line with permission.
6. **Never claim** that a `tel:` link connected, that a message was delivered, or
   that coordinates are accurate enough for rescue.
7. **Always route** the user to official guidance and to 112 first in a
   life-threatening situation.

---

## 2. Review metadata schema

Every safety record in the app data must carry these fields. `reviewStatus`
defaults to `human-review-required`; it can only become `reviewed` with a named
human reviewer.

```json
{
  "id": "emergency-112",
  "category": "emergency-contact",
  "label": {
    "kk": "112 — бірыңғай шұғыл нөмір",
    "ru": "112 — единый номер экстренных служб",
    "en": "112 — unified emergency number"
  },
  "value": "112",
  "scope": "Kazakhstan",
  "sourceUrl": "https://egov.kz/cms/kk/articles/emergency_number_112",
  "publisher": "eGov / Government of Kazakhstan",
  "sourceType": "official",
  "sourceLanguage": "kk",
  "sourceVerification": "official-verified",
  "lastVerified": "2026-10-20",
  "verifiedBy": "unassigned",
  "reviewStatus": "human-review-required",
  "translationStatus": "machine-draft",
  "translationReviewer": null,
  "translationReviewedAt": null,
  "notes": "Primary emergency number. Show source and lastVerified in UI."
}
```

### 2.1 Field definitions

| Field | Required | Allowed values / meaning |
|---|---|---|
| `id` | yes | Stable slug; never reuse for a different fact |
| `category` | yes | `emergency-contact`, `rescue-contact`, `guidance`, `weather-source`, `hazard-source` |
| `label` | yes | Object with `kk`, `ru`, `en`; all three must exist before release |
| `value` | yes | The number, URL, or short guidance text |
| `scope` | yes | `Kazakhstan`, `Almaty city`, `Almaty region`, `national-park`, etc. |
| `sourceUrl` | yes | Exact page used, not a homepage unless the fact is on it |
| `publisher` | yes | Named institution, not “the internet” |
| `sourceType` | yes | `official`, `official-repost`, `secondary`, `volunteer` |
| `sourceLanguage` | yes | `kk`, `ru`, `en` |
| `sourceVerification` | yes | `official-verified`, `official-conflict`, `secondary`, `unverified` |
| `lastVerified` | yes | ISO date `YYYY-MM-DD` |
| `verifiedBy` | yes | Named person or role; `unassigned` is not releasable |
| `reviewStatus` | yes | `human-review-required`, `reviewed`, `rejected`, `stale` |
| `translationStatus` | yes | `machine-draft`, `human-reviewed`, `official-wording` |
| `translationReviewer` | when reviewed | Named kk/ru reviewer |
| `translationReviewedAt` | when reviewed | ISO date |
| `notes` | no | Caveats, conflicts, scope limits |

`sourceVerification` answers “does an official publisher say this?”
`reviewStatus` answers “has a human approved this for use in the product?”
They are independent. An official source can still be `human-review-required`
for product wording, scope, or translation.

---

## 3. Verified official sources

### 3.1 Emergency numbers

| ID | Fact | Value | Source URL | Publisher | Language | Last checked | Source verification | Human review |
|---|---|---|---|---|---|---|---|---|
| SAFE-001 | Unified emergency number | 112 | https://egov.kz/cms/kk/articles/emergency_number_112 | eGov / Government of Kazakhstan | kk | 2026-10-20 (page last modified 2025-11-25) | official-verified | Required |
| SAFE-002 | Fire and rescue | 101 | https://egov.kz/cms/kk/articles/emergency_number_112 | eGov / Government of Kazakhstan | kk | 2026-10-20 | official-verified | Required |
| SAFE-003 | Police | 102 | https://egov.kz/cms/kk/articles/emergency_number_112 | eGov / Government of Kazakhstan | kk | 2026-10-20 | official-verified | Required |
| SAFE-004 | Emergency medical assistance | 103 | https://egov.kz/cms/kk/articles/emergency_number_112 | eGov / Government of Kazakhstan | kk | 2026-10-20 | official-verified | Required |
| SAFE-005 | Emergency gas service | 104 | https://egov.kz/cms/kk/articles/emergency_number_112 | eGov / Government of Kazakhstan | kk | 2026-10-20 | official-verified | Required |
| SAFE-006 | Single emergency number; fire/rescue; police | 112, 101, 102 | https://www.gov.kz/situations/729/intro?lang=en | Government of Kazakhstan | en | 2026-10-20 | official-verified | Required |
| SAFE-007 | Legal list of free emergency services | 102, 103, 101/112, 104/109x | https://cdb.kz/sistema/pravovaya-baza/ob-utverzhdenii-perechnya-ekstrennoy-meditsinskoy-pravookhranitelnoy-pozharnoy-avariynoy-i-drugikh-s/ | Government of Kazakhstan, Resolution No. 929 (2004-09-03) | ru | 2026-10-20 | secondary (mirror of an official act; confirm on adilet.zan.kz) | Required |

Notes on the 112 page (SAFE-001): it states that calls are free from any
telephone; that the caller should report the reason, exact address, and name;
that the caller should not hang up first; that the line should stay free for a
callback; and that 112 can be reached even without a SIM card, without an
operator network, or with a negative balance. The last point is an official
statement and is useful, but it must **not** be turned into a promise of
coverage in remote mountains. Page title: «112 шұғыл нөмірі».

### 3.2 Almaty mountain rescue

| ID | Fact | Value | Source URL | Publisher | Language | Last checked | Source verification | Human review |
|---|---|---|---|---|---|---|---|---|
| SAFE-010 | Almaty city rescue service dispatch | 109 | https://almaty109.kz/ | Almaty city rescue service / Almaty 109 | ru | 2026-10-20 | official-verified | Required |
| SAFE-011 | Almaty rescue service landline | +7 727 271 44 90 | https://almaty109.kz/ | Almaty city rescue service | ru | 2026-10-20 | official-verified (single source) | Required — confirm by a second official source before release |
| SAFE-030 | 109 also serves as the Open Almaty municipal contact center (from 2026-04-03) | 109 (municipal function) | https://open-almaty.kz/novosti/v-almaty-dlya-obrashchenij-v-open-almaty-vnedren-edinyj-nomer-109 | Almaty akimat press service / Open Almaty | ru | 2026-10-20 | official-verified | Required |
| SAFE-012 | Republican Operational Rescue Unit (ROSO) duty phone | +7 727 372 15 60 | https://www.gov.kz/memleket/entities/emer/press/news/details/375688?lang=ru | Ministry of Emergency Situations (MChS) | ru | 2026-10-20 | official-verified | Required |
| SAFE-013 | ROSO duty phone (corroboration) | 8 (727) 372 15 60 | https://old.open-almaty.kz/ru/spravochnaia-informacia/phone-services | Almaty city information portal (old) | ru | 2026-10-20 | secondary (potentially stale) | Do not publish from this source alone |
| SAFE-014 | 112 routes mountain incidents to city or regional rescue structures | Informational | https://www.gov.kz/uploads/2024/9/17/bf797a6b4a7d013127673e11c05b760d_original.3189117.pdf | Almaty akimat / visitalmaty memo on gov.kz | ru | 2026-10-20 | official-verified (published guidance) | Required |

The MChS article (SAFE-012) explicitly says: “В случае чрезвычайных ситуаций
звоните по номеру 112 или 8(727)372-15-60 (дежурный РОСО).” Treat the ROSO
number as a **duty phone that can change**, not a permanent emergency line.
The primary action in the app remains 112.

`109` is an Almaty city service, not a national mountain-rescue number. It must
be labeled with its scope. It is also used as the Open Almaty municipal contact
center (see SAFE-030), which is a separate function and a source of user
confusion. See C-02.

### 3.3 Official mountain-safety guidance

| ID | Guidance | Source URL | Publisher | Language | Date / last checked | Source verification | Human review |
|---|---|---|---|---|---|---|---|
| SAFE-020 | Mountain safety memo: route knowledge, weather check, group of at least two, telling someone the plan and return time, layered clothing, map/compass/flashlight/first aid/food/water, water treatment, park rules, hazards, offline maps, calling 112/109, mountain huts, emergency signals | https://www.gov.kz/uploads/2024/9/17/bf797a6b4a7d013127673e11c05b760d_original.3189117.pdf | Almaty akimat / visitalmaty, hosted on gov.kz | ru | Published 2024-09-17; checked 2026-10-20 | official-verified | Required |
| SAFE-021 | Avalanche warning: avoid mountain trips during heightened avalanche threat; check Kazhydromet; use marked trails; do not go out during a storm warning | https://www.gov.kz/memleket/entities/emer/press/news/details/973538?lang=ru | MChS | ru | 2025-04-10; checked 2026-10-20 | official-verified | Required |
| SAFE-022 | “60 seconds of safety: rules of conduct in the mountains” | https://www.gov.kz/org/emer/press/news/details/1221881?lang=ru | MChS | ru | Checked 2026-10-20 | unverified (official URL exists; body is JavaScript-rendered and was not readable) | Required — read manually and archive |
| SAFE-023 | Regional emergency department contacts and 112 | https://www.gov.kz/memleket/entities/emer-alm | DChS Almaty region | ru | Checked 2026-10-20 | official-verified | Required |
| SAFE-024 | National emergency authority | https://www.gov.kz/memleket/entities/emer | MChS | ru | Checked 2026-10-20 | official-verified | Required |

Guidance items from SAFE-020 are general recommendations, not legal duties.
The app must not turn them into pass/fail legal requirements or a safety score.

### 3.4 Official weather and hazard sources

| ID | Source | URL | Publisher | Language | Last checked | Source verification | Human review |
|---|---|---|---|---|---|---|---|
| SAFE-040 | Kazhydromet home: forecasts, tourist-route forecasts, dangerous-weather outlook, storm warnings | https://www.kazhydromet.kz/ru | Kazhydromet (Ministry of Ecology and Natural Resources) | ru | 2026-10-20 | official-verified | Required |
| SAFE-041 | Storm-warning page | https://www.kazhydromet.kz/storm | Kazhydromet | kk/ru | 2026-10-20 | official-verified; **dynamic** | Required |
| SAFE-042 | Mudflow forecasting unit and daily mudflow bulletin | https://www.kazhydromet.kz/ru/management/upravlenie-issledovaniya-selevyh-processov-i-prognozirovaniya-seley | Kazhydromet | ru | 2026-10-20 | official-verified | Required |
| SAFE-043 | Example daily mudflow bulletin (PDF) | https://www.kazhydromet.kz/uploads/files_calendar/12861/file/6aad0e64db54bbyulleten-97.pdf | Kazhydromet | ru | 2026-10-20 | official-verified; **dated example, not current** | Required |
| SAFE-044 | Almaty 7-day forecast | https://www.kazhydromet.kz/ru/weather/in_city_7_days/6/99 | Kazhydromet | ru | 2026-10-20 | official-verified; **dynamic** | Required |

Dynamic sources (SAFE-041, SAFE-044) must never be cached and presented as
current. At the 2026-10-20 check, the storm-warning page showed “no storm
warnings found”; that is a point-in-time state, not a reusable fact.

---

## 4. Minimum emergency set for the MVP

Only these contacts may appear in the release build, each with its scope and
source label:

| Display label (en / ru / kk) | Number | Scope | Source | Release condition |
|---|---|---|---|---|
| Unified emergency / Единый экстренный / Бірыңғай шұғыл | 112 | Kazakhstan | SAFE-001, SAFE-006 | Human review + translation review |
| Fire and rescue / Пожарная служба / Өрт сөндіру қызметі | 101 | Kazakhstan | SAFE-001, SAFE-006 | Human review + translation review |
| Police / Полиция / Полиция | 102 | Kazakhstan | SAFE-001, SAFE-006 | Human review + translation review |
| Ambulance / Скорая помощь / Жедел медициналық көмек | 103 | Kazakhstan | SAFE-001 | Human review + translation review |
| Gas emergency / Аварийная газовая служба / Авариялық газ қызметі | 104 | Kazakhstan | SAFE-001 | Human review + translation review |
| Almaty Rescue Service / Служба спасения Алматы / Алматы қаласының құтқару қызметі | 109 | Almaty city only | SAFE-010 | Human review + scope warning in UI |
| ROSO duty phone / Дежурный РОСО / РОСО кезекшісі | +7 727 372 15 60 | Almaty region, mountain rescue | SAFE-012 | Human review; label as “duty phone, may change” |

Do **not** add a response time, helicopter guarantee, rescue-point list, satellite
number, SMS short code, or volunteer number to this table without a new official
source and a new review record.

UI requirements for these items:

- Show `lastVerified` date and publisher.
- Show a persistent note: “In a life-threatening emergency, call 112. Numbers
  and services can change.”
- Mark 109 and ROSO as regional, not national.
- Do not auto-dial anything. A tap opens the dialer only.
- Keep emergency actions reachable even in demo mode.

---

## 5. Unverified, secondary, and do-not-publish

| ID | Item | Why it is not usable | Required action |
|---|---|---|---|
| UNS-01 | Volunteer rescue community contact list at rescuekz.org | Volunteer-run, not an official rescue service; numbers are published by the group itself | Do not display in app. If ever considered, obtain written confirmation and legal review |
| UNS-02 | Direct DChS Almaty city phone numbers on old.open-almaty.kz | Old portal, undated, not corroborated | Do not display; use 112 |
| UNS-03 | “Register your hike with 112” | Appears in a secondary news article quoting MChS; not found in the official 112 guidance | Do not claim official trip registration. Treat as unverified until MChS publishes a procedure |
| UNS-04 | Mountain hut and KSP counts/locations | Sources conflict: the 2024 memo says 2 KSP + 18 huts; a Dec 2025 akimat news item says 4 KSP + 18 huts | Do not publish counts or locations. Human review and 2GIS cross-check required |
| UNS-05 | UKV frequency 433.450 MHz | Published in the official memo, but operational availability is not independently confirmed | Do not present as a guaranteed emergency channel; human review |
| UNS-06 | Response times and helicopter availability | No official service-level statement found | Never publish a number or guarantee |
| UNS-07 | Satellite SOS, SMS gateways, mesh relay | No official integration or source | Product may show as “requires integration” only; never as available |
| UNS-08 | “112 works with no network at all” | The official page says it can work without SIM/operator network/positive balance, but this is not a guarantee of coverage in remote terrain | Quote narrowly; add caveat; human review |
| UNS-09 | Machine-translated kk/ru emergency wording | Not reviewed by a native emergency-terminology reviewer | Block release until reviewed; see section 7 |

---

## 6. Conflicts and open questions

| ID | Conflict / question | Current handling |
|---|---|---|
| C-01 | Number of KSP and mountain huts differs between the 2024 memo and a Dec 2025 akimat news item | Publish neither count nor map pins; revise only after a current official list is obtained |
| C-02 | 109 is both the Almaty rescue dispatch and, since April 2026, the Open Almaty municipal contact center | Label 109 as “Almaty city rescue / municipal contact center”; state that 112 is the emergency number. Human review required |
| C-03 | ROSO duty phone may change | Show as secondary regional contact with a “may change” label; re-verify every release |
| C-04 | “Report your route to 112” claim | Marked unverified (UNS-03); do not build a “trip registration” claim on it |
| C-05 | Mountain-hut alarm button procedure | Described in the official memo, but the current operating status of every hut is not verified. Describe only as “where available”; do not imply universal coverage |
| C-06 | English terminology for Kazakh/Russian services | No single official English glossary found. Use descriptive English labels and keep kk/ru official wording; review |

---

## 7. Translation and terminology review

Kazakh is the primary interface language, Russian is the dominant local
emergency language, and English is the submission language. Safety wording must
not be freely paraphrased.

### 7.1 Requirements

- Kazakh and Russian emergency terms must follow official eGov/MChS usage, not
  back-translation from English.
- A native speaker of each language with familiarity with emergency services or
  medical terminology must review every safety string, including button labels,
  warnings, and the dispatcher phrasebook.
- English strings must be reviewed for plain-language clarity after the kk/ru
  wording is fixed, so that all three languages describe the same action.
- Machine translation may be used only as a draft and must be marked
  `machine-draft`.
- Proper service names must not be translated into invented equivalents.

### 7.2 Terminology table (draft — requires review)

| Concept | Kazakh (draft) | Russian (official-style) | English | Status |
|---|---|---|---|---|
| Unified duty-dispatch service | Бірыңғай кезекшілік-диспетчерлік қызмет | Единая дежурно-диспетчерская служба | Unified duty-dispatch service | Draft — verify against source |
| Fire service | Өрт сөндіру қызметі | Пожарная служба | Fire service | Draft — matches SAFE-001 |
| Police | Полиция | Полиция | Police | Draft — matches SAFE-001 |
| Emergency medical assistance | Жедел медициналық көмек | Скорая медицинская помощь | Emergency medical assistance | Draft — matches SAFE-001 |
| Emergency gas service | Авариялық газ қызметі | Аварийная служба газа | Emergency gas service | Draft — matches SAFE-001 |
| Rescue service | Құтқару қызметі | Служба спасения | Rescue service | Draft |
| Almaty City Rescue Service | Алматы қаласының құтқару қызметі | Служба спасения города Алматы | Almaty City Rescue Service | Draft — matches registry name |
| Republican Operational Rescue Unit (ROSO) | Республикалық жедел құтқару жасағы | Республиканский оперативный спасательный отряд (РОСО) | Republican Operational Rescue Unit | Draft |
| Dispatcher | Кезекші-диспетчер | Дежурный-диспетчер | Dispatcher | Draft |
| Coordinates | Координаттар | Координаты | Coordinates | Draft |
| Injured person | Зардап шеккен адам | Пострадавший | Injured person | Draft |
| Lost / I am lost | Адасып қалдым | Я заблудился | I am lost | Draft |
| Avalanche | Қар көшкіні | Лавина | Avalanche | Draft |
| Mudflow | Сел | Сель | Mudflow | Draft |
| Hypothermia | Гипотермия | Гипотермия | Hypothermia | Draft |
| Altitude sickness | Тау ауруы | Горная болезнь | Altitude sickness | Draft |
| Stay where you are | Орныңызда қалыңыз | Оставайтесь на месте | Stay where you are | Draft |
| Do not hang up | Тұтқаны қоймаңыз | Не кладите трубку | Do not hang up | Draft |

Every row must become `human-reviewed` or `official-wording` before release.
Unreviewed rows must not appear in the emergency screen or offline guide.

### 7.3 Dispatcher phrasebook rules

- Short, speakable sentences; no idioms.
- Include: who you are, where you are, what happened, how many injured, current
  conditions, phone battery, and that you will stay in place.
- Do not promise that the dispatcher speaks a specific language.
- Do not include a phrase implying the app has contacted anyone.

---

## 8. Human review and sign-off

| Review item | Reviewer role | Required evidence | Status |
|---|---|---|---|
| Emergency numbers and scopes | Product safety owner + second reviewer | Dated source screenshots, notes on call/email verification | Not started |
| Mountain guidance wording | Reviewer with outdoor-safety or rescue background | Signed review of each guidance item | Not started |
| Kazakh terminology | Native kk reviewer, emergency/medical familiarity | Row-by-row sign-off in section 7.2 | Not started |
| Russian terminology | Native ru reviewer, emergency/medical familiarity | Row-by-row sign-off in section 7.2 | Not started |
| English clarity | Product/content reviewer | Final read of all safety strings | Not started |
| 109/ROSO scope labels | Product safety owner | Confirmation that labels say “Almaty city” / “duty phone” | Not started |
| No-false-claims audit | Product lead | Checklist against section 1 | Not started |

`verifiedBy` must contain a person's name or a named role with a date. A build
with `verifiedBy: "unassigned"` on any displayed safety item is not releasable.

---

## 9. Verification checklist (Phase 5 and Phase 7)

### 9.1 Before every release

- [ ] Open SAFE-001 and confirm 112, 101, 102, 103, 104 are unchanged.
- [ ] Open SAFE-006 and confirm the English official page still lists 112/101/102.
- [ ] Open SAFE-010 and confirm 109 is still presented as the Almaty rescue line.
- [ ] Open SAFE-012 and confirm the ROSO duty number; if changed, update or remove.
- [ ] Confirm every displayed item has `sourceUrl`, `lastVerified`, `verifiedBy`,
      `reviewStatus`, and all three language labels.
- [ ] Confirm no live weather/hazard value is cached as current.
- [ ] Confirm the UI says “call 112” first and does not imply guaranteed rescue.
- [ ] Confirm no volunteer, satellite, SMS, or mesh number appears as available.
- [ ] Confirm kk/ru strings are human-reviewed for this release.
- [ ] Confirm the build contains no claim of official partnership or integration.

### 9.2 Source re-check method

1. Prefer the original publisher page over a repost.
2. Record the exact URL, page title, language, and date checked.
3. Save a dated screenshot or PDF copy for the submission archive.
4. If a page is JavaScript-only or unreachable, mark it unverified; do not infer
   content from a search snippet.
5. If two official sources conflict, publish neither claim until resolved.
6. Never call 112, 101, 102, 103, 104, or 109 to “test” the app.

### 9.3 Phase 7 submission check

- [ ] Safety claims in the PDF and video match the reviewed register.
- [ ] No response time, rescue location, or integration is asserted.
- [ ] Offline guidance shows source and `lastVerified`.
- [ ] Demo labels keep simulated features clearly separate from real emergency
      actions.
- [ ] The emergency screen remains usable in demo mode.

---

## 10. Change log

| Date | Change | By |
|---|---|---|
| 2026-10-20 | Initial register created: official emergency numbers, Almaty rescue contacts, MChS/akimat guidance, Kazhydromet sources; conflicts and secondary sources separated; review metadata and translation workflow defined | P1-S4 |
