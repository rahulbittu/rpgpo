# Sprint 268: Score Breakdown API + Visit-Type Display (Phase 2c)

**Date:** March 9, 2026
**Story Points:** 7
**Focus:** Score breakdown API endpoint + ScoreBreakdown UI component on business detail page

## Mission
Make the multi-dimensional scoring system visible to users. When you view a restaurant, you should see not just one number but a breakdown: dine-in score vs delivery score vs takeaway score, food-only score, verified rating percentage, and would-return percentage.

## Team Discussion

**Sarah Nakamura (Lead Eng):** "The score breakdown API queries all non-flagged ratings for a business, groups by visit type, and computes weighted averages using the effective_weight column from Sprint 267. This means the breakdown respects credibility weighting and verification boosts — it's not a naive average."

**Amir Patel (Architecture):** "The endpoint is a read-only aggregation. No writes, no mutations. It uses the persisted dimensional scores and effective weights, so it's a simple SELECT + group + average. No score engine computation needed at read time — we pre-computed everything at write time in Sprint 267."

**Nadia Kaur (Cybersecurity):** "The verified percentage shows what fraction of ratings have photo verification. This creates social proof for the verification system — when users see '40% verified,' they're incentivized to add photos too. It's a positive feedback loop."

**Jasmine Taylor (Marketing):** "The visit-type separation is THE differentiator for WhatsApp messaging. 'See how it scores for dine-in vs delivery.' No other platform does this. The breakdown card makes it visual and immediate."

**Marcus Chen (CTO):** "The ScoreBreakdown component is self-contained: it fetches its own data, handles loading/empty states, and renders cleanly. Placed between SubScoresCard and RatingDistribution on the business detail page."

## Changes

### Server — Score Breakdown API
- **`server/routes-score-breakdown.ts`** (NEW):
  - `GET /api/businesses/:id/score-breakdown`
  - Returns: totalRatings, overallScore, foodScoreOnly, dineIn/delivery/takeaway breakdowns, verifiedPercentage, wouldReturnPercentage, raterDistribution
  - Uses effective_weight for weighted averages
  - Excludes flagged ratings
  - Handles zero-rating case gracefully
- **`server/routes.ts`**: Registered `registerScoreBreakdownRoutes`

### Client — ScoreBreakdown Component
- **`components/business/ScoreBreakdown.tsx`** (NEW):
  - Fetches from score-breakdown API
  - Visit type rows with icons (restaurant/bicycle/bag)
  - Stats row: Food Only score, Verified %, Return %
  - Returns null when no ratings (no empty state noise)
- **`app/business/[id].tsx`**: Integrated ScoreBreakdown between SubScoresCard and RatingDistribution

### Tests
- **16 new tests** in `tests/sprint268-score-breakdown.test.ts`
- API endpoint, visit-type grouping, verification stats, component rendering, page integration

## Test Results
- **191 test files, 5,349 tests, all passing** (~2.8s)
- +16 new tests from Sprint 268
- 0 regressions

## Rating Integrity Part 9 Status
- [x] Score breakdown API: overall + per-visit-type + food-only
- [x] Verified percentage display
- [x] Would-return percentage display
- [x] Rater distribution (dine-in/delivery/takeaway counts)
- [ ] Score trend sparkline (future sprint)
- [ ] Delivery vs dine-in separation in leaderboard display (future sprint)
