# Sprint 324: Dish Leaderboard Badges on Ranking Cards

**Date:** March 9, 2026
**Story Points:** 3
**Focus:** Show dish leaderboard badges (#1 Biryani, #3 Butter Chicken) on each business card in the Rankings page

## Mission
When viewing the Rankings page, users see business cards with scores and confidence levels but no connection to the dish leaderboard system. This sprint adds amber dish badges showing where each business ranks on dish leaderboards. A business ranked #1 for Biryani and #3 for Butter Chicken gets two tappable badges that navigate to the respective leaderboard pages.

## Team Discussion

**Marcus Chen (CTO):** "This closes the loop between the restaurant leaderboard and the dish leaderboard. Before, a user would see 'Spice Garden #1' and separately discover it's ranked for Biryani. Now the dish reputation is visible directly on the ranking card — one more reason to trust the ranking."

**Amir Patel (Architecture):** "New batch function `getBatchDishRankings(businessIds)` does a single JOIN query for all businesses in the leaderboard response. Avoids N+1. Limited to top 3 dish rankings per business to keep cards clean. The leaderboard API now returns `dishRankings[]` alongside photoUrls."

**Sarah Nakamura (Lead Eng):** "The badges use the same amber color palette as dish shortcuts and leaderboard pages. Tappable — pressing '#1 Biryani' navigates to `/dish/biryani`. Added between the meta row (cuisine + neighborhood) and the confidence/rating row."

**Jasmine Taylor (Marketing):** "This is a huge credibility signal. '#1 Biryani in Dallas' on a card is more compelling than a raw score. It's specific and debatable — exactly the kind of thing that gets shared in WhatsApp groups."

**Priya Sharma (QA):** "17 tests covering: batch function (export, params, limit, shape), leaderboard route (import, call, response), MappedBusiness type, and RankedCard UI (render, content, navigation, styles, docs)."

## Changes
- `server/storage/dishes.ts` — Added `getBatchDishRankings()` batch function with single JOIN query, max 3 per business
- `server/storage/index.ts` — Export getBatchDishRankings
- `server/routes.ts` — Leaderboard route calls getBatchDishRankings in parallel with getBusinessPhotosMap, adds dishRankings to response
- `types/business.ts` — Added optional `dishRankings` field to MappedBusiness interface
- `components/leaderboard/SubComponents.tsx` — RankedCard renders dish badges (dishBadgeRow, dishBadge, dishBadgeText styles)

## Test Results
- **245 test files, 6,171 tests, all passing** (~3.4s)
