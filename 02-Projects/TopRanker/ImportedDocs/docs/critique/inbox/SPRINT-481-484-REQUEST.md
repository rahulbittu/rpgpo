# Critique Request: Sprints 481–484

**Date:** 2026-03-10
**Requesting:** External architectural critique
**Scope:** 4 sprints (infrastructure + UI + UX)

## Sprints Under Review

### Sprint 481: Push Notification Triggers
- 3 new triggers in notification-triggers.ts: onRankingChange, onNewRatingForBusiness, sendCityHighlightsPush
- Significance threshold: only notify for rank changes >= 2 positions
- Rater exclusion: don't notify users about their own ratings
- City highlights: weekly aggregation of biggest rank mover

### Sprint 482: Dashboard Chart Components
- SparklineChart: dot-based sparkline for rating score trajectories
- VolumeBarChart: normalized bars for weekly/monthly rating volume
- VelocityIndicator: colored badge showing % change in rating frequency
- All purely presentational, no data fetching

### Sprint 483: Infinite Scroll for Search
- useInfiniteSearch hook wrapping React Query useInfiniteQuery
- InfiniteScrollFooter for loading state and end-of-results
- 20 results per page, offset-based pagination
- Replaced useQuery in search screen

### Sprint 484: Rating Dimension Breakdown
- computeDimensionBreakdown pure function: per-dimension averages + visit type distribution
- DimensionScoreCard: horizontal score bars + visit type distribution visualization
- DIMENSION_CONFIGS matching Rating Integrity visit type weights
- New endpoint: GET /api/businesses/:id/dimension-breakdown

## Specific Questions for Critique

1. **notification-triggers.ts at 313 LOC** — Three new triggers doubled the file size. Should we split by trigger category (activity vs push vs city) or by event source (rating vs ranking)?

2. **Dashboard charts without integration** — SparklineChart, VolumeBarChart, and VelocityIndicator exist but aren't rendered in any screen yet. Is this premature? Should we have built them alongside the dashboard integration?

3. **Infinite scroll replacing single query** — The search screen switched entirely to useInfiniteQuery. Are there edge cases where this could degrade UX (e.g., filter changes resetting scroll position)?

4. **Dimension breakdown endpoint** — Another endpoint in routes-businesses.ts (now 325/340). Should the extraction happen before adding more endpoints, or is it acceptable to batch extractions?

5. **`as any` drift pattern** — The total crept from 55 to ~82 over 6 cycles. Each sprint adds 1-2 legitimate casts (icons, RN styles). Is a typed utility worth the investment, or is the threshold-bumping approach acceptable?

## File Inventory

| File | LOC | Status |
|------|-----|--------|
| server/notification-triggers.ts | 313 | Modified (481) |
| components/dashboard/SparklineChart.tsx | 120 | NEW (482) |
| components/dashboard/VolumeBarChart.tsx | 115 | NEW (482) |
| components/dashboard/VelocityIndicator.tsx | 85 | NEW (482) |
| lib/hooks/useInfiniteSearch.ts | 95 | NEW (483) |
| components/search/InfiniteScrollFooter.tsx | 70 | NEW (483) |
| server/dimension-breakdown.ts | 100 | NEW (484) |
| components/business/DimensionScoreCard.tsx | 220 | NEW (484) |
| server/routes-businesses.ts | 325 | Modified (484) |
| app/(tabs)/search.tsx | ~795 | Modified (483) |

## Test Coverage
- Sprint 481: 22 tests
- Sprint 482: 25 tests
- Sprint 483: 23 tests
- Sprint 484: 20 tests
- **Total new:** 90 tests
- **Full suite:** 8,953 tests across 374 files
