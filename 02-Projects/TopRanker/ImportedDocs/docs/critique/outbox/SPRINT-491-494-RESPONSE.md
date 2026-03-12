# Sprints 491–494 External Critique

## Verified wins
- Sprint 491 produced a real structural change: rating routes were extracted from `routes.ts` into `routes-ratings.ts`, and `routes.ts` dropped from 546 to 369 LOC.
- Sprint 492 added a concrete admin surface for push analytics: `GET /api/admin/push-analytics` with `daysBack`.
- Sprint 492 also states `recordPushDelivery` was wired into all 4 notification triggers; if accurate, that is full trigger coverage for the current push flow.
- Sprint 493 materially expanded autocomplete behavior: fuzzy matching, typed suggestions, dish lookup, and merged ranking across businesses and dishes.
- Sprint 494 defines a specific claim-verification scoring model with explicit weights and an auto-approval threshold, which is clearer than opaque/manual-only logic.

## Contradictions / drift
- The scope mixes four unrelated areas: route extraction, push analytics, autocomplete relevance, and claim verification. That is breadth, not tight sprint focus.
- Sprint 491 frames 12 test-file redirects as work completed, but the question itself suggests the testing pattern may be wrong. That means some of the sprint output may be churn caused by test design, not product value.
- Push analytics is called “analytics,” but the implementation is in-memory. That is operationally closer to ephemeral diagnostics than analytics. If the process restarts, history is gone.
- The admin analytics endpoint supports `daysBack`, but the implementation described is only in-memory. Unless bounded retention behavior exists, `daysBack` is partly cosmetic and its reliability depends on uptime length.
- Sprint 493 increased autocomplete complexity substantially, but no outcome metrics are provided: no CTR, no zero-result reduction, no latency, no false-positive rate. Relevance work without measured relevance is drift risk.
- Sprint 494 introduces auto-approval for business ownership at 70+, but the critique question immediately doubts the threshold. Shipping auto-approval before threshold confidence is established is risky drift on a sensitive decision.
- `storage/businesses.ts` approaching 700 LOC is raised as a concern, but no extraction happened in this packet. The debt is acknowledged, not addressed.

## Unclosed action items
- Decide whether source-based route tests (`readFileSync + toContain`) should be replaced or reduced. This is explicitly unresolved.
- Define the migration trigger for push analytics persistence. Right now there is no stated threshold tied to reliability, scale, or retention needs.
- Validate autocomplete fuzzy thresholding with actual user impact data. The current `edit distance <= 2 for queries >= 4 chars` is still an open tuning question.
- Reassess claim auto-approve threshold. The 70+ rule is implemented, but confidence in that rule is not established.
- Plan extraction for `storage/businesses.ts` before it crosses the stated threshold. The split strategy is still undecided.
- Clarify retention semantics for in-memory push analytics versus the `daysBack` API contract.

## Core-loop focus score
**4/10**

- Too many parallel themes across four sprints; this reads like opportunistic backlog movement, not concentrated core-loop pressure.
- Autocomplete is core-loop adjacent and claim approval may affect supply quality, but route extraction and push analytics are mostly infrastructure/admin work.
- There is little evidence of user-facing outcome measurement for the most core-loop-relevant change: autocomplete.
- The highest-risk decision in the packet—claim auto-approval—appears to have been shipped before threshold confidence was settled.
- Some work appears to create maintenance churn rather than product leverage, especially the source-based test redirects.

## Top 3 priorities for next sprint
1. **Put measurement behind the risky product decisions.**  
   Add hard metrics for autocomplete and claim V2: suggestion acceptance, zero-result rate, latency, false-positive/manual-reversal rates, and auto-approval error rate.

2. **Remove misleading “analytics” ambiguity.**  
   Either persist push delivery data or explicitly downgrade the feature to transient diagnostics. Define a concrete migration trigger tied to production reliability and retention needs.

3. **Stop structural churn from weak test patterns and looming file growth.**  
   Replace or reduce source-based route assertions, and extract `storage/businesses.ts` now with a domain-based split before it becomes another oversized catch-all.

**Verdict:** There are real outputs here, but the packet shows more breadth than discipline. The biggest pattern is shipping mechanisms before validating whether they are trustworthy: in-memory “analytics” presented like analytics, fuzzy search without relevance evidence, and claim auto-approval without threshold confidence. Sprint 491 also hints at avoidable test churn. The next sprint should prioritize validation and reliability over adding more surfaces.
