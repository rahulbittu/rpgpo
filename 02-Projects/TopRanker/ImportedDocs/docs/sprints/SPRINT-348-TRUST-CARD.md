# Sprint 348: Business Detail Trust Card Refresh

**Date:** March 9, 2026
**Story Points:** 3
**Focus:** Confidence badge, trusted rater count, last rated date in trust explainer card

## Mission
The trust explainer card on business detail pages (Constitution #12) shows users how scores are calculated. Sprint 348 refreshes it with three new signals: a confidence badge that visually indicates ranking reliability, a trusted rater count showing how many credible community members contributed, and a last-rated date showing freshness.

## Team Discussion

**Marcus Chen (CTO):** "The confidence badge is Constitution #8 made visual. Instead of just text saying 'based on 3 ratings so far,' users see a 'Provisional' badge with an hourglass icon. Immediate visual communication of data quality."

**Sarah Nakamura (Lead Eng):** "Four confidence tiers: Provisional (hourglass, amber), Early (hourglass, amber), Established (shield, blue), Strong (shield, green). The color progression naturally communicates increasing confidence."

**Amir Patel (Architecture):** "The props are optional — trustedRaterCount and lastRatedDate don't break existing callers. The business detail page computes them from the ratings array that's already loaded."

**Jordan Blake (Compliance):** "Showing trusted rater count adds transparency without revealing individual identities. Users see '4 Trusted Raters' without knowing who they are. That's Constitution #6 — credibility is transparent."

**Jasmine Taylor (Marketing):** "'Last rated Mar 9' tells users this business has recent activity. Stale data is a trust killer — freshness signals combat that."

**Priya Sharma (QA):** "21 new tests covering confidence badge variants, trusted rater count display, last rated date wiring, and backwards compatibility. 6,423 tests total."

## Changes

### `components/business/TrustExplainerCard.tsx` (100→120 LOC)
- Added `trustedRaterCount` and `lastRatedDate` optional props
- Confidence badge row with 4 variants: Provisional, Early, Established, Strong
- Icons: hourglass-outline (early/provisional), shield-checkmark (established/strong)
- Colors: amber (provisional/early), blue (established), green (strong)
- Trusted Raters stat (shown when count > 0)
- Last rated text with freshness indicator
- 5 new styles: confidenceBadgeRow, confidenceBadge, confidenceBadgeStrong, confidenceBadgeEstablished, confidenceBadgeText, lastRatedText

### `app/business/[id].tsx`
- Passes `trustedRaterCount` computed from ratings with trusted/top tier
- Passes `lastRatedDate` formatted from first rating's createdAt

### Tests
- `tests/sprint348-trust-card-refresh.test.ts` — 21 tests

## Test Results
- **263 test files, 6,423 tests, all passing** (~3.6s)
- **Server build:** 593.7kb (unchanged — client-only changes)

## Constitution Alignment
- **#12:** Trust explainer is mandatory — this makes it more informative
- **#8:** Honest under low data — confidence badge shows exactly how reliable the ranking is
- **#6:** Credibility is transparent — trusted rater count without revealing identities
