# Sprint 271: Temporal Decay Integration (Rating Integrity Phase 3a)

**Date:** March 9, 2026
**Story Points:** 5
**Focus:** Replace step-function temporal decay with exponential decay from Rating Integrity doc; integrate compositeScore + effectiveWeight columns into business score recalculation

## Mission
Rating Integrity Part 6 Step 5 specifies exponential temporal decay: `decay = e^(-0.003 × days)`. The server was using an older step-function approximation from `getTemporalMultiplier` (1.0/0.85/0.65/0.45/0.25 at fixed breakpoints). Sprint 271 replaces this with the correct exponential formula and integrates the Sprint 267 integrity columns (compositeScore, effectiveWeight) into the business score calculation.

## Team Discussion

**Sarah Nakamura (Lead Eng):** "Two changes: the decay formula and the score source. `recalculateBusinessScore` now calls `computeDecayFactor` from the score engine instead of `getTemporalMultiplier`. And it reads `compositeScore` + `effectiveWeight` when available, falling back to `rawScore` + `weight` for legacy ratings. This means Sprint 267+ ratings use the full integrity pipeline end-to-end."

**Amir Patel (Architecture):** "The exponential decay is smoother and more principled than the step function. A rating from 100 days ago gets 0.74x weight instead of the step function's abrupt 0.85→0.65 cliff at 90 days. The half-life is ~231 days, meaning a 7.5-month-old rating has half the influence of a fresh one."

**Marcus Chen (CTO):** "This closes the loop. Sprint 267 persisted compositeScore and effectiveWeight at write time. Sprint 271 reads them at ranking time. The business score now reflects: visit-type weighted composite → credibility × verification × gaming → exponential temporal decay → weighted average. Every step in Part 6 is live."

**Nadia Kaur (Cybersecurity):** "The decay formula makes coordinated rating campaigns even harder. An attacker would need to sustain ratings over months to maintain influence. A burst of fake ratings from 6 months ago contributes less than 60% of a single fresh legitimate rating."

**Jasmine Taylor (Marketing):** "From a user perspective, nothing changes visually. But the scores are now more accurate for restaurants that have improved or declined over time. A restaurant that was great last year but dropped off will see its score naturally drift down. That's honest."

## Changes

### Server — Business Score Recalculation
- **`server/storage/businesses.ts`**:
  - Import `computeDecayFactor` from `@shared/score-engine`
  - `recalculateBusinessScore` now uses exponential decay instead of step function
  - Reads `compositeScore` and `effectiveWeight` columns (Sprint 267+)
  - Falls back to `rawScore` and `weight` for pre-Sprint-267 ratings
  - Same weighted average formula: `SUM(score × weight × decay) / SUM(weight × decay)`

### Server — Score Breakdown API
- **`server/routes-score-breakdown.ts`**:
  - Import `computeDecayFactor` from `@shared/score-engine`
  - `weightedAvg` helper now applies exponential decay per rating
  - Uses `compositeScore` for overall and per-visit-type averages
  - Decay is computed from rating age in days

### Tests
- **19 new tests** in `tests/sprint271-temporal-decay.test.ts`
- Structural tests: import validation, decay function usage, compositeScore integration, legacy fallback
- Unit tests: decay values at 0/91/183/365/730 days, half-life verification, LAMBDA value, monotonicity, non-zero property
- Integration tests: recent vs old rating weighting, contribution balance, equal-age symmetry

## Test Results
- **193 test files, 5,388 tests, all passing** (~2.9s)
- +19 new tests from Sprint 271
- 0 regressions

## Decay Formula Reference (Rating Integrity Part 6 Step 5)
```
decay_factor = e^(-0.003 × days_since_rating)

Day 0:     100% weight
3 months:   75% weight
6 months:   57% weight
1 year:     33% weight
2 years:    11% weight
Half-life:  ~231 days (~7.5 months)
```

## Rating Integrity Phase 3a Status
- [x] Exponential decay in recalculateBusinessScore
- [x] Exponential decay in score-breakdown API
- [x] compositeScore + effectiveWeight column integration
- [x] Legacy rating fallback (rawScore + weight)
- [ ] Bayesian prior for low-data restaurants (Phase 3b — Sprint 272)
