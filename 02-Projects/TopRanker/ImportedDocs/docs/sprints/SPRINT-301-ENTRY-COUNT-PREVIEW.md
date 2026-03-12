# Sprint 301: Best In Entry Count Preview

**Date:** March 9, 2026
**Story Points:** 2
**Focus:** Show dish leaderboard entry count on Best In cards

## Mission
When a user sees a Best In card (e.g., "Biryani"), show the number of ranked entries before they tap — "5 ranked" instead of generic "Best in Dallas". This sets expectations and adds credibility by showing there's real competition.

## Team Discussion

**Marcus Chen (CTO):** "Expectation setting before navigation. '5 ranked' tells the user there's a real leaderboard waiting — not an empty page. This reduces bounce and increases engagement."

**Amir Patel (Architecture):** "Reuses the existing `/api/dish-leaderboards` endpoint that DishLeaderboardSection already calls. We just map `dishSlug → entryCount` and pass it down as a prop. No new API endpoints."

**Sarah Nakamura (Lead Eng):** "The entryCounts prop is optional — if the fetch fails or data isn't available, the card gracefully falls back to 'Best in {city}'. Progressive enhancement."

**Jasmine Taylor (Marketing):** "Best biryani: 5 ranked. That's a more compelling card than 'Best in Dallas'. It implies competition, debate, activity."

**Priya Sharma (QA):** "8 tests covering prop interface, conditional display, fallback behavior, API fetch, and prop passing."

## Changes
- `components/search/BestInSection.tsx` — Added `entryCounts` optional prop; card subtitle shows "N ranked" when count available
- `app/(tabs)/search.tsx` — Fetch dish-leaderboards for entry counts; pass to BestInSection
- 8 tests in `tests/sprint301-entry-count-preview.test.ts`

## Test Results
- **222 test files, 5,812 tests, all passing** (~3.0s)
