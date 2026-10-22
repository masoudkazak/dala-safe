# Dala Safe — User Research and Usability Test Plan

**Document:** P1-S2 deliverable
**Version:** 1.0
**Date:** 2026-10-20
**Owner:** P1-S2
**Status:** Plan only. No interviews or usability sessions have been conducted.

---

## 0. Integrity statement

- **No participant has been interviewed or tested as of 2026-10-20.** Every persona, need, problem statement, and behavior described elsewhere in this project is a hypothesis until this plan produces evidence.
- No finding may be written, quoted, counted, or shown in the product, pitch, PDF, or video unless it is traceable to a consenting participant and recorded in the findings log (Section 10).
- Do not invent participants, quotes, sample sizes, percentages, or "users said" claims. Single-participant observations must be labeled as anecdotes.
- Every research report must state the actual number of participants (`N`), the method, the dates, and the limitations. A study that did not happen is reported as "not conducted".
- If recruitment fails, the honest output is: "0 sessions completed; hypotheses remain unvalidated", plus the recruitment attempts made.

---

## 1. Purpose and decision scope

This study exists to decide four product questions before and during MVP build:

1. Which of the three candidate core problems is real, frequent, and painful enough to build around?
2. Does the proposed end-to-end workflow (plan → readiness → share → remind → emergency/offline) fit how Almaty-area hikers actually prepare?
3. Do users correctly understand the safety boundaries (message generated is not sent; app does not monitor; route is not certified)?
4. Which MVP features earn their place, and which are tolerated but unused?

This plan covers two methods:

- **Moderated interviews** (30–40 min) about past trips and current behavior.
- **Moderated usability tests** (45–60 min total, including a short post-test interview) on the MVP build or a high-fidelity interactive build using sample data.

It does **not** cover quantitative surveys, diary studies, or production analytics. The MVP has no analytics by design, so behavioral claims must come from moderated sessions until a separate, consented study is run.

---

## 2. Hypotheses to validate (and what would falsify them)

Hypotheses are written so that a result can count against them. Thresholds are decision conventions for a small qualitative sample, not statistical significance.

| ID | Hypothesis | Evidence that supports it | Evidence that falsifies or weakens it |
|---|---|---|---|
| H1 | Preparation is fragmented across chat, notes, maps, and memory, and readiness is judged by feel. | Participants describe 3+ disconnected tools; at least half report a forgotten item, wrong timing, or a last-minute scramble in their last 3 trips. | Most participants describe one stable routine with no reported gaps; tools are few and sufficient; preparation problems are rare or trivial. |
| H2 | The trip plan is rarely shared in a structured way (route, return time, "what if overdue" contact action). | Participants say they "tell someone" but cannot state a return time or what the contact should do; messages are partial or buried in chat. | Most participants already send a complete plan and a clear overdue instruction; they see no gap. |
| H3 | A short, customizable readiness checklist changes at least one concrete pre-departure action and is not seen as bureaucracy. | In usability, participants add/remove an item, act on a recommendation, or say it surfaced something they would otherwise skip. | Participants skip it, call it obvious/annoying, or complete it without changing any decision or action. |
| H4 | Loss of connectivity is a real concern, and offline access to emergency numbers, coordinates, phrases, and decision guidance is valuable. | Participants describe connectivity gaps on actual routes; they use screenshots/downloads as workarounds; they ask for offline access unprompted. | Connectivity is described as reliable on their routes; existing downloads are sufficient; offline access is not prioritized. |
| H5 | Language choice affects trust and comprehension; Kazakh-first matters for part of the audience, Russian remains necessary, English is needed for visitors and some guides. | Participants switch language or say the Kazakh version changes comfort/understanding; mixed-language groups describe real friction. | Participants are indifferent to language, or one language is sufficient for nearly all sessions. |
| H6 | Local-only data (no account, no sync) is acceptable for the MVP if export and delete are clear. | Participants accept "one phone, local data" when privacy and export are explained; no one makes sync a blocker. | Most participants require multi-device access or account backup before using it for a real trip. |
| H7 | A calendar reminder (.ics) with return-time alarms is useful enough to add to a real trip. | Participants import the file or say they would; they see value in a second reminder beyond a mental note. | Participants say phone alarms/mental notes are enough; they would not add a calendar event. |
| H8 | Target users would try Dala Safe for a real trip within 30 days (stated intent only). | Participants ask to keep the build, name a specific upcoming trip, or agree to a follow-up. | Participants see it as a demo, a "nice idea", or would not change their routine. |
| H9 | Guides and small-group organizers have needs the MVP does not serve (roster, group status, accountability) and are a secondary segment for now. | Guides ask for participant lists, group check-in, or duty-of-care features absent from MVP; they would not use it without them. | Guides' needs match the solo/small-group workflow closely; MVP is sufficient for them. |
| H10 | Users correctly understand the safety limits when the interface says them plainly. | In comprehension checks, participants state that a message is not sent, the app does not monitor, and a route is not verified safe. | Participants believe the app sent a message, monitors them, or guarantees safety, even after the labels. This is a release blocker, not a nice-to-have. |

