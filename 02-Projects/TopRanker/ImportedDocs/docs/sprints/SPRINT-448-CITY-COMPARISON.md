# Sprint 448: Review Summary City Comparison

**Date:** 2026-03-10
**Duration:** 1 sprint cycle
**Story Points:** 5
**Owner:** Sarah Nakamura (Lead Eng)

## Mission

Add city-level comparison metrics to business detail pages. Users can now see how a business's score, rating count, and would-return rate compare against the city average — making ranking context immediately visible.

## Team Discussion

**Marcus Chen (CTO):** "Context is everything in ranking. A 4.2 score means nothing in isolation — is that good for Dallas? Is it above or below average? This sprint surfaces that context directly on the business page. The delta indicators (green up, red down) make it instantly scannable."

**Rachel Wei (CFO):** "This is a retention feature. When users see 'this restaurant is +0.8 above city average', that validates their choice. When they see a restaurant is below average, that creates a moment of discovery — 'what's better?' — which drives more exploration. Both outcomes are good for engagement."

**Amir Patel (Architect):** "The city stats endpoint aggregates on every call, which is fine at our current scale. With 30-50 active businesses per city, the queries are fast. At 500+ businesses, we'd want to cache the city stats with a 5-minute TTL. The architecture supports that — just wrap the computation in a cache layer."

**Priya Sharma (Design):** "The comparison card uses the same visual language as the existing review summary. Trophy icon for score, star for ratings, thumbs-up for would-return. The delta badges use green/red with arrow icons — universal affordance. The dimension bar chart shows the business vs city at a glance."

**Sarah Nakamura (Lead Eng):** "The staleTime of 120s on the city stats query means we don't re-fetch on every navigation. City averages don't change fast enough to need real-time data. The 30-day window for recent ratings and would-return gives a meaningful sample size."

**Nadia Kaur (Security):** "The city stats endpoint is read-only aggregate data. No PII exposed. The dimension averages are city-wide, not per-business or per-user. No authorization required — this is public summary data."

## Changes

### New: `server/routes-city-stats.ts` (~105 LOC)
- **GET /api/city-stats/:city** — Aggregated city metrics
- Returns: totalBusinesses, avgWeightedScore, avgRatingCount, avgWouldReturnPct, recentRatingsCount, dimensionAvgs
- Filters by active businesses only
- 30-day window for recent ratings data

### New: `components/business/CityComparisonCard.tsx` (~235 LOC)
- Header: "vs {City} Average" with business count
- 3 key metrics with delta indicators (score, ratings, would-return)
- Delta color coding: green (#2D8F4E) positive, red (#D44040) negative
- Dimension comparison bars with legend
- CityComparisonCardProps interface for type safety

### Modified: `server/routes.ts`
- Added import + registration of registerCityStatsRoutes

### Modified: `lib/api.ts`
- Added CityStats interface and fetchCityStats function
- Calls /api/city-stats/:city endpoint

### Modified: `app/business/[id].tsx` (508→524 LOC)
- Added cityStats query with 120s staleTime
- Renders CityComparisonCard after ReviewSummaryCard
- Conditionally shown when city stats are loaded and business exists

## Test Coverage
- 42 tests across 7 describe blocks in `__tests__/sprint448-city-comparison.test.ts`
- Validates: route structure, endpoint logic, component, API client, page wiring, routes wiring, docs

## Metrics
- Server build: ~623kb
- Tables: 32 (unchanged)
