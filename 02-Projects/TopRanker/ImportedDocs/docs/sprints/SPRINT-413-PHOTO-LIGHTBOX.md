# Sprint 413: Business Detail Photo Lightbox

**Date:** 2026-03-09
**Type:** Feature — Business Detail UX
**Story Points:** 3

## Mission

Add a fullscreen photo lightbox to the business detail page. Tapping any photo in HeroCarousel or PhotoGallery opens a dark modal with swipeable fullscreen photos, photo counter, and close button. Previously, photos were view-only in the carousel and grid with no way to see them at full resolution.

## Team Discussion

**Priya Sharma (Design):** "The lightbox uses a near-black backdrop (95% opacity) with `contentFit='contain'` so photos fill the screen without cropping. The counter in the top-right matches the existing HeroCarousel counter style. The 'Swipe to browse' hint fades into the background — first-time discoverable without being noisy."

**Amir Patel (Architecture):** "PhotoLightbox is a self-contained 153 LOC component — Modal + ScrollView + SafeImage. Zero state leaks into business/[id].tsx beyond the boolean toggle and index. The `onPhotoPress` callback is optional on both HeroCarousel and PhotoGallery, so no breaking changes."

**Sarah Nakamura (Lead Eng):** "business/[id].tsx grew by 18 lines (476→494, 76% of threshold). The growth is all wiring — 2 state vars, 1 callback, 1 component render, 2 prop passes. PhotoLightbox itself is completely self-contained with its own scroll tracking."

**Jordan Blake (Compliance):** "Every tappable photo has `accessibilityRole='button'` and labels like 'View photo 3 of 8 fullscreen'. The close button has 'Close photo viewer'. Screen readers can navigate the lightbox naturally."

**Marcus Chen (CTO):** "This closes the last major gap in the business detail photo experience. Users can now browse photos in carousel, see the grid, and tap to view fullscreen. The lightbox opens at the tapped photo index so context is preserved."

**Nadia Kaur (Security):** "The lightbox only renders SafeImage with existing photoUrls — no new network requests, no new data exposure. The Modal is transparent with `onRequestClose` for Android back button support."

## Changes

### New Files
- `components/business/PhotoLightbox.tsx` (153 LOC) — Fullscreen modal with paging ScrollView, photo counter, close button, swipe hint

### Modified Files
- `components/business/HeroCarousel.tsx` (126→131 LOC, +5) — Added `onPhotoPress` optional prop, wrapped photos in TouchableOpacity with accessibility labels
- `components/business/PhotoGallery.tsx` (164→173 LOC, +9) — Added `onPhotoPress` optional prop, made featured and grid photos tappable with accessibility labels
- `app/business/[id].tsx` (476→494 LOC, +18) — Added lightbox state, openLightbox callback, passed onPhotoPress to HeroCarousel/PhotoGallery, rendered PhotoLightbox

### Test Files
- `__tests__/sprint413-photo-lightbox.test.ts` — 26 tests: PhotoLightbox structure, HeroCarousel integration, PhotoGallery integration, business/[id].tsx wiring, accessibility

## Test Results
- **314 files**, **7,498 tests**, all passing
- Server build: **601.1kb**, 31 tables
- 0 test cascades

## File Health After Sprint 413

| File | LOC | Threshold | % | Change | Status |
|------|-----|-----------|---|--------|--------|
| search.tsx | 692 | 900 | 77% | = | OK |
| profile.tsx | 680 | 800 | 85% | = | OK |
| rate/[id].tsx | 554 | 700 | 79% | = | OK |
| business/[id].tsx | 494 | 650 | 76% | +18 | OK |
| index.tsx | 420 | 600 | 70% | = | OK |
| challenger.tsx | 142 | 575 | 25% | = | OK |

**All 6 key files at OK status.**