**Global falsification rule for the product concept:** if, after at least 8 completed sessions across at least two segments, fewer than half of participants describe a preparation or plan-sharing gap that the MVP addresses, the core value proposition must be rewritten before further feature work. Record this decision explicitly, with the participant count.

---

## 3. Participants

### 3.1 Segments and quotas

Target: **8 participants per round**, two rounds (Round 1 before/early MVP; Round 2 on the near-final build). Minimum viable sample: 6 per round. Stop recruiting for a segment when its quota is met; do not pad the sample to make a theme look stronger.

| Segment | Definition | Round 1 quota | Round 2 quota |
|---|---|---|---|
| A. Independent hikers | Solo or groups of 2–4; at least 2 trips in the Almaty region in the last 12 months | 4 | 4 |
| B. Small-group organizers | Plan trips for 3–10 people (friends, club, informal group); not paid guides | 2 | 2 |
| C. Guides / instructors | Paid or club-leading experience ≥1 year; secondary segment | 2 | 2 |

Within each round, aim for:

- At least 3 sessions primarily in Kazakh, 3 in Russian, 2 comfortable in English.
- At least 2 participants with lower digital confidence (smartphone user, but not an app power user).
- At least 2 participants who turned back, had a near-miss, or had a trip disrupted by weather/connectivity.
- Gender mix; age range 18–55; at least 2 participants aged 40+.
- At least 1 participant who usually hiked without a dedicated planning app.

### 3.2 Inclusion criteria

- Age 18+.
- Resident of or regular visitor to Almaty region.
- At least 2 outdoor trips (hike/trek) in the last 12 months, at least one in the last 6 months.
- Uses a smartphone for trip planning or communication.
- Able to give informed consent in Kazakh, Russian, or English.
- Willing to be recorded (or willing to participate without recording; note the limitation).

### 3.3 Exclusion criteria

- Under 18.
- No outdoor trip in the last 12 months.
- Professional rescue/military-only context with no recreational hiking (may be interviewed separately as an expert, not counted in the main sample).
- Current Dala Safe team members, close relatives, or anyone whose feedback could be coerced by a reporting relationship.
- Anyone in an active emergency or recent unresolved traumatic incident; do not recruit through crisis contexts.

### 3.4 Recruitment channels

- Almaty hiking and trekking Telegram/WhatsApp communities (post a neutral recruitment message; do not claim endorsement by the community).
- University outdoor clubs and mountain-sports clubs.
- Gear shops and climbing gyms (ask permission before posting).
- Personal network, with conflicts disclosed and capped at 2 participants to reduce bias.
- Guide/instructor contacts, explicitly labeled as the secondary segment.

**Do not claim partnerships.** Wording must be: "We are doing independent product research" — never "supported by", "in partnership with", or "official".

### 3.5 Incentive

Offer a small, honest compensation (for example, coffee/transport reimbursement). Amount is set per round and recorded. The incentive must not depend on positive feedback, and participants must be told they can stop at any time and still receive it. Do not pay guides in exchange for implied endorsement.

---

## 4. Screening questionnaire

Ask in the participant's preferred language. Record answers verbatim; do not paraphrase into the findings log.

