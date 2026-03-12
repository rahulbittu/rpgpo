# External Critique Request — Sprints 270-274

Date: 2026-03-09
Requesting: External review of 5-sprint block (270-274)

## Sprint Summaries

### Sprint 270: SLT Q3 Review + Arch Audit #36
- Points: 3
- SLT-270 meeting: Phase 2 completion assessment, roadmap 271-275
- Arch Audit #36: Grade A (12th consecutive A-range)
- 5,369 tests across 192 files

### Sprint 271: Temporal Decay Integration (Phase 3a)
- Points: 5
- Replaced step-function `getTemporalMultiplier` with exponential `computeDecayFactor` (e^(-0.003 × days))
- `recalculateBusinessScore` now reads compositeScore + effectiveWeight columns
- Score breakdown API also applies temporal decay
- Half-life: ~231 days (~7.5 months)
- 19 new tests

### Sprint 272: Bayesian Prior for Low-Data Restaurants (Phase 3b)
- Points: 5
- IMDB-style weighted rating: `(W × R + m × C) / (W + m)` where m=3, C=6.5
- Low-data restaurants shrink toward 6.5; high-data restaurants keep earned score
- Applied in `recalculateBusinessScore`
- 18 new tests

### Sprint 273: Leaderboard Minimum Requirements (Phase 3c)
- Points: 5
- 3 new columns: dineInCount, credibilityWeightedSum, leaderboardEligible
- Eligibility: 3+ raters AND 1+ dine-in AND credibility sum ≥ 0.5
- `getLeaderboard` and `recalculateRanks` filter by eligible only
- Ineligible businesses still appear in search but not ranked
- 17 new tests

### Sprint 274: Rate Flow UX Polish
- Points: 5
- Live composite score preview using `computeComposite` (visit-type weighted)
- Error banner retry button
- Success haptic (NotificationFeedbackType.Success)
- rate/[id].tsx threshold bumped from 600 to 650
- 13 new tests

## Test Count Progression

| Sprint | Total Tests | Test Files | Delta |
|--------|------------|------------|-------|
| 270 | 5,369 | 192 | +0 (governance) |
| 271 | 5,388 | 193 | +19 |
| 272 | 5,406 | 194 | +18 |
| 273 | 5,423 | 195 | +17 |
| 274 | 5,436 | 196 | +13 |
| **Total** | **5,436** | **196** | **+67** |

## Known Contradictions / Risks

1. **Bayesian prior strength of 3 is arbitrary**: The value was chosen to approximate "3 average-weight phantom ratings." No empirical validation. For the 1-10 scale, a prior mean of 6.5 assumes a symmetric distribution of restaurant quality. If the actual distribution is skewed (more good restaurants than bad), the prior may systematically undervalue new good restaurants.

2. **Temporal decay ignores restaurant opening date**: A new restaurant that opened last week and an established restaurant both have their first ratings treated identically. But a 6-month-old rating for a new restaurant is more relevant than a 6-month-old rating for an established restaurant with 100 ratings (the new restaurant may have changed significantly).

3. **Leaderboard eligibility is binary**: A restaurant with 2 ratings (ineligible) and one with 3 ratings (eligible) have a cliff — one appears in rankings, the other doesn't. A gradual transition (e.g., reduced visibility rather than complete exclusion) might be fairer.

4. **`recalculateBusinessScore` is growing**: The function now handles: score computation, decay, Bayesian prior, eligibility tracking. It's ~60 lines and could be decomposed for testability.

5. **Old step-function `getTemporalMultiplier` still in codebase**: Not used for scoring anymore but still exported from `shared/credibility.ts`. Could cause confusion.

## Questions for External Reviewer

1. **Bayesian prior calibration**: The prior mean (6.5) and strength (3) are expert-determined, not empirically derived. How do ranking platforms (IMDB, BoardGameGeek, Yelp) calibrate their Bayesian parameters? Should we compute the prior mean from actual data (city/category average) rather than using a fixed global value?

2. **Temporal decay half-life**: The 231-day half-life means a 1-year-old rating has ~33% weight. Is this appropriate for restaurants, where quality can change rapidly (e.g., chef change, ownership change)? How do other review platforms handle rating freshness? Would a shorter half-life (e.g., 90-120 days) better reflect restaurant dynamics?

3. **Leaderboard eligibility cliff**: The binary eligible/ineligible transition at 3 raters creates a cliff effect. Should we implement a softer transition (e.g., reduced rank position or visual dimming for businesses with 3-5 ratings)? How do platforms handle the cold-start ranking problem?

4. **Score pipeline complexity**: The full scoring pipeline is now: composite → credibility → verification → gaming → decay → Bayesian → eligibility. Seven transformations. Is this pipeline auditable and explainable to users? How do we ensure the cumulative effect of multiple adjustments doesn't produce counterintuitive rankings?

5. **Anti-requirement violations (now 22 sprints old)**: Business responses (Sprint 253) and review helpfulness (Sprint 257) remain in the codebase but disabled. The SLT has asked the CEO for a decision 3 times. What organizational mechanism forces a decision on long-standing architectural violations? Is the continued presence of disabled-but-present violation code a risk?
