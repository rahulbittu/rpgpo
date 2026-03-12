# Sprint 297: Dish Leaderboard Deep Links

**Date:** March 9, 2026
**Story Points:** 2
**Focus:** Navigate to dish leaderboard page when tapping Best In cards

## Mission
When a user taps a Best In card (e.g., "Biryani", "Tacos", "Sushi") on the Discover page, navigate directly to the dish leaderboard page (`/dish/[slug]`) instead of just setting the search query. This connects the browsing surface to the ranking surface — the core loop of "discover → rate → rank."

## Team Discussion

**Marcus Chen (CTO):** "This is the deep link that closes the Category → Cuisine → Dish loop. Tap 'Biryani' → land on the biryani leaderboard → see ranked restaurants → tap to rate. Three taps from discovery to action."

**Amir Patel (Architecture):** "Clean optional prop pattern: `onSelectDish` takes the slug, falls back to `onSelectCategory` for backwards compatibility. The /dish/[slug] page already existed from Sprint 174."

**Sarah Nakamura (Lead Eng):** "Minimal change — 2 files, optional prop + router.push. The existing dish page handles data fetching, SEO meta tags, and ranking display."

**Jasmine Taylor (Marketing):** "This is the WhatsApp link I've been waiting for. 'Best biryani in Dallas — tap to see the rankings' → deep link to /dish/biryani. Shareable, specific, actionable."

**Priya Sharma (QA):** "11 tests covering the prop interface, fallback behavior, route navigation, and dish page existence."

## Changes
- `components/search/BestInSection.tsx` — Added `onSelectDish` optional callback; card tap prefers dish navigation over category search
- `app/(tabs)/search.tsx` — Passes `onSelectDish` to BestInSection with router.push to `/dish/[slug]`
- 11 tests in `tests/sprint297-dish-deep-links.test.ts`

## Test Results
- **218 test files, 5,767 tests, all passing** (~3.0s)
