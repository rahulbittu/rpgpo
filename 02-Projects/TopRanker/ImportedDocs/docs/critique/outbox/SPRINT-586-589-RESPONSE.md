# SPRINT-586-589 External Critique

## Verified wins
- Sprint 587 appears to have closed a real durability gap: photo hash index now has DB persistence and preload on startup instead of being memory-only.
- Sprint 588 added a second anti-gaming layer on top of exact SHA-256 matching. That is a real capability increase, even if the chosen algorithm is weak.
- Sprint 586/589 show a repeatable extraction pattern exists: move code, rewire routes/imports, redirect tests. The work is being done systematically rather than ad hoc.
- The request surfaces concrete operational constraints: single-process runtime, 730kb build ceiling, 50+ route imports, and repeated test redirect churn. That is useful evidence of where pressure is accumulating.

## Contradictions / drift
- The packet frames Sprint 588 as “perceptual hash / average hash” and asks whether to invest in a “proper DCT-based perceptual hash.” That is the contradiction: you do not currently have a robust perceptual hash; you have a simplified byte-sampling average hash being labeled as one.
- The anti-gaming stack is described as two-layer verification, but both layers are still hash-based similarity checks on the same artifact class. That is not broad defense-in-depth; it is a narrow extension of the same tactic.
- Build discipline is effectively gone already: 725.9kb against a 730kb ceiling with +2-3kb per sprint means the ceiling is being treated as a lagging alarm, not an enforced constraint.
- The team keeps extracting components/routes, but every extraction increases test redirect churn. That indicates modularization of source files is not matched by modularization of test access patterns.
- The request asks whether explicit route imports should give way to auto-discovery because `routes.ts` has 50+ imports, but there is no evidence here that import count itself is the bottleneck. The demonstrated pain is test and file-structure churn, not route registration runtime.
- On stores, the packet asks “full Redis now?” while also stating single-process today and that DB persistence + preload already exists. That reads like premature architecture anxiety unless there is evidence of memory pressure, startup latency, or multi-process plans.

## Unclosed action items
- Decide whether Sprint 588’s average-hash implementation is acceptable or replace it with an actual DCT-based pHash. This is the clearest unresolved technical quality issue in the packet.
- Make a concrete build-size policy now. At current growth, the 730kb ceiling will be hit within 2 sprints. “Keep watching it” is no longer a policy.
- Resolve the test-maintenance cascade caused by extraction work. The helper/search abstraction proposed in the request remains unaddressed and likely necessary.
- Define a clear architecture rule for in-memory indexes: when hybrid DB + memory is sufficient, and what trigger would justify Redis. Right now it sounds case-by-case and unprincipled.
- Reassess route extraction goals. If the problem is `routes.ts` sprawl, fix registration ergonomics; if the problem is test churn, route auto-discovery is probably irrelevant.

## Core-loop focus score
**6/10**
- There is some core-loop relevance: photo anti-gaming and business detail extraction plausibly affect ranking/input quality.
- Persistence for photo hashes is operationally relevant and prevents regressions in a live loop.
- But a lot of effort appears spent on extraction mechanics, route wiring, import churn, and test redirects rather than user-visible loop improvement.
- The build ceiling issue is now close enough to consume future sprint time reactively, which is classic maintenance drag.
- The team is adding architecture surface area (multiple indexes, hybrid persistence, route decomposition) faster than it is tightening the underlying conventions.

## Top 3 priorities for next sprint
1. **Fix the photo “pHash” quality gap.** Either rename Sprint 588’s algorithm honestly as a cheap average-hash heuristic and accept its limits, or replace it with a proper DCT-based perceptual hash. Do not keep calling a weak sampler “perceptual hash” and assume the anti-gaming problem is handled.
2. **Set and enforce a build-size decision immediately.** Given 99.4% utilization, choose one path now: raise the ceiling with explicit rationale, or split/admin-lazy-load to buy headroom. Do not drift into accidental ceiling breaches sprint by sprint.
3. **Stop extraction-driven test churn.** Introduce a test helper or other indirection so component/file extraction does not require mass redirect edits across 5-13 test files every time. This is repeated, measurable friction and now a pattern, not a one-off.

**Verdict:** These sprints produced some real infrastructure gains, but the packet mostly documents accumulating maintenance pressure dressed up as modularization progress. The strongest contradiction is the claimed “perceptual hash,” which by your own description is not robust enough to justify confidence. The build ceiling is effectively exhausted, test coupling is repeatedly exposed by every extraction, and the Redis/auto-discovery questions are mostly premature compared with the obvious unresolved problems already in front of you.
