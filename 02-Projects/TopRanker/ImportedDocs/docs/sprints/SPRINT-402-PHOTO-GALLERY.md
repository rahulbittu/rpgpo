# Sprint 402: Business Photo Gallery Improvements

**Date:** 2026-03-09
**Type:** Feature Enhancement
**Story Points:** 3

## Mission

Enhance the business photo gallery with photo count badge, "1 of N" index on featured image, "See all" overlay on last grid image, community photo label, and "Add your photo" CTA. Constitution #10: "Premium feel, free access." The gallery should feel polished and inviting.

## Team Discussion

**Marcus Chen (CTO):** "Photo galleries drive engagement. Users scroll photos before reading anything. Making the gallery more informative (count badge, index) and actionable (add your photo CTA) directly supports the Business Pro value proposition."

**Rachel Wei (CFO):** "The 'Add your photo' CTA links to the rating flow, which includes photo upload. This creates a secondary entry point to the rating loop from the gallery itself. More rating paths = more ratings."

**Amir Patel (Architecture):** "PhotoGallery.tsx grew from ~80 LOC to ~170 LOC — still compact. New props are all optional and backward-compatible: communityPhotoCount and onAddPhoto. We used pct() for all percentage values, avoiding new `as any` casts."

**Priya Sharma (Frontend):** "The 'See all' overlay on the last grid image when there are more than 6 photos is an Instagram-style pattern. Dark overlay with '+N' count and 'See all' label — immediately communicates more content is available."

**Sarah Nakamura (Lead Eng):** "7 test cascades in sprint362 — all pattern updates for the new gallery structure. business/[id].tsx added 1 line for the onAddPhoto prop. No threshold violations."

## Changes

### Modified Files
- `components/business/PhotoGallery.tsx` — Added photo count badge, photo index on featured, "See all" overlay, community label, "Add your photo" CTA. +90 LOC.
- `app/business/[id].tsx` — Added onAddPhoto prop to PhotoGallery. +1 LOC.
- `tests/sprint362-photo-gallery.test.ts` — Updated 5 assertions for new gallery patterns (test cascade).

### New Files
- `tests/sprint402-photo-gallery.test.ts` — 18 tests

## Test Results
- **305 files**, **7,314 tests**, all passing
- Server build: **601.1kb**, 31 tables