1. How old are you? (confirm 18+)
2. What city/region do you live in?
3. How often do you hike or trek? When was your last trip, and where?
4. How many trips in the Almaty region in the last 12 months? (confirm ≥2)
5. Do you usually go alone, with 1–3 people, or with a larger group? Who plans the trip?
6. Do you ever organize trips for others? How many people, and are you paid?
7. What do you use to plan a trip? (apps, maps, notes, chats, paper — list all)
8. Before you leave, who knows where you are going and when you plan to return? How do they know?
9. Have you ever lost mobile connectivity on a trip? What did you do?
10. Have you ever turned back, been late, or had a trip go differently than planned? Briefly, what happened?
11. Which language do you prefer for apps? Kazakh / Russian / English / mixed.
12. How comfortable are you trying a new app on your phone? (1–5)
13. Do you have 45–60 minutes for a session, in person or by video call?
14. Are you comfortable being audio-recorded? (Yes / No — either is acceptable)
15. Do you know anyone on the Dala Safe team? (conflict check)

Store screening responses with the participant ID only. Do not keep names in the same file as answers.

---

## 5. Consent script

Read aloud before recording. Give the participant a copy (paper or PDF). Obtain verbal consent on the recording and, where possible, a signed/typed consent form. If the participant declines recording, take written notes and record that fact.

> **Consent script (English; translate faithfully into Russian/Kazakh for the session)**
>
> "My name is [name], and I am doing independent research for a project called Dala Safe. It is a mobile app concept that helps people prepare for outdoor trips, share a safety plan, and find emergency information offline. I am not selling anything, and this is not a test of you.
>
> The session takes about 30–40 minutes for an interview, or 45–60 minutes if we also test a prototype. I will ask about trips you have taken, how you prepare, and what you do when plans change. There are no right or wrong answers. You can skip any question and stop at any time.
>
> With your permission, I would like to audio-record this session and, for the prototype part, record the screen. The recording is used only to write accurate notes. We will not publish your name or identifying details. Your notes will be labeled with a pseudonym such as P03. Recordings are stored encrypted, accessible only to [number] project members, and deleted within 90 days after analysis. Anonymized notes may be kept for up to 12 months.
>
> You can ask us to delete your recording and notes at any time by contacting [contact]. If you withdraw, we will delete them within 7 days, except where we are legally required to keep something.
>
> Please do not share real passport numbers, medical records, home addresses, or other sensitive personal data during the session. If you mention a specific route, we may generalize it in our notes.
>
> We will not make a real emergency call during this session. If you feel unwell or distressed, tell me and we will stop immediately.
>
> Do you have any questions? Do you agree to take part? Do you agree to the audio recording? Do you agree to screen recording for the prototype part?"

**Consent checklist for the moderator:**

- [ ] Purpose and voluntary nature explained
- [ ] Recording consent explicitly yes/no
- [ ] Data use, storage, access, retention, and deletion explained
- [ ] Right to skip/stop/withdraw explained
- [ ] Sensitive-data warning given
- [ ] Emergency-call limitation stated
- [ ] Contact for withdrawal provided
- [ ] Consent recorded (audio timestamp or signed form)

---

## 6. Interview guide (30–40 minutes)

**Rules for the moderator**

- Ask about **past behavior**, not hypothetical enthusiasm. "Tell me about the last trip" beats "Would you use…".
- Do not describe the solution until Section 6.7. Do not defend the product.
- Use neutral probes: "What happened next?", "How did you decide?", "What did you do instead?", "Can you show me?"
- Do not fill silences; allow 5 seconds.
- Never correct the participant's safety practice during the interview. Note it.
- If the participant asks for emergency advice, say: "I am not a rescue professional; please follow official guidance", and do not improvise.

### 6.1 Opening (0–3 min)

- Thank them; confirm consent and recording.
- "I want to understand how you actually plan and handle trips, not whether you like an idea."
- Confirm they have 30–40 minutes and are in a quiet place.

### 6.2 Last real trip reconstruction (3–10 min)

- "Walk me through your most recent hike, from the moment you decided to go."
- Who suggested it? Who was responsible for what?
- When and how did you choose the route? What information did you check?
- What did you pack, and how did you decide?
- What time did you plan to return? Did you tell anyone? Exactly what did you say?
- What changed vs. the plan, if anything?
- Probe: "What almost went wrong?" "What did you do when you weren't sure?"

### 6.3 Current preparation workflow (10–17 min)

- "Show me the apps/tools you used for that trip." (screen share if remote; ask them to open the actual apps)
- Which tool does what? Where do notes live? Where do maps live? Where does the group chat live?
- What do you always check, and what do you sometimes forget?
- Have you ever forgotten something important? What was the consequence?
- How do you decide you are "ready" to leave?
- What do you do if the forecast looks bad the night before?

### 6.4 Sharing the plan and return time (17–23 min)

