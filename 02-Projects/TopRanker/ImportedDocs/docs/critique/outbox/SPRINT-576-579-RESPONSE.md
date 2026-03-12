# Sprints 576-579 External Critique

## Verified wins
- Sprint 576 has a clear, verifiable structural improvement: mock routing logic moved out of `lib/api.ts` into `lib/mock-router.ts`, and `api.ts` shrank from 573 LOC to 517 LOC.
- Sprint 577 closed a real fake-data gap: `DishVoteStreakCard` now uses server-side computed data via `/api/members/me` instead of implied placeholder logic.
- Sprint 578 added an actual server-backed comparison feature, not just UI: `GET /api/cities/:city/dimension-averages` with a single AVG aggregation query and a matching card.
- Sprint 579 added claim-state visibility tied to authenticated user scope, which is core-product relevant and not ornamental.

## Contradictions / drift
- Sprint 576 asks about Map/trie scalability while the packet says there are only ~15 routes. That is not a current problem. The bigger issue is route-order fragility from “most specific prefixes first, catch-alls last.” This is maintainable only while the list stays small and heavily tested.
- Sprint 577 presents the 3-query vs 1-CTE question as the main concern, but the real issue is correctness and transactional consistency across three sequential reads. Optimization is secondary; drift is treating perf as the first-order question.
- Sprint 578 adds an uncached city-average endpoint without any stated evidence of usage frequency or latency concern. That is acceptable for now, but asking about TTL caching before traffic data is available is speculative drift.
- Sprint 579 says the card is for business detail page claim state, but the endpoint returns all user claims and the client filters by businessId. That is a direct mismatch between page-level need and API shape.
- Across the packet, there is more attention on implementation pattern questions than on whether the features tightened the main user loop. Only the claim-status item is obviously close to conversion flow.

## Unclosed action items
- Add route-order tests for `EXACT_ROUTES` precedence and catch-all behavior. The current pattern is brittle unless explicitly pinned by tests.
- Revisit `getDishVoteStreakStats(memberId)` for single-query or transactionally consistent read if this endpoint is user-facing and refreshed often.
- Decide API shape for claims: add server-side filtering by `businessId` or a dedicated endpoint for the business detail use case.
- Validate whether city dimension averages need caching based on actual endpoint usage/latency, not preemptive concern.
- Test strategy question is unresolved: 11,010 tests may be fine, but there is no evidence here on runtime, flake rate, or signal quality, so “sustainable” is currently unanswered.

## Core-loop focus score
**6/10**
- Claim-status visibility is directly tied to a core trust/conversion loop for business ownership.
- Dish vote streaks reinforce repeat engagement, though this is retention-side rather than primary acquisition/conversion.
- Dimension comparison is useful product depth, but it is one step removed from the core loop unless proven to affect rating/submission behavior.
- Mock router extraction is maintenance work, not core-loop progress.
- Too much sprint energy appears split between infra cleanup and secondary UX instead of the most constrained user journey.
- Some work shipped with mismatched API granularity (`all claims` for a single business page), which weakens focus.

## Top 3 priorities for next sprint
1. **Fix API/UI shape mismatch on claims**
   - Add server-side filtering by `businessId` or provide a business-specific claim-status endpoint.
   - Stop fetching all claims to answer a single-business question.

2. **Harden streak correctness before optimizing it**
   - Verify edge cases: timezone boundaries, duplicate-day votes, no-vote members, and today/yesterday cutoff behavior.
   - Only collapse to a single CTE if correctness is already locked and this endpoint is measurably hot.

3. **Add guardrail tests for mock route precedence**
   - The array-order router is acceptable at ~15 routes, but only if precedence and fallback behavior are locked with explicit tests.
   - Do not spend time on trie/Map abstractions yet.

**Verdict:** This sprint set shipped real features, but the packet repeatedly frames speculative scale/perf questions while leaving more immediate mismatches and brittleness in place. The biggest concrete issue is the claims flow returning too much data for a page-specific need; the next is route-order fragility in the mock router. Core-loop focus is moderate, not strong.
