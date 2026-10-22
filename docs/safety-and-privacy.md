# Dala Safe — Safety and Privacy

| Field | Value |
|---|---|
| Document | Safety model, data inventory, storage, export/delete, privacy |
| Session | P3-G3 (data management and privacy) |
| Last updated | 2026-10-20 |
| Status | Working document — not a legal privacy policy, not a safety certification |
| Related register | [`docs/safety-sources.md`](./safety-sources.md) |

> This document describes what the current application actually does. It does
> not claim official partnership with emergency services, rescue organisations,
> government bodies, or telecom operators. Emergency content remains subject to
> the source and human-review rules in `docs/safety-sources.md`.

---

## 1. Purpose and scope

Dala Safe is a mobile-first trip preparation and safety-planning PWA. It helps a
user record a trip plan, prepare a checklist, create a shareable safety plan, and
keep essential guidance available. It is intended to support preparation and
communication; it is not a replacement for official instructions, rescue
services, or certified navigation tools.

This document covers:

- the safety model and explicit non-claims;
- what Dala Safe does and does not do;
- the data the app stores locally;
- export, import and delete-all behaviour;
- privacy, analytics and offline-cache stance;
- requirements for emergency content and kk/ru safety text review;
- known limitations.

---

## 2. Safety model

Dala Safe follows a conservative safety model:

1. **The user remains responsible for the trip and for contacting help.** The app
   prepares information; it does not take over trip management.
2. **Generated is not sent.** A message, plan, or phone link produced by the app
   is not evidence that anything was delivered or that a call connected.
3. **Official guidance wins.** If app text conflicts with an official emergency
   service or local authority instruction, the official instruction applies.
4. **Uncertainty is shown, not hidden.** Coordinate accuracy, offline limits,
   imported-file quality and translation status must not be presented as
   guarantees.
5. **No invented operational capability.** Numbers, response times, rescue
   locations, rescue availability, weather warnings and integrations must come
   from a dated, attributable source.

### 2.1 What Dala Safe is not

Dala Safe is **not**:

- an emergency dispatch service;
- a monitoring or check-in service;
- a satellite messenger or satellite SOS device;
- an SMS gateway or automatic message sender;
- a certified navigation, avalanche, or mountain-safety system;
- a rescue guarantee or a promise of response time;
- an official channel for registering an itinerary with authorities;
- a backup or synchronization service for trip records.

The app does **not** dispatch rescuers, monitor the user's location, detect falls,
send SMS automatically, contact satellites, notify a trusted contact
automatically, or guarantee connectivity.

---

## 3. What the app does and does not do

### 3.1 Current capabilities

- Stores trip plans in the browser on the current device.
- Stores checklist state, readiness answers, and an optional safety plan with
  the trip.
- Generates shareable text for the user to copy, share, or send using their own
  device and apps.
- Provides locally available preparation and emergency guidance, subject to the
  source and review register.
- Exports trips to a documented JSON file and imports such a file back.
- Deletes all local app data after an explicit confirmation.

### 3.2 Explicit non-capabilities

- No account creation, login, profile, or user directory.
- No backend, database, cloud sync, or cross-device transfer.
- No automatic location tracking or location history.
- No automatic emergency calling, SMS, push alert, or satellite transmission.
- No live weather, live hazard feed, or live rescue-status service.
- No background monitoring when the app is closed.
- No analytics, advertising, or behavioural tracking SDK.

Some screens may label future or simulated capabilities as **Demo**,
**Planned**, **Requires integration**, or **Needs verification**. Those labels are
part of the safety model and must not be removed to make a demonstration look
more capable than it is.

---

## 4. Data inventory

All app data described below is stored in the browser's `localStorage` for the
current origin. Nothing in this inventory is stored on a Dala Safe server,
because the app has no Dala Safe server.

### 4.1 Trip records

