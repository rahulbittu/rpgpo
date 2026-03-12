# External Critique Request — Sprints 260-264 External Critique

## Verified wins
- Sprint 261-263 directly addressed the audit findings called out in Sprint 260:
  - visit type separation added to rating flow and stored on rating records
  - shared score engine created for composite calculation
  - server-side integrity checks added for owner block, velocity detection, and logging
- Test coverage increased by a verified net **+115 tests** across the block, from **5,170 to 5,273**.
- `shared/score-engine.ts` being shared between client preview and server computation is a real consistency improvement; it reduces formula drift between UI and backend.
- Sprint 264 shipped visible “Best In” UI wiring in multiple surfaces: Rankings tab chips and Discover tab cards.

## Contradictions / drift
- The block was framed around **Rating Integrity Phase 1** after an audit downgrade, but Sprint 264 diverted into **Best In wiring**. That is clear roadmap drift before the integrity work is proven live and validated.
- Sprint 260 says the downgrade was due to architecture docs saying one thing while code did another. By the end of Sprint 264, that is still not fully closed because the packet explicitly says rating integrity is **not yet proven in production**, only implemented and synthetically tested.
- “Phase 1 completeness” is overstated. The packet itself admits:
  - score engine has no production-data validation
  - owner block fails for pre-claim owners
  - thresholds are conservative defaults, not calibrated
  That is implementation progress, not integrity completeness.
- Test count presentation is slightly misleading: Sprint 264 reports **+22 tests** while total tests only rise from **5,263 to 5,273**. The packet explains this as tests added to an existing file, but the important point is that high test volume is being used as evidence while unresolved correctness gaps remain.
- Integrity response is inconsistent: the audit concern was “rating integrity gaps,” but flagged ratings are reduced to **0.05x weight instead of deletion**. That may be a valid product choice, but the packet gives no evidence this aligns with the audit expectation or abuse model.

## Unclosed action items
- **Production validation of score engine** is still open. Synthetic tests are not enough for ranking-impacting math.
- **Pre-claim owner self-rating gap** is still open. The packet explicitly identifies it and offers no implemented closure.
- **Threshold calibration for velocity detection** is still open. Current values are defaults with no empirical justification.
- **Proof that rating integrity is live and enforced end-to-end** is still open. The packet describes modules and tests, not rollout status, observed effects, or audit re-check.
- **Audit downgrade remediation** is not closed. There is no evidence of re-audit, acceptance, or restoration from A-.
- **Anti-requirement violations** from Sprint 260 are still described as “carried”; no closure is provided here.

## Core-loop focus score
**5/10**

- Sprints 261-263 were aligned to the core ranking loop: collect rating context, compute score, filter abuse.
- Sprint 264 broke that focus by shifting to “Best In” presentation before the underlying integrity work was validated.
- The work improved architecture and test count, but not yet trustworthiness proven in live conditions.
- The most important loop risk remains unresolved: bad or biased ratings can still enter via pre-claim ownership and unvalidated thresholding.
- This block looks stronger on implementation artifacts than on outcome verification.

## Top 3 priorities for next sprint
1. **Validate the score engine on real historical data before more UI work.** Run backtests, outlier analysis, adversarial cases, and compare old vs new ranking movements.
2. **Close the pre-claim owner gap.** Add retroactive flagging or claim-time scans of existing ratings tied to newly claimed businesses.
3. **Finish audit remediation with evidence.** Reconcile code vs architecture docs, verify integrity checks are live end-to-end, and get explicit closure on the carried anti-requirement violations.

**Verdict:** This was a mixed block: three sprints of relevant integrity implementation followed by one sprint of avoidable feature drift. The team can claim progress, but not closure. The audit-triggering problems are only partially addressed, key abuse gaps remain open, and there is still no evidence that the new scoring and integrity logic behaves correctly on production-shaped data.
