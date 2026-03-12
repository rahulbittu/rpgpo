# Sprint 321: Cuisine-Aware Empty States on Discover

**Date:** March 9, 2026
**Story Points:** 3
**Focus:** Mirror Rankings' cuisine-aware empty states on the Discover page

## Mission
Sprint 319 added cuisine-aware empty states to Rankings but Discover still shows a generic "No results" message when a cuisine filter returns no businesses. This sprint adds the same pattern: cuisine name in message, dish leaderboard suggestions from CUISINE_DISH_MAP, and "Show all cuisines" clear button.

## Team Discussion

**Marcus Chen (CTO):** "Discover is the search-first surface. If someone filters by Korean and gets no results, seeing 'Explore Korean dish rankings: Korean BBQ, Bibimbap, Fried Chicken' keeps them in the app. Consistent UX across both tabs."

**Sarah Nakamura (Lead Eng):** "The pattern mirrors Sprint 319 exactly. Uses CUISINE_DISH_MAP (now imported into search.tsx) to show cuisine-specific dish suggestions. The existing suggestion chips are hidden when a cuisine is selected — they're generic and would conflict."

**Amir Patel (Architecture):** "search.tsx now imports CUISINE_DISH_MAP from shared/best-in-categories. This is the first time Discover uses the dish map directly — before it only used CUISINE_DISPLAY for labels."

**Jasmine Taylor (Marketing):** "The empty state on Discover is more likely to be hit than Rankings because Discover supports geographic filtering. 'Korean in Uptown' might return zero, but Korean BBQ leaderboard has city-wide data."

**Priya Sharma (QA):** "12 tests covering: CUISINE_DISH_MAP import, cuisine-aware message, dish suggestions, navigation, clear filter, suggestion chip hiding, and styles."

## Changes
- `app/(tabs)/search.tsx` — Import CUISINE_DISH_MAP; enhanced ListEmptyComponent with cuisine-aware message, dish suggestions, clear filter; hides generic suggestion chips when cuisine selected; 5 new styles

## Test Results
- **242 test files, 6,127 tests, all passing** (~3.3s)
