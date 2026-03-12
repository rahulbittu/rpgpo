# Sprint 486: Business Analytics Route Extraction

**Date:** 2026-03-10
**Duration:** 1 sprint cycle
**Story Points:** 2
**Owner:** Sarah Nakamura (Lead Eng)

## Mission

Extract dashboard, rank-history, and dimension-breakdown endpoints from routes-businesses.ts to a new routes-business-analytics.ts. Resolves M-1 from Audit #55 (routes-businesses.ts at 95.6%).

## Team Discussion

**Sarah Nakamura (Lead Eng):** "Clean extraction — 3 endpoints moved, 82 LOC removed from routes-businesses.ts (325→243, 25% reduction). The new file is 102 LOC with all analytics endpoints. Test redirects were the bulk of the work — 7 test files needed updates."

**Amir Patel (Architect):** "routes-businesses.ts is back to 71.5% of threshold (243/340). This is the healthiest it's been since before Sprint 442's filter additions. The analytics endpoints have a natural grouping — all are read-heavy, analytics-focused, and several are Pro-tiered."

**Marcus Chen (CTO):** "The extraction cadence continues to work. Every 2-3 feature cycles, we extract. The test redirect pattern is well-understood now — change the file path in readFileSync calls."

**Rachel Wei (CFO):** "No user-facing changes, but the codebase health improvement reduces future development friction. This is the kind of maintenance that pays dividends in velocity."

## Changes

### New: `server/routes-business-analytics.ts` (~102 LOC)
- `registerBusinessAnalyticsRoutes(app)` — registers 3 endpoints
- `GET /api/businesses/:slug/dashboard` — owner dashboard with auth + Pro tiering
- `GET /api/businesses/:id/rank-history` — public rank history with day range
- `GET /api/businesses/:id/dimension-breakdown` — public dimension score breakdown

### Modified: `server/routes-businesses.ts` (-82 LOC, 325→243)
- Removed dashboard, rank-history, dimension-breakdown endpoints
- Removed imports: buildDashboardTrend, computeDimensionBreakdown
- Updated header comment with current endpoint list
- Now has 7 endpoints: autocomplete, popular-categories, search, :slug, ratings, claim, photos

### Modified: `server/routes.ts` (+2 LOC)
- Added import and registration of registerBusinessAnalyticsRoutes

### Test redirects (7 files):
- `__tests__/sprint478-dashboard-analytics.test.ts` — dashboard integration → routes-business-analytics.ts
- `__tests__/sprint484-dimension-breakdown.test.ts` — endpoint → routes-business-analytics.ts
- `tests/sprint171-routes-splitting.test.ts` — dashboard/rank-history → new describe block
- `tests/sprint173-claim-verification.test.ts` — dashboard access control → routes-business-analytics.ts
- `tests/sprint176-business-pro-subscription.test.ts` — dashboard tiering → routes-business-analytics.ts
- `tests/sprint146-freshness-boundary-audit.test.ts` — memberTier snapshot → routes-business-analytics.ts
- `__tests__/sprint476-search-extraction.test.ts` — LOC threshold updated

### New: `__tests__/sprint486-analytics-extraction.test.ts` (19 tests)
- Module structure: exports, endpoints, imports, auth, trend data
- LOC reduction: routes-businesses.ts under 260, no longer has extracted content
- Route registration: import and call in routes.ts

## Test Coverage
- 19 new tests, all passing
- Full suite: 8,973 tests across 375 files, all passing in ~4.8s
- Server build: 648.2kb (unchanged — same code, different file)
