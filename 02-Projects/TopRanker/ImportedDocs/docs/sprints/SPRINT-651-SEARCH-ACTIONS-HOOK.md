# Sprint 651: Extract useSearchActions Hook

**Date:** 2026-03-11
**Points:** 2
**Focus:** Extract URL sync + share handler from search.tsx into a reusable `useSearchActions` hook — addressing Audit #105 M2 finding

## Mission

search.tsx was at 98% ceiling (596/610 LOC) — flagged as M2 in Audit #105 and prioritized in SLT-650 as Sprint 651's deliverable. The URL sync logic (Sprint 647) and share handler (Sprint 644/646) are self-contained action behaviors that don't need to live in the main component. Extract them into `useSearchActions` to create headroom for future search features.

## Team Discussion

**Amir Patel (Architecture):** "The hook encapsulates three concerns: currentFilters memo, URL sync side effect, and share handler. All three depend on the same filter state inputs. Clean extraction boundary."

**Sarah Nakamura (Lead Eng):** "29-line reduction — 596→567 LOC. That drops search.tsx from 98% to 93% ceiling utilization. We've bought ourselves ~43 lines of headroom for the next search feature."

**Marcus Chen (CTO):** "This is the kind of tech debt sprint that pays for itself. Without this, any touch to search.tsx would have triggered a forced extraction under pressure."

**Nadia Kaur (Cybersecurity):** "The Share API and clipboard fallback logic moved cleanly into the hook. No security surface area changes."

**Jordan Blake (Compliance):** "URL sync via replaceState stays web-only — the Platform.OS check moved into the hook unchanged. No privacy implications."

## Changes

### `lib/hooks/useSearchActions.ts` (NEW — 63 LOC)
- `useSearchActions()` hook accepting filter state, query, city, result count, and urlParamsRead ref
- Returns `{ currentFilters, handleShareSearch }`
- Contains URL sync useEffect (replaceState on web)
- Contains native Share.share() with clipboard fallback

### `app/(tabs)/search.tsx` (596 → 567 LOC)
- Removed inline `currentFilters` useMemo
- Removed inline URL sync useEffect
- Removed inline `handleShareSearch` callback
- Removed `Share` import from react-native
- Removed `router` import from expo-router
- Removed `encodeSearchParams` and `SearchFilterState` imports from search-url-params
- Added `useSearchActions` import and hook call after `filtered` memo

### Test Updates
- `sprint451-url-sync.test.ts`: Updated to check for `useSearchActions` instead of `encodeSearchParams` in search.tsx
- `sprint471-preset-chips.test.ts`: Updated to check for `useSearchActions` instead of `currentFilters = useMemo`

## Health
- **Tests:** 11,696 pass (501 files)
- **Build:** 646.8kb (no change — client-side extraction only)
- **search.tsx:** 567 LOC (ceiling 610) — 93% utilization (was 98%)
