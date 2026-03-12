# Sprint 312: Dynamic Dish Shortcuts via useDishShortcuts Hook

**Date:** March 9, 2026
**Story Points:** 3
**Focus:** Replace static CUISINE_DISH_MAP usage with a React Query hook that enriches shortcuts with real entry counts

## Mission
Sprint 306 introduced CUISINE_DISH_MAP — a static mapping from cuisine to dish leaderboard slugs. This works but requires code changes to add new dishes. Sprint 312 extracts a `useDishShortcuts` hook that fetches actual dish leaderboards from the API and enriches shortcuts with real entry counts. The static map remains as the source of cuisine→dish associations, but entry counts come from live data.

## Team Discussion

**Marcus Chen (CTO):** "The hook pattern is the right abstraction. `useDishShortcuts(city, cuisine)` returns enriched shortcuts with live entry counts. Both Rankings and BestInSection consume the same hook — DRY and consistent."

**Amir Patel (Architecture):** "The API call is shared via React Query key `['dish-boards-all', city]`. Both surfaces share the same cache. 120s stale time means one fetch serves both Rankings and Discover."

**Sarah Nakamura (Lead Eng):** "Entry counts on dish chips ('🍛 Best Biryani · 3') give users a preview before tapping — same pattern as Sprint 301's entry count preview on Best In cards."

**Priya Sharma (QA):** "18 tests covering: hook file, API fetch, CUISINE_DISH_MAP fallback, entry count enrichment, Rankings integration, BestInSection integration, and removal of direct CUISINE_DISH_MAP imports."

**Rachel Wei (CFO):** "Live entry counts on dish chips are social proof. '🍛 Best Biryani · 5' tells users there's real competition. This increases tap-through rates."

## Changes
- `lib/hooks/useDishShortcuts.ts` — NEW: Hook that fetches dish leaderboards, cross-references with CUISINE_DISH_MAP, returns enriched DishShortcut[] with entry counts
- `app/(tabs)/index.tsx` — Replaced static CUISINE_DISH_MAP with useDishShortcuts hook; shows entry counts on chips
- `components/search/BestInSection.tsx` — Same: uses useDishShortcuts; shows entry counts on chips
- 18 tests in `tests/sprint312-dynamic-dish-shortcuts.test.ts`

## Test Results
- **233 test files, 5,977 tests, all passing** (~3.2s)
