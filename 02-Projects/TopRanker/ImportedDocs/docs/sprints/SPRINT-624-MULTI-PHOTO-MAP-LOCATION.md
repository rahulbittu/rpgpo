# Sprint 624: Multi-Photo Strips + Map Current Location Button

**Date:** 2026-03-11
**Type:** Core Loop — CEO Feedback (Photo Richness + Map UX)
**Story Points:** 3
**Status:** COMPLETE

## Mission

Increase photo strip limit from 3 to 6 photos across all card types. Add a "My Location" button to the map view so users can center the map on their current position.

## Team Discussion

**Priya Sharma (Design):** "Going from 3 to 6 photos makes the swipe experience significantly richer. Users can now see multiple angles, dishes, and ambiance shots before tapping into a business. The dot indicators scale naturally."

**Sarah Nakamura (Lead Eng):** "Two lines changed for the photo limit — `slice(0, 3)` → `slice(0, 6)` in both DiscoverPhotoStrip and leaderboard PhotoStrip. The ScrollView paging and dot rendering already worked for any number of photos."

**Amir Patel (Architecture):** "The map location button follows Google Maps convention — circular white button, bottom-right, navigate icon. It uses the existing `requestLocation` callback from search.tsx and panTo when user location is known. Zero new location code needed."

**Marcus Chen (CTO):** "Props threading was clean: `onMyLocation` + `userLocation` through SearchMapSplitView → MapView. The button shows amber when location is available, tertiary when not yet requested."

## Changes

### Modified Files
- `components/search/SubComponents.tsx` — DiscoverPhotoStrip: `slice(0, 3)` → `slice(0, 6)`
- `components/leaderboard/SubComponents.tsx` — PhotoStrip: `slice(0, 3)` → `slice(0, 6)`
- `components/search/MapView.tsx` — Added `onMyLocation` + `userLocation` props, `handleMyLocation()` function, "My Location" button (bottom-right, circular), `myLocationBtn` style
- `components/search/SearchMapSplitView.tsx` — Added `onMyLocation` + `userLocation` to interface, passed through to MapView
- `app/(tabs)/search.tsx` — Passes `requestLocation` and `userLocation` to SearchMapSplitView

## Verification
- 11,524 tests passing across 493 files
- Server build: 627.3kb (< 750kb ceiling)
- 30 tracked files, 0 threshold violations
- MapView.tsx: ~305 LOC (< 320 ceiling)
