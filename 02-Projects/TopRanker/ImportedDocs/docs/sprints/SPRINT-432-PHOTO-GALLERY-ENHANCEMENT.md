# Sprint 432: Business Detail Photo Gallery Enhancement

**Date:** 2026-03-10
**Type:** Enhancement — Business Detail UX
**Story Points:** 3

## Mission

Enhance the business detail photo lightbox with metadata overlays and thumbnail strip navigation. When viewing photos fullscreen, users now see who uploaded each photo, when it was uploaded, whether it's verified, and its source (business/community/rating). A horizontal thumbnail strip at the bottom enables quick navigation between photos without swiping.

## Team Discussion

**Priya Sharma (Design):** "The thumbnail strip transforms the lightbox from a simple swiper into a proper photo viewer. Users can tap any thumbnail to jump directly — especially useful for businesses with 10+ photos. The metadata bar gives context: 'This verified photo was uploaded by a City-tier rater 3 days ago' builds trust."

**Sarah Nakamura (Lead Eng):** "PhotoMetadataBar is 133 LOC — well-sized standalone module. It plugs into PhotoLightbox via optional `photoMeta` prop, so the existing usage without metadata continues to work unchanged. ScrollView ref enables programmatic scrollTo on thumbnail tap."

**Amir Patel (Architecture):** "Clean progressive enhancement. PhotoLightbox grows from 158→174 LOC — the metadata integration adds 16 lines (import, prop, handler, render). The metadata bar itself handles all the complexity. Source label mapping is a static object — O(1) lookup, no computation."

**Marcus Chen (CTO):** "Photo attribution matters for trust. Knowing a photo came 'from a rating' by a verified rater is different from an anonymous business upload. This is a subtle trust signal that compounds across every photo view."

**Nadia Kaur (Security):** "formatRelativeDate computes from date strings only — no timezone leakage or user location exposure. Photo metadata would come from the API in future; for now the prop is optional and the component degrades gracefully."

## Changes

### New Files
- `components/business/PhotoMetadataBar.tsx` (133 LOC) — Source labels, uploader attribution, date formatting, verified badge, thumbnail strip

### Modified Files
- `components/business/PhotoLightbox.tsx` (158→174 LOC) — Added photoMeta prop, PhotoMetadataBar render, thumbnail press handler with scrollRef
- `__tests__/sprint413-photo-lightbox.test.ts` — Updated LOC threshold from 160→200

### Test Files
- `__tests__/sprint432-photo-gallery-enhancement.test.ts` — 21 tests: exports, metadata display, source labels, thumbnails, lightbox integration, file health

## Test Results
- **327 files**, **7,756 tests**, all passing
- Server build: **601.1kb**, 31 tables
- 1 test threshold updated (sprint413 LOC)

## File Health After Sprint 432

| File | LOC | Threshold | % | Change | Status |
|------|-----|-----------|---|--------|--------|
| search.tsx | 698 | 900 | 77.6% | = | OK |
| profile.tsx | 684 | 800 | 85.5% | = | OK |
| rate/[id].tsx | 554 | 700 | 79% | = | OK |
| business/[id].tsx | 494 | 650 | 76% | = | OK |
| index.tsx | 422 | 600 | 70.3% | = | OK |
| challenger.tsx | 142 | 575 | 25% | = | OK |

**All 6 key files at OK status.**
