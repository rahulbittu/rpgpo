# Sprint 366: Extract PhotoGallery Component

**Date:** March 10, 2026
**Story Points:** 2
**Focus:** Extract photo gallery from business detail into reusable PhotoGallery component

## Mission
Arch Audit #55 flagged business/[id].tsx at 619 LOC (95% of 650 threshold). SLT-365 prioritized PhotoGallery extraction. This sprint moves the masonry gallery layout into `components/business/PhotoGallery.tsx`, reducing business/[id].tsx by 54 lines.

## Team Discussion

**Amir Patel (Architecture):** "Same extraction pattern as useSearchPersistence (Sprint 361) and useRatingAnimations (Sprint 346). Identify the self-contained block, extract with its styles, update the caller to use the component, redirect tests. business/[id].tsx drops from 619 to 565 LOC — back to safe territory."

**Sarah Nakamura (Lead Eng):** "PhotoGallery is fully self-contained: props are just photoUrls and category. It handles the >1 threshold check internally, so the caller doesn't need any conditional wrapper."

**Priya Sharma (QA):** "Updated Sprint 362 tests to check PhotoGallery component instead of business/[id].tsx for gallery patterns. Added 14 new extraction-specific tests. Zero test logic changes — just redirecting source assertions."

**Marcus Chen (CTO):** "This is the governance loop delivering: Audit #55 identified the threshold risk, SLT-365 scheduled the extraction, Sprint 366 delivered. 54 lines extracted, business/[id].tsx now at 565/650 (87%)."

## Changes

### `components/business/PhotoGallery.tsx` (NEW — 81 LOC)
- Self-contained masonry photo gallery component
- Props: photoUrls (string[]), category (string)
- Returns null for ≤1 photos
- Featured first photo (16:9) + 2-column grid + overflow message

### `app/business/[id].tsx` (619→565 LOC, -54 lines)
- Replaced inline gallery with `<PhotoGallery>` component
- Removed 7 gallery-related style definitions
- Added import for PhotoGallery

### `components/business/SubComponents.tsx` (barrel)
- Added PhotoGallery and PhotoGalleryProps exports

### Test updates
- `tests/sprint366-photo-gallery-extract.test.ts` (NEW — 14 tests)
- `tests/sprint362-photo-gallery.test.ts` — Redirected gallery assertions to PhotoGallery component

## Test Results
- **276 test files, 6,717 tests, all passing** (~3.7s)
- **Server build:** 599.3kb (unchanged)
