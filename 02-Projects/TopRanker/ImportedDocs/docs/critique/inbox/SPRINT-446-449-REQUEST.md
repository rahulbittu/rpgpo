# Critique Request: Sprints 446–449

**Date:** 2026-03-10
**Requester:** Sarah Nakamura (Lead Eng)
**Review Window:** Sprints 446–449 (Dietary Enrichment → Rate Extraction)

## Context

This cycle delivered admin dietary management, hours-based search filtering, city comparison cards, and a major component extraction. The search experience now has 6 filter dimensions (text, category, cuisine, dietary, distance, hours).

## Deliverables for Review

1. `server/routes-admin-dietary.ts` — Admin dietary tag management (4 endpoints)
2. `server/hours-utils.ts` — Real-time open status computation
3. `server/routes-city-stats.ts` — City-level aggregated metrics
4. `components/business/CityComparisonCard.tsx` — Business vs city comparison
5. `components/rate/RatingConfirmation.tsx` — Extracted from SubComponents
6. `components/search/DiscoverFilters.tsx` — Extended with HoursFilterChips

## Questions for External Review

### 1. CUISINE_TAG_SUGGESTIONS covers 8 cuisines — is hardcoding appropriate?

Sprint 446 maps cuisine types to dietary tags (indian→vegetarian, middle_eastern→halal). This is hardcoded in `routes-admin-dietary.ts`. Dallas has 20+ cuisine types. Should this be:
- (a) Database-driven mapping table?
- (b) Admin-configurable?
- (c) AI-suggested based on menu analysis?
- (d) Hardcoded is fine for Dallas scale?

### 2. computeOpenStatus timezone hardcoding — how to generalize?

Sprint 447's `hours-utils.ts` hardcodes `America/Chicago` for Dallas. All current cities (TX + Southern US) are Central Time. But future expansion to Eastern/Pacific zones breaks this. How should timezone be:
- (a) Stored per-business in the schema?
- (b) Derived from city → timezone mapping?
- (c) Passed as a parameter from the client?

### 3. City stats aggregation — caching strategy at scale?

Sprint 448's `routes-city-stats.ts` runs full aggregation on every request. With 30-50 businesses per city, this is fast. At 500+ businesses, it needs caching. When should we:
- (a) Add Redis caching immediately (proactive)?
- (b) Wait until query time exceeds 100ms (reactive)?
- (c) Pre-compute city stats on a cron schedule?

### 4. DiscoverFilters.tsx at ~370/400 LOC — extraction strategy?

Sprint 447 added HoursFilterChips, pushing DiscoverFilters to ~370 LOC. The file has 4 chip components + sort header + styles. If Sprint 451 adds filter URL sync:
- (a) Extract each chip type to its own file now?
- (b) Extract only the largest (DietaryTagChips at ~35 LOC)?
- (c) Extract styles to a shared file?
- (d) Leave until 400 LOC trigger?

### 5. CityComparisonCard dimension data — how to populate business-side averages?

Sprint 448's comparison card receives `dimensionComparisons` from city stats, but passes 0 for `bizAvg`. The business-side dimension averages need to be computed from the ratings array. Should this:
- (a) Be computed client-side from the ratings already fetched?
- (b) Be a new server endpoint per business?
- (c) Be included in the business detail response?

## Metrics Snapshot

| Metric | Sprint 445 | Sprint 449 | Delta |
|--------|------------|------------|-------|
| Test files | 339 | 344 | +5 |
| Tests | 8,152 | 8,308 | +156 |
| Server build | 611.4kb | 622.7kb | +11.3kb |
| Audit grade | A (#47) | A (#48) | — |
| Admin endpoints | 40+ | 45+ | +5 |
