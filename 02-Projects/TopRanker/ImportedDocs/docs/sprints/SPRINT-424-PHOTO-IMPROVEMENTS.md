# Sprint 424: Rate Flow Photo Improvements

**Date:** 2026-03-10
**Type:** Enhancement — Rating Flow UX
**Story Points:** 3

## Mission

Improve the photo upload experience in the rating flow with a progressive verification boost meter, photo tips for first-time users, and photo index badges. This increases photo upload rates which directly improves verification quality and trust in ratings.

## Team Discussion

**Priya Sharma (Design):** "The boost meter is the star. Users see their verification percentage climb as they add photos and receipts. The camera markers on the progress bar make the 3-photo limit intuitive. When no photos exist, tips guide users to take better shots."

**Amir Patel (Architecture):** "PhotoBoostMeter is a pure presentation component — takes photoCount and hasReceipt, computes the boost. Uses pct() helper for progress bar width (no `as any`). The 50% cap from the Rating Integrity doc is enforced in the component."

**Sarah Nakamura (Lead Eng):** "RatingExtrasStep grew from 511→521 LOC. The old photoVerifiedBadge and photoBoostHint were replaced by PhotoBoostMeter and PhotoTips. Updated sprint266 tests to match new UI — 2 test redirects, zero net test loss."

**Marcus Chen (CTO):** "This directly supports verification rates. Every photo is +15% verification boost. If users add 3 photos + receipt, they hit the 50% cap. That's a massive trust signal that flows into the credibility weighting system."

**Nadia Kaur (Security):** "Photo picker permissions are already handled correctly — camera permission requested only when camera button is tapped. No new permission surface area."

## Changes

### New Files
- `components/rate/PhotoBoostMeter.tsx` (100 LOC) — PhotoBoostMeter with progressive bar + camera markers, PhotoTips with 3 guidance items

### Modified Files
- `components/rate/RatingExtrasStep.tsx` (511→521 LOC, +10) — Replaced static boost badge with PhotoBoostMeter, replaced boost hint text with PhotoTips, added photo index badges
- `tests/sprint266-rating-photos.test.ts` — 2 test redirects for replaced UI elements

### Test Files
- `__tests__/sprint424-photo-improvements.test.ts` — 21 tests: meter structure, boost calculation, tips, integration, file health

## Test Results
- **323 files**, **7,675 tests**, all passing
- Server build: **601.1kb**, 31 tables
- 2 test redirects (sprint266), 0 test cascades

## File Health After Sprint 424

| File | LOC | Threshold | % | Change | Status |
|------|-----|-----------|---|--------|--------|
| search.tsx | 698 | 900 | 77.6% | = | OK |
| profile.tsx | 684 | 800 | 85.5% | = | OK |
| rate/[id].tsx | 554 | 700 | 79% | = | OK |
| business/[id].tsx | 494 | 650 | 76% | = | OK |
| index.tsx | 422 | 600 | 70.3% | = | OK |
| challenger.tsx | 142 | 575 | 25% | = | OK |

**All 6 key files at OK status.**
