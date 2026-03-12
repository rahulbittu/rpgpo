# Sprint 379: Rating Flow Photo Upload UI

**Date:** March 10, 2026
**Story Points:** 3
**Focus:** Enhance photo upload in rating flow with multi-photo support, camera option, and thumbnail strip

## Mission
The rating flow had single-photo upload only (gallery picker). This sprint adds multi-photo support (up to 3 photos), a camera capture option alongside the gallery picker, and a thumbnail strip showing uploaded photos with individual remove buttons.

## Team Discussion

**Amir Patel (Architecture):** "The enhancement is backward-compatible. photoUris and setPhotoUris are optional props — if not provided, falls back to single photoUri. The MAX_PHOTOS constant (3) can be adjusted without code changes."

**Sarah Nakamura (Lead Eng):** "Two action buttons side-by-side: Gallery (images-outline) and Camera (camera-outline). Gallery uses launchImageLibraryAsync, Camera uses launchCameraAsync with permission request. Both compress to 80% quality with 4:3 aspect."

**Priya Sharma (QA):** "24 new tests covering multi-photo props, camera support, gallery support, thumbnails, action row, accessibility, rate screen integration, and file size guards. 287 test files, 6,960 tests, all passing."

**Marcus Chen (CTO):** "Photo verification is +15% credibility boost (from Rating Integrity doc). Multi-photo means users can show food, ambiance, and receipt — hitting multiple verification signals in one rating. This directly strengthens signal quality."

**Nadia Kaur (Cybersecurity):** "Camera permission is requested lazily (only on tap). The permission flow uses expo-image-picker's built-in OS dialog. No custom permission handling needed."

## Changes

### `components/rate/RatingExtrasStep.tsx` (319→365 LOC, +46 lines)
- Added `MAX_PHOTOS = 3` constant
- Added `photoUris?: string[]` and `setPhotoUris?: (uris: string[]) => void` optional props
- Added `addPhotoFromGallery()`, `addPhotoFromCamera()`, `removePhoto()` functions
- Replaced single photo view with multi-photo thumbnail strip
- Split "Add photo" into Gallery and Camera buttons in side-by-side action row
- Added 5 new styles: photoStrip, photoThumb, photoThumbImage, photoThumbRemove, photoActionRow
- Modified existing styles: photoSection (added gap), photoAddBtn (added flex: 1), photoVerifiedBadge (removed absolute positioning)

### `app/rate/[id].tsx` (618→621 LOC, +3 lines)
- Added `photoUris` state (string array)
- Passed `photoUris` and `setPhotoUris` to RatingExtrasStep

### Test updates
- `tests/sprint379-photo-upload-ui.test.ts` (NEW — 24 tests)

## Test Results
- **287 test files, 6,960 tests, all passing** (~3.9s)
- **Server build:** 599.3kb (unchanged)
