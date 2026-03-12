# SPRINT-290-294 External Critique

## Verified wins
- End-to-end cuisine filter pipeline appears completed across API, client fetch layer, search state, list indicator, and map indicator based on the changed files listed.
- Cache key was updated to include `selectedCuisine` in `["search", city, debouncedQuery, selectedCuisine]`, which is the minimum correct move for filtered search results.
- Wiring from `BestInSection` into `search.tsx` via `onCuisineChange` is a direct, understandable implementation for the current scope.
- Test coverage increased materially: 4 new test files and 47 new tests.

## Contradictions / drift
- Sprint 290 is presented as a governance checkpoint, but the packet gives no concrete output from that checkpoint beyond noting anti-requirements are still unresolved after 38 sprints. That is process without closure.
- You call this a completed “UX pipeline,” but the review questions still ask basic architecture questions about callback vs store/context, query invalidation semantics, extraction thresholds, and shared styling. That indicates implementation landed before key boundaries were settled.
- `search.tsx` growth from 802 to 862 LOC is treated as acceptable because it remains under a 950 threshold. That is threshold-chasing, not code health management.
- Style reuse is described as “defined once in StyleSheet” but the question asks whether it should move to shared constants. That means reuse is local, not actually standardized.
- Anti-requirement violations are framed as awaiting CEO input after 38 sprints. That is organizational drift being carried as technical debt indefinitely.

## Unclosed action items
- Decide whether cuisine state remains local via callback props or is promoted to shared state. The packet shows the implementation exists, but the architectural decision is still open.
- Decide whether query-key inclusion alone is the cache contract, or whether explicit invalidation policy is required on cuisine change.
- Set an extraction rule for `search.tsx` before the file continues to accumulate UI logic.
- Decide whether cuisine indicator styles stay local or become shared primitives.
- Resolve the 38-sprint-old anti-requirement violations instead of continuing to defer them.
- Provide actual outputs from Audit #40 if it is being claimed as sprint value.

## Core-loop focus score
**7/10**

- Strong alignment to the search discovery loop: filter selection, results update, visible active state, map parity.
- Backend-to-frontend wiring looks coherent and focused on a single user task.
- 47 tests suggest execution discipline around the shipped path.
- Score is capped because one of the five sprints was governance with no demonstrated product or engineering closure.
- Architectural and debt questions were deferred while still shipping incremental UI, which is acceptable short-term but not clean focus.

## Top 3 priorities for next sprint
1. **Close the open architecture decisions around search state ownership and cache behavior.** Stop shipping more search filter surface area until callback-vs-shared-state and invalidation policy are explicit.
2. **Extract filter indicator/UI logic out of `app/(tabs)/search.tsx`.** The file is already large; waiting for an arbitrary 950 LOC threshold is poor control.
3. **Force resolution on the anti-requirement debt.** After 38 sprints, “waiting for CEO input” is not an engineering plan. Escalate with a deadline or remove/retain via explicit owner decision.

**Verdict:** Useful user-facing progress was made on cuisine filtering, and the implementation seems to span the full stack cleanly enough. But the packet also shows a pattern of shipping first and formalizing boundaries later: oversized page component, unresolved state ownership, unresolved cache policy, local-only style reuse, and a 38-sprint-old anti-requirement stall. The work is productive, but governance and code-health closure are lagging behind the feature trail.
