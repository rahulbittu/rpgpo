# Sprint 589: Business Detail Page Section Extraction

**Date:** 2026-03-10
**Story Points:** 3
**Status:** Complete

## Mission

Extract hero and analytics sections from `app/business/[id].tsx` to dedicated components. The file was at 585 LOC — reduced to 410 LOC (30% reduction).

## Team Discussion

**Sarah Nakamura (Lead Eng):** "Two clean extraction boundaries: the hero section (carousel → breadcrumb → name card → stats → impact banner → confidence → badges) became BusinessHeroSection at 153 LOC. The analytics section (score → trust → sub-scores → review → city comparison → breakdowns → distributions → rank history) became BusinessAnalyticsSection at 119 LOC."

**Amir Patel (Architecture):** "The main file is now pure orchestration — data fetching, state management, and layout composition. All rendering logic lives in extracted components. This follows the same pattern we used for profile.tsx in Sprint 584."

**Marcus Chen (CTO):** "585 → 410 LOC is a 30% reduction. The file was our second-largest screen component. 13 test files needed redirects — the test redirect pattern is well-established now."

**Nadia Kaur (Security):** "No auth boundary changes. The hero section's bookmark toggle and share handlers still receive callbacks from the parent. Analytics section receives pre-fetched data — no new network calls."

**Jasmine Taylor (Marketing):** "The breadcrumb navigation, impact banner, and badge section are now in BusinessHeroSection — good for the above-the-fold story. When we A/B test hero layouts, we only touch one component."

## Changes

### New Files
- **`components/business/BusinessHeroSection.tsx`** (153 LOC)
  - HeroCarousel, breadcrumb nav, BusinessNameCard, QuickStatsBar
  - Impact banner, RankConfidenceIndicator, business badges
  - All hero-specific styles
- **`components/business/BusinessAnalyticsSection.tsx`** (119 LOC)
  - ScoreCard, TrustExplainerCard, SubScoresCard
  - ReviewSummaryCard, CityComparisonCard, ClaimStatusCard
  - ScoreBreakdown, DimensionScoreCard, DimensionComparisonCard
  - ScoreTrendSparkline, TopDishes, DishRankings
  - RatingDistribution, RankHistoryChart
  - Computes avgQ1/Q2/Q3 internally

### Modified Files
- **`app/business/[id].tsx`** (585→410 LOC, -175)
  - Replaced hero section with `<BusinessHeroSection />`
  - Replaced analytics section with `<BusinessAnalyticsSection />`
  - Removed 12 component imports moved to extracted modules
  - Removed hero/analytics styles moved to extracted modules

### Test Files
- **`__tests__/sprint589-business-detail-extraction.test.ts`** (26 tests)
- Updated 13 test files to read from extracted components:
  - sprint444, sprint448, sprint487, sprint578, sprint579, sprint144
  - sprint157, sprint268, sprint276, sprint277, sprint322, sprint348, sprint373

### Threshold Updates
- `shared/thresholds.json`: tests 11175→11202, build 725.9kb (unchanged — client-only extraction)

## Test Results
- **11,202 tests** across 477 files, all passing in ~9.3s
- Server build: 725.9kb
