# Sprint 422: Business Detail Review Sorting

**Date:** 2026-03-10
**Type:** Enhancement — Business Detail UX
**Story Points:** 3

## Mission

Add sort controls to the community reviews section on the business detail page. Users can sort reviews by Recent, Highest, Lowest, or Most Weighted — helping them find the most relevant reviews quickly. This improves the business detail experience and aligns with the trust-first philosophy by surfacing high-weight reviews.

## Team Discussion

**Priya Sharma (Design):** "The sort chips sit between the distribution chart and the first review — natural visual break. Amber fill for the active chip keeps brand consistency. Four options cover the main use cases: recency, score extremes, and credibility weight."

**Amir Patel (Architecture):** "Pure client-side sort with zero API changes. The sortRatings function creates a copy to avoid mutating the original array. Sort resets the visible count to 5 so users start fresh after switching sort mode."

**Sarah Nakamura (Lead Eng):** "CollapsibleReviews grew from 220→275 LOC — still well under any threshold concern. The ReviewSortChips component is exported separately for potential reuse, but lives in the same file since it's tightly coupled."

**Marcus Chen (CTO):** "Most Weighted sort is the differentiator. No other review platform lets you sort by credibility weight. This surfaces trusted rater reviews first — exactly our value proposition."

**Jordan Blake (Compliance):** "Good that sort is client-side only. No new data exposure, no new API surface. The existing rating data already includes weight, so this is purely a presentation change."

**Nadia Kaur (Security):** "No security concerns — no new inputs, no new API calls. The sort function handles edge cases cleanly with the spread copy."

## Changes

### Modified Files
- `components/business/CollapsibleReviews.tsx` (220→275 LOC, +55) — Added ReviewSortKey type, SORT_OPTIONS config, sortRatings function, ReviewSortChips component, sort state in CollapsibleReviews, sort chip styles

### Test Files
- `__tests__/sprint422-review-sorting.test.ts` — 18 tests: sort state, sort options, sortRatings function, ReviewSortChips accessibility, wiring, file health

## Test Results
- **321 files**, **7,630 tests**, all passing
- Server build: **601.1kb**, 31 tables
- 0 test cascades

## File Health After Sprint 422

| File | LOC | Threshold | % | Change | Status |
|------|-----|-----------|---|--------|--------|
| search.tsx | 698 | 900 | 77.6% | = | OK |
| profile.tsx | 684 | 800 | 85.5% | = | OK |
| rate/[id].tsx | 554 | 700 | 79% | = | OK |
| business/[id].tsx | 494 | 650 | 76% | = | OK |
| index.tsx | 421 | 600 | 70% | = | OK |
| challenger.tsx | 142 | 575 | 25% | = | OK |

**All 6 key files at OK status.**
