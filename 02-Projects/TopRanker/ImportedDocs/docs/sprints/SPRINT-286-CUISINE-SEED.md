# Sprint 286: Cuisine Column + Expanded Seed Data + Cuisine-Filtered Leaderboard

**Date:** March 9, 2026
**Story Points:** 8
**Focus:** Add `cuisine` to businesses schema, expand seed data with cuisine-tagged restaurants, wire cuisine filtering through API to Rankings UI

## Mission
Address CEO feedback: "seed more data and think about category → cuisine → dish as one workflow, restaurants should filter by those and ranking shown below." This sprint adds the database foundation, expands seed data across 10 cuisines, and wires cuisine filtering end-to-end.

## Team Discussion

**Marcus Chen (CTO):** "This is a fundamental data model change. Adding `cuisine` as a first-class column rather than overloading `category` is the right call. Category is the business type (restaurant, cafe, bar), cuisine is the food identity (indian, mexican, japanese). They're orthogonal dimensions."

**Amir Patel (Architecture):** "The nullable `cuisine` column is correct — cafes, bars, bakeries don't have cuisine. The index on `(city, cuisine)` will make filtered queries fast. Cache keys now include cuisine so we don't serve stale data when switching cuisines."

**Sarah Nakamura (Lead Eng):** "Expanding from 35 to 47 seed businesses with 10 cuisine types gives us real data to test the filtering. The Indian Dallas focus — Irving, Plano, Frisco, Richardson — matches our Phase 1 marketing strategy."

**Jasmine Taylor (Marketing):** "Five Indian restaurants across Irving/Plano/Frisco/Richardson is exactly what I need for the WhatsApp groups. 'Best biryani in Irving' is now testable with seed data."

**Rachel Wei (CFO):** "Each cuisine leaderboard is a separate marketing conversation. Indian community debates biryani rankings, Mexican community debates tacos. This is the product differentiation we planned."

**Dev Kapoor (Backend):** "The `getLeaderboard()` function now takes an optional `cuisine` parameter. When null, it returns all restaurants. When set, it filters. The cache key includes cuisine so we get proper invalidation. Clean."

**Priya Sharma (QA):** "29 new tests covering schema, seed data, API parameters, and client integration. The Indian Dallas focus tests verify Irving/Plano/Frisco/Richardson presence."

## Changes
- `shared/schema.ts` — Added `cuisine` column (nullable text) + `idx_biz_cuisine` index
- `server/seed.ts` — Expanded from 35 to 47 businesses with cuisine tags across 10 types, expanded dishes
- `server/storage/businesses.ts` — `getLeaderboard()` accepts optional `cuisine` param, new `getCuisines()` function
- `server/storage/index.ts` — Export `getCuisines`
- `server/routes.ts` — Leaderboard accepts `?cuisine=` param, new `GET /api/leaderboard/cuisines` endpoint
- `lib/api.ts` — `fetchLeaderboard()` accepts optional `cuisine` parameter
- `app/(tabs)/index.tsx` — Rankings query includes `selectedCuisine` in queryKey and passes to API
- `tests/sprint189-redis-cache.test.ts` — Updated cache key assertion
- 29 tests in `tests/sprint286-cuisine-seed.test.ts`

## Cuisine Distribution (Seed Data)
| Cuisine | Count | Key Neighborhoods |
|---------|-------|-------------------|
| Indian | 5 | Irving, Plano, Frisco, Richardson, Uptown |
| Mexican | 4+4 street food | Oak Cliff, Pleasant Grove, Bishop Arts |
| American | 4+4 fast food | Deep Ellum, Bishop Arts, Oak Lawn |
| Japanese | 3 | Deep Ellum, Oak Lawn, Arts District |
| Korean | 2 | Carrollton, Royal Lane |
| Thai | 2 | Lowest Greenville, Knox-Henderson |
| Italian | 2 | Bishop Arts, Deep Ellum |
| Vietnamese | 2 | Garland, East Dallas |
| Chinese | 2 | Richardson, Plano |
| Mediterranean | 1 | Richardson |

## Test Results
- **207 test files, 5,633 tests, all passing** (~3.0s)
