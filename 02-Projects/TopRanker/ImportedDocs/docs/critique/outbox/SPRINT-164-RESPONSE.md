# Sprint 164 — Performance Audit: N+1 Fixes, Missing Indexes, Query Optimization External Critique

## Verified wins
- Added two missing indexes in `shared/schema.ts`: `businessPhotos.businessId` and `credibilityPenalties.memberId`.
- Replaced featured placements N+1 fetching with a batch path via `getBusinessesByIds()` in `server/storage/businesses.ts` and `server/routes.ts`.
- Reduced `detectAnomalies` from two unbounded member rating queries to one `COUNT ... FILTER` query in `server/storage/ratings.ts`.
- Added test coverage for this sprint’s work in `tests/sprint164-performance-audit.test.ts` with 21 new tests.
- Packet reports 2220 tests across 99 files passing.

## Contradictions / drift
- The sprint claims “fixed 3 critical performance issues,” but one class of fix is not actually delivered in production: the new indexes exist in schema only and explicitly have not been pushed to the production DB.
- “No behavior changes” is asserted, but there is no evidence in the packet of benchmark data, query plans, or production verification; only correctness tests are mentioned.
- The sprint is framed as a performance audit response, but the retro action items from this exact work are deferred again: `updateMemberStats()` still does 4 queries.
- Proposed next sprint includes SLT meeting and architecture audit #15 alongside the unresolved `updateMemberStats` work; that is process/admin load competing with unfinished core optimization follow-through.
- The question set asks about CI query plan testing, but the sprint itself did not include any performance measurement mechanism beyond code changes and tests. That is a gap between audit intent and verification rigor.

## Unclosed action items
- Push the new indexes to the actual database using `drizzle-kit push`; until then the index fixes are incomplete.
- Consolidate `updateMemberStats()` query pattern; it remains a known multi-query inefficiency.
- Add load testing, as called out in the retro, since this sprint provides no reported before/after performance evidence.
- Decide how performance changes will be verified going forward: benchmarks, query plans, or production telemetry. Right now this is undefined.

## Core-loop focus score
**6/10**
- Work stayed mostly on backend query-path efficiency, which is relevant to the product’s core request loop.
- The featured placements N+1 fix is a direct core-path improvement.
- The anomaly detection query consolidation is useful, but likely less central than user-facing hot paths.
- Score is capped because the index work is not deployed, so one-third of the claimed wins is still not realized.
- No benchmark or production validation is provided, so “performance sprint” execution is only partially closed.
- Carrying forward `updateMemberStats()` leaves another known query inefficiency unresolved.

## Top 3 priorities for next sprint
1. **Finish the incomplete work:** push the two indexes to the production DB and verify they are actually used.
2. **Close the known query debt:** consolidate `updateMemberStats()` instead of deferring it again.
3. **Add performance verification:** at minimum load tests and captured query plans for the touched paths; otherwise future “performance fixes” remain mostly asserted, not demonstrated.

**Verdict:** This sprint is partially complete, not cleanly complete. The batch-query and anomaly-query changes are real wins, but the headline claim of fixing three critical issues is overstated because the index fixes are not deployed. The larger problem is execution discipline: you changed query code without adding hard evidence that the changes materially improved latency or load behavior, and you already know another multi-query hotspot remains open.
