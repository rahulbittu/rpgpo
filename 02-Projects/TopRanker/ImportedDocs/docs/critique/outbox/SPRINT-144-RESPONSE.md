# Sprint 144 — Live Experiments + MapView Extraction + E2E Pipeline Validation External Critique

## Verified wins
- The "run or delete" directive from Sprint 143 was addressed directly. All three experiments are now `active: true`, and two of them (`personalized_weight`, `trust_signal_style`) were freshly wired into product UI with variant-conditional rendering via `useExperiment`. This is real product integration, not just flag changes.
- The E2E experiment pipeline tests (24) prove the full lifecycle: assignment → exposure dedup → outcome recording → dashboard computation → recommendation. This validates the infrastructure that Sprints 135-143 built. The statistical correctness tests (200-user traffic split, threshold-based recommendations) and cross-component hash parity tests are particularly strong evidence.
- MapView extraction from search.tsx (907→713 LOC) is clean and measurable. The MapView component, CITY_COORDS, and Google Maps imports were moved as a coherent unit. No regressions.
- The critique request is honest about what was NOT done: HTTP-level freshness tests (priority #2) and business/SubComponents decomposition (priority #3 partial). This is a credibility improvement over prior packets that relabeled unaddressed items.
- Test count grew from 1899 to 1947 (+48), all passing. The new tests are meaningful pipeline validation, not padding.

## Contradictions / drift
- **HTTP-level freshness tests have now been deferred for three consecutive sprints.** Sprint 142 first raised it as "close the gap between function invocation and response correctness." Sprint 143 didn't address it. Sprint 144 explicitly chose experiment activation over it. The deferral is acknowledged, but the item is aging dangerously — each sprint that passes without addressing it weakens confidence that the tier freshness claims from Sprint 141-142 actually hold at the HTTP layer.
- **business/SubComponents.tsx at 997 LOC is still untouched.** The critique called this out in Sprint 143 and Sprint 144 only addressed search.tsx. The largest SubComponents file remains nearly 1000 lines. Partial credit for search extraction, but the harder problem was avoided.
- "All 3 experiments activated" sounds comprehensive, but `confidence_tooltip` was already active since Sprint 135. The net new activation is 2 experiments, not 3. The framing overstates the delta.
- The experiments are "active" but there is still no evidence of real user traffic flowing through them. Activation + UI wiring is necessary but not sufficient. Without production traffic data or even simulated load testing, the experiments exist in a validated-but-unused state. The pipeline is proven in tests; it is not yet proven in production.
- The packet asks "What would move the score back to 8/10?" — the answer is straightforward: stop deferring the HTTP freshness tests. That item represents the single largest open credibility gap in the tier correctness story.

## Unclosed action items
- **Write HTTP-level freshness integration tests.** This is now the oldest open critique item (3 sprints). Mock Express request to a FRESH endpoint (e.g., GET /api/members/:username) with stale stored tier, assert the response JSON contains corrected tier data. This is the missing proof between "the math works" and "the server returns correct data."
- **Decompose business/SubComponents.tsx** (997 LOC). Split into individual component files: HeroCarousel.tsx, TrustExplainerCard.tsx, ScoreCard.tsx, etc. Target: no single file over 500 LOC.
- **Gather or simulate experiment outcome data.** Activate experiments in production are only meaningful if outcome data flows through the dashboard. Either deploy to a staging environment with test users or create a realistic simulation that generates exposure/outcome data through the actual API endpoints (not just test-file function calls).
- **Stop counting confidence_tooltip as a Sprint 144 activation.** It was active since Sprint 135. Honest accounting strengthens the packet.

## Core-loop focus score
**8/10**

- The experiment activation is directly core-loop relevant: personalized vote weight on challenger and trust signal style on business detail both affect how users experience the trust/credibility system.
- E2E pipeline validation proves the measurement infrastructure works, which is necessary for data-driven product iteration. This closes a multi-sprint gap.
- MapView extraction is housekeeping but reasonable alongside the experiment work.
- Score recovers from 7 to 8 because the main critique directive ("run or delete") was addressed with substance, not just flags. The UI wiring and pipeline validation make the activation real.
- Score is capped at 8 because the HTTP freshness tests keep getting deferred and business/SubComponents remains oversized. Both are straightforward items that should not keep sliding.
- The honest disclosure of what was NOT done in the critique request is noted positively. Credibility in the packet format matters.

## Top 3 priorities for next sprint
1. **HTTP-level freshness integration tests — no more deferrals.** This has been open for 3 sprints. Write tests that hit Express route handlers with stale tier state and assert corrected responses. This is the final proof needed to close the tier freshness story.
2. **Decompose business/SubComponents.tsx into individual files.** 997 LOC in a single extracted file defeats the purpose. One component per file, each under 300 LOC.
3. **Generate experiment outcome data through the actual API.** Either simulate realistic user flows through the experiment endpoints or prepare for a staging deployment. The pipeline is validated in tests; now prove it works with data flowing through HTTP.

**Verdict:** This sprint corrected the main failure of Sprint 143 by actually activating and wiring experiments instead of just expanding infrastructure. The pipeline validation tests are the strongest evidence yet that the A/B framework works end-to-end. Score recovers to 8/10 because the core directive was addressed with substance. But the HTTP freshness tests are now a chronic deferral — three sprints is too long to carry an open credibility gap. Fix it next sprint or explain why it cannot be done.
