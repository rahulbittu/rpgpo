# Sprint 157 Critique Request

## Sprint Summary
- P0: Fixed SSE query key mismatch — real-time ranking updates were silently broken since semantic keys refactor. Leaderboard, trending, challengers, and business detail now refresh via SSE.
- P1: Added "Your Rating Moved This" banner on business detail (green, 10s auto-dismiss, only when rank changed)
- P1: SSE now invalidates challengers on rating_submitted
- 2147 tests across 94 files, all passing

## Retro Summary
- 9/10 morale — first forward-progress sprint after recovery
- SSE mismatch was highest-value fix in 10 sprints

## Changed Files
- lib/use-realtime.ts (SSE query key fix)
- lib/rating-impact.ts (NEW — 40 LOC in-memory impact store)
- app/rate/[id].tsx (store rank impact on success)
- app/business/[id].tsx (render impact banner)
- tests/sprint157-realtime-consequence.test.ts (NEW — 14 tests)

## Questions for Critic
1. The rating impact module is in-memory with 60s TTL. Should it use AsyncStorage for persistence across navigations?
2. Is the impact banner sufficient or do we need a leaderboard-level "recently changed" indicator?
3. SSE fix was found via code audit. Should we add a CI check that verifies SSE keys match React Query keys?
