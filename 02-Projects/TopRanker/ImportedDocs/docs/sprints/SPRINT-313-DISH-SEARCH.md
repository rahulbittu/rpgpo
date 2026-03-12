# Sprint 313: Dish-Specific Search on Discover

**Date:** March 9, 2026
**Story Points:** 3
**Focus:** Show matching dish leaderboards in search autocomplete results

## Mission
When a user types "biryani" in the Discover search bar, they see business results but not the "Best Biryani in Dallas" leaderboard. This sprint adds dish leaderboard matching to the autocomplete dropdown — dish matches appear above business results with a "Ranking" badge.

## Team Discussion

**Marcus Chen (CTO):** "This closes the discovery gap. If someone searches for a dish, the most relevant result is the leaderboard, not individual businesses. Showing it first is the right UX decision."

**Amir Patel (Architecture):** "The dish boards data is already fetched for entry counts (Sprint 301). Sprint 313 reuses the same query, stores full board info (name, emoji, slug, entryCount), and filters client-side. No new API calls."

**Sarah Nakamura (Lead Eng):** "The dishSearchMatches computation is a simple `useMemo` — filter boards where the name includes the query. Case-insensitive, minimum 2 characters. The `DishMatch` interface is exported from SearchOverlays for type safety."

**Jasmine Taylor (Marketing):** "Typing 'biryani' and seeing 'Best Biryani · 5 spots ranked' with a Ranking badge is the ideal first impression. It tells users immediately that we have structured leaderboard data, not just reviews."

**Priya Sharma (QA):** "15 tests covering: DishMatch interface, dropdown rendering, navigation, entry count display, badge, search matching logic, backward compatibility."

## Changes
- `components/search/SearchOverlays.tsx` — Added `DishMatch` interface and `dishMatches` prop to AutocompleteDropdown; dish results render with emoji, entry count, and "Ranking" badge; 2 new styles
- `app/(tabs)/search.tsx` — Store full DishBoardInfo from API; compute `dishSearchMatches` via useMemo; pass to AutocompleteDropdown

## Test Results
- **234 test files, 5,992 tests, all passing** (~3.2s)
