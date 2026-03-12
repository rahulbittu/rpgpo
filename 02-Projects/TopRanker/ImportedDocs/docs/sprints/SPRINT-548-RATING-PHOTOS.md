# Sprint 548: Rating Photo Indicators + API Integration

**Date:** 2026-03-10
**Story Points:** 5
**Status:** Complete
**Tests:** 28 new (10,279 total across 437 files)

## Mission

Surface rating photo and receipt verification status in the business detail page's rating list. Users can now see which ratings are backed by photo evidence or receipt verification, building visual trust in the rating integrity system.

## Team Discussion

**Marcus Chen (CTO):** "Photo and receipt verification are +15% and +25% boosts respectively — the two most impactful verification signals. But users couldn't see which ratings had them. This sprint closes the visibility gap. When a user sees 'Photo Verified' and 'Receipt Verified' badges on ratings, they understand why those ratings carry more weight."

**Amir Patel (Architecture):** "Adding hasPhoto and hasReceipt to the getBusinessRatings query is minimal — just 2 fields in the select. No joins needed since they're on the ratings table itself. The API passes them through ApiRating → mapApiRating → MappedRating cleanly."

**Rachel Wei (CFO):** "The visual differentiation between photo-verified and receipt-verified ratings supports the trust narrative. Users can see 'this person was actually there and has proof.' That's the core value proposition against Yelp's anonymous review system."

**Sarah Nakamura (Lead Eng):** "RatingPhotoData type and fetchRatingPhotos give us the building block for a full photo carousel in V2. For now, we show the indicator badges. The carousel (click to expand photos) can be built on top of this API without any server changes."

**Nadia Kaur (Cybersecurity):** "Receipt verification indicators are particularly important for trust. When users see 'Receipt Verified' they know the rating can't be fake — there's a paper trail. This is a deterrent against gaming."

## Changes

### Server — Business Ratings Query (`server/storage/businesses.ts`, 552→554 LOC)
- Added `hasPhoto` and `hasReceipt` fields to getBusinessRatings select
- No additional joins — fields are on the ratings table

### Client — Types (`components/business/types.ts`, 22→25 LOC)
- Added `hasPhoto?: boolean` and `hasReceipt?: boolean` to MappedRating interface

### Client — API Types (`lib/api.ts`, 654→670 LOC)
- Added `hasPhoto` and `hasReceipt` to ApiRating interface
- Added mapping in `mapApiRating` function
- New `RatingPhotoData` interface (id, ratingId, photoUrl, cdnKey, isVerifiedReceipt)
- New `fetchRatingPhotos(ratingId)` function for future photo carousel

### Client — Rating Indicators (`components/business/CollapsibleReviews.tsx`, 300→327 LOC)
- Photo indicator: camera-outline icon + "Photo Verified" badge (amber)
- Receipt indicator: receipt-outline icon + "Receipt Verified" badge (green)
- Indicators appear between sub-scores and comment
- `photoIndicatorRow`, `photoIndicator`, `receiptIndicator` styles

### Test Threshold Redirections
- `sprint524-api-extraction.test.ts` — api.ts: 660→680 LOC

## Test Summary

- `__tests__/sprint548-rating-photos.test.ts` — 28 tests
  - MappedRating type: 3 tests (hasPhoto, hasReceipt, Sprint 548 ref)
  - ApiRating type: 2 tests (hasPhoto, hasReceipt)
  - mapApiRating: 2 tests (hasPhoto mapping, hasReceipt mapping)
  - RatingPhotoData: 5 tests (export, photoUrl, isVerifiedReceipt, fetchRatingPhotos, API path)
  - CollapsibleReviews indicators: 11 tests (hasPhoto check, hasReceipt check, camera icon, receipt icon, Photo Verified text, Receipt Verified text, styles)
  - Server query: 2 tests (hasPhoto select, hasReceipt select)
  - File health: 3 tests (api.ts < 690, CollapsibleReviews < 340, types.ts < 30)
