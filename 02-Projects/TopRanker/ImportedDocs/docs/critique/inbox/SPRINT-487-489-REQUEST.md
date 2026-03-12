# Critique Request: Sprints 487–489

**Date:** 2026-03-10
**Requesting Team:** TopRanker Engineering
**Scope:** Dashboard chart integration, push trigger wiring, search skeleton loading

## What We Built

### Sprint 487: Dashboard Chart Integration
- Wired SparklineChart, VolumeBarChart, VelocityIndicator into owner dashboard
- Extended DashboardData interface with weeklyVolume, monthlyVolume, velocityChange, sparklineScores
- Wired DimensionScoreCard into public business profile after ScoreBreakdown
- End-to-end analytics pipeline: computation (478) → API (486) → UI (487)

### Sprint 488: Push Trigger Wiring
- Connected onRankingChange + onNewRatingForBusiness to POST /api/ratings
- Added startCityHighlightsScheduler (weekly Monday 11am UTC) for all active + beta cities
- Migrated tier upgrade from legacy push.ts to notification-triggers.ts
- All triggers use fire-and-forget pattern (.catch(() => {}))

### Sprint 489: Search Skeleton Loading
- New SearchResultsSkeleton component matching search results layout
- Filter chip pills, result count bar, 4 card skeletons with photo/name/score/tags
- Animated SkeletonPulse (opacity 0.3↔0.7, 600ms, native driver)
- Replaced generic DiscoverSkeleton in search loading state

## Questions for Critique

1. **Dashboard data coupling:** The DashboardData interface now has 12 fields. Is it getting too fat? Should we split into core stats vs. analytics vs. reviews?

2. **Fire-and-forget push triggers:** All triggers use `.catch(() => {})` which swallows errors silently. Should we at least log failures, or is the existing try/catch inside each trigger function sufficient?

3. **Skeleton layout matching:** The SearchResultsSkeleton hardcodes 4 card skeletons. If the layout changes (e.g., horizontal cards, grid view), the skeleton won't match. Should we make it configurable by view mode?

4. **City highlights scheduler timing:** Runs 1 hour after weekly digest (11am vs 10am UTC Monday). Is this the right spacing? Should it be a separate day to avoid notification fatigue?

5. **notification-triggers.ts growth:** Now at 397/450 LOC with 8 functions. Is it time to split schedulers from triggers, or is the single-file approach still cleaner?

## Metrics
- 9,024 tests across 378 files
- Server build: 650.7kb
- `as any`: 78 total, 32 client-side
