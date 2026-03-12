# Sprint 574: Dish Vote Streak Tracking

**Date:** 2026-03-10
**Story Points:** 3
**Status:** Complete
**Tests:** 36 new (10,889 total across 464 files)

## Mission

Add a dish vote streak card to the profile page that tracks consecutive days with dish-level ratings. This creates a habit loop around dish specificity — the behavior that powers dish leaderboards ("Best biryani in Irving"). Also fixes two critical mock data bugs that caused the Rankings screen to crash and the Discover section to show "Cannot load."

## Team Discussion

**Marcus Chen (CTO):** "Dish-level detail is what separates us from Yelp. Every rating that includes a specific dish creates a data point for our dish leaderboards. The streak mechanic makes this behavior visible and rewarding. And fixing those mock data path bugs is essential — new devs hitting the app in demo mode need to see a working product."

**Sarah Nakamura (Lead Eng):** "The component is 152 LOC — completely self-contained. It reads dishVoteStreak, longestDishStreak, totalDishVotes, and topDish from the profile API. The milestone markers at 3/7/14/30 days align with our existing streak badge thresholds. The getMockData fix was the real detective work — `startsWith('/api/leaderboard')` was a prefix match that caught sub-paths like `/api/leaderboard/neighborhoods` and returned MOCK_BUSINESSES instead of strings."

**Amir Patel (Architecture):** "profile.tsx grew from 455 to 465 LOC — import + 9 lines of JSX. No new API calls. The mock data guard pattern (`!path.startsWith('/api/leaderboard/')`) properly separates the base leaderboard path from sub-resources. Also added guards for `/api/businesses/popular-categories`, `/api/search/`, and `/api/city-stats` to prevent the catch-all slug matcher from intercepting them."

**Rachel Wei (CFO):** "Dish leaderboards are one of our strongest product differentiation stories. 'Best biryani in Irving' is the kind of specific ranking that drives organic sharing. Making dish voting visible via streaks directly increases the data quality of these leaderboards."

**Leo Hernandez (Design):** "The milestone markers use escalating warm colors — orange at 3 days, deeper orange at 7, red at 14, purple at 30. The progress bar targets the next milestone, creating a concrete visual goal. The fire icon scales with streak length for at-a-glance recognition."

**Nadia Kaur (Cybersecurity):** "The component reads only from profile props. The streak tips are hardcoded strings. No user-generated content risk, no new attack surface."

## Changes

### Bug Fix: Rankings screen crash (Critical)
- **Root cause:** `getMockData` matched `/api/leaderboard/neighborhoods` and `/api/leaderboard/cuisines` with the catch-all `startsWith("/api/leaderboard")`, returning raw `MOCK_BUSINESSES` (ApiBusiness[]) instead of string arrays
- **Fix:** Added specific handlers for `/api/leaderboard/neighborhoods`, `/api/leaderboard/cuisines`, `/api/leaderboard/dish-shortcuts`, `/api/leaderboard/best-in` BEFORE the catch-all, and changed catch-all to only match when path does NOT start with `/api/leaderboard/`
- **Impact:** `LeaderboardFilterChips` received ApiBusiness objects where it expected strings, triggering "Objects are not valid as a React child"

### Bug Fix: Discover section "Cannot load" (Critical)
- **Root cause:** `/api/businesses/popular-categories` matched the slug catch-all in `getMockData`, returning a single business object instead of category data; `/api/search/popular-queries` had no handler and threw
- **Fix:** Added guards for `/api/businesses/popular-categories`, `/api/search/`, `/api/city-stats`

### New: `components/profile/DishVoteStreakCard.tsx` (152 LOC)
- `DishVoteStreakCardProps`: currentStreak, longestStreak, totalDishVotes, topDish, delay, onRatePress
- MILESTONES — 4 thresholds (3d, 7d, 14d, 30d) with escalating colors and icons
- STREAK_TIPS — 5 actionable tips rotating by totalDishVotes
- Progress bar to next milestone with percentage fill
- Stats row: total dish votes, best streak, top dish
- FadeInDown animation, returns null when totalDishVotes is 0
- CTA button when streak is broken and onRatePress provided

### Modified: `app/(tabs)/profile.tsx` (455→465 LOC, +10)
- Added import: DishVoteStreakCard
- Renders after AchievementsSection, before ProfileStatsCard
- Passes dishVoteStreak, longestDishStreak, totalDishVotes, topDish, delay=250

### Modified: `lib/api.ts` (550→567 LOC, +17)
- ApiMemberProfile: +4 optional fields (dishVoteStreak, longestDishStreak, totalDishVotes, topDish)
- getMockData: +7 guards for sub-path mock data (neighborhoods, cuisines, dish-shortcuts, best-in, popular-categories, search, city-stats)
- Catch-all leaderboard handler restricted to exact `/api/leaderboard` (no sub-paths)

### Modified: `lib/mock-data.ts`
- MOCK_MEMBER_PROFILE: +4 fields (dishVoteStreak: 5, longestDishStreak: 12, totalDishVotes: 34, topDish: "Brisket")

### Modified: `shared/thresholds.json`
- Added DishVoteStreakCard.tsx: maxLOC 160, current 152
- Updated lib/api.ts: maxLOC 570→575, current 550→567
- Tests: currentCount 10853→10889

## Test Summary

- `__tests__/sprint574-dish-vote-streak.test.ts` — 35 tests
  - Component: 20 tests (export, interface, props, milestones, tips, null guard, next milestone, color, animation, progress bar, milestones, stats, tip, CTA, pct, brand, flame, badge, LOC)
  - Profile integration: 4 tests (import, render, props, delay + LOC)
  - API types: 4 tests (dishVoteStreak, longestDishStreak, totalDishVotes, topDish)
  - Mock data: 4 tests (dishVoteStreak, longestDishStreak, totalDishVotes, topDish)
  - Mock data fix: 3 tests (neighborhoods handler, cuisines handler, sub-path guard)
- Test redirects: 1 (sprint562 api.ts LOC threshold 570→575)
