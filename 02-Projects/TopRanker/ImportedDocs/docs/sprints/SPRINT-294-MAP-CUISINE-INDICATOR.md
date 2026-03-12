# Sprint 294: Map View Cuisine Indicator

**Date:** March 9, 2026
**Story Points:** 2
**Focus:** Cuisine filter indicator in map view + cuisine display on map card

## Mission
Extend the active cuisine indicator from Sprint 293 to the map view mode. When a user selects a cuisine and switches to map view, the filter chip is visible above the results list. Also show cuisine type on the map's selected business card overlay.

## Team Discussion

**Marcus Chen (CTO):** "Both view modes now have cuisine parity. List view got it in 293, map view gets it in 294. No view mode can hide the active filter."

**Amir Patel (Architecture):** "Style reuse from Sprint 293 — activeCuisineRow and activeCuisineChip are defined once and used in both locations. Zero style duplication."

**Sarah Nakamura (Lead Eng):** "The map selected card now shows cuisine between category and neighborhood: 'Restaurants · 🇮🇳 Indian · Irving'. Same pattern as the leaderboard cards from Sprint 289."

**Jasmine Taylor (Marketing):** "Map screenshots with the cuisine chip visible are great for location-based WhatsApp posts: 'See all Indian restaurants near you in Dallas' with the map view."

**Priya Sharma (QA):** "8 tests covering map cuisine chip rendering, map card cuisine display, and verifying no style duplication."

## Changes
- `app/(tabs)/search.tsx` — Add cuisine indicator chip above map split list header; show cuisine in map selected business card category line
- 8 tests in `tests/sprint294-map-cuisine-indicator.test.ts`

## Test Results
- **215 test files, 5,722 tests, all passing** (~3.0s)
