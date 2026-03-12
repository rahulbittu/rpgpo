# Sprint 546: Recent/Popular Query Deduplication

**Date:** 2026-03-10
**Story Points:** 3
**Status:** Complete
**Tests:** 20 new (10,233 total across 435 files)

## Mission

Remove duplicate queries from the Popular Searches panel when the same query already appears in Recent Searches. Users seeing the same query in both panels is a minor UX issue flagged in the Sprint 544 retro.

## Team Discussion

**Marcus Chen (CTO):** "Deduplication is a small but important polish. When a user searches for 'biryani irving' and sees it in both Recent and Popular, it looks like a bug — not intentional overlap. The social proof of Popular is strongest when it shows queries the user hasn't already searched."

**Amir Patel (Architecture):** "The Set-based lookup with lowercase normalization is the right approach. It handles case differences ('Biryani' vs 'biryani') and whitespace variations. The filtering happens at render time, so no server changes needed."

**Sarah Nakamura (Lead Eng):** "The `excludeQueries` prop keeps the dedup logic in PopularQueriesPanel where it belongs. The parent just passes `recentSearches` — no new state or effects. Clean separation of concerns."

**Cole Richardson (City Growth):** "This was item #3 on the Sprint 544 retro action items. Good to close it quickly. The Popular panel now always shows genuinely new discovery — queries the community is searching that this specific user hasn't tried yet."

## Changes

### Client — PopularQueriesPanel (`components/search/SearchOverlays.tsx`, 410→414 LOC)
- Added `excludeQueries?: string[]` prop with empty array default
- Creates Set from excludeQueries (lowercase + trimmed) for O(1) lookup
- Filters queries before rendering — excluded queries never appear
- Returns null when all queries are excluded (no empty panel)
- Slices filtered results (not raw queries) to 6

### Client — Search Integration (`app/(tabs)/search.tsx`, 665→666 LOC)
- Passes `excludeQueries={recentSearches}` to PopularQueriesPanel
- No new state or effects — uses existing recentSearches from persistence hook

### Test Threshold Redirections
- `sprint544-search-autocomplete.test.ts` — null check: queries.length→filtered.length

## Test Summary

- `__tests__/sprint546-query-dedup.test.ts` — 20 tests
  - PopularQueriesPanel: 13 tests (excludeQueries prop, interface, default, Set, lowercase, trim, filter, null, slice, sprint ref, icon, badge, title)
  - Search wiring: 5 tests (passes excludeQueries, dedup prop, recent-first order, import, persistence hook)
  - File health: 2 tests (SearchOverlays.tsx < 425 LOC, search.tsx < 670 LOC)
