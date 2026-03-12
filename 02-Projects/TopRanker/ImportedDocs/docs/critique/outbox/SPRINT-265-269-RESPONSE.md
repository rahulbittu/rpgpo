# SPRINT-265-269-REQUEST External Critique

## Verified wins
- Integrity checks were moved from theory into the actual `POST /api/ratings` path in Sprint 265: owner-self-rating block, velocity check, and submission logging are explicitly claimed as wired.
- Naive averaging was replaced with `computeComposite` in the rating submission flow. That is a real core scoring improvement, not just UI work.
- Verification and weighting logic was persisted into the ratings model in Sprint 267, including dimensional scores, verification signals, and effective weight fields.
- Score transparency improved in Sprint 268 with a dedicated breakdown API and UI surfacing of rating composition data.
- Low-data honesty got explicit product treatment in Sprint 269 via confidence tiers and zero-rating empty state.
- Test count increased every sprint in the block: +96 total, with file count also increasing from 188 to 192.

## Contradictions / drift
- The biggest contradiction is calling uploads “verification” when the packet itself admits photo and receipt uploads are not actually verified for authenticity. This is not verification; it is attachment-based boosting.
- Sprint 266 introduced a “+15% verification boost” UI hint before Sprint 267 actually defined and implemented the full verification/effective-weight model. The UX promise appears ahead of the underlying trustworthiness.
- “Integrity pipeline end-to-end complete through Phase 2” is overstated given the known risk that users can game photo/receipt boosts with arbitrary images. The pipeline is wired, but the verification premise is incomplete.
- The weighting model has likely drifted from understandable ranking into opaque suppression. The packet highlights a 300x max/min ratio and does not show any guardrail, floor, or user-facing explanation.
- Score breakdown transparency and confidence badges improve honesty on the read side, but the underlying score is still influenced by a verification system the packet admits can be gamed. Transparency over a distortable score is only partial honesty.
- Performance risk was knowingly added with read-time aggregation and no caching strategy. That is acceptable only if explicitly temporary; here it reads like shipped scope without closure criteria.

## Unclosed action items
- Resolve whether the 300x effective-weight spread is acceptable, or add a floor/cap. This is still an open product and ranking-policy decision, not just tuning.
- Stop labeling photo/receipt uploads as “verification” unless authenticity is checked, or downgrade the wording and boost semantics.
- Define a concrete anti-gaming plan for upload-based boosts. Right now the risk is named but not mitigated.
- Decide whether low-confidence businesses should display scores at all below a threshold, instead of only showing badges.
- Add a caching or precomputation strategy for `GET /api/businesses/:id/score-breakdown` before scale makes the endpoint expensive.
- Address the `as any` regression. The packet explicitly calls out worsening type discipline with no closure.
- Decide whether category confidence thresholds remain hardcoded or move to config/data.

## Core-loop focus score
**7/10**
- Strong focus on the main loop: submit rating → weight it → compute score → show score breakdown.
- Sprint 265 and 267 directly improved rating ingestion and scoring, which is the right center of gravity.
- Sprint 268 and 269 improved trust/readability of rankings, still adjacent to the core loop.
- Sprint 266 is weaker because it adds a boost mechanic before solving whether the “verification” signal is valid.
- Too much of the block depends on a shaky proxy for trust. That undermines the quality of the loop even if the loop itself is coherent.

## Top 3 priorities for next sprint
1. **Fix the false-verification problem**
   - Either remove/reword “verification” claims and reduce the boost, or add actual authenticity checks. Current semantics are misleading.

2. **Constrain the weighting model**
   - Add floors/caps and run distribution analysis on effective weights. A 300x spread is too extreme to leave as an abstract concern.

3. **Close score-breakdown scalability**
   - Add caching, precompute snapshots, or both. Do not keep a read-time aggregation endpoint in a “known risk” state if it is now part of the business detail experience.

**Verdict:** This block made real progress on the rating/scoring loop, but it also shipped a semantic bait-and-switch: “verification” boosts that are not verification. The biggest problem is not missing polish; it is that trust signals are being rewarded without being trustworthy, while a highly aggressive weighting model can quietly suppress users by 300x. Until those two issues are corrected, the system is more sophisticated than credible.
