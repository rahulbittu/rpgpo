# Sprint 306: Rankings Cuisine-to-Dish Drill-Down

**Date:** March 9, 2026
**Story Points:** 3
**Focus:** Show dish leaderboard shortcuts on Rankings when a cuisine is selected

## Mission
When a user selects "Indian" on the Rankings page, they see ranked Indian restaurants — but they might want to go deeper: "Show me the best biryani" or "Show me the best dosa." This sprint adds a dish shortcuts row that appears when a cuisine is selected, with tappable chips that navigate directly to dish leaderboard pages.

## Team Discussion

**Marcus Chen (CTO):** "This is the vertical drill-down we've been building toward: Category → Cuisine → Dish. The user journey is now: tap 'Indian' → see 'Dish Rankings: 🍛 Best Biryani, 🫓 Best Dosa' → tap biryani → see the biryani leaderboard. Three taps from the Rankings tab to a specific dish ranking."

**Amir Patel (Architecture):** "The `CUISINE_DISH_MAP` lives in `shared/best-in-categories.ts` — same file as `CUISINE_DISPLAY`. It's a static mapping from cuisine to dish leaderboard slugs. No API calls needed because the map is client-side. The dish leaderboard page handles fetching the actual data."

**Sarah Nakamura (Lead Eng):** "The dish shortcuts row only renders when `selectedCuisine` is set AND the cuisine has entries in `CUISINE_DISH_MAP`. Korean, Thai, and Chinese don't have mapped dishes yet — they'll get them when we add more leaderboards."

**Jasmine Taylor (Marketing):** "This is the screenshot I've been waiting for. Indian cuisine selected, 'Dish Rankings: 🍛 Best Biryani' chip glowing amber. That's the hero image for our WhatsApp launch campaign."

**Priya Sharma (QA):** "18 tests covering the shared CUISINE_DISH_MAP structure, Rankings page integration, navigation, haptics, analytics tracking, and styles."

## Changes
- `shared/best-in-categories.ts` — Added `CUISINE_DISH_MAP`: cuisine → dish leaderboard slug/name/emoji mapping for 7 cuisines
- `app/(tabs)/index.tsx` — Imported CUISINE_DISH_MAP; added dish shortcuts ScrollView row with amber-tinted chips; 5 new styles
- 18 tests in `tests/sprint306-cuisine-dish-drilldown.test.ts`

## Test Results
- **227 test files, 5,895 tests, all passing** (~3.2s)
