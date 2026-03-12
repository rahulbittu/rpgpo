# Sprint 571: Discover Sections Extraction

**Date:** 2026-03-10
**Story Points:** 3
**Status:** Complete
**Tests:** 26 new + 13 redirected (10,803 total across 461 files)

## Mission

Extract discover-mode sections from search.tsx into a DiscoverSections component. search.tsx was at 670/680 LOC (99% of threshold) — flagged as P1 in Arch Audit #72. This extraction frees 82 LOC, bringing search.tsx to 588 LOC with significant headroom for future features.

## Team Discussion

**Marcus Chen (CTO):** "This is the kind of preventive maintenance that keeps velocity sustainable. search.tsx was one feature away from hitting its threshold. The extraction creates room for 2-3 more feature additions before the next threshold concern."

**Sarah Nakamura (Lead Eng):** "The DiscoverSections component (154 LOC) encapsulates 6 discover-mode elements: discover tip, city comparison, BestIn categories, cuisine indicator, featured section, trending, and dish leaderboards. All rendered conditionally based on debouncedQuery. search.tsx drops from 670 to 588 LOC (-82)."

**Amir Patel (Architecture):** "13 test files redirected — the most in any extraction sprint. The discover sections had tendrils across Sprint 167, 284, 287, 292, 293, 295, 297, 301, 302, 326, 404, 568 tests. All cleanly redirected to DiscoverSections.tsx with zero behavioral changes."

**Rachel Wei (CFO):** "Extraction sprints don't add user-facing value directly, but they maintain build velocity. Without this, Sprint 572 (photo gallery grid) would have been blocked by the search.tsx threshold."

**Jordan Blake (Compliance):** "The callback prop naming convention (onSetQuery, onSetActiveFilter, onSetSelectedCuisine) is consistent and self-documenting. Makes the data flow between parent and child clear."

## Changes

### New: `components/search/DiscoverSections.tsx` (154 LOC)
- `DiscoverSectionsProps` interface: 13 props for city, query state, filter state, data, callbacks
- Renders: discover tip, CityComparisonOverlay, BestInSection, cuisine indicator, FeaturedSection, TrendingSection, DishLeaderboardSection
- Own StyleSheet: discoverTip, activeCuisineRow, activeCuisineChip styles
- Conditional rendering based on debouncedQuery and activeFilter

### Modified: `app/(tabs)/search.tsx` (670→588 LOC, -82)
- Removed 5 imports: BestInSection, TrendingSection, DishLeaderboardSection, CityComparisonOverlay, CUISINE_DISPLAY
- Removed unused imports: ScrollView, router
- Added: DiscoverSections import
- Replaced 50+ lines of discover section rendering with single `<DiscoverSections>` component
- Removed 7 styles: discoverTip, discoverTipTextStack, discoverTipTitle, discoverTipSubtext, discoverTipClose, activeCuisineRow, activeCuisineChip, activeCuisineText, activeCuisineCount

### Test Redirections (13 files)
- `sprint167-dish-leaderboard-ui.test.ts` — DishLeaderboardSection in discover
- `sprint284-search-cuisine-picker.test.ts` — BestInSection usage
- `sprint287-bestin-extraction.test.ts` — BestInSection import + usage
- `sprint292-cuisine-search-wiring.test.ts` — onCuisineChange wiring
- `sprint293-cuisine-indicator.test.ts` — CUISINE_DISPLAY + styles
- `sprint294-map-cuisine-indicator.test.ts` — cuisine in map view
- `sprint295-slt-audit.test.ts` — cuisine indicator visibility
- `sprint297-dish-deep-links.test.ts` — dish navigation
- `sprint301-entry-count-preview.test.ts` — entryCounts pass-through
- `sprint302-cuisine-analytics.test.ts` — cuisine analytics
- `sprint326-discover-doordash.test.ts` — BestIn + DishLeaderboard
- `sprint404-trending-section.test.ts` — TrendingSection import
- `sprint568-city-comparison-overlay.test.ts` — CityComparisonOverlay + LOC 680→600

### Modified: `shared/thresholds.json`
- search.tsx: maxLOC 680→600, current 670→588
- Added DiscoverSections.tsx: maxLOC 170, current 154
- Tests: minCount 10700→10800, currentCount 10777→10803

## Test Summary

- `__tests__/sprint571-discover-sections-extraction.test.ts` — 26 tests
  - DiscoverSections component: 14 tests (export, interface, props, imports, renders x5, discover tip, cuisine indicator, conditional render, styles, LOC)
  - search.tsx reduction: 9 tests (import, renders, removed imports x4, removed styles x2, LOC)
  - Backward compat: 3 tests (FlatList, BusinessCard, prop forwarding)
