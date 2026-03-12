# Sprint 701 — Pull-to-Refresh Consistency

**Date:** 2026-03-11
**Theme:** UX Consistency
**Story Points:** 2

---

## Mission Alignment

Rankings and Discover used React Query's `isRefetching` for pull-to-refresh state, while Challenger and Profile used manual `useState(false)` + `setRefreshing(true/false)`. This inconsistency meant two different state management patterns for the same interaction. This sprint standardizes all 4 tabs on the React Query pattern — simpler, fewer lines, and automatically synchronized with the actual fetch state.

---

## Team Discussion

**Sarah Nakamura (Lead Eng):** "The manual pattern had a subtle race condition — if the refetch threw, `setRefreshing(false)` might not fire, leaving the spinner stuck. React Query's `isRefetching` is derived directly from the query state, so it's always correct."

**Amir Patel (Architecture):** "Challenger was able to drop `useState` entirely — it was only used for refreshing. Profile still needs it for `selectedBadge`, but the refresh-specific state is gone."

**Derek Liu (Mobile):** "All 4 tabs now have the same one-liner: `const onRefresh = useCallback(() => { Haptics.selectionAsync(); refetch(); }, [refetch])`. Consistent haptic feedback, consistent spinner behavior."

**Priya Sharma (Design):** "The spinner tint color is BRAND.colors.amber across all tabs. Small detail but it matters — no more visual inconsistency during refresh."

---

## Changes

| File | Change |
|------|--------|
| `app/(tabs)/challenger.tsx` | Replaced manual refreshing state with `isRefetching` from useQuery |
| `app/(tabs)/challenger.tsx` | Removed `useState` import (no longer needed) |
| `app/(tabs)/profile.tsx` | Added `isRefetching` to useQuery destructure, passed to ProfileContent |
| `app/(tabs)/profile.tsx` | Replaced manual refreshing state with `isRefetching` prop |
| `__tests__/sprint701-refresh-consistency.test.ts` | 22 tests for all 4 tabs + consistency check |

---

## Health Metrics

| Metric | Value |
|--------|-------|
| Build size | 662.3kb / 750kb (88.3%) |
| Tests | 12,120 pass / 517 files |

---

## What's Next (Sprint 702)

Empty state polish — illustrations + copy improvements.
