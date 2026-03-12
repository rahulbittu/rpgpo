# Sprint 563: Photo Carousel Extraction — CollapsibleReviews.tsx 407→349 LOC

**Date:** 2026-03-10
**Story Points:** 2
**Status:** Complete
**Tests:** 22 new + 10 redirected (10,607 total across 453 files)

## Mission

Extract PhotoCarouselModal component and carousel styles from CollapsibleReviews.tsx into `components/business/PhotoCarouselModal.tsx`. CollapsibleReviews was at 407/420 LOC (97% threshold). This is the third of three scheduled extractions from the SLT-560 roadmap. All three extraction targets from Audit #70 are now complete.

## Team Discussion

**Marcus Chen (CTO):** "Third extraction complete. All three Low findings from Audit #70 addressed: dashboard.tsx (561), api.ts (562), CollapsibleReviews (563). The extraction roadmap delivered exactly on plan."

**Sarah Nakamura (Lead Eng):** "Clean separation. PhotoCarouselModal is fully self-contained at 70 LOC — own Modal, FlatList, Dimensions, ActivityIndicator, and styles. CollapsibleReviews dropped to 349 LOC, well below the new 370 threshold."

**Amir Patel (Architecture):** "This extraction also addresses the critique question from Sprint 555 about per-rating modals. The extracted component can now be lifted to a shared instance in a future sprint — the extraction makes that refactor trivial."

**Rachel Wei (CFO):** "Three extractions in three sprints. Total LOC freed: 100 (dashboard) + 141 (api) + 58 (reviews) = 299 LOC across the three highest-pressure files. Significant headroom for future features."

**Cole Richardson (City Growth):** "10,607 tests. Each extraction sprint adds ~22-25 new tests and redirects ~10 existing ones. The test infrastructure handles extractions smoothly."

## Changes

### New File: `components/business/PhotoCarouselModal.tsx` (70 LOC)
- Extracted from CollapsibleReviews.tsx (Sprint 552 code)
- Self-contained: Modal with fade animation, horizontal pagingEnabled FlatList, close button, receipt badge overlay, photo count, loading/empty states
- Contains SCREEN_WIDTH constant and all carousel styles

### Modified: `components/business/CollapsibleReviews.tsx` (407→349 LOC, -58)
- Removed inline PhotoCarouselModal function (-40 LOC)
- Removed carousel styles (-17 LOC)
- Removed SCREEN_WIDTH constant (-1 LOC)
- Removed unused imports: Modal, FlatList, Dimensions, ActivityIndicator
- Added import of PhotoCarouselModal from extracted component

### Modified: `shared/thresholds.json`
- CollapsibleReviews.tsx: maxLOC 420→370, current 407→349
- Added PhotoCarouselModal.tsx: maxLOC 90, current 70

### Test Redirections
- `sprint552-photo-carousel.test.ts` — 8 assertions redirected from CollapsibleReviews.tsx to PhotoCarouselModal.tsx

## Test Summary

- `__tests__/sprint563-carousel-extraction.test.ts` — 22 tests
  - Extracted component: 13 tests (export, props, Modal, FlatList, close, receipt, count, loading, empty, styles, SCREEN_WIDTH, LOC)
  - CollapsibleReviews after: 7 tests (import, no inline def, no SCREEN_WIDTH, no unused imports, no carousel styles, still renders, LOC bounds)
  - Thresholds: 2 tests (CollapsibleReviews lowered, PhotoCarouselModal tracked)
