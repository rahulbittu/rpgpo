# Critique Request: Sprints 576-579

**Date:** 2026-03-10
**Requesting:** External review of Sprints 576-579

## What Was Built

### Sprint 576: Mock Data Router Extraction
- Extracted `getMockData` from `lib/api.ts` into `lib/mock-router.ts` (77 LOC)
- Route-map pattern with `EXACT_ROUTES` array — most specific prefixes first, catch-alls last
- State helpers (`isServingMockData`, `resetMockDataFlag`, `setServingMockData`) co-located
- api.ts dropped from 573 to 517 LOC

### Sprint 577: Server-Side Dish Vote Streak Calculation
- `getDishVoteStreakStats(memberId)` — 3 queries: total count, top dish, distinct days
- Streak algorithm: walks sorted (desc) distinct days, tracks current + longest
- Wired into `/api/members/me` — DishVoteStreakCard now shows real data
- Current streak only counts if most recent vote was today or yesterday

### Sprint 578: Rating Dimension Comparison Card
- `DimensionComparisonCard` — self-fetching, shows business vs city dimension averages
- Server: `GET /api/cities/:city/dimension-averages` — single SQL with AVG aggregations
- Dual horizontal bars per dimension (amber = business, gray = city)
- Adapts to primary visit type via shared DIMENSION_CONFIGS

### Sprint 579: Business Claim Status Tracking
- `ClaimStatusCard` — shows pending/approved/rejected state on business detail page
- Server: `GET /api/members/me/claims` — returns all claims with business name/slug
- Three visual states with contextual CTAs (Open Dashboard / Resubmit Claim)
- Auth-gated, scoped to authenticated user only

## Questions for Reviewer

1. **Mock router extraction**: Is the EXACT_ROUTES array the right pattern, or would a Map/trie be more maintainable at scale? The current array has ~15 routes.

2. **Streak calculation**: The 3-query approach runs sequentially. A single CTE could reduce to 1 query. Is this premature optimization, or should it be done now?

3. **City dimension averages**: Currently uncached. Should we add TTL caching now, or wait until we have production traffic data to determine if it's actually a bottleneck?

4. **Claim status card**: Currently fetches all user claims and filters client-side by businessId. At what scale does this become a problem? Should we add a server-side filter?

5. **Test count at 11,010**: Is the linear test growth sustainable, or should we consolidate older sprint tests into broader integration tests?

## Files to Review
- `lib/mock-router.ts` (77 LOC)
- `server/storage/members.ts` lines 320-380 (getDishVoteStreakStats)
- `server/city-dimension-averages.ts` (50 LOC)
- `components/business/DimensionComparisonCard.tsx` (115 LOC)
- `components/business/ClaimStatusCard.tsx` (93 LOC)
- `server/routes-members.ts` lines 278-284 (claims endpoint)
