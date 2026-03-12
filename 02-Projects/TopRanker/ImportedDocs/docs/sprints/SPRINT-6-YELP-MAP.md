# Sprint 6: Yelp-Style Map View (v1.6-Yelp-Map)

**Sprint Goal:** Upgrade the Discover screen's map mode from a simple toggle to a Yelp-style split-screen layout with an interactive Google Map on top and a scrollable list below.

**Status:** Complete
**Target Tag:** `v1.6-Yelp-Map`

---

## Tickets

### TICKET-6.1: Split-Screen Map Layout
- **Priority:** P0 (Feature)
- **Files Modified:**
  - `app/(tabs)/search.tsx`
- **Description:**
  Map mode now shows a Yelp-inspired split view: Google Map fills the top 45% of the screen, with a scrollable business list below (rounded top corners, subtle shadow). The list uses compact `MapBusinessCard` rows for density. Previously the map and list were separate full-screen views toggled by a button.

### TICKET-6.2: Interactive Map Pin Selection
- **Priority:** P0 (UX)
- **Files Modified:**
  - `app/(tabs)/search.tsx`
- **Description:**
  Tapping a map pin now shows a floating business card overlay at the bottom of the map with the business photo, name, score, rank, open/closed status, and category. Tapping the card navigates to the business profile. Tapping the map background dismisses the card. The map also auto-pans to center the selected pin.

### TICKET-6.3: Improved Map Markers
- **Priority:** P1 (Visual)
- **Files Modified:**
  - `app/(tabs)/search.tsx`
- **Description:**
  Map markers upgraded from simple circles to teardrop/pin shapes with drop shadows. Rank number displayed inside each pin. Higher-ranked businesses have higher z-index so their markers appear on top. Map auto-fits bounds to show all markers with comfortable padding.

### TICKET-6.4: Google Maps API Key Setup
- **Priority:** P0 (Infrastructure)
- **Files Modified:**
  - `.env`
- **Description:**
  Added `EXPO_PUBLIC_GOOGLE_MAPS_API_KEY` to `.env` file. The map was previously non-functional because this key was missing, causing the map to fall back to a plain list.

### TICKET-6.5: Map UX Polish
- **Priority:** P1 (UX Polish)
- **Files Modified:**
  - `app/(tabs)/search.tsx`
- **Description:**
  - Transit and POI layers hidden for cleaner map
  - Map auto-fits bounds to show all business markers
  - Maximum zoom of 16 enforced for single-marker views
  - Non-web platforms show a graceful fallback message instead of a broken map

---

## Release Checklist
- [x] All 5 tickets implemented
- [x] No TypeScript errors
- [ ] Visual QA on web
- [ ] Git tag: `v1.6-Yelp-Map`
