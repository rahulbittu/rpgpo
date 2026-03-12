# Sprint 169: Dish Leaderboard Batch Recalculation + Dish Rank Consequence

**Date:** 2026-03-09
**Story Points:** 5
**Focus:** 6-hour batch recalculation job + dish rank consequence message in rating confirmation

---

## Mission Alignment
Rankings must reflect live data. Without periodic recalculation, dish leaderboards go stale as new ratings come in. The consequence message closes the feedback loop: rate a dish → see how it updates the dish ranking.

---

## Team Discussion

**Marcus Chen (CTO):** "Two Sprint 168 retro action items closed in one sprint. The batch job recalculates every 6 hours with a startup sweep — no stale boards. The consequence message completes the dish leaderboard loop."

**Amir Patel (Architecture):** "The batch job follows our established pattern — startup execution + setInterval + graceful shutdown cleanup. Same pattern as the challenger closure job. The recalculation iterates all active boards and calls the existing recalculateDishLeaderboard function. No new queries needed."

**Sarah Nakamura (Lead Eng):** "The dishContext prop flows cleanly: search param → rate screen state → RatingConfirmation prop → conditional banner. The conditional rendering means zero overhead when not navigating from a dish leaderboard."

**Priya Sharma (Design):** "The dish rank banner in the confirmation screen uses the same amber tint (8% opacity) as the dish context banner in step 1. Visual consistency between the two touchpoints — entering the flow and seeing the result."

**Rachel Wei (CFO):** "Dish leaderboards are the content engine for organic SEO. 'Best Biryani in Dallas' pages need fresh data. A 6-hour cadence means search crawlers always see updated rankings."

**Nadia Kaur (Security):** "The batch job runs server-side only, no user input involved. recalculateDishLeaderboard already excludes flagged ratings and applies credibility weighting. No new attack surface."

---

## Changes

### Batch Recalculation Job (server/index.ts)
- Added `recalculateAllDishBoards()` function: fetches all active boards, calls `recalculateDishLeaderboard` for each
- Startup sweep: runs immediately on server boot
- 6-hour setInterval: `dishRecalcInterval` stored for graceful shutdown
- Logs board count + total entries recalculated
- Error handling: try/catch with logger.error, individual failures don't crash the loop

### Dish Rank Consequence (components/rate/SubComponents.tsx)
- `RatingConfirmation` accepts optional `dishContext?: string` prop
- Conditional dish rank banner: "This also updates the **[Dish]** ranking"
- New styles: `dishRankBanner` (amber tint bg), `dishRankText`

### Prop Passing (app/rate/[id].tsx)
- `dishContext={dishContext}` added to `<RatingConfirmation>` call
- Completes the data flow from search param through to confirmation screen

---

## Test Results
- **22 new tests** covering batch job scheduling, graceful shutdown, prop passing, banner rendering
- Full suite: all passing
