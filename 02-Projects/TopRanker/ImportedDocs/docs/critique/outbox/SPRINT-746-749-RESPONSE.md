# Sprints 746-749 External Critique

## Verified wins
- 9 consecutive sprints were spent on hardening with no feature churn. That is consistent focus, not mixed-priority thrash.
- The packet claims measurable coverage of internal quality controls: 12,920 tests, 22+ pre-submit checks, tracked thresholds, and explicit attention to security findings.
- Sprint 746 addressed a real class of bug: truthy-value abuse on boolean-like fields (`isReceipt`, anti-gaming flags q1-q5) via strict `=== true` checks.
- Sprint 748 expanded the deployment gate materially by adding 7 checks to `scripts/pre-submit-check.sh`.
- Sprint 749 surfaced governance drift in `thresholds.json` instead of leaving it silently wrong. Finding the drift is a win; letting it accumulate was not.

## Contradictions / drift
- The team says “production-ready,” but the main gate cited is a manual script, not CI. That is not production-grade process control.
- The packet frames 0 known security findings as a readiness signal, but all evidence presented is internal. “No known findings” after 9 internal hardening sprints is not the same as external validation.
- 9 sprints of hardening without shipping anything creates the exact risk named in the packet: optimizing internals before exposing the product to real usage. That is drift from product validation to internal reassurance.
- Boolean strictness was added per field, but the packet itself questions schema validation at the boundary. That implies the current approach may be tactical patching, not a scalable validation strategy.
- Threshold governance drift of 17% on tests and a file-count mismatch undermines the claim that thresholds are serving as active controls. If controls can go stale that far, they are partially ceremonial.

## Unclosed action items
- CI integration remains unclosed. A manual `pre-submit-check.sh` is not enough if launch readiness is the claim.
- External validation remains unclosed. The packet asks whether hardening has replaced shipping; that question exists because it has not been resolved.
- API boundary validation strategy remains unclosed. Per-field strictness was added, but no durable scaling approach is established.
- Threshold governance remains unclosed. The drift was detected, but no policy is stated for automated sync vs deliberate manual review.
- Bus-factor mitigation remains unclosed. One developer executing 9 straight sprints is a production risk until handoff/review/onboarding mechanics are explicit.

## Core-loop focus score
**6/10**

- Strong execution focus on code quality and security hardening over 9 sprints.
- Weak focus on the actual product loop: ship, observe, learn. There is no evidence here of external user or operational validation.
- The work improved internal safeguards, but several safeguards are still manual, which weakens the claim of operational readiness.
- The team identified real governance gaps, but only after substantial drift, which suggests process lag.
- Single-developer concentration kept momentum high but reduced resilience and independent verification.

## Top 3 priorities for next sprint
1. **Move the pre-submit gate into CI before calling the app launch-ready.** Manual checks are optional in practice, regardless of intent.
2. **Ship to an external validation surface immediately** — beta, limited rollout, or real-user exposure with monitoring. Stop spending full sprints on internal hardening without market/runtime feedback.
3. **Define one scalable governance layer for inputs and thresholds.** Use boundary/schema validation for request inputs where applicable, and decide whether thresholds are auto-updated with review or manually updated with enforced ownership. Right now both are half-governed.

**Verdict:** The team likely improved code quality, but the packet overreaches on “production-ready.” The biggest issue is not missing another hardening tweak; it is the gap between internal confidence and external proof. Manual gates, stale thresholds, per-field validation patches, and a one-developer delivery pattern are all signs of a system that is cleaner internally than it is operationally mature. Stop extending the hardening cycle as a substitute for CI and real-world validation.
