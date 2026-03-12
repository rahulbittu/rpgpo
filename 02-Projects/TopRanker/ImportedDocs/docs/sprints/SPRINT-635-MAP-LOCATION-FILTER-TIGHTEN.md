# Sprint 635: Map Current Location Blue Dot + Filter Row Spacing

**Date:** 2026-03-11
**Points:** 5
**Focus:** Fix map current location (blue dot marker + auto-pan) + tighten Discover filter row spacing

## Mission

CEO feedback: (1) Map current location button doesn't show where you are. (2) Discover filter rows (Near Me, price, dietary, hours) are "overbloated" with wasted vertical space.

## Team Discussion

**Sarah Nakamura (Lead Eng):** "The map had no visual indicator for user location — just a pan/zoom behavior with no marker. Added a standard Google Maps blue dot SVG marker that appears when location is granted."

**Marcus Chen (CTO):** "Good catch on the auto-pan timing issue. Previously, tapping 'My Location' with no permission would request it, but after the async grant, the map wouldn't auto-pan. Now a useEffect watches `userLocation` and pans+zooms on first acquisition."

**Priya Sharma (QA):** "The filter spacing was 6px between each row. Dropped to 2px — removes about 16px of vertical waste across the 4 filter rows. Combined with the alignment fix from Sprint 634, Discover should feel much tighter."

**Amir Patel (Architecture):** "MapView grew to 346 LOC with the blue dot code. Raised ceiling from 320 to 360. Still well-contained for a component handling Google Maps init, markers, info windows, and user location."

## Changes

### `components/search/MapView.tsx`
- Added `userMarkerRef` for tracking user location marker
- Added useEffect: when `userLocation` becomes available, creates blue dot SVG marker (#4285F4) at user position
- Auto-pans and zooms to 14 on first location acquisition
- If location updates, repositions existing marker (no duplicate markers)
- Cleanup: removes user marker on unmount

### `components/search/FilterChipsExtended.tsx`
- `dietaryScrollRow.marginBottom`: 6 → 2
- `distanceRow.paddingBottom`: 6 → 2
- `hoursRow.paddingBottom`: 6 → 2

### `components/search/DiscoverFilters.tsx`
- `filterScrollRow.marginBottom`: 6 → 2
- `priceRow.paddingBottom`: 6 → 2
- `sortRow.paddingBottom`: 6 → 2

### Test Updates
- `sprint624`: MapView LOC ceiling 320 → 360
- `sprint622`: paddingBottom assertions updated from 6 to 2

## Health
- **Tests:** 11,694 pass (501 files)
- **Build:** 630.5kb
- **MapView LOC:** 346 (ceiling 360)
