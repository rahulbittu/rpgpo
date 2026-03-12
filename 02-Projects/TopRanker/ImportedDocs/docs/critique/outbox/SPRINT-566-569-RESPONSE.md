# Sprints 566-569 External Critique

## Verified wins
- Sprint 566 shipped a concrete user-facing improvement: dish leaderboard now prefers rating photos over business photos and shows a photo count badge.
- Sprint 567 shipped a concrete dashboard addition: rating velocity widget with mini bar chart, peak indicator, and trend badge.
- Sprint 568 shipped a concrete discover/search feature: city comparison overlay in the discover flow.
- Sprint 569 shipped a concrete transparency feature: credibility breakdown tooltip exposing 7 factors on profile.
- The packet names specific technical debt and risk items instead of hiding them: stale-time policy, server-side caching absence, `search.tsx` size, missing drill-down, and an N+1 query.

## Contradictions / drift
- The biggest contradiction is Sprint 569 vs the cited integrity rule. The packet says the doc states **“NO public individual weight display”** while the feature exposes all 7 factors. Your interpretation of “public” is narrower than the plain reading. Unless the doc explicitly distinguishes self-view from any user-visible display, this is policy drift.
- Sprint 569 claims “score transparency,” but the open question itself acknowledges potential reverse-engineering. That means security/product review was not settled before shipping.
- Sprint 568 adds a 5-minute client stale time for city stats while also stating stats are computed on-demand from the DB and are **not cached server-side**. That is not a freshness strategy; it is only a client refetch throttle. It does nothing for backend query cost under broad traffic.
- Sprint 568 shipped a new city-comparison surface while `search.tsx` is already at 670/680 LOC. That indicates feature accretion without structural extraction. The team knew the file was at threshold and still added more discover complexity.
- Sprint 567 shipped a chart with no tap/drill-down. If the widget is meant to support interpretation of “velocity,” the lack of exploration path weakens it into decoration. If overview-only was intended, that should have been defined up front; the question suggests it was not.
- Sprint 566 knowingly shipped an N+1 query and left it to retro. “Typical leaderboard sizes <20” is not a defense when the endpoint is inherently batch-shaped and the fix is straightforward.

## Unclosed action items
- Resolve whether credibility factor display violates the integrity rule. This needs an explicit policy decision, not interpretation-by-implementation.
- Add server-side caching or precomputation for city stats if this overlay will see repeated traffic. Current client stale time does not address DB load.
- Refactor `search.tsx`. Discover-mode content extraction is still pending and the file is already effectively at the limit.
- Fix the N+1 in `getDishLeaderboardWithEntries` with a batched count query.
- Decide whether the velocity widget is overview-only or needs week-level drill-down; the feature definition is incomplete as written.
- Establish performance expectations for city queries on 50+ restaurant cities. The packet gives no evidence of actual latency or cost measurements.

## Core-loop focus score
**6/10**

- 566 is close to core-loop quality: better photos on leaderboard directly improve choosing/interpreting dishes.
- 567 is adjacent, not core: a velocity widget is analytics garnish unless it changes user action.
- 568 is mixed: city comparison can support discovery, but it also adds heavy query complexity and UI surface area inside an already bloated search file.
- 569 is mostly trust/transparency work, valuable but not core-loop unless credibility directly changes rating or restaurant choice behavior.
- Too much sprint energy went into secondary surfaces while basic engineering closure was deferred: policy ambiguity, N+1, and oversized search module.
- The packet reads like four small feature shipments with unresolved product/infra questions, not a tightly managed core-loop sprint.

## Top 3 priorities for next sprint
1. **Close the credibility policy gap before iterating further.** Decide whether self-visible factor breakdown is allowed, and if allowed, define exactly what can be shown without exposing weights or enabling reverse-engineering.
2. **Harden search/discover infrastructure.** Extract discover-mode content from `search.tsx` and add server-side caching/precomputation for city stats so the new overlay does not sit on top of a fragile, expensive path.
3. **Pay off the obvious query debt.** Replace the leaderboard N+1 with a grouped query and set a rule that known batch-query issues are fixed in-sprint, not deferred to retro.

**Verdict:** These sprints shipped visible UI, but the execution is loose: one feature appears to drift against policy, one adds backend cost without backend caching, one deepens an already oversized search module, and one shipped with a known N+1. The pattern is shipping first and resolving definition/performance afterward. That is not disciplined iteration on the core loop.
