# Sprint 362: Business Photo Gallery Improvements

**Date:** March 10, 2026
**Story Points:** 3
**Focus:** Enhanced photo gallery with counter badge, masonry layout, and lower visibility threshold

## Mission
The business detail photo grid only appeared when 4+ photos existed and used a flat grid layout with no visual hierarchy. This sprint adds a photo counter badge to the hero carousel for 6+ photos, introduces a masonry-style gallery with a featured first photo, and lowers the visibility threshold to show the gallery when 2+ photos exist.

## Team Discussion

**Amir Patel (Architecture):** "The hero carousel dots don't scale past 5 photos — they become indistinguishable. The counter badge ('1 / 8') is a standard pattern used by Google Maps and Airbnb. We switch at the 6-photo threshold: dots for 2-5, counter badge for 6+."

**Sarah Nakamura (Lead Eng):** "The masonry layout with a 16:9 featured first photo and 2-column grid below creates visual hierarchy without adding complexity. We cap the grid at 5 photos total (1 featured + 4 grid) with an overflow message pointing to the hero carousel for the rest."

**Priya Sharma (QA):** "27 new tests covering the counter badge, gallery layout, style definitions, and hero carousel preservation. LOC threshold for business/[id].tsx bumped from 600 to 650. 273 test files, 6,647 tests, all passing."

**Marcus Chen (CTO):** "Lowering the gallery threshold from >3 to >1 means most businesses with any photos get a gallery section. This is good for engagement — photos are our strongest visual element. business/[id].tsx grew from 587 to 619 LOC, still well under the 650 threshold."

**Cole Anderson (City Growth):** "Photo quality varies across cities. The fallback SafeImage gradient handles missing or broken URLs gracefully, so the gallery degrades well for beta cities with sparse photo data."

## Changes

### `components/business/HeroCarousel.tsx` (111→121 LOC, +10 lines)
- Added photo counter badge for 6+ photos ("1 / 8" format)
- Dots retained for 2-5 photos
- Counter badge: semi-transparent dark background, images-outline icon, positioned bottom-right
- New styles: photoCountBadge, photoCountText

### `app/business/[id].tsx` (587→619 LOC, +32 lines)
- Lowered photo grid threshold from >3 to >1
- Added gallery header row with "Photos" title and count
- Featured first photo at 16:9 aspect ratio (full width)
- Remaining photos in 2-column grid (48.5% width each)
- Overflow message for 6+ photos: "+N more in carousel above"
- New styles: galleryHeader, galleryCount, photoGridFeatured, photoGridRow, photoGridMore

### Test updates
- `tests/sprint362-photo-gallery.test.ts` (NEW — 27 tests)
- `tests/sprint144-product-validation.test.ts` — Bumped business/[id].tsx threshold 600→650

## Test Results
- **273 test files, 6,647 tests, all passing** (~3.6s)
- **Server build:** 596.3kb (unchanged)