- Who knows your plan? How did they learn it — message, call, shared document, nothing?
- What exactly does that person know: route, return time, group size, vehicle, emergency contact?
- What should they do if you are late? Have you ever agreed on a rule?
- Has anyone ever checked on you? What happened?
- "If you had to send a plan in one message right now, what would it contain?" (let them draft it aloud)

### 6.5 Connectivity and unexpected situations (23–29 min)

- Tell me about a time you lost signal. Where were you, and what did you need?
- What do you keep offline: maps, screenshots, numbers, phrases, notes?
- Have you ever needed to call emergency services or ask for help? What happened? (Do not push for traumatic detail.)
- What information would you need in the first two minutes of an incident?
- What do you do when the weather/route/group condition changes — who decides, and how?

### 6.6 Language and device context (29–31 min)

- Which language do you use for maps and safety information? Why?
- Do you ever travel with people who prefer another language? How do you handle it?
- What phone do you use? What happens to your battery on a full-day trip?

### 6.7 Concept reaction (31–36 min) — only after elicitation

Show **three static screens or a short non-interactive flow**: trip creation, generated trusted-contact message, emergency screen. Do not show the full product tour.

- "What do you think this does?" (comprehension first, opinion second)
- "What would you expect to happen after you tap 'share'?"
- "Does this monitor your trip? How would you know?"
- "What is missing for you to use it on a real trip?"
- "What would make you delete it?"
- "Who else would need to use it for it to work?"

### 6.8 Close (36–40 min)

- "If you could change one thing about how you prepare, what would it be?"
- "Is there anything I should have asked?"
- Ask permission for a follow-up and for Round 2 usability testing.
- Confirm incentive and thank them. Stop recording.

### 6.9 Core questions in Russian (field phrasing)

Use these as a guide, not a rigid script; adjust to the participant's speech. Kazakh sessions should be run by a fluent moderator with equivalent phrasing.

- "Расскажите про вашу последнюю поездку — с момента, когда решили пойти."
- "Кто знал, куда вы идёте и когда вернётесь? Что именно вы ему написали?"
- "Что вы делаете, если планы меняются или связь пропадает?"
- "Что для вас значит «быть готовым» к выходу?"
- "Что должно быть в приложении, чтобы вы взяли его в реальный поход?"
- "Что бы заставило вас удалить его?"

---

## 7. Usability test plan (MVP)

### 7.1 Setup

- Build: the current MVP build (or the closest interactive build) with **sample data only**. Reset storage between sessions.
- Sample trip: a clearly labeled example (e.g., "Sample: Kolsai Lakes day hike"), a sample trusted contact, and no real personal data.
- Device: participant's own phone first (most realistic); a backup Android device with a current browser if needed. Test at a narrow viewport (360×640 or the participant's actual phone).
- Facilitator + note-taker. One person runs tasks; the other records.
- Recording: screen + audio with consent. If no consent, written notes only.
- **Never place a real emergency call.** For the emergency task, say: "Please show me how you would find the number. Do not tap call — we will not make a real call." If the participant moves to call, intervene calmly.
- Geolocation: ask permission before the session. Test both granted and denied paths by changing browser permissions when possible.
- Offline: test with real airplane mode / network disconnection after the app has loaded once, not just an offline badge.

### 7.2 Think-aloud instructions

> "I will give you a few tasks. Please think aloud: say what you are looking at, what you expect, and what you are trying to do. I will not help unless you are stuck for a while, because I want to see what the app does on its own. There are no wrong answers; if something is confusing, that is useful for us."

### 7.3 Tasks

Success is scored as **independent**, **with help**, or **failed**. Record time only where it is meaningful (T1, T5). Do not prompt before 60 seconds of genuine struggle; log the prompt.