| Field | Meaning | Notes |
|---|---|---|
| `id` | Local trip identifier | Also used for import merge by id |
| `name` | Trip name | User-entered |
| `destination` | Destination or route description | User-entered |
| `departureAt` | Planned departure date/time | Stored as entered by the form |
| `returnAt` | Expected return date/time | Stored as entered by the form |
| `groupSize` | Number of people | User-entered |
| `notes` | Free-text notes | May contain sensitive personal detail |
| `status` | `draft`, `ready`, or `completed` | Local workflow state |
| `createdAt`, `updatedAt` | Timestamps | Local record metadata |
| `checklist` | Checklist items | Includes localised labels, required flag, done flag, custom flag |
| `readiness` | Preparation answers | Duration, group experience, connectivity, forecast availability, route type |
| `safetyPlan` | Optional safety plan | Includes trusted-contact name and phone, meeting point, notes, guidance ids, generation time |
| `track` | Optional GPX track | If present: route name, source label, points with latitude/longitude and optional elevation/time, summary, warnings |

The optional `track` field is part of the trip schema. It can appear if route
data has been imported or created by a feature that populates it. Treat such a
trip export as location-sensitive data.

### 4.2 Settings

| Key | Contents |
|---|---|
| `dala-safe:v1:settings` | Language (`kk`, `ru`, `en`), units (`metric`), onboarding flag |

### 4.3 Demo state

| Key | Contents |
|---|---|
| `dala-safe:v1:demo` | State for the product tour / demo experience. This must not hold real personal data. |

### 4.4 Quarantined data

If stored JSON is unreadable, the storage layer may keep a best-effort raw copy
under a key such as `dala-safe:v1:trips:corrupt:<timestamp>`. This is a diagnostic
copy of damaged data, not an active trip record.

### 4.5 Data that is not stored

- **Emergency-screen geolocation is not stored automatically.** When the
  emergency screen requests location, the coordinates are for that moment's
  display and user action. They are not written to the trip record, export, or a
  server by the app.
- No location history, movement trail, or background location record is kept.
- No account identifiers, email addresses, passwords, or authentication tokens
  are stored because there are no accounts.
- No analytics identifiers, advertising identifiers, or cross-site tracking
  identifiers are created by the app.
- No server-side copy of trip data exists.

A user can still type location details into free-text fields, and an imported
GPX track can contain coordinates. Those become part of the local trip record
and of any export the user creates.

---

## 5. Data flow and local storage

### 5.1 Normal flow

1. The user enters trip details in the browser.
2. The app validates the form and writes the trip list to `localStorage`.
3. The app reads the trip list from `localStorage` on load.
4. Export serialises the local trip list to a JSON `Blob` and downloads it.
5. Import reads a user-selected file in the browser, validates it, and writes the
   merged trip list back to `localStorage` once.

No trip data is transmitted to a Dala Safe backend. The application shell and
static assets may be fetched from the site origin and cached by the service
worker. The service worker in this repository precaches the app shell, icons and
manifest, and runtime-caches same-origin static assets; it does not read or cache
the contents of `localStorage`.

### 5.2 Storage limitations

- `localStorage` is **per browser profile and per origin**. Another browser,
  another device, or a private window may show different data or no data.
- The browser or operating system can clear it at any time: storage pressure,
  privacy cleanup, "clear site data", profile deletion, or a crash.
- Storage quota is finite and browser-dependent. Reaching the quota can make a
  write fail.
- In private/incognito mode, data may disappear when the session ends.
- There is **no cloud backup** and no automatic backup.
- Data is **not encrypted at rest** by Dala Safe. Anyone with access to the
  browser profile or device may be able to read it.
- A browser extension, malware, or cross-site scripting vulnerability could read
  or modify local data. Dala Safe does not provide a security boundary against a
  compromised device or browser.
- If a write fails, the UI must not imply that data was saved. The current data
  screen surfaces quota and unavailable-storage messages from the shared
  `storageProblem` state.

### 5.3 Corruption handling

- Unreadable trip envelopes are skipped so the app can start in a safe state.
- A raw copy may be quarantined for diagnosis, as described above.
- Readable trips are kept; the app does not silently invent replacements.
- Delete-all attempts to remove quarantined copies when the storage backend can
  be enumerated (normal browser `localStorage`). If storage cannot be
  enumerated, those copies may remain until site data is cleared.

---

## 6. Export procedure

1. Open **Settings → Manage local data** (`/settings/data`).
2. Select **Export all trips**.
3. The browser downloads `dala-safe-trips-YYYY-MM-DD.json` (date in local time).
4. The screen reports how many trips were included.

