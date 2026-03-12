# Sprint 314: Related Dish Rankings + Dish Search Analytics

**Date:** March 9, 2026
**Story Points:** 3
**Focus:** Show related dish leaderboards on dish page; track dish search match taps

## Mission
When viewing "Best Biryani in Dallas," users see an isolated page with no way to discover other Indian dish rankings. This sprint adds a "More Indian Rankings" section that links to sibling dishes (Dosa) from the same cuisine, plus analytics tracking for dish search autocomplete taps.

## Team Discussion

**Marcus Chen (CTO):** "Discovery loops are how you increase time-on-site. Biryani → Dosa → back to Indian cuisine. Each dish page should be a hub, not a dead end. The CUISINE_DISH_MAP reverse lookup is elegant — zero API calls."

**Amir Patel (Architecture):** "The relatedDishes computation is a useMemo that iterates CUISINE_DISH_MAP entries to find the parent cuisine, then filters out the current dish. O(n) over ~10 entries — negligible. No new state, no new API calls."

**Jasmine Taylor (Marketing):** "The 'More Indian Rankings' section creates shareable moments. Someone on WhatsApp sharing 'Best Biryani' page will also see 'Best Dosa' — that's two potential taps instead of one. We needed dish_search_match_tap analytics since Sprint 313."

**Priya Sharma (QA):** "18 tests covering: CUISINE_DISH_MAP import, reverse lookup, sibling filtering, related section rendering, analytics events, SearchOverlays tracking, and doc existence."

**Sarah Nakamura (Lead Eng):** "Analytics additions are minimal — two new events (dish_search_match_tap, related_dish_tap) with consistent property naming. SearchOverlays now imports Analytics for the first time."

## Changes
- `app/dish/[slug].tsx` — Import CUISINE_DISH_MAP + CUISINE_DISPLAY; compute relatedDishes via useMemo; render "More {Cuisine} Rankings" section with linked chips; 6 new styles
- `lib/analytics.ts` — Added `dish_search_match_tap` and `related_dish_tap` events + convenience functions
- `components/search/SearchOverlays.tsx` — Import Analytics; track dishSearchMatchTap on dish result press

## Test Results
- **235 test files, 6,010 tests, all passing** (~3.2s)
