# Sprint 322: Business Detail Dish Rankings

**Date:** March 9, 2026
**Story Points:** 5
**Focus:** Show which dish leaderboards a business is ranked on in the business detail page

## Mission
When viewing a business profile (e.g., Spice Garden), users see ratings and reviews but not which dish leaderboards the business appears on. This sprint adds a "Dish Rankings" card showing "Ranked #1 for Biryani, #3 for Butter Chicken" with tap-to-navigate to each leaderboard.

## Team Discussion

**Marcus Chen (CTO):** "This connects the business profile to the dish pipeline. A user viewing Spice Garden sees it's #1 for Biryani — that's a credibility signal. They can tap through to see who else is ranked, creating a discovery loop back through the leaderboard system."

**Amir Patel (Architecture):** "New API endpoint: GET /api/businesses/:id/dish-rankings. Storage function joins dishLeaderboardEntries with dishLeaderboards, returns rank position, score, and entry count. The component is self-contained with its own React Query hook."

**Sarah Nakamura (Lead Eng):** "DishRankings component follows the same pattern as TopDishes: conditional render (null when empty), card layout, rows with navigation. Positioned above TopDishes on the business page since leaderboard rankings are more significant than community votes."

**Rachel Wei (CFO):** "Businesses seeing their rankings on their own profile page is a monetization lever. 'Upgrade to Business Pro to feature your #1 Biryani ranking' is a natural upsell."

**Jasmine Taylor (Marketing):** "The rank badge with amber background matches the dish leaderboard page styling. Visual consistency builds recognition: amber badge = leaderboard rank."

**Priya Sharma (QA):** "20 tests covering: component export, props, API fetch, rank rendering, navigation, empty state, API route, storage function, page integration, and docs."

## Changes
- `components/business/DishRankings.tsx` — NEW: Card showing dish leaderboard rankings with rank badges, scores, and navigation
- `server/storage/dishes.ts` — Added getBusinessDishRankings() function with join query
- `server/routes-dishes.ts` — Added GET /api/businesses/:id/dish-rankings endpoint
- `app/business/[id].tsx` — Import and render DishRankings above TopDishes

## Test Results
- **243 test files, 6,147 tests, all passing** (~3.3s)
