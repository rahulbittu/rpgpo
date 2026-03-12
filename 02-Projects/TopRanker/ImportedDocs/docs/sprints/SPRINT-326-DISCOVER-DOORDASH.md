# Sprint 326: DoorDash-Style Navigation for Discover Page

**Date:** March 9, 2026
**Story Points:** 3
**Focus:** Apply DoorDash pattern to Discover page — move filters into scroll content

## Mission
The Discover page (search.tsx) had the same problem the Rankings page had before Sprint 325: fixed filter rows above the FlatList consuming ~120px before any content appeared. Filter chips, price chips, and sort chips were all fixed above the scroll. This sprint applies the same DoorDash/Uber/Grab pattern: only header + search + view toggle stay fixed; everything else scrolls with content.

## Design Reference
**Before (4 fixed rows, ~180px):**
1. Header (Discover + city picker)
2. Search bar
3. View toggle + filter chips
4. Price chips + sort chips

**After (3 fixed rows, ~120px):**
1. Header (Discover + city picker)
2. Search bar
3. View toggle only
4. [FlatList: Filter chips → Price → Sort → BestIn → Trending → Dish Leaderboards → Results]

## Team Discussion

**Marcus Chen (CTO):** "This completes the DoorDash pattern across both main pages. Rankings and Discover now both put filters IN the scroll. The view toggle stays fixed because it's a navigation-level control — you need to switch between list and map without scrolling."

**Amir Patel (Architecture):** "Clean move — filter chips, price chips, and sort chips from fixed position into ListHeaderComponent. Net +2 LOC (963 total, still under 1000 threshold). The view toggle gets its own viewToggleRow style. No new components needed."

**Sarah Nakamura (Lead Eng):** "The pattern is now consistent: header + search fixed, everything else scrolls. On Discover, the first business card appears much higher on screen. Filters are still accessible by scrolling to the top."

**Jasmine Taylor (Marketing):** "The Discover page now matches the Rankings page experience. Open the app, see restaurants immediately. Filter when you want, not forced to scroll past them."

**Priya Sharma (QA):** "15 tests verifying: filter/price/sort chips are inside ListHeaderComponent, NOT in fixed area. View toggle stays fixed above FlatList. All 6 filter types preserved. BestInSection and DishLeaderboardSection still in scroll."

**Rahul Pitta (CEO):** "Both pages now follow the same pattern. Content first, filters discoverable. This is how DoorDash, Uber, and Grab all work. The app feels consistent."

## Changes
- `app/(tabs)/search.tsx` — Moved filter chips (All/Top 10/Challenging/Trending/Open Now/Near Me), price chips ($/$$/$$$/$$$$), and sort chips (Ranked/Most Rated/Trending) from fixed position into FlatList ListHeaderComponent. View toggle stays fixed in new `viewToggleRow` style. Added `filterScrollRow` style for spacing. Net +2 LOC (961→963).

## Test Results
- **247 test files, 6,196 tests, all passing** (~3.4s)
- **Server build:** 606.6kb (under 700kb threshold)
