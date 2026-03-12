# Sprint 272: Bayesian Prior for Low-Data Restaurants (Rating Integrity Phase 3b)

**Date:** March 9, 2026
**Story Points:** 5
**Focus:** Bayesian shrinkage toward category mean for restaurants with few ratings

## Mission
A restaurant with 2 perfect ratings shouldn't outrank a restaurant with 30 consistently-good ratings. The Bayesian prior addresses this by blending a restaurant's weighted score with the category/city mean, proportional to data density. Low-data restaurants shrink toward average; high-data restaurants keep their earned score.

## Team Discussion

**Amir Patel (Architecture):** "The formula is the IMDB-style weighted rating: `bayesian = (W × R + m × C) / (W + m)`. W is the sum of decayed effective weights, R is the restaurant's weighted average, C is the prior mean (6.5), and m is the prior strength (3). With W=1 and R=9.0, the Bayesian score is 7.125 — a significant shrinkage. With W=30 and R=9.0, it's 8.77 — barely affected."

**Sarah Nakamura (Lead Eng):** "The implementation is clean. `applyBayesianPrior` is a pure function in the score engine. `recalculateBusinessScore` computes the raw weighted average first, then applies the prior. The prior strength of 3 means a restaurant needs roughly 3 effective-weight units of data before its score starts to dominate the prior."

**Marcus Chen (CTO):** "This directly supports Constitution #9 (low-data honesty). We already show confidence badges from Sprint 269. Now the score itself is honest — a provisional restaurant with 2 ratings can't sit at #1 with a perfect 10. The Bayesian prior pulls it down to ~7.9, which is still good but doesn't mislead."

**Nadia Kaur (Cybersecurity):** "The Bayesian prior is anti-gaming infrastructure. An attacker creating a new restaurant and giving it 2 fake perfect ratings only achieves a 7.9 Bayesian score. To reach 9.0, they'd need ~30 effective-weight units of ratings — which requires many accounts with credibility history. The economic cost of gaming is multiplied."

**Jasmine Taylor (Marketing):** "From a messaging perspective: 'Our rankings account for data confidence. A restaurant with hundreds of ratings has earned its spot. A new addition is shown with honest uncertainty.' That's the transparency story."

## Changes

### Shared — Score Engine
- **`shared/score-engine.ts`**:
  - `applyBayesianPrior(weightedScore, totalDecayedWeight, priorMean?, priorStrength?)`: IMDB-style shrinkage formula
  - `BAYESIAN_PRIOR_STRENGTH = 3`: Equivalent to 3 average-weight phantom ratings
  - `DEFAULT_PRIOR_MEAN = 6.5`: Neutral midpoint of 1-10 scale
  - Returns prior mean when no data (weight=0)

### Server — Business Score Recalculation
- **`server/storage/businesses.ts`**:
  - Import `applyBayesianPrior` from score engine
  - `recalculateBusinessScore` computes raw weighted average, then applies Bayesian prior
  - Result: `weightedScore` in DB now reflects Bayesian-adjusted score

### Tests
- **18 new tests** in `tests/sprint272-bayesian-prior.test.ts`
- Structural tests: import validation, function call verification, constant exports
- Unit tests: zero-data, low-data shrinkage, high-data convergence, custom parameters, constant values
- Behavior tests: decreasing shrinkage, symmetry around mean, data-density ranking, vanishing prior

## Test Results
- **194 test files, 5,406 tests, all passing** (~2.8s)
- +18 new tests from Sprint 272
- 0 regressions

## Bayesian Prior Reference
```
bayesian_score = (W × R + m × C) / (W + m)

W = sum of decayed effective weights
R = restaurant's weighted average
C = 6.5 (prior mean)
m = 3 (prior strength)

Examples:
  2 ratings (W≈1), perfect 10 → Bayesian: 7.9
  5 ratings (W≈3), score 9.0 → Bayesian: 7.75
  10 ratings (W≈7), score 9.0 → Bayesian: 8.25
  30 ratings (W≈20), score 9.0 → Bayesian: 8.67
  100 ratings (W≈70), score 9.0 → Bayesian: 8.90
```

## Rating Integrity Phase 3b Status
- [x] Bayesian prior formula in score engine
- [x] Integration with recalculateBusinessScore
- [x] Configurable prior mean and strength
- [x] Comprehensive boundary tests
- [ ] Leaderboard minimum requirements enforcement (Phase 3c — Sprint 273)
