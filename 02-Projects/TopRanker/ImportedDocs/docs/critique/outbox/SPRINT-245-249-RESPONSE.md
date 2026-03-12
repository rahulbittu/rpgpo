# External Critique Request — Sprints 245-249 External Critique

## Verified wins
- Admin auth sweep appears real, specific, and high-value: 8 endpoints gated, with listed module updates (`moderation-queue.ts`, `business-analytics.ts`, `search-ranking-v2.ts`).
- Tiered rate limiting shipped as an actual module (`server/tiered-rate-limiter.ts`), not just a plan. Test count increased by 36 in Sprint 247.
- WebSocket auth improved from session cookies to JWT. That is a concrete security/architecture change, not just feature polish.
- Test suite growth is consistent across execution sprints: +140 tests, 4 new sprint-specific test files, total from 4,723 to 4,863.
- Charlotte/Raleigh work was at least operationalized into config/status changes and seed data, not just research: `shared/city-config.ts` updated and sprint-specific test added.
- Content-policy input length limits for regex are a real defensive fix with a clear threat model (ReDoS prevention).

## Contradictions / drift
- Q4 roadmap included Carolinas and WebSocket v2; those shipped. It also included email templates and tiered rate limits; those shipped. But the block still drifted toward enabling infrastructure without closing the operational dependencies: CDN is still partial, Redis is still deferred, WebSocket remains single-instance in practice.
- Sprint 249 claims “delivery tracking” for notifications, while the next sprint proposes Expo push integration with delivery tracking again. That suggests either Sprint 249 tracking is only in-app/WebSocket delivery or the scope is being described inconsistently.
- Sprint 248 calls NC market research “validated,” but the same packet admits city prioritization is still uncertain and asks whether Charlotte should even outrank Raleigh. That is not validation; it is preliminary hypothesis.
- “Growth phase begins” is overstated against the evidence. Ranking quality instrumentation is still absent, Bayesian scoring is still empirically unvalidated, and city prioritization is still based largely on intuition.
- The audit grade is strong, but it masks repeated deferral on foundational issues: in-memory stores grew to 9 after Redis had already been recommended since Sprint 225. That is not maturity; it is controlled procrastination.
- CDN work is described as “finally shipped” in Sprint 247, but the packet later states only headers were done and proxy is still missing. That is partial implementation being narrated like completion.

## Unclosed action items
- Redis migration is still the biggest stale item. It has been recommended since Audit #29 / Sprint 225, deferred four times, and the system added more in-memory state anyway.
- CDN deployment remains unclosed across 6 audits. Headers are not the deployment.
- Ranking quality instrumentation remains open despite being critical to the product’s core ranking claim. Six sprints after ranking v2 launch, still no CTR/dwell measurement.
- `routes.ts` extraction is still pending and tied to “next endpoint addition,” which is not an action plan; it is avoidance.
- Push compliance review is still pending while push is the proposed next sprint. This should not trail implementation.
- Charlotte beta readiness is open, and the current prioritization rationale is weak enough that it may need validation before promotion.
- Email template sanitization/XSS handling is still unresolved despite shipping a template system that interpolates user/business content.

## Core-loop focus score
**6/10**

- Strong work on platform capabilities: auth hardening, rate limiting, notifications. Good engineering, but only partly core-loop.
- Too much effort went to enablement layers while ranking quality measurement—the actual trust/ranking loop—remains uninstrumented.
- NC expansion added supply/config state, but not evidence of user demand, engagement, or marketplace performance.
- WebSocket v2 and push planning improve retention plumbing, but without ranking instrumentation you still cannot verify the product is helping users choose better businesses.
- Repeated deferral of Redis/CDN means engineering attention is split between new features and old infrastructure debt.
- Test growth is good, but high test count does not compensate for missing production feedback loops.

## Top 3 priorities for next sprint
1. **Instrument ranking quality now.** Ship CTR, dwell time, and basic rank-position outcome metrics before more market expansion or growth claims. This is the most important blind spot in the packet.
2. **Close one deferred infrastructure dependency instead of adding another in-memory feature.** Redis should start now, especially for rate limiter and WebSocket state. Stop increasing the migration scope before phase 1 begins.
3. **Resolve notification/email safety and scope boundaries before broader push rollout.** Clarify what “delivery tracking” already exists, complete CAN-SPAM/TCPA review, and add explicit sanitization rules for template interpolation.

**Verdict:** This was a productive 5-sprint block, but it is being narrated as more complete and more growth-ready than the evidence supports. The main pattern is shipping attractive capability layers while repeatedly deferring the operational and measurement work that would make them trustworthy at scale. The biggest misses are unchanged: no empirical ranking instrumentation, no closure on Redis/CDN, and fuzzy wording around what is actually “done.”