Export is disabled when there are no trips.

### 6.1 Format

```json
{
  "format": "dala-safe-trip-export",
  "version": 1,
  "exportedAt": "2026-10-20T10:00:00.000Z",
  "trips": []
}
```

The `trips` array contains the full local trip records, including notes, checklist
state, readiness answers, safety-plan contact details, and any stored route
points. The file is UTF-8 JSON and is **not encrypted**.

### 6.2 Privacy warning

The export file contains personal trip details, possibly including:

- names and descriptions of trips;
- free-text notes and meeting points;
- a trusted contact's name and phone number;
- route coordinates if a track is stored with a trip;
- timestamps that reveal travel plans.

Store the file securely, share it only with people you trust, and delete copies
you no longer need. Exporting does not upload the file anywhere.

---

## 7. Import procedure

1. Open **Settings → Manage local data** (`/settings/data`).
2. Choose a Dala Safe JSON export (`.json`).
3. The file is rejected if it is larger than **5 MB**
   (`5 × 1024 × 1024` bytes), unreadable, not JSON, or not a Dala Safe export.
4. The screen reports the number of trips in the file, new trips, and replaced
   trips. A valid export containing zero trips is reported and changes nothing.

### 7.1 Merge behaviour

- Existing trips are kept.
- A trip with the same `id` as an imported trip is **replaced by the imported
  version**.
- New trips are placed before the existing trips.
- Stored trips not present in the file remain unchanged.
- If the file itself repeats an `id`, the **last occurrence wins**.
- The merge is computed fully before a single `replaceAll` call. Invalid,
  oversized, or unreadable files therefore cause no partial write.
- If the final storage write fails because storage is unavailable or full, the
  in-memory screen may show the import result while the shared storage warning
  indicates that the change may not persist. Reloading may then lose the import.

Import validates the documented envelope and trip shape; it does not verify that
the content is factually correct or safe. Treat files from other people as
untrusted data.

---

## 8. Delete-all procedure

1. Open **Settings → Manage local data**.
2. Optionally use **Export a copy first**. The delete confirmation also reminds
   the user to export.
3. Select **Delete all local data**.
4. Confirm in the destructive dialog.

Deletion:

- clears the in-memory trip list through `replaceAll([])`;
- removes the trips, settings and demo keys from `localStorage`;
- removes quarantined `:corrupt:` copies when storage can be enumerated;
- does not delete exported files, downloads, operating-system backups, or copies
  held by third-party apps or cloud drives.

After deletion, the language resets to the default (Kazakh) on reload because the
settings key is removed. Checklist progress, safety plans, trusted-contact details
and trip notes stored in the browser are removed with the trip records.

If storage is unavailable, removal may fail. The app must show a safe storage
message rather than claiming success. In that situation, clear site data through
the browser to remove anything that remains.

---

## 9. Privacy and analytics stance

- **No account and no backend.** The application does not have a Dala Safe server
  for trip data, authentication, or synchronization.
- **No cross-device sync.** Moving to another device requires a manual export and
  import.
- **No analytics SDK and no telemetry calls in this repository.** The app does not
  send usage events, screen views, crash reports, or behavioural profiles to an
  analytics provider.
- **No advertising or third-party tracking scripts** are included.
- **No sale or sharing of trip data** by Dala Safe, because the app does not
  receive trip data.
- **User-initiated actions only.** Copying, sharing, opening a phone link, or
  opening an external source happens only when the user acts. A `tel:` link only
  starts a call attempt on a supported device; it does not confirm connection.
- **External links** open third-party sites. Their privacy practices are outside
  Dala Safe's control.
- **Local data is readable on the device.** Dala Safe does not encrypt
  `localStorage` or export files. Use device lock, browser profile security and
  safe file handling.
- **Demo and tour content** must use sample data, not real personal trip data.

If analytics, crash reporting, a backend, or sync are added later, this document
must be updated before release, with the data collected, purpose, retention,
recipients, and user control stated explicitly.

---

## 10. Emergency content source and review requirements

Emergency content is safety-critical. The canonical source register and field
schema are in [`docs/safety-sources.md`](./safety-sources.md). The following rules
apply to every emergency number, instruction, phrase and hazard statement:

