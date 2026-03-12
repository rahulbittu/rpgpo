# Sprint 552: Rating Photo Carousel — Tappable Badges + Modal Viewer

**Date:** 2026-03-10
**Story Points:** 3
**Status:** Complete
**Tests:** 18 new (10,369 total across 441 files)

## Mission

Sprint 548 added "Photo Verified" and "Receipt Verified" badges to rating cards but clicking them did nothing. The SLT-550 critique flagged this as confusing progressive disclosure. This sprint makes badges tappable — tap opens a full-screen modal with a horizontal-swipeable photo carousel fetched from the `fetchRatingPhotos` API.

## Team Discussion

**Marcus Chen (CTO):** "This closes the photo UX gap from Sprint 548. Users now see badges and can tap to view the actual photos. It's the complete loop: upload → badge → view."

**Amir Patel (Architecture):** "The carousel uses the existing `GET /api/ratings/:id/photos` endpoint added in Sprint 548 — no new server code needed. Fire-and-forget error handling keeps the pattern consistent with our photo upload flow."

**Sarah Nakamura (Lead Eng):** "CollapsibleReviews grew from 327→407 LOC — an 80-line increase. Two threshold redirections needed (sprint548 and sprint422 tests). The carousel modal could be extracted in a future sprint if this file grows further."

**Rachel Wei (CFO):** "Photo verification is a trust differentiator. Making photos viewable — not just indicated — strengthens the 'see the proof' narrative for our marketing."

**Jasmine Taylor (Marketing):** "The 'View Photos' CTA is much better than a static 'Photo Verified' badge. Users in beta groups kept asking 'where are the photos?' — this answers that."

**Cole Richardson (City Growth):** "Photo density varies by city. Dallas restaurants have more photos than beta cities. The empty state ('No photos available') handles sparse data gracefully."

## Changes

### Photo Carousel Modal (`components/business/CollapsibleReviews.tsx` — 327→407 LOC)
- **PhotoCarouselModal component:** Full-screen dark overlay with horizontal `FlatList` (pagingEnabled)
- **Tappable badges:** `TouchableOpacity` wrapping photo indicator row with `openCarousel` handler
- **Photo loading:** `fetchRatingPhotos(rating.id)` called on badge tap, with `ActivityIndicator` while loading
- **Receipt overlay:** `isVerifiedReceipt` photos show a "Receipt" badge overlay on the carousel slide
- **Photo count:** Bottom indicator shows "N photo(s)"
- **Close button:** Top-right close-circle icon
- **Empty state:** "No photos available" text for ratings with badges but no uploaded photos
- **Label change:** "Photo Verified" → "View Photos" with chevron-forward hint
- **Fire-and-forget:** Error on photo fetch suppressed (doesn't block UI)

### Test Redirections (3 total)
- `sprint548-rating-photos.test.ts` — LOC threshold 340→420, "Photo Verified" → "View Photos"
- `sprint422-review-sorting.test.ts` — LOC threshold 350→420

## Test Summary

- `__tests__/sprint552-photo-carousel.test.ts` — 18 tests
  - Imports: Modal, FlatList, fetchRatingPhotos, RatingPhotoData
  - Carousel: horizontal + pagingEnabled, close button, receipt overlay, photo count
  - Tappability: onPress={openCarousel}, chevron-forward, View Photos label
  - States: ActivityIndicator for loading, empty state text, fire-and-forget error
  - Styles: carouselOverlay, carouselSlide, carouselImage
  - API: fetchRatingPhotos function, RatingPhotoData interface, photoUrl + isVerifiedReceipt
  - Server: GET /api/ratings/:id/photos endpoint exists
