# Sprint 332: Extract Filter Components from search.tsx

**Date:** March 9, 2026
**Story Points:** 3
**Focus:** Reduce search.tsx from 963 to 862 LOC by extracting filter/price/sort components

## Mission
search.tsx at 963 LOC was 37 lines from the 1000 threshold (flagged in Audits #47 and #48). The filter chips, price chips, and sort chips were inline JSX totaling ~80 LOC with their styles. This sprint extracts them into `DiscoverFilters.tsx` — three memoized components: `FilterChips`, `PriceChips`, `SortChips`.

## Design Reference
**Before:** 963 LOC with inline filter/price/sort rendering + styles
**After:** 862 LOC (-101) using extracted components from DiscoverFilters

**Extracted components:**
- `FilterChips` — All / Top 10 / Challenging / Trending / Open Now / Near Me
- `PriceChips` — $ / $$ / $$$ / $$$$
- `SortChips` — Ranked / Most Rated / Trending

## Team Discussion

**Marcus Chen (CTO):** "search.tsx was our highest-risk file for threshold breach. 963 → 862 gives us 138 lines of headroom. The extracted components are self-contained with their own styles and haptics."

**Amir Patel (Architecture):** "Three React.memo components, each with typed props. FilterChips accepts onFilterChange + onNearMe callbacks. PriceChips uses a toggle pattern (tap again to clear). SortChips passes sort key to parent. Clean prop interfaces."

**Sarah Nakamura (Lead Eng):** "Updated 2 test files (sprint144, sprint326) that checked for inline patterns. The new sprint332 test file has 16 tests covering all three components and their integration in search.tsx."

**Jasmine Taylor (Marketing):** "No user-facing changes. The filter UX is identical."

**Priya Sharma (QA):** "16 tests verifying: all exports exist, filter types preserved, price levels preserved, sort options preserved, haptics, accessibility, integration in search.tsx ListHeaderComponent."

## Changes
- `components/search/DiscoverFilters.tsx` — NEW: Three extracted components (FilterChips, PriceChips, SortChips) with styles. 155 LOC.
- `app/(tabs)/search.tsx` — Replaced inline filter/price/sort with extracted components. Removed 12 style definitions. -101 LOC (963→862).
- Updated test files: sprint144, sprint326.

## Test Results
- **252 test files, 6,261 tests, all passing** (~3.5s)
- **Server build:** 607.4kb (under 700kb threshold)