| ID | Task | Setup | Success criteria | Critical comprehension check |
|---|---|---|---|---|
| T1 | Create a trip for a real upcoming hike: name, destination, departure, expected return, group size, one note. Then find the readiness checklist. | Clean state | Trip saved and visible; validation understood; checklist reached without help | "What would happen if you set the return before departure?" |
| T2 | Complete the checklist; customize it by removing one item and adding one item; open one recommendation and explain why it appeared. | Saved trip | Checklist persists; customization works; participant can explain the reason shown | "Is this a legal requirement or a recommendation? How do you know?" |
| T3 | Generate the safety plan and the trusted-contact message; copy the message. | Saved trip | Plan and message generated; copy succeeds; participant finds the fallback share path | "Has this message been sent? Who has it now?" (must answer: not sent) |
| T4 | Create a calendar reminder for the return time and explain what it will do. | Saved trip | `.ics` generated; participant can state it creates an event/reminder, not a monitored alarm | "Will the app alert anyone if you are late?" (must answer: no) |
| T5 | Find the emergency number, get and copy your coordinates, and find one phrase in the phrasebook. Simulate permission denied, then granted. | Emergency screen | Number found in ≤2 taps; denial handled without a dead end; coordinates copied with accuracy shown; phrase found | "Does the app know where you are well enough for rescue? What does the accuracy mean?" |
| T6 | Export your trip data, then delete the trip and confirm the result. Switch the interface to Kazakh and back. | Saved trip | Export produces a usable file; deletion requires confirmation and removes the trip; language switch is complete and persistent | "Where is your data stored? Is it on our server?" (must answer: on this device) |
| T7 (offline) | Turn on airplane mode, reload the app, open the saved trip and the emergency guidance. | App loaded once | App shell and essential guidance load offline; saved trip is available; no misleading "live" data shown | "Is this information current? How can you tell?" |

Optional if time allows: 10-item SUS and a 1–7 single ease question (SEQ) after each task. Do not treat SUS as validation of the product concept.

### 7.4 Post-test debrief (8–10 min)

- Hardest moment; what they expected; what they would do differently.
- "Which part would you actually use on a real trip? Which would you ignore?"
- "What would stop you from trusting this?"
- "Would you share this with a friend? What would you say it is?"
- "Is anything here misleading or unsafe?"
- Ask about the three limits again in their own words: not sent, not monitored, not a rescue guarantee.

### 7.5 Safety-comprehension release gate

If **any** participant believes a generated message was delivered, that the app monitors the trip, or that a route is certified safe after seeing the relevant screen, log it as a severity-1 comprehension failure. Fix the interface and re-test that comprehension point with at least 3 new participants before release. One failure is enough to block a "clear" claim.

---

## 8. Note-taking template (per session)

Use a new file per session. No names, no phone numbers, no exact home addresses.

```markdown
# Session note — P## — Round 1 — 2026-MM-DD

- Participant ID: P##
- Segment: A / B / C
- Session language: kk / ru / en
- Method: interview / usability / both
- Duration:
- Device/browser:
- Recording consent: audio yes/no; screen yes/no
- Facilitator / note-taker:
- Conflict of interest: none / described

## Context (facts only)
- Last trip (generalized):
- Group size / role:
- Tools used:
- Experience self-description:

## Timeline of the session
| Time | What happened / what was said (verbatim where possible) | Observation vs interpretation |
|---|---|---|
| 00:03 |  |  |

## Current behavior
- Preparation steps:
- Who knows the plan / what they know:
- Connectivity workarounds:
- Language behavior:

## Pain points and workarounds (verbatim)
- 

## Usability results
| Task | Independent / with help / failed | Time | Errors | Notes |
|---|---|---|---|---|
| T1 |  |  |  |  |

## Comprehension checks
- Message sent? (correct/incorrect, quote)
- App monitors? (correct/incorrect, quote)
- Route verified? (correct/incorrect, quote)
- Data location? (correct/incorrect, quote)

## Quotes worth keeping (verbatim, de-identified)
> 

## Contradictions / surprises
- 

## Follow-ups
- 

## Researcher memo (clearly separated from observation)
- 
```

**Note-taking rules**

- Separate **observation** (what happened / what was said) from **interpretation** (what you think it means). Never merge them.
- Record verbatim quotes with timestamp; do not clean up grammar.
- Record the tool names and the exact wording of messages participants show you (with permission).
- If you did not hear it, do not write it.
- Debrief within 24 hours while memory is fresh; mark uncertain notes as "uncertain".

---

## 9. Findings log template

One row per **atomic observation**, entered within 48 hours of the session. Aggregated themes are written only in the analysis summary, never in the raw log.

