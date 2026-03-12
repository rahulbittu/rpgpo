# Sprint 634: Alignment Fix Complete — BestInSection + Test Updates

**Date:** 2026-03-11
**Points:** 3
**Focus:** Complete the double-padding alignment fix across all FlatList ListHeader components

## Mission

CEO feedback: chip rows and filter sections don't align with the neighborhood section (LeaderboardFilterChips). Root cause: FlatList's `contentContainerStyle: { paddingHorizontal: 16 }` stacks with child component padding. Fix pattern: ScrollViews get `marginHorizontal: -16` to cancel FlatList padding (their own `contentContainerStyle` re-applies it); View-based rows remove their `paddingHorizontal` since FlatList provides it.

## Team Discussion

**Sarah Nakamura (Lead Eng):** "This is the last piece — BestInSection had 4 styles with `paddingHorizontal: 16` that were doubling up. Same pattern we applied to RankingsListHeader and DiscoverFilters in Sprint 633."

**Marcus Chen (CTO):** "The alignment strategy is clean: ScrollViews use `marginHorizontal: -16` + `contentContainerStyle paddingHorizontal: 16`, Views rely on FlatList's padding. Consistent pattern across all ListHeader components now."

**Amir Patel (Architecture):** "Updated the Sprint 622 tests to reflect the new alignment strategy. Tests now verify that View-based rows do NOT have their own paddingHorizontal, since FlatList provides it."

**Priya Sharma (QA):** "11,694 tests pass. Build at 630.5kb. The fix touches BestInSection.tsx (Discover) and alignment test file. All other components were fixed in Sprint 633."

## Changes

### `components/search/BestInSection.tsx`
- Added `fullBleedRow: { marginHorizontal: -16 }` style
- Added `style={styles.fullBleedRow}` to all 3 ScrollViews (cuisineTabsScroll, dishShortcutsScroll, bestInScroll)
- Removed `paddingHorizontal: 16` from `bestInHeader` style (FlatList provides it)
- ScrollViews keep `paddingHorizontal: 16` in their contentContainerStyle (correct after -16 cancellation)

### `__tests__/sprint622-alignment-whitespace.test.ts`
- Updated 3 tests: `priceRow`, `sortRow`, `bestInHeader` now assert NO `paddingHorizontal` (FlatList provides it)
- Previously these tests expected `paddingHorizontal: 16` which caused double-padding

## Alignment Strategy Summary (All Components)

| Component | Location | Fix |
|-----------|----------|-----|
| RankingsListHeader — category chips | ScrollView in FlatList | marginHorizontal: -16 on style |
| RankingsListHeader — cuisine chips | View wrapper in FlatList | marginHorizontal: -16 on wrapper |
| RankingsListHeader — dish shortcuts | ScrollView in FlatList | marginHorizontal: -16 on style |
| RankingsListHeader — bestInHeader | View in FlatList | Removed paddingHorizontal |
| RankingsListHeader — rankingSummary | View in FlatList | Removed paddingHorizontal |
| DiscoverFilters — filterChips | ScrollView in FlatList | marginHorizontal: -16 on style |
| DiscoverFilters — priceRow | View in FlatList | Removed paddingHorizontal |
| DiscoverFilters — sortRow | View in FlatList | Removed paddingHorizontal |
| FilterChipsExtended — dietary | ScrollView in FlatList | marginHorizontal: -16 on style |
| FilterChipsExtended — distance | View in FlatList | Removed paddingHorizontal |
| FilterChipsExtended — hours | View in FlatList | Removed paddingHorizontal |
| BestInSection — cuisineTabs | ScrollView in FlatList | marginHorizontal: -16 on style (**this sprint**) |
| BestInSection — dishShortcuts | ScrollView in FlatList | marginHorizontal: -16 on style (**this sprint**) |
| BestInSection — bestInScroll | ScrollView in FlatList | marginHorizontal: -16 on style (**this sprint**) |
| BestInSection — bestInHeader | View in FlatList | Removed paddingHorizontal (**this sprint**) |

## Health
- **Tests:** 11,694 pass (501 files)
- **Build:** 630.5kb
- **BestInSection LOC:** ~186 (under 200 ceiling)
