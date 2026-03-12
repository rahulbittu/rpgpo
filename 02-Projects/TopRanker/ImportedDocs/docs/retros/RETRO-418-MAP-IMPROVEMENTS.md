# Retro 418: Search Map Improvements

**Date:** 2026-03-09
**Duration:** 1 sprint cycle
**Story Points:** 3
**Facilitator:** Sarah Nakamura

## What Went Well

**Priya Sharma:** "The 'Search this area' button is a standard Google Maps UX pattern — users expect it. Combined with info windows on markers, the map is now a first-class discovery tool, not just a visual."

**Amir Patel:** "Adding 6 beta city coordinates was trivial — static data, zero runtime cost. The info window uses Google's native InfoWindow which handles positioning, closing, and scroll into view automatically."

**Sarah Nakamura:** "One test cascade, one-line fix. The dragend + zoom_changed listeners set showSearchArea to true — simple and effective. No new dependencies."

## What Could Improve

- **search/SubComponents.tsx at 660 LOC** — Getting large. MapView alone is ~170 LOC. Should extract into its own file in a future sprint.
- **onSearchArea is not yet wired in search.tsx** — The callback prop exists but the parent doesn't pass it. Needs search.tsx integration to actually trigger a coordinate-based search.
- **Info window HTML template** — Simple but not branded. Could use custom OverlayView for a React-rendered info window with amber styling.

## Action Items

- [ ] Extract MapView into `components/search/MapView.tsx` when SubComponents.tsx approaches 700 LOC — **Owner: Amir**
- [ ] Wire onSearchArea in search.tsx for coordinate-based search — **Owner: Sarah (next search sprint)**
- [ ] Consider custom OverlayView for branded map popups — **Owner: Priya (future)**

## Team Morale
**8/10** — Practical improvements to an underused feature. The map view is now significantly more useful with info windows and search-area support.
