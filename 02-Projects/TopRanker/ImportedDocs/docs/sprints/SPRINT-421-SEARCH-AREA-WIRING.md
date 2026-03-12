# Sprint 421: Search onSearchArea Wiring

**Date:** 2026-03-09
**Type:** Enhancement — Search UX
**Story Points:** 2

## Mission

Complete the map "Search this area" feature started in Sprint 418 by wiring the onSearchArea callback in search.tsx. When users pan the map and tap "Search this area", results are filtered to businesses within 5km of the new map center. This completes the two-sprint map improvement cycle.

## Team Discussion

**Priya Sharma (Design):** "The 5km radius is intentional — it's roughly the area visible at zoom level 12-13 on Google Maps. Users pan, tap 'Search this area', and see only businesses near where they're looking. Simple and effective."

**Amir Patel (Architecture):** "The implementation is minimal: one new state variable (mapSearchCenter), one filter condition in the useMemo, one callback prop to MapView. Only 6 new lines in search.tsx."

**Sarah Nakamura (Lead Eng):** "search.tsx grew from 692→698 LOC (77.6% of threshold). Zero test cascades. The mapSearchCenter state is included in the useMemo dependencies, so filtered results recalculate automatically."

**Marcus Chen (CTO):** "This completes the Sprint 418 action item. The map view is now a functional search tool, not just a visualization."

## Changes

### Modified Files
- `app/(tabs)/search.tsx` (692→698 LOC, +6) — Added mapSearchCenter state, wired onSearchArea callback to MapView, added 5km proximity filter in useMemo, added mapSearchCenter + viewMode to useMemo deps

### Test Files
- `__tests__/sprint421-search-area-wiring.test.ts` — 9 tests: state, wiring, proximity filtering, file health

## Test Results
- **320 files**, **7,612 tests**, all passing
- Server build: **601.1kb**, 31 tables
- 0 test cascades

## File Health After Sprint 421

| File | LOC | Threshold | % | Change | Status |
|------|-----|-----------|---|--------|--------|
| search.tsx | 698 | 900 | 77.6% | +6 | OK |
| profile.tsx | 684 | 800 | 85.5% | = | OK |
| rate/[id].tsx | 554 | 700 | 79% | = | OK |
| business/[id].tsx | 494 | 650 | 76% | = | OK |
| index.tsx | 421 | 600 | 70% | = | OK |
| challenger.tsx | 142 | 575 | 25% | = | OK |

**All 6 key files at OK status.**
