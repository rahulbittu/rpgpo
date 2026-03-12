# Sprint 527: Search Page Modularization

**Date:** 2026-03-10
**Story Points:** 5
**Status:** Complete
**Tests:** 17 new (9,770 total across 416 files)

## Mission

Extract the map split view (selected business card overlay, map/list split, cuisine indicator) from `app/(tabs)/search.tsx` (798 LOC) into `components/search/SearchMapSplitView.tsx`. Reduce search.tsx to under 660 LOC.

## Team Discussion

**Amir Patel (Architecture):** "798→651 LOC, a 147-line reduction. The SearchMapSplitView at 207 LOC is self-contained with its own styles. It takes filtered businesses and callbacks as props — no data fetching, pure presentation."

**Marcus Chen (CTO):** "search.tsx was the largest UI file at 798 LOC. With this extraction plus the earlier filter/overlay extractions (Sprints 193, 287, 332, 383, 404), the Discover page is now a composition of 12 extracted components."

**Sarah Nakamura (Lead Eng):** "4 test files needed redirect: sprint144 (orphaned exports + MapView import), sprint281 (as any count), sprint294 (map cuisine display), sprint383 (map empty state). Clean redirects — all passing."

**Rachel Wei (CFO):** "search.tsx is now at 81% of the 800 LOC threshold. The map view was the single largest inline block — extracting it gives us headroom for future search features."

**Jordan Blake (Compliance):** "The extraction preserves all accessibility labels and roles on the map card overlay. No behavioral changes."

## Changes

### New Files

| File | LOC | Purpose |
|------|-----|---------|
| `components/search/SearchMapSplitView.tsx` | 207 | Map split view: selected card overlay, cuisine indicator, MapBusinessCard list |
| `__tests__/sprint527-search-modularization.test.ts` | 95 | 17 tests covering extraction and redirects |

### Modified Files

| File | Before | After | Delta | Change |
|------|--------|-------|-------|--------|
| `app/(tabs)/search.tsx` | 798 | 651 | -147 | Replaced map split view + styles with SearchMapSplitView |
| `tests/sprint144-product-validation.test.ts` | — | — | 0 | Redirect SubComponents import checks |
| `tests/sprint294-map-cuisine-indicator.test.ts` | — | — | 0 | Redirect to SearchMapSplitView |
| `tests/sprint383-discover-empty-state.test.ts` | — | — | 0 | Redirect map variant check |

### Extracted to SearchMapSplitView.tsx

- Map/list split container layout (Yelp-like)
- Selected business card overlay (photo, name, score, rank, cuisine, open/closed)
- Cuisine indicator chip in map list section
- Split list header with result count
- MapBusinessCard FlatList with empty state
- All map-related styles (15 style definitions)

## Test Summary

- `__tests__/sprint527-search-modularization.test.ts` — 17 tests
  - SearchMapSplitView: 10 tests (export, props, imports, card overlay, cuisine, list, empty state, styles, LOC)
  - search.tsx: 7 tests (import, render, no direct MapView, no map styles, LOC, retained list, retained filters)
