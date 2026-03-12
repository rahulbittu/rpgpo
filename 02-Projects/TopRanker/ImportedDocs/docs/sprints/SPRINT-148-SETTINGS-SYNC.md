# Sprint 148: Settings Notification Sync + Backend Setup Guide

**Date:** 2026-03-08
**Sprint Duration:** 1 day
**Story Points Completed:** 13
**Total Tests:** 2,031 across 87 files (22 new + 3 fixed)

---

## Mission Alignment

Settings notification preferences were client-only — toggling a switch did nothing beyond the current session. This sprint closes that gap by persisting all 6 notification keys to the database via a jsonb column, syncing on mount and on every toggle. Additionally, the lack of a backend setup guide meant new engineers couldn't run the full stack with real Google Places data without tribal knowledge. Both were top critique priorities from Sprint 147.

---

## Team Discussion

**Marcus Chen (CTO):** "Settings sync was the single most embarrassing gap in the product. A user toggles 'weekly digest' off, closes the app, reopens — it's back on. That's not a preference system, that's a decoration. The jsonb column approach is correct — we don't need a separate table for six keys. This is the kind of fix that has zero visual impact but massive trust impact."

**Sarah Nakamura (Lead Eng):** "Implementation is clean. The PUT endpoint does a shallow merge so we never blow away keys the client didn't send. The client fires off the PUT without awaiting — fire-and-forget — so toggle latency is zero. If the network call fails, local state still reflects the user's intent and the next mount will re-sync. I verified the round-trip: toggle off, kill app, relaunch, preference stays off. 22 new tests cover the full matrix of key combinations plus edge cases like empty payloads and invalid keys."

**Amir Patel (Architecture):** "Using jsonb on the members table is the right call at our scale. If we ever hit a point where notification preferences become a complex domain — per-category, per-frequency, scheduling windows — we'd extract to a dedicated table. But for 6 boolean keys, a jsonb column with a default value avoids an unnecessary join. The storage layer function `updateNotificationPrefs` does a JSON merge at the Drizzle level, not a full row replacement, so concurrent writes on other member fields won't conflict."

**Derek Olawale (Frontend):** "The settings screen now does a `useEffect` fetch on mount that populates all 6 toggle states from the server response. Each toggle fires the PUT with the full current state object. I debated sending only the changed key, but sending the full object means we never get into a partial-sync state. The UX is identical — toggles are instant because we optimistically update local state. No loading spinners, no blocking. If the server is unreachable, the user doesn't even notice."

**Priya Sharma (Design):** "No visual changes this sprint, which is fine — the settings screen layout was already solid. What I care about is that the mental model matches reality. When a user sees a toggle in the 'off' position, it should mean off — on the server, in the push system, everywhere. This sprint makes that true. For Sprint 149, I'd like to revisit the settings screen to add confirmation feedback — a subtle toast or checkmark when preferences save successfully, so the user has confidence."

**Jasmine Taylor (Marketing):** "The backend setup guide is huge for onboarding. We've been losing a full day every time a new contractor or team member tries to get the stack running with real Google Places data. The SETUP.md covers env vars, API key provisioning, seed data, and the places proxy — everything that was previously spread across Slack threads and tribal knowledge. I'm going to link this from the hiring onboarding doc."

**Nadia Kaur (Security):** "I reviewed the jsonb column for injection vectors. Drizzle parameterizes the JSON value, so there's no raw SQL concatenation. The PUT endpoint validates that incoming keys match the allowed set of 6 — any unknown keys are stripped before write. Rate limiting on the preferences endpoint is inherited from the global middleware, so a misbehaving client can't hammer the DB with toggle spam. The setup guide correctly marks the Google Places API key as a server-only secret and warns against committing `.env` files."

**Jordan Blake (Compliance):** "Notification preferences are consent signals under GDPR. Persisting them server-side is not just a UX improvement — it's a compliance requirement. If a user opts out of marketing notifications, we need that preference stored durably, not just in a client-side cache that disappears on reinstall. This sprint moves us from 'technically non-compliant' to 'defensible' on notification consent. The 6 keys now include marketing-related categories, which means we have a clear audit trail for consent withdrawal."

---

## Changes

### 1. `shared/schema.ts` — notificationPrefs jsonb column
- Added `notificationPrefs` jsonb column to the `members` table with a default value containing all 6 keys set to `true`
- Keys: `pushEnabled`, `emailEnabled`, `weeklyDigest`, `rankingUpdates`, `challengerAlerts`, `marketingEmails`

### 2. `server/routes.ts` — expanded notification-preferences endpoints
- GET `/api/notification-preferences` now reads from the DB `notificationPrefs` column instead of returning hardcoded defaults
- PUT `/api/notification-preferences` validates incoming keys against the allowed set, strips unknown keys, and writes to DB via `updateNotificationPrefs`
- Expanded from 3 keys to 6 keys

### 3. `server/storage/members.ts` — updateNotificationPrefs function
- New function `updateNotificationPrefs(memberId, prefs)` that performs a JSON merge update on the `notificationPrefs` column
- Returns the updated preferences object

### 4. `server/storage/index.ts` — re-exported new function
- Added `updateNotificationPrefs` to the storage barrel export

### 5. `app/settings.tsx` — client sync on mount and toggle
- `useEffect` fetches current preferences from GET endpoint on mount
- Each toggle fires a PUT with the full preferences object (fire-and-forget, no await)
- Optimistic local state update ensures zero-latency toggle UX

### 6. `docs/SETUP.md` — comprehensive backend setup guide
- Environment variables reference (DB, Google Places API key, session secret)
- Google Places API key provisioning steps
- Database setup and seed data instructions
- Running the dev server with real API data
- Places proxy configuration
- Troubleshooting common issues

### 7. `tests/sprint148-settings-sync.test.ts` — 22 new tests
- Round-trip persistence: toggle, reload, verify
- All 6 keys individually tested
- Edge cases: empty payload, unknown keys stripped, partial updates
- Concurrent toggle rapid-fire test
- Unauthenticated request returns 401
- Default values on fresh account

### 8. `tests/sprint116-dashboard.test.ts` — 3 tests fixed
- Updated test assertions to use new 6-key preference structure instead of old 3-key names

---

## PRD Gap Status

| Gap | Status | Notes |
|-----|--------|-------|
| Settings preferences not persisted | CLOSED | All 6 keys synced to DB via jsonb |
| No backend setup documentation | CLOSED | docs/SETUP.md covers full stack setup |
| Community reviews functional | DEFERRED | Already works with real API data per Sprint 147 analysis |

---

## Test Summary

- **New tests:** 22 (sprint148-settings-sync.test.ts)
- **Fixed tests:** 3 (sprint116-dashboard.test.ts)
- **Total:** 2,031 tests across 87 files
- **All passing**
