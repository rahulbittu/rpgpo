# Sprint 478: Business Owner Dashboard Analytics

**Date:** 2026-03-10
**Duration:** 1 sprint cycle
**Story Points:** 3
**Owner:** Sarah Nakamura (Lead Eng)

## Mission

Add rating trend analytics to the business owner dashboard — weekly/monthly volume with sparkline data, velocity change tracking, and Pro/Free tiering for data depth. Resolves SLT-475 action item for dashboard enhancements.

## Team Discussion

**Sarah Nakamura (Lead Eng):** "Clean separation — all analytics computation lives in `dashboard-analytics.ts` as pure functions. The route just calls `buildDashboardTrend()` and slices output by subscription tier. No state, no side effects, easy to test."

**Amir Patel (Architect):** "The 200-rating fetch for trend analysis is a pragmatic upper bound. For businesses with high volume, we may want to push this computation to a materialized view or background job in a future sprint. But for now, in-memory is fine — 200 ratings is trivial."

**Marcus Chen (CTO):** "The Pro/Free tiering is exactly right — Free users see last 4 weeks and 3 months, Pro users get full 12-week and 6-month history. This creates a real upsell moment without gatekeeping basic visibility."

**Rachel Wei (CFO):** "This is the first dashboard feature that directly demonstrates Pro value. Business owners can see their rating velocity trending up and know they need Pro to see the full picture. The conversion funnel from Free dashboard to Pro subscription just got stronger."

**Jasmine Taylor (Marketing):** "When we pitch Business Pro to restaurant owners, 'see your rating trends and velocity' is much more compelling than 'see your reviews.' Trend data tells a story — are you improving or declining? That's actionable."

**Nadia Kaur (Cybersecurity):** "The 200-rating limit on the analytics query is a good natural bound. No pagination abuse possible. The existing requireAuth + owner/admin check on the dashboard endpoint covers authorization."

## Changes

### New: `server/dashboard-analytics.ts` (~122 LOC)
- `RatingVolumePoint` interface: period (ISO date), count, avgScore
- `DashboardTrend` interface: weeklyVolume, monthlyVolume, velocityChange, sparklineScores
- `computeWeeklyVolume(ratings, weeks=12)` — iterates weeks backwards, filters ratings per week, computes count and avg
- `computeMonthlyVolume(ratings, months=6)` — calendar month bucketing with same pattern
- `computeVelocityChange(weeklyVolume)` — compares last 2 weeks vs previous 2 weeks, returns % change
- `extractSparklineScores(ratings, limit=20)` — last N scores reversed for chart rendering
- `buildDashboardTrend(ratings)` — orchestrator that calls all four functions

### Modified: `server/routes-businesses.ts` (+11 LOC, 305→316)
- Added `import { buildDashboardTrend } from "./dashboard-analytics"`
- Dashboard endpoint now fetches `allRatingsResult` (200 ratings) in parallel Promise.all
- Calls `buildDashboardTrend(allRatingsResult.ratings)` for trend computation
- Response baseData includes: weeklyVolume, monthlyVolume, velocityChange, sparklineScores
- Pro/Free tiering: Free gets weeklyVolume.slice(-4) and monthlyVolume.slice(-3)

### Modified: `__tests__/sprint476-search-extraction.test.ts`
- Bumped routes-businesses.ts LOC threshold from 310 to 325

### New: `__tests__/sprint478-dashboard-analytics.test.ts` (23 tests)
- dashboard-analytics.ts: interfaces, weekly/monthly volume, velocity, sparkline, buildDashboardTrend
- routes-businesses.ts: import, 200-rating fetch, trend data in response, Pro/Free tiering

## Test Coverage
- 23 new tests, all passing
- Full suite: 8,841 tests across 369 files, all passing in ~4.7s
- Server build: 640.0kb (+2.8kb from dashboard-analytics module)
