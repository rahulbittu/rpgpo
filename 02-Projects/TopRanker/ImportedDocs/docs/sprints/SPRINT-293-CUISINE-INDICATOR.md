# Sprint 293: Active Cuisine Filter Indicator

**Date:** March 9, 2026
**Story Points:** 2
**Focus:** Visual indicator showing when search results are filtered by cuisine

## Mission
When a user selects a cuisine from BestInSection (e.g., "Indian"), show a visible chip above search results indicating the active filter. Include the cuisine emoji, label, result count, and a dismiss button. This prevents the hidden-state confusion identified in Sprint 292's retro.

## Team Discussion

**Marcus Chen (CTO):** "Applied filters should always be visible. Users must know why they're seeing a subset of results. This is UX 101 — state transparency."

**Sarah Nakamura (Lead Eng):** "The chip uses amber-tinted styling to match our brand, with the close-circle icon for quick clearing. The result count ('12 results') gives immediate feedback on filter impact."

**Amir Patel (Architecture):** "CUISINE_DISPLAY lookup gives us consistent emoji + label rendering. Same source of truth as the leaderboard cards and BestInSection tabs."

**Jasmine Taylor (Marketing):** "Screenshots of filtered results with '🇮🇳 Indian · 5 results' are perfect for WhatsApp shares. The branding is cohesive."

**Priya Sharma (QA):** "13 tests covering the import, conditional rendering, CUISINE_DISPLAY lookup, close button accessibility, and all four new styles."

## Changes
- `app/(tabs)/search.tsx` — Import CUISINE_DISPLAY, add active cuisine chip with emoji/label/count/dismiss, add 4 new styles (activeCuisineRow, activeCuisineChip, activeCuisineText, activeCuisineCount)
- 13 tests in `tests/sprint293-cuisine-indicator.test.ts`

## Test Results
- **214 test files, 5,714 tests, all passing** (~3.0s)
