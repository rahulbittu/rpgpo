# External Critique Request — Sprints 270-274 External Critique

## Verified wins
- Phase 3 ranking work shipped across three consecutive sprints: temporal decay (271), Bayesian prior (272), and leaderboard eligibility gates (273).
- The scoring path was updated in more than one surface, not just one codepath: `recalculateBusinessScore` changed, and the score breakdown API also applies temporal decay.
- Eligibility behavior is at least operationally consistent with stated product intent: ineligible businesses still appear in search but are excluded from ranking.
- Test count increased every implementation sprint: +67 tests total, from 5,369 to 5,436, across 196 files.
- Sprint 274 appears scoped to UX polish rather than net-new surface area, which is at least consistent with a cleanup sprint after core ranking changes.

## Contradictions / drift
- The block claims strong architectural hygiene while explicitly acknowledging growing score-pipeline complexity and a still-exported obsolete `getTemporalMultiplier`. That is drift between “12th consecutive A-range” and the actual state of the scoring module.
- The stated core problem is ranking quality, but sprint 274 spent a full sprint on rate-flow polish. That is focus drift away from the ranking loop immediately after introducing three arbitrary or unvalidated ranking mechanisms.
- Bayesian prior was shipped with arbitrary parameters (`m=3`, `C=6.5`) and no empirical calibration. That is not “integration”; it is hardcoded policy disguised as math.
- Temporal decay was implemented globally while known to ignore restaurant age/opening context. That weakens the claim that freshness is being modeled in a restaurant-specific way.
- Leaderboard quality control is described as improved, but the chosen mechanism is a hard eligibility cliff. That solves spam/noise crudely while introducing discontinuity in the ranking experience.
- The score pipeline now has seven transformations, yet the packet asks whether it is auditable/explainable. Shipping first and asking explainability later is product/architecture drift.

## Unclosed action items
- Remove or deprecate the old exported step-function `getTemporalMultiplier` from `shared/credibility.ts`.
- Decompose `recalculateBusinessScore`; the packet itself flags it as accumulating too many responsibilities.
- Calibrate Bayesian prior mean/strength from real data or document why fixed global constants are acceptable.
- Revisit temporal decay half-life using observed restaurant rating patterns; current value is acknowledged as unvalidated.
- Address the leaderboard eligibility cliff with either a softer transition or explicit product rationale.
- Force a decision on disabled anti-requirement code from Sprints 253 and 257. At 22 sprints old, this is no longer “pending”; it is unmanaged residue.

## Core-loop focus score
**6/10**

- Sprints 271-273 were tightly aligned to the ranking core loop: score quality, cold start, and leaderboard integrity.
- The work shipped as a connected sequence rather than isolated tweaks, which is good focus.
- But the sequence is weakened by arbitrary parameter choices and no evidence of calibration against real data.
- Sprint 274 diverted from ranking correctness to rate-flow polish before the new ranking system was validated.
- The growing monolithic scoring function suggests shipping velocity took priority over maintainability in the core loop.
- Long-lived disabled features still occupying codebase attention are background focus debt.

## Top 3 priorities for next sprint
1. **Instrument and calibrate the ranking model**
   - Replace guessed constants with measured ones where possible: prior mean, prior strength, and decay half-life.
   - Produce distribution checks and before/after rank movement analysis for low-data and stale-rating businesses.

2. **Refactor the scoring pipeline for auditability**
   - Break `recalculateBusinessScore` into named stages with isolated tests.
   - Remove obsolete `getTemporalMultiplier` export and document the active scoring flow end-to-end.

3. **Resolve policy debt, not just code debt**
   - Get a binding decision on disabled anti-requirement features from Sprints 253/257.
   - Either delete them or schedule reactivation; indefinite disabled presence is governance failure.

**Verdict:** This block made real progress on ranking mechanics, but too much of it is hardcoded, uncalibrated, and piled into an increasingly opaque scoring path. The biggest problem is not lack of shipping; it is shipping ranking policy without enough empirical grounding, while governance still tolerates stale disabled code and obsolete exports. The A-range audit signal looks overstated relative to the contradictions admitted in the packet.
