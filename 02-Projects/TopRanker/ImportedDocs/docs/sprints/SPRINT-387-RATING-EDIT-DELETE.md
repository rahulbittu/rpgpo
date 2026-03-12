# Sprint 387: Rating Edit/Delete Capability

**Date:** 2026-03-09
**Type:** Feature — User Trust
**Story Points:** 5

## Mission

Give users the ability to edit (within 48h) and delete their ratings from the profile history. Backend routes already existed (Sprint 183) — this sprint wires up the client-side UI and API calls.

## Team Discussion

**Marcus Chen (CTO):** "Users need to be able to correct mistakes. A wrong score that can't be fixed erodes trust in the system. The 48-hour edit window balances correctability with integrity — ratings become permanent after 48h."

**Sarah Nakamura (Lead Eng):** "The long-press pattern is consistent with our ranked card copy-link feature (Sprint 337). Users who know the gesture get power features; casual users aren't overwhelmed."

**Amir Patel (Architecture):** "Good that the backend was already built. The PATCH route validates ownership and time window server-side, so even if someone bypasses the client check, the server enforces the 48h limit."

**Priya Sharma (Frontend):** "The action row slides in under the history row on long press. Edit shows for recent ratings (≤48h), expired message for older ones. Delete always available with Alert confirmation."

**Jordan Blake (Compliance):** "Delete with confirmation is the right UX. Users have agency over their data. The Alert with 'This cannot be undone' is clear consent."

## Changes

### Modified Files
- `components/profile/HistoryRow.tsx` — Enhanced with long-press action toggle, Edit (navigates to rate page with editRatingId), Delete (Alert confirmation + callback), 48h edit window check (42 → 142 LOC)
- `lib/api.ts` — Added editRatingApi (PATCH) and deleteRatingApi (DELETE) functions
- `app/(tabs)/profile.tsx` — Added handleDeleteRating callback, passes onDelete to HistoryRow, imports deleteRatingApi

### New Files
- `tests/sprint387-rating-edit-delete.test.ts` — 30 tests covering HistoryRow actions, API functions, profile integration, server routes

## Test Results
- **293 files**, **7,098 tests**, all passing
- Server build: **599.3kb**, 31 tables

## Architecture Notes
- Backend already existed (Sprint 183 PATCH/DELETE routes)
- 48h edit window enforced client-side (UX) AND server-side (security)
- Edit navigates to rate page with `editRatingId` param — rate page doesn't handle this yet (future sprint to pre-fill form)
- Delete triggers profile refetch to remove the row
