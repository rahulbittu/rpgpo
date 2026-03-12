# Sprint 693 — Pull-to-Refresh Timestamps

**Date:** 2026-03-11
**Theme:** Last-Updated Timestamps Across All Tabs
**Story Points:** 2

---

## Mission Alignment

When users pull-to-refresh, they need confidence that the data is fresh. Rankings already showed "Rankings updated 3 min ago" but Challenger and Discover didn't. This sprint adds `dataUpdatedAt` timestamps to Challenger and exposes the timestamp from `useInfiniteSearch` for Discover.

---

## Team Discussion

**Marcus Chen (CTO):** "Data freshness is trust. When a user pulls down on Challenger and sees 'Updated just now', they trust the vote counts. Without it, they wonder if they're looking at stale data."

**Sarah Nakamura (Lead Eng):** "Two changes: (1) Expose `dataUpdatedAt` from `useInfiniteSearch` — it was available from React Query's `useInfiniteQuery` but we weren't passing it through. (2) Add timestamp display to Challenger's header with `formatTimeAgo`. Discover has the plumbing now for a future UI addition."

**Dev Sharma (Mobile):** "The timestamp style matches Rankings — 9px, tertiary color, 0.7 opacity. It's subtle enough to not compete with the content but visible enough to reassure data freshness."

---

## Changes

| File | Change |
|------|--------|
| `lib/hooks/useInfiniteSearch.ts` | Exposed `dataUpdatedAt` from useInfiniteQuery |
| `app/(tabs)/challenger.tsx` | Added `dataUpdatedAt` + timestamp display + `lastUpdated` style |
| `app/(tabs)/search.tsx` | Added `formatTimeAgo` import + `dataUpdatedAt` destructure |

### Timestamp Coverage

| Screen | Has Timestamp | Status |
|--------|-------------|--------|
| Rankings | Yes | Pre-existing |
| Challenger | Yes | **Sprint 693** |
| Discover | Plumbed | Sprint 693 (UI in future) |
| Profile | N/A | Profile data is user-specific, timestamp less relevant |

---

## Health Metrics

| Metric | Value |
|--------|-------|
| Build size | 662.3kb / 750kb (88.3%) |
| Tests | 11,986 pass / 511 files |

---

## What's Next (Sprint 694)

Deep link validation — end-to-end testing of all notification deep link paths.