1. **Named official source.** Each item needs a publisher, an exact source URL, a
   `lastVerified` date, and a review status.
2. **No invented facts.** Never invent a phone number, response time, rescue
   location, rescue capability, weather warning, or official approval.
3. **Show provenance.** The UI must display the source and verification date next
   to safety content, not hide them in an inaccessible place.
4. **Do not imply connection or delivery.** A phone link, copied message, or
   generated plan is not proof that help was contacted or that a message arrived.
5. **Do not promise coordinate accuracy.** Browser geolocation can be inaccurate,
   stale, or unavailable. Coordinates are an aid for communication, not a rescue
   guarantee.
6. **Do not cache live data as current.** Weather, hazard and status information
   must show when it was fetched and must not be presented as live when offline
   or stale.
7. **Default to `human-review-required`.** A machine-translated or
   machine-assisted safety string is not approved content until a competent
   human reviewer signs it off.
8. **Escalate unresolved items.** If a source is conflicting or unverified, do
   not show the item as authoritative. Mark it or omit it.
9. **Follow official guidance first.** In a life-threatening situation, direct the
   user to the official emergency service (112 in Kazakhstan) and local
   authorities.

The current Kazakh and Russian safety text is **machine-assisted and pending
human review** unless a specific item is marked otherwise in the source register.
No claim of professional translation, medical review, or rescue-service approval
should be made before that review is recorded.

---

## 11. Known limitations

- Local-only storage can be cleared without warning; manual export is the only
  backup.
- Export files are plain, unencrypted JSON.
- Import is limited to 5 MB and to the Dala Safe export envelope.
- Import replaces by `id`; it cannot detect two different trips that happen to
  use the same id.
- Schema validation is structural, not a malware or content-safety scan.
- The app cannot recover data that the browser has already removed.
- Delete-all cannot remove OS-level backups, browser sync of other data,
  downloaded export files, or copies made by other apps.
- Delete-all may not remove quarantined raw copies if the storage backend cannot
  be enumerated.
- No encryption at rest, no remote wipe, and no multi-user separation.
- Browser geolocation accuracy and availability are not guaranteed.
- GPX/route data, if present in a trip, is location-sensitive and is included in
  exports.
- Live weather, live hazards, dispatch, SMS, satellite and automatic monitoring
  are not implemented.
- Emergency numbers and guidance must be re-verified against official sources;
  outdated or unreviewed content must not be treated as current.
- This document is not a legal privacy policy and has not been reviewed by a
  lawyer or data-protection authority.

---

## 12. Human-review checklist for Kazakh and Russian safety text

Use this checklist before any kk/ru string is treated as reviewed. Record the
reviewer, date and evidence in the safety-sources register.

| # | Check | Status |
|---|---|---|
| 1 | Reviewer is a native or fully fluent kk/ru speaker with relevant safety, medical, or professional translation competence. | ☐ |
| 2 | Every emergency number matches an official source and the `lastVerified` date. | ☐ |
| 3 | No response time, rescue location, rescue capability, or official partnership is invented or implied. | ☐ |
| 4 | Urgency and imperative tone are preserved; wording does not soften a life-threatening instruction. | ☐ |
| 5 | "Call", "send", "share", "dispatch" and "rescue" are not mistranslated as completed actions. | ☐ |
| 6 | `tel:` labels make clear that a link only starts a call attempt and does not prove connection. | ☐ |
| 7 | Coordinate wording states that accuracy is not guaranteed and is not a rescue guarantee. | ☐ |
| 8 | 112 and any local rescue number are consistent across kk, ru and en. | ☐ |
| 9 | Units, dates, times, casing and punctuation are correct for the locale. | ☐ |
| 10 | Long Kazakh/Russian words and Cyrillic text fit mobile layouts without clipping or overflow. | ☐ |
| 11 | Machine-translation markers are removed only after human review, not before. | ☐ |
| 12 | Unresolved or conflicting items are marked as needing verification or omitted from authoritative UI. | ☐ |
| 13 | Reviewer name, review date and source evidence are recorded in `docs/safety-sources.md`. | ☐ |
| 14 | The reviewed text still matches the English meaning and the official source. | ☐ |

If any item is unchecked, the text remains **human-review-required** and must not
be presented as authoritative safety guidance.
