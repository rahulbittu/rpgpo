# Sprint 164 Critique Request

**Sprint:** 164 — Performance Audit: N+1 Fixes, Missing Indexes, Query Optimization
**Date:** 2026-03-09
**Test Count:** 2220 across 99 files (all passing)

## Sprint Summary
Fixed 3 critical performance issues from architecture audit: (1) Added missing indexes on businessPhotos.businessId and credibilityPenalties.memberId, (2) Converted featured placements from N+1 to batch query (2 queries regardless of placement count), (3) Combined 2 unbounded member rating queries in detectAnomalies into 1 COUNT FILTER query.

## Retro Summary
Team morale 9/10. Clean optimizations, no behavior changes. Action items: consolidate updateMemberStats, add load testing.

## Changed Files
- `shared/schema.ts` — 2 new indexes (idx_biz_photos_business, idx_penalties_member)
- `server/storage/businesses.ts` — new getBusinessesByIds() batch function
- `server/routes.ts` — featured endpoint uses batch queries
- `server/storage/ratings.ts` — detectAnomalies combined FILTER query
- `tests/sprint164-performance-audit.test.ts` — 21 new tests

## Known Contradictions
- Indexes added in schema but not yet pushed to production DB (need drizzle-kit push)
- updateMemberStats() still makes 4 queries (tracked for next sprint)

## Proposed Next Sprint
Sprint 165: SLT meeting (every 5 sprints), architecture audit #15, updateMemberStats consolidation.

## Questions for External Critique
1. Is the FILTER clause approach for anomaly detection portable across Postgres versions?
2. Should we add query execution plan tests (EXPLAIN ANALYZE) to CI?
3. Any concerns about the ANY(ARRAY[...]) pattern for batch lookups vs IN clause?