| Field | Definition |
|---|---|
| `participantId` | Pseudonymous ID (`P01`…). Never a name. |
| `date` | Session date (YYYY-MM-DD). |
| `method` | `interview`, `usability`, `both`, `follow-up` |
| `segment` | `A` independent, `B` group organizer, `C` guide |
| `context` | Trip type / task ID, one line |
| `observation` | Fact or verbatim quote. No interpretation. |
| `hypothesis` | H1–H10, or `new` |
| `effect` | `supports`, `refutes`, `mixed`, `inconclusive` |
| `confidence` | `high`, `medium`, `low` (definitions in Section 10.3) |
| `evidence` | Note file + line/timestamp; recording timestamp if consented |
| `reviewer` | Second person who checked the row against the note |
| `notes` | Contradictions, follow-up needed |

Copyable row:

```markdown
| P01 | 2026-11-03 | interview | A | Last trip, preparation | "I screenshot the route because the map dies above the waterfall." | H4 | supports | medium | notes/P01.md#L42; audio 00:18:20 | [initials] | Workaround is screenshots, not offline maps |
```

**Log rules**

- A theme requires **at least 2 independent participants** to be called a finding. A single participant is an anecdote, labeled as such.
- Count **participants**, not mentions. One person repeating something five times is still one participant.
- Negative cases are mandatory: record observations that contradict the emerging theme, and state how they affect confidence.
- Never write a finding as a percentage of "users" from this sample. Write "4 of 8 participants".
- If a quote is translated, keep the original and the translation side by side; note the translator.
- Findings that could affect safety (misunderstanding of sending/monitoring/route status) are logged immediately and escalated the same day.

---

## 10. Analysis method

### 10.1 Process (affinity mapping)

1. **Normalize** each session note into atomic observations (one idea per card/row), keeping the participant ID and evidence pointer.
2. **Open code** the observations with short labels (e.g., "screenshot workaround", "no return time agreed", "fear of battery drain").
3. **Cluster** codes into themes by journey stage: before leaving, sharing, during the trip, emergency, after return. Use a physical board or FigJam/Miro; keep the original IDs visible.
4. **Name clusters as problem statements**, not feature names. ("People cannot state a return time their contact would act on", not "needs sharing feature".)
5. **Map** each cluster to H1–H10. Mark `supports`, `refutes`, `mixed`, or `inconclusive`.
6. **Weigh** by number of independent participants and by method (observed behavior in usability > stated opinion > inferred preference).
7. **Search for disconfirming evidence**: who does not have this problem, and why? Add it to the summary.
8. **Decide**: keep, revise, or drop the hypothesis; record the decision and the evidence count.
9. **Write** a 1–2 page findings summary with N, segments, dates, themes, contradictions, confidence, and implications.
10. **Update** `docs/product-definition.md` with a dated changelog entry referencing the findings summary. Do not silently rewrite personas or scope.

### 10.2 Synthesis workshop

- 60–90 minutes, facilitator + note-taker + one person who did not run sessions.
- Start from raw observations, not from the team's preferred narrative.
- Timebox clustering; park disagreements as "inconclusive" rather than forcing consensus.
- End with a decision log: what changed, what did not, what needs another round.

### 10.3 Confidence definitions

| Level | Convention |
|---|---|
| High | ≥4 participants across ≥2 segments, and at least one observed behavior (not only stated opinion), with no strong contradicting case. |
| Medium | 2–3 participants, or a single method, or a mostly stated preference. |
| Low | 1 participant, inferred from indirect evidence, or contradicted by another observation. |

These are project conventions for a small qualitative sample. They are not statistical confidence and must not be presented as such.

### 10.4 What not to do

- Do not report "X% of users" from 6–10 interviews.
- Do not merge guide feedback with independent-hiker feedback without labeling the segment.
- Do not convert a usability failure into a feature request without checking whether the label or flow caused it.
- Do not let the person who designed the screen run the only analysis of that screen without a second reviewer.
- Do not delete disconfirming notes.

---

## 11. Evidence storage and data handling

### 11.1 Storage layout

```text
research/                      # never committed to the repository
  consent/                     # signed forms or consent records, access-restricted
  keys/                        # pseudonym ↔ contact mapping, encrypted, separate from notes
  2026-11-03/
    P01/
      audio.enc                # encrypted recording
      screen.enc               # only with separate consent
      notes.md                 # de-identified
      consent.md               # consent status, no signature image
  findings/
    2026-11-findings.md
    findings-log.md
```

