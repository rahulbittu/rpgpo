# Sprint 303: Dish Seed Data Expansion

**Date:** March 9, 2026
**Story Points:** 2
**Focus:** Expand dish seed data for all businesses and add 5 new dish leaderboards

## Mission
Sprint 298 added 7 restaurants to meet the 3-per-cuisine minimum, but those businesses had no dishes seeded. Several other restaurants were also missing dish data. This sprint fills every gap: every restaurant with a cuisine now has 2-3 signature dishes, and we double the leaderboard count from 5 to 10.

## Team Discussion

**Marcus Chen (CTO):** "Dish data drives engagement. Every business with an empty dish list is a dead end for the user. Filling these gaps means the 'Best biryani in Irving' narrative works for every cuisine, not just the popular ones."

**Amir Patel (Architecture):** "No schema changes. The seed file grew by ~100 lines of data arrays. The leaderboard builder picks up new boards automatically through the ILIKE matching pattern."

**Sarah Nakamura (Lead Eng):** "15 new business-dish mappings and 5 new leaderboards (pizza, pho, dosa, kebab, brisket). Total seeded dishes now exceeds 100 — meaningful for demo and testing."

**Jasmine Taylor (Marketing):** "Pizza and brisket leaderboards are huge for Dallas. 'Best pizza in Dallas' and 'Best brisket in Dallas' are high-intent searches. Now we have the data to back them up."

**Priya Sharma (QA):** "20 tests covering every Sprint 298 business has dishes, leaderboard expansion, volume checks, and doc existence."

**Rachel Wei (CFO):** "Rich seed data makes investor demos compelling. Showing 10 active leaderboards with real dishes is more impressive than 5 sparse ones."

## Changes
- `server/seed.ts` — Added dishes for 15 businesses (7 from Sprint 298 + 8 previously under-represented); added 5 new dish leaderboards (pizza, pho, dosa, kebab, brisket)
- 20 tests in `tests/sprint303-dish-seed-expansion.test.ts`

## Data Summary
- **Businesses with dishes:** 21 → 36 (+15)
- **Total dish entries:** ~65 → ~110 (+45)
- **Dish leaderboards:** 5 → 10 (biryani, ramen, taco, burger, coffee + pizza, pho, dosa, kebab, brisket)

## Test Results
- **224 test files, 5,848 tests, all passing** (~3.1s)
