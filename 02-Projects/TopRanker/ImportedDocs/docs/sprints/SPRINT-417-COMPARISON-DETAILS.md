# Sprint 417: Challenger Comparison Details

**Date:** 2026-03-09
**Type:** Feature — Challenger UX
**Story Points:** 3

## Mission

Add a collapsible side-by-side comparison section to challenger cards. Users can tap "Compare Stats" to see defender vs challenger: score, ratings, cuisine, neighborhood, and price. Winner values are highlighted in amber. This gives users more context for their voting decision beyond just the vote bar.

## Team Discussion

**Priya Sharma (Design):** "The comparison grid uses a centered icon+label column with defender on the left, challenger on the right — mirrors the fight card layout above. Winner highlighting in amber creates a subtle competitive tension. The collapsible pattern keeps the card clean by default."

**Amir Patel (Architecture):** "ComparisonDetails is a self-contained 208 LOC component. It imports ApiBusiness type directly and uses CUISINE_DISPLAY for cuisine labels. No new API calls — all data comes from the existing challenger response."

**Sarah Nakamura (Lead Eng):** "ChallengeCard grew by 7 lines for the import + component render. challenger.tsx unchanged at 142 LOC. Zero test cascades. The component uses LayoutAnimation for smooth expand/collapse."

**Marcus Chen (CTO):** "The comparison section supports the Challenger revenue product ($99). If users feel engaged enough to compare stats before voting, they're more invested in the outcome. Engagement drives repeat visits."

**Rachel Wei (CFO):** "The Challenger product is our most concrete revenue opportunity. Any feature that increases engagement with challenge cards directly supports conversion from free viewers to $99 challenger purchasers."

**Jordan Blake (Compliance):** "The toggle has accessibilityRole='button', descriptive labels ('Show comparison details' / 'Hide comparison details'), and expanded state. The StatRow values are readable by screen readers."

## Changes

### New Files
- `components/challenger/ComparisonDetails.tsx` (208 LOC) — Collapsible comparison grid with StatRow, winner highlighting, 5 stat categories (score, ratings, cuisine, area, price)

### Modified Files
- `components/challenger/ChallengeCard.tsx` (418→425 LOC, +7) — Imported ComparisonDetails, rendered after VoteBar

### Test Files
- `__tests__/sprint417-comparison-details.test.ts` — 20 tests: component structure, StatRow, ChallengeCard integration, accessibility, file health

## Test Results
- **317 files**, **7,559 tests**, all passing
- Server build: **601.1kb**, 31 tables
- 0 test cascades

## File Health After Sprint 417

| File | LOC | Threshold | % | Change | Status |
|------|-----|-----------|---|--------|--------|
| search.tsx | 692 | 900 | 77% | = | OK |
| profile.tsx | 680 | 800 | 85% | = | OK |
| rate/[id].tsx | 554 | 700 | 79% | = | OK |
| business/[id].tsx | 494 | 650 | 76% | = | OK |
| index.tsx | 421 | 600 | 70% | = | OK |
| challenger.tsx | 142 | 575 | 25% | = | OK |

**All 6 key files at OK status.**