- Keep `research/` out of version control (add to `.gitignore` when the repository exists). Never commit recordings, consent forms, contact details, or raw transcripts.
- Encrypt audio/video at rest (e.g., `age` or an encrypted archive). Store the key separately from the files.
- Cloud storage, if used, must have per-user accounts, 2FA, and access limited to named project members. A shared link is not acceptable.
- Access list: maximum 2–3 named people. Record who accessed raw data and when.
- Screen recordings must not capture notifications, contact names, or personal photos. Ask participants to enable Do Not Disturb; crop or blur if needed.

### 11.2 Retention and deletion

| Data | Retention | Action |
|---|---|---|
| Raw audio/video | 90 days after analysis, or earlier on request | Delete file and any local copies; confirm in the log |
| De-identified notes | Up to 12 months | Review; delete or keep only aggregated findings |
| Consent records | As required by the applicable rules; store separately | Do not link to findings publicly |
| Pseudonym key | Until follow-up is no longer needed, then delete | Never store with notes |
| Findings summary | Project lifetime | Contains no direct identifiers |

- Withdrawal request: stop using the data, delete raw recordings and notes within 7 days, and confirm in writing. Aggregated findings that cannot be traced back may remain.
- If a breach or accidental exposure occurs, record it, notify the affected participant without delay, and delete/rotate exposed files.

### 11.3 Privacy rules during sessions

- Do not ask for passport numbers, medical records, exact home addresses, or financial data.
- If a participant volunteers sensitive information, do not transcribe it; note "sensitive detail withheld" and move on.
- Generalize route details in shared notes when they could identify a person (e.g., "a route above Almaty" instead of a specific secluded trailhead).
- Do not photograph faces without separate consent. Do not use session screenshots in the pitch or video unless the participant consented to that use specifically.
- Do not include research data in demo mode, sample data, or the product tour.
- Follow applicable data-protection requirements and the competition's rules; when in doubt, collect less.

---

## 12. Ethics and safety

- **Voluntary participation.** No employer, club, or guide relationship may pressure participation. Recruit organizers separately from their group members.
- **No emergency simulation with real calls.** Never dial emergency numbers, send real SMS, or trigger real alerts during a session.
- **Distress protocol.** If a participant becomes distressed recalling an incident: stop, acknowledge, offer to pause or end, and do not probe for details. Do not provide medical or rescue advice.
- **Weather/trail conditions.** Do not ask participants to hike or meet at a remote location for research. Use a café, co-working space, office, or video call.
- **Vulnerable participants.** Do not recruit people who are currently involved in a rescue, bereaved, or in crisis.
- **Honest framing.** Do not promise the product will keep them safe, and do not imply official endorsement.
- **Incentive ethics.** Payment is for time, not for praise. State this before the session.

---

## 13. Schedule and logistics

| Step | Timing | Output |
|---|---|---|
| Pilot session with 1 internal-friendly participant (not counted) | Before Round 1 | Fixed script, timing, task wording |
| Round 1: 6–8 interviews + usability on early build | MVP early | Findings log, severity list |
| Synthesis 1 + product-definition update | Within 1 week | Dated changelog, scope decisions |
| Round 2: 6–8 sessions on near-final build | Before release candidate | Comprehension re-test, task success |
| Synthesis 2 + final findings summary | Before PDF/video claims | Evidence-backed claims only |

Logistics per session: 15 min setup, 30–40 min interview, 35–45 min usability, 10 min buffer. Two researchers maximum in the room. Send the consent form and a short agenda 24 hours ahead; do not send the concept in advance (it biases the elicitation).

---

## 14. Research status register (fill in as work happens)

| Round | Planned N | Completed N | Dates | Segments | Evidence file | Status |
|---|---|---|---|---|---|---|
| Pilot | 1 | 0 | — | — | — | Not started |
| Round 1 | 8 | 0 | — | — | — | Not started |
| Round 2 | 8 | 0 | — | — | — | Not started |

**Current status: 0 participants. No findings exist.** Any document that cites user evidence before this table is updated is in violation of this plan.

---

## 15. Outputs of this plan

1. `research/findings/findings-log.md` — raw, per-observation evidence.
2. `research/findings/YYYY-MM-findings.md` — synthesis with N, themes, contradictions, confidence.
3. A dated changelog entry in `docs/product-definition.md` for every scope or persona change.
4. A short list of **verified claims** that may be used in the pitch/PDF/video, each with participant count and method, and a list of claims that remain hypotheses.

If no sessions are completed, output only item 4's second list: the claims that remain hypotheses, stated plainly.
