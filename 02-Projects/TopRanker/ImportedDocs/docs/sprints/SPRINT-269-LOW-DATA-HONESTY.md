# Sprint 269: Low-Data Honesty — Confidence Badges + Empty States (Rating Integrity Phase 2d)

**Date:** March 9, 2026
**Story Points:** 5
**Focus:** Surface data confidence across UI — ScoreBreakdown badges, leaderboard indicators, search indicators

## Mission
Constitution #9: "Low-data honesty mandatory. Provisional/early states, never fake certainty." When a restaurant has 3 ratings, showing a score without context is misleading. Sprint 269 adds confidence badges to ScoreBreakdown, leaderboard cards, and search cards — making it visible whether a ranking is provisional, early, established, or strong.

## Team Discussion

**Sarah Nakamura (Lead Eng):** "The `getRankConfidence` function in `lib/data.ts` already returns the right tier. Sprint 269 wires it into the three surfaces that show scores: ScoreBreakdown, leaderboard, and search. The function accepts an optional category parameter for category-specific thresholds — fine dining needs more ratings to be 'strong' than a food truck."

**Amir Patel (Architecture):** "The 4-tier confidence system is the right abstraction. Provisional (0-2 ratings), Early (3-9), Established (10-24), Strong (25+). These thresholds are configurable per category via `CATEGORY_CONFIDENCE_THRESHOLDS`. The UI never needs to know the threshold numbers — it just gets back a tier label."

**Nadia Kaur (Cybersecurity):** "This is anti-gaming infrastructure disguised as UX. When users see 'Provisional' on a restaurant with 2 ratings, they won't trust a perfect 10.0 score. Social proof works both ways — showing LOW confidence reduces the payoff for fake rating campaigns."

**Jasmine Taylor (Marketing):** "This is a trust differentiator. Yelp shows a star rating whether there's 1 review or 1,000. We show the confidence level. 'Only 3 ratings so far — be one of the first.' That's honest, and it drives engagement."

**Marcus Chen (CTO):** "The zero-rating empty state is critical. Instead of showing nothing, we show 'Not enough ratings yet — be one of the first.' This converts a dead end into a call to action. Every empty state should drive the core loop."

**Jordan Blake (Compliance):** "Transparency about data sufficiency is a regulatory positive. If we ever face FTC scrutiny on ranking methodology, showing confidence indicators demonstrates good faith. We're not hiding behind opaque algorithms."

## Changes

### Client — ScoreBreakdown Confidence Badges
- **`components/business/ScoreBreakdown.tsx`**:
  - Imports `getRankConfidence`, `RANK_CONFIDENCE_LABELS` from `@/lib/data`
  - Accepts new `category` prop for category-specific thresholds
  - Zero-rating state: "Not enough ratings yet" banner with hourglass icon
  - Non-strong confidence: badge with tier-specific icon and color
    - Provisional: hourglass-outline, muted text
    - Early: trending-up, amber
    - Established: shield-checkmark, green
  - Strong confidence: no badge (clean display)
  - New styles: `confBadge`, `confBadgeProvisional`, `confBadgeEarly`, `confBadgeEstablished`, `lowDataBanner`, `lowDataTextWrap`, `lowDataTitle`, `lowDataDesc`

### Client — Business Page Integration
- **`app/business/[id].tsx`**: Passes `category={business.category}` to ScoreBreakdown

### Client — Leaderboard Cards
- **`components/leaderboard/SubComponents.tsx`**: Added `getRankConfidence` call, hourglass icon for provisional/early, shield-checkmark + "VERIFIED" pill for established/strong, confidence label tooltip

### Client — Search Cards
- **`components/search/SubComponents.tsx`**: Added `getRankConfidence` call, `confIndicatorWrap` style for confidence indicators on search result cards

### Tests
- **20 new tests** in `tests/sprint269-low-data-honesty.test.ts`
- Structural tests: ScoreBreakdown imports, confidence badge rendering, zero-rating state, business page integration, leaderboard wiring, search wiring
- Unit tests: `getRankConfidence` boundary tests for all 4 tiers, category-specific thresholds (fine_dining), unknown category fallback, RANK_CONFIDENCE_LABELS completeness

## Test Results
- **192 test files, 5,369 tests, all passing** (~2.9s)
- +20 new tests from Sprint 269
- 0 regressions

## Rating Integrity Phase 2d Status
- [x] 4-tier confidence system (provisional → early → established → strong)
- [x] Category-specific thresholds
- [x] ScoreBreakdown confidence badge
- [x] ScoreBreakdown zero-rating empty state
- [x] Leaderboard card confidence indicators
- [x] Search card confidence indicators
- [x] Business page passes category to ScoreBreakdown
- [ ] Confidence indicators on Challenger cards (future sprint)
