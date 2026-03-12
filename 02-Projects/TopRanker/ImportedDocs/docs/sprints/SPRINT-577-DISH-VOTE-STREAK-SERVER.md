# Sprint 577: Server-Side Dish Vote Streak Calculation

**Date:** 2026-03-10
**Story Points:** 5
**Status:** Complete

## Mission

Wire the dish vote streak stats (currentStreak, longestStreak, totalDishVotes, topDish) from actual database data in the `/api/members/me` endpoint. Sprint 574 added the client component and API types; this sprint provides real data from the server.

## Team Discussion

**Marcus Chen (CTO):** "The client component was rendering mock data. Now it renders real streak data from dishVotes table. This is the pattern — client first for UX validation, then server for real data."

**Amir Patel (Architecture):** "The streak algorithm uses three queries: total count, top dish by frequency, and distinct days for streak calculation. All scoped to one member so performance is fine. The day-walking algorithm is O(n) where n is distinct vote days."

**Sarah Nakamura (Lead Eng):** "The function returns zeros immediately when totalDishVotes is 0 — no wasted queries. And the current streak only counts if the most recent vote was today or yesterday, so stale streaks reset properly."

**Dev Okonkwo (Frontend):** "No client changes needed — the API response shape already matches what DishVoteStreakCard expects from Sprint 574. The optional fields fall through gracefully."

**Nadia Kaur (Security):** "The query uses parameterized memberId via Drizzle ORM — no injection risk. The DATE() extraction is on an indexed timestamp column."

## Changes

### Modified Files
- **`server/storage/members.ts`** (+61 LOC, 580→641)
  - Added `getDishVoteStreakStats(memberId)` function
  - Imports: `isNotNull` from drizzle-orm, `dishVotes`/`dishes` from schema
  - Queries: total count (non-null dishId), top dish by join+groupBy, distinct days for streak
  - Streak algorithm: walks descending day array, tracks current + longest streaks
  - Returns `{ dishVoteStreak, longestDishStreak, totalDishVotes, topDish }`

- **`server/storage/index.ts`** — Added `getDishVoteStreakStats` export

- **`server/routes-members.ts`** (+3 LOC)
  - `/api/members/me` now imports and calls `getDishVoteStreakStats(member.id)`
  - Spreads `streakStats` into response alongside `seasonal`

### Test Files
- **`__tests__/sprint577-dish-vote-streak-server.test.ts`** (29 tests)
  - Function existence, signature, return shape (6)
  - Query patterns: dishVotes, isNotNull, dishes join, groupBy, DATE, streak logic (12)
  - Storage index export (1)
  - Route wiring: import, call, spread, response shape (4)
  - Client API type compatibility (4)
  - LOC thresholds (2)

### Threshold Updates
- `shared/thresholds.json`: tests 10912→10941, build 712.1→714.3kb

## Data Flow

```
dishVotes table → getDishVoteStreakStats(memberId)
  → 3 queries: count, top dish, distinct days
  → streak algorithm (day walking)
  → { dishVoteStreak, longestDishStreak, totalDishVotes, topDish }
  → /api/members/me response → DishVoteStreakCard component
```

## Test Results
- **10,941 tests** across 466 files, all passing in ~5.9s
- Server build: 714.3kb
