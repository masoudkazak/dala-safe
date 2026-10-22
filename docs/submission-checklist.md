# Dala Safe — final submission checklist (P7-S1 basis)

| Field | Value |
|---|---|
| Document | Final competition submission checklist |
| Compiled | 2026-10-21 by session P6-S2/P6-S3 (project-description PDF + two-minute video deliverables) |
| To be completed by | P7-S1 on the day of submission (re-run every item; rules may change) |
| Official rules register | `docs/competition-rules.md` (checked 2026-10-20; primary source https://oq.gov.kz/en/news/1564) |
| Deadline | **2026-10-30** (official). Internal target: **2026-10-29 18:00 Asia/Almaty** — the cut-off time and time zone are not stated in the regulation (open item U-02). |
| Submission channel | E-mail to **Oqbaiqau@gmail.com** with the presentation (video) and the PDF description attached; include full name, citizenship, university and year of study, age |

> This checklist records the **real current state** of each file. Items that could
> not be produced in the documentation environment are marked **NOT PRODUCED
> HERE** with exact build/production instructions. Nothing in this file claims a
> video exists, that a human reviewer has signed off safety text, or that any
> user research has been done.

---

## 1. Deliverable files — current status

### 1.1 Application and code

| Deliverable | Status (2026-10-21) | Evidence / note |
|---|---|---|
| Working React/Vite/TypeScript PWA | **EXISTS** | `src/`; production output present in `dist/` (manifest, `sw.js`, assets) |
| Unit tests | **PASSING** | `npx vitest run` → 30 files / **238 tests**, 0 failures (run 2026-10-21, reproduced in `docs/testing-report.md`) |
| Typecheck / lint / i18n completeness | **PASSING** | `npm run typecheck` exit 0; `npx eslint .` exit 0; `node scripts/check-i18n.mjs` → “3 languages × 10 namespaces” (all run 2026-10-21) |
| Integration / E2E tests | **PASSING** | `npx playwright test` → **12/12 passed** (journey, offline ×3, errors ×8), run twice on 2026-10-21; recorded in `docs/testing-report.md` §3 |
| Offline / PWA verification with real network disconnect | **PASSING (automated)** | `node scripts/verify-offline.mjs` → **14/14**, including a real `setOffline` + full reload served by `sw.js` (`docs/testing-report.md` §4). Device-level airplane mode still untested |
| Accessibility audit | **PASSING (script-based)** | `npm run verify:a11y` → **0 findings** across 10 routes × 3 languages — landmarks, headings, names, labels, contrast, focus, reduced motion (`docs/testing-report.md` §5). No screen-reader pass |
| Human review of emergency numbers / kk/ru safety text | **NOT STARTED** | `docs/safety-and-privacy.md` §12 checklist unticked; every shipped number is `human-review-required` |

### 1.2 Documentation

| File | Status | Note |
|---|---|---|
| `README.md` | **EXISTS** | P6-S1 |
| `docs/architecture.md` | **EXISTS** | P6-S1 |
| `docs/competition-rules.md` | **EXISTS** | Verified rules + 16 open questions (U-01…U-16) |
| `docs/scope.md` | **EXISTS** | Scope frozen for MVP |
| `docs/market-research.md` | **EXISTS** | Desk research only; 0 user evidence |
| `docs/product-definition.md` | **EXISTS** | Hypotheses labelled as such |
| `docs/user-research-plan.md` | **EXISTS** | **0 participants** — no findings exist |
| `docs/safety-sources.md` | **EXISTS** | Source register with URLs, last-verified dates, review status |
| `docs/safety-and-privacy.md` | **EXISTS** | Safety model, data inventory, export/delete, limitations |
| `docs/feature-status.md` | **EXISTS** | Six-category status of every capability |
| `docs/testing-report.md` | **EXISTS** | Real commands and results: typecheck, lint, 238 unit, i18n, build, 12 E2E, 14 offline checks, 0 a11y findings |
| `docs/roadmap.md` | **EXISTS** | Phase status with evidence |
| `docs/claims-register.md` | **EXISTS** | Allowed/forbidden claims (input to Gate G5) |
| `docs/submission-checklist.md` | **EXISTS** | This file |
| `docs/final-report.md` | **EXISTS** | P7-S2 report: implementation, results, defects, capabilities, sources, files, commands, deliverables, checklist, top-3 priorities |

### 1.3 Competition deliverables

| File | Status | Note |
|---|---|---|
| `deliverables/project-description.html` | **EXISTS** | Self-contained, print-ready source (inline CSS, no external resources); 15 sections |
| `deliverables/dala-safe-project-description.pdf` | **EXISTS** | Generated here with Playwright Chromium (`page.pdf`, A4, printBackground, margins). **216,145 bytes (≈211 KB), 15 A4 pages.** Opens and contains all 15 sections (verified with `pdfinfo`/`pdftotext`) |
| `deliverables/build-pdf.mjs` | **EXISTS** | Reproducible rebuild: `node deliverables/build-pdf.mjs` (needs the Playwright Chromium already in `~/.cache/ms-playwright`) |
| `deliverables/video-script.md` | **EXISTS** | Final narration, 6 sections with second budgets; **298 words** of English narration; subtitle requirement noted (kk/ru/en = submission language) |
| `deliverables/shot-list.md` | **EXISTS** | 17 shots, exact routes and interactions, 1280×720 landscape, fixed sample trip, avoid-list, production workflow, verification checklist |
| `deliverables/edit-plan.md` | **EXISTS** | Tool-agnostic timeline, subtitle/overlay placement, app palette branding, MP4 export settings |
| **Two-minute video (MP4/MOV)** | **NOT PRODUCED HERE** | The documentation environment has **no screen-recording capability**; only ffmpeg is available and no display/capture source exists. **No video file has been generated and none is claimed.** Production instructions: see §4 |
| Budget appendix | **NOT A SEPARATE FILE** | Budget lives in PDF §15: **no funding requested** for the delivered scope (0 KZT); an itemised *proposal estimate* (KZT, item/quantity/unit cost/total) is included for the optional next phase, clearly flagged as estimate-only with no quotes obtained |

---

## 2. Verified competition requirements (re-check on the day)

| Requirement | Value | Confidence |
|---|---|---|
| Organizer | Otandastar Qory / «Отандастар қоры» КЕАҚ | Verified |
| Competition | “OQ Startup” for ethnic Kazakhs abroad | Verified |
| **Eligible participant** | Ethnic Kazakhs aged **15–30** who are **citizens of a foreign country** | Verified — see §3 |
| Eligible project stage | Already started, currently operating, or planned | Verified |
| Required documents | (1) presentation: horizontal video ≤2 min **or** PPTX/PDF ≤10 slides; (2) brief project description in **PDF**; (3) personal data of the participant | Verified |
| Presentation chosen | Horizontal **video**, ≤120 s (the PDF description is mandatory either way) | Verified |
| Video container | **MP4 or MOV** (English text); kk/ru text says “MP3” — treat MP3 as a typo, ship **MP4**, confirm by e-mail (U-01) | Verified with conflict |
| Video orientation | Horizontal / landscape | Verified |
| PDF required sections | Title; relevance/problem; objective; key tasks; target audience; implementation mechanism & activities; implementation period; expected outcomes; required resources — plus current results/achievements and further plans for an operating project | Verified (9 mandatory; the 15-section PDF in `deliverables/` covers all of them) |
| Budget rule | Only if funding is required: state the amount and give a detailed budget (expense, quantity, unit cost, total). If no funding is requested, say so explicitly | Verified (U-16) |
| Submission languages | Kazakh, Russian or English | Verified |
| Submission channel | E-mail to Oqbaiqau@gmail.com | Verified |
| Personal data required | Full name, citizenship, university and year of study, age | Verified |
| Deadline | **2026-10-30** (window opened 2026-09-30); cut-off time/timezone unstated (U-02) | Verified / unverified detail |
| Publication consent | Submitting implies consent to publish on the Foundation site and Facebook, Instagram, Telegram | Verified |
| Max PDF pages / file size, judging criteria | Not published | Unverified — ask; keep the PDF small (currently ≈211 KB) |

---

## 3. Eligibility — confirm honestly before sending (risk to resolve)

The eligibility rule applies to the **participant**, not to the project’s market.
Dala Safe targets Kazakhstan; that does **not** make the submitter eligible, and
nothing in the project makes an ineligible person eligible. Before any files are
sent, the applicant must be able to truthfully confirm **all** of:

- [ ] Is an ethnic Kazakh («ұлты қазақ отандастар» / “ethnic Kazakhs”).
- [ ] Is aged **15–30** at submission.
- [ ] Is a **citizen of a foreign country** (not a citizen of Kazakhstan).
- [ ] Can provide full name, citizenship, university and year of study, and age (if not a student, state status honestly and ask the organiser — U-06).

If any item is false, **do not submit under these rules** — ask the organiser
first. Do not adjust or distort participant identity to fit the rule; this is an
integrity requirement, not a formatting detail. This checklist records the
condition only; the confirmation itself is the applicant’s and is not recorded
in the repository.

---

## 4. Producing the two-minute video (NOT PRODUCED HERE — instructions)

1. Build and run the app from the repository root: `npm run build && npm run preview` (or serve the existing `dist/`). Use a clean browser profile at **1280×720 landscape**.
2. Prepare the fixed sample trip from `deliverables/shot-list.md` §1 (name **Big Almaty Lake day hike**, group 4, fictional contact +7 700 000 00 00). Never use personal data.
3. Record the 17 shots in the listed order with a screen recorder (OBS or the OS built-in recorder), speaking the narration from `deliverables/video-script.md` (298 words ≈ fits 120 s at a natural pace). Never activate a `tel:` link; never show a “sent/delivered” state.
4. Edit per `deliverables/edit-plan.md`: six-section timeline, subtitles in the chosen submission language (kk/ru/en), “Sample data / demonstration” overlay on demo segments, closing card with the palette (#1f5c4a / #a85732 / #2f6f92 / #f5f4ee).
5. Export **MP4, H.264 + AAC, 1920×1080 or 1280×720 landscape, ≤120.0 s**, audio ≈ −16 LUFS, burned-in subtitles. Name it `OQ_Startup_2026_DalaSafe_Presentation.mp4` (unless the organiser specifies otherwise).
6. Verify with a probe and a full playback on a second device:
   `ffprobe -v error -show_entries format=duration:stream=codec_type,codec_name,width,height -of default=noprint_wrappers=1 <file>` → duration ≤ 120.0, h264 + aac, landscape dimensions.
7. Run the verification checklist in `deliverables/shot-list.md` §4 (format, audio/subtitles, content integrity, consistency).

---

## 5. Re-verification checklist (run on the day of submission, not earlier)

### 5.1 Official rules

- [ ] Re-open https://oq.gov.kz/en/news/1564 and confirm deadline, e-mail, age/citizenship/ethnicity, languages, video duration/orientation, PDF sections.
- [ ] Re-open the kk and ru versions and diff them; confirm whether the MP4/MP3 conflict (U-01) is still present.
- [ ] Check https://oq.gov.kz/press/, https://t.me/s/otandastar, Instagram `@otandastar_qory`, Facebook `OtandastarQory` and memleket.kz for a newer post, extension or rule change.
- [ ] Save dated screenshots/PDFs of all three language versions of the regulation.

### 5.2 Open questions with the organiser (send as one e-mail, keep the reply)

- [ ] U-01 MP4 or MP3 container (we ship MP4).
- [ ] U-02 exact cut-off time and time zone on 2026-10-30.
- [ ] U-03 maximum PDF size/pages (current PDF ≈211 KB, 15 pages).
- [ ] U-05 individual or team submissions; U-06 “university and year of study” for a non-student.
- [ ] U-12 how a submission receipt/confirmation is issued.
- [ ] U-08/U-11 if relevant: whether a product URL may be included; whether video and PDF may be in different languages.

### 5.3 Artifacts

- [ ] PDF opens on a clean machine (no repo context), contains all 15 sections / 9 mandatory items, and states the project stage honestly.
- [ ] PDF contains no fabricated costs, partnerships, results, user counts or adoption claims; the budget (if read as a request) is clearly a proposal estimate, and “no funding requested” is stated.
- [ ] Video is landscape, **≤120.0 s**, plays end-to-end, audio intelligible, subtitles readable and accurate in the submission language.
- [ ] Video, PDF, README, `docs/feature-status.md` and the live app agree on scope, status, timeline and expected impact (Gate G5 / P6-S4 claims reconciliation done).
- [ ] No demo capability is presented as working; every demo segment carries the sample-data overlay and the app’s own status labels.
- [ ] No personal data anywhere in the video or PDF beyond the four required personal-data fields in the e-mail body.
- [ ] Test evidence quoted in the PDF still matches the latest run (238 unit tests / 30 files + 12 E2E + 14 offline on 2026-10-21 — re-run `npm run typecheck && npm run lint && npx vitest run && npm run check:i18n && npm run build && npm run test:e2e && npm run verify:offline && npm run verify:a11y` if any code changed since).

---

## 6. Before you send

- [ ] Eligibility confirmed by the applicant (§3) — truthful, all four conditions.
- [ ] One submission language chosen (kk / ru / en) and used consistently in the video, subtitles and PDF (or the organiser has confirmed mixing).
- [ ] Files named: `OQ_Startup_2026_DalaSafe_Presentation.mp4` and `OQ_Startup_2026_DalaSafe_Description.pdf` (adjust only if the organiser specifies a convention).
- [ ] E-mail to **Oqbaiqau@gmail.com** from a monitored address, with attachments confirmed present and within size limits; request a read receipt and written confirmation.
- [ ] E-mail body contains the four required personal-data fields: full name, citizenship, university and year of study, age.
- [ ] Publication consent understood: the submission may be published on the Foundation site, Facebook, Instagram and Telegram.
- [ ] Send by **2026-10-29 18:00 Asia/Almaty** (internal target) — well inside the 2026-10-30 deadline.
- [ ] Archive: the exact sent files, the sent e-mail, any organiser reply, and the dated rules screenshots. Keep the archive until results are announced.
- [ ] Record the send time in Asia/Almaty and the delivery evidence in this file (append below).

### Send record (fill in on the day)

| Field | Value |
|---|---|
| Sent at (Asia/Almaty) | |
| Sent from (address) | |
| Files attached (names, sizes) | |
| Read receipt / confirmation | |
| Organiser reply received | |

---

## 7. Known gaps that are honestly disclosed (do not “fix” by overclaiming)

1. **No user research has been done** — 0 interviews, 0 usability sessions. Personas, problems and differentiation are hypotheses; the PDF and video say so.
2. **No human safety review yet** — emergency numbers are sourced and dated (2026-10-20) but kk/ru wording is machine-assisted and marked `human-review-required`.
3. **Offline is verified in desktop Chromium only** — `scripts/verify-offline.mjs` proves the SW serves the shell after a real disconnect (14/14), but no phone or airplane-mode test has been done; do not claim device-level offline.
4. **The video file does not exist yet** — it must be recorded on the applicant’s machine from the real application using the supplied script, shot list and editing plan.
5. **Several competition mechanics are unverified** (U-01…U-16) — resolve by e-mail; follow the conservative defaults in `docs/competition-rules.md` §7 if no reply arrives.
6. **Eligibility is a personal condition** — confirm it truthfully (§3); no document in this repository can establish it.
