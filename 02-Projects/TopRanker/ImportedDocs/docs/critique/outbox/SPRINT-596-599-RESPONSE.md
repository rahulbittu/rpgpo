# SPRINT 596-599 External Critique

## Verified wins
- Sprint 596 produced shared test utilities to target a quantified duplication problem: 977 duplications across 162 test files.
- Sprints 597-598 did create measurable LOC headroom in tracked files: schema -42 LOC, search.tsx -28 LOC.
- Sprint 599 created larger headroom via extraction: -105 LOC.
- Sprint 599 also removed dead code: MiniChart had been dead since Sprint 487, and is now gone.
- The request is explicit that these were maintenance/compression sprints, not disguised feature work.

## Contradictions / drift
- The packet calls comment removal “zero-risk” and asks whether it counts as capacity management. It does not count as meaningful complexity reduction. It improves threshold optics, not maintainability in any substantial way.
- You cite “freeing LOC headroom across critical files” as a focus, but two of the listed wins are comment stripping. That is threshold management, not architectural improvement.
- Eight consecutive non-user-facing sprints is clear core-loop drift by your own framing. “SLT-600 mandates return to core loop in Sprint 602” means the organization already recognizes the drift and had to externally correct it.
- The infrastructure list is inconsistent in severity: build optimization, deployment, and pHash persistence are plausibly foundational; three compression sprints in the same streak look like tail-end threshold grooming after the foundational work was done.
- Sprint 596 addresses duplication, but the chosen strategy is “adopt forward, no bulk migration.” That means the quantified duplication remains mostly intact. This is a partial intervention presented against a large existing problem.
- Dead code sat for 112 sprints after being identified. That is not a tooling gap first; it is an ownership and closure failure.

## Unclosed action items
- Pending issues from the 591-594 critique remain unresolved in this packet: git-committed dist assets, asymmetric moderation accountability, threshold ceiling management, build size trajectory, and core-loop focus drift.
- Threshold policy is still undecided after three compression sprints. That leaves the team without a clear policy for preventing immediate regrowth.
- Test helper adoption is unclosed. “Adopt forward” is not resolution for 977 duplications across 162 files; it is a slow-roll cleanup with no completion mechanism stated.
- Dead code lifecycle is unclosed. MiniChart being removed now does not solve the fact that a known dead component survived 112 sprints after flagging.
- Core-loop return is deferred. The packet says SLT-600 mandates return in Sprint 602, which means 600-601 are still at risk unless explicitly constrained.

## Core-loop focus score
**3/10**

- Eight consecutive non-user-facing sprints is extended drift, not a temporary detour.
- Some infrastructure work may have been necessary, especially deployment-related, but the packet does not justify why compression consumed three separate sprints inside this streak.
- Comment stripping inflated apparent progress without changing core product capability or materially reducing code complexity.
- The only clearly durable internal improvement here is the shared test helper, and even that lacks a migration/closure plan.
- The existence of an external mandate to return to the core loop by Sprint 602 is evidence that focus was not self-correcting.

## Top 3 priorities for next sprint
1. **Ship a user-facing core-loop change.** No more compression-only or cleanup-only sprint framing. The next sprint needs a rating/search/discovery improvement with user-visible impact.
2. **Set and enforce a threshold policy.** Count structural extraction/refactor as real headroom; do not treat comment stripping as equivalent. Lower ceilings or freeze them at post-compression levels, but make one rule and enforce it.
3. **Add closure mechanisms for maintenance debt.** Require owners and due-by sprint for flagged dead code and cleanup items; otherwise “flagged in retro” will keep meaning “ignored for 112 sprints.”

**Verdict:** These sprints produced some real maintenance gains, but the packet overstates compression as if threshold relief equals architectural progress. Extraction and dead code removal are legitimate; comment stripping is mostly optics. The larger issue is unchecked drift: eight consecutive non-user-facing sprints, unresolved carryover critique items, no closure system for known debt, and a mandated future return to the core loop because the team did not self-correct.
