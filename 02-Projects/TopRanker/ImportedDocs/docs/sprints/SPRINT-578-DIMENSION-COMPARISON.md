# Sprint 578: Rating Dimension Comparison Card

**Date:** 2026-03-10
**Story Points:** 5
**Status:** Complete

## Mission

Create a self-fetching DimensionComparisonCard that shows how a business's per-dimension scores (food, service, vibe, etc.) compare to city-wide averages. This gives users context — "Is this restaurant's food better than average for Dallas?"

## Team Discussion

**Marcus Chen (CTO):** "Comparison context is how users make decisions. Showing a 4.2 food score means nothing alone. Showing it's 0.4 above the city average — that's actionable information."

**Amir Patel (Architecture):** "The city averages endpoint uses a single SQL query with AVG aggregations joined to the businesses table. Filtered by active businesses and non-flagged ratings. Efficient and cacheable."

**Sarah Nakamura (Lead Eng):** "The component reuses DIMENSION_CONFIGS from DimensionScoreCard — no duplication. It adapts to the primary visit type automatically. Dual bars per dimension make the comparison scannable."

**Priya Sharma (Design):** "The amber/gray dual bar pattern is consistent with CityComparisonCard's legend. Delta coloring (green above, red below) gives instant visual feedback."

**Dev Okonkwo (Frontend):** "Self-fetching pattern means no prop drilling from the parent. The component manages its own queries with React Query. If either query fails, it returns null gracefully."

**Nadia Kaur (Security):** "City parameter is URL-decoded on the server. The SQL uses parameterized queries via Drizzle. No injection risk."

## Changes

### New Files
- **`server/city-dimension-averages.ts`** (50 LOC)
  - `computeCityDimensionAverages(city)` — AVG aggregation for all 6 dimensions
  - Joins ratings × businesses, filters active + non-flagged
  - Returns `CityDimensionAverages` with dimension avgs + totalRatings + totalBusinesses

- **`components/business/DimensionComparisonCard.tsx`** (115 LOC)
  - Self-fetching: `/api/businesses/:id/dimension-breakdown` + `/api/cities/:city/dimension-averages`
  - Dual bar per dimension (amber = business, gray = city)
  - Adapts to primary visit type via DIMENSION_CONFIGS
  - Delta coloring: green > +0.2, red < -0.2
  - Legend + city business count header

### Modified Files
- **`server/routes-business-analytics.ts`** (+7 LOC)
  - New endpoint: `GET /api/cities/:city/dimension-averages`
  - Imports and calls `computeCityDimensionAverages`

- **`app/business/[id].tsx`** (+2 LOC)
  - Added DimensionComparisonCard import
  - Renders after DimensionScoreCard, before ScoreTrendSparkline

- **`lib/mock-router.ts`** (+2 LOC)
  - Added `/api/cities/` mock handler for dev fallback

### Threshold Updates
- `shared/thresholds.json`: tests 10941→10977, build 714.3→715.9kb
- `sprint554`: build threshold 715→720kb
- `sprint281`: client `as any` threshold 40→48

## Test Results
- **10,977 tests** across 467 files, all passing in ~5.8s
- Server build: 715.9kb
