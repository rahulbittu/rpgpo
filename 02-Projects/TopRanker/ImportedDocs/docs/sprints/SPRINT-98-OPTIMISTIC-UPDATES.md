# Sprint 98 — Optimistic Updates + M1 Audit Index

**Date**: 2026-03-08
**Theme**: Instant UI Feedback + DB Performance
**Story Points**: 8
**Tests Added**: 17 (409 total)

---

## Mission Alignment

Users expect instant feedback when they rate a business. Waiting for a server round-trip
before seeing any change breaks the illusion of a live, responsive app. Optimistic updates
show the result immediately and roll back only if the server rejects it.

---

## Team Discussion

**Priya Sharma (Frontend)**: "The rating mutation now has three lifecycle hooks working
together: onMutate optimistically increments totalRatings in the cache, onError rolls
it back with the stored previous state, and onSettled always refetches to sync with
server truth. Combined with SSE from Sprint 97, the user sees changes instantly."

**Amir Patel (Architecture)**: "The SSE invalidation replaces the old pattern of manually
invalidating 5 query keys in onSuccess. Now the mutation only needs to invalidate profile
(user-specific data SSE doesn't cover). Leaderboard, search, trending, and challengers
are all handled by SSE broadcasts. Cleaner separation of concerns."

**Marcus Chen (CTO)**: "Added the googlePlaceId index — `idx_biz_google_place`. The column
already had a unique constraint which creates an implicit index in most DBs, but an
explicit index makes the intent clear and guarantees B-tree access for the photo-fetching
LEFT JOIN query in getBusinessesNeedingPhotos(). M1 closed."

**Sarah Nakamura (Lead Engineer)**: "17 new tests cover the optimistic update lifecycle:
cache increment, field preservation, null cache handling, rollback on error, settled
refetch, error message mapping, and query key structure. 409 total tests."

**Leo Hernandez (Design)**: "The perceived performance improvement is huge. Before, you'd
submit a rating and see the old count until the server responded. Now the count bumps
instantly. If the server fails, it snaps back — but users rarely see that."

---

## Changes

### Optimistic Rating Updates
- Added `onMutate` to rating submission — cancels in-flight queries, snapshots cache, increments totalRatings
- Added `onError` rollback — restores previous cache state if mutation fails
- Added `onSettled` — always refetches business data for server consistency
- Removed manual invalidation of leaderboard/search/challengers from onSuccess — SSE handles these
- Error messages: network → "No internet", 401 → "Session expired", generic passthrough

### M1 Audit: googlePlaceId Index
- Added `idx_biz_google_place` index on businesses.googlePlaceId
- Supports the LEFT JOIN in getBusinessesNeedingPhotos() query
- Complements existing unique constraint for explicit B-tree access

### Query Stale Time Alignment
- Rating mutation relies on SSE for cross-query invalidation
- Profile still explicitly invalidated (user-specific, not broadcasted)

---

## Audit Status

| Item | Status | Sprint |
|------|--------|--------|
| M1: googlePlaceId index | CLOSED | 98 |
| M2: Email service integration | Open | — |
| M3: Cancel → expire placement | Open | — |
| M4: Webhook replay | Open | — |
| M5: Prune mock-data.ts | Open | — |

---

## What's Next (Sprint 99)

Continue M2-M5 audit items, add more SSE broadcast points (admin actions, claim
approvals), explore react-native-sse for true native real-time.
