# Sprint 426: MapView Extraction

**Date:** 2026-03-10
**Type:** Structural — Component Extraction
**Story Points:** 3

## Mission

Extract MapView component (~264 LOC) from search/SubComponents.tsx into its own file components/search/MapView.tsx. This addresses the Medium finding M1 from Arch Audit #43 and reduces SubComponents.tsx from 660→396 LOC — well below the 700 LOC extraction threshold.

## Team Discussion

**Amir Patel (Architecture):** "This is the extraction we've been planning since Audit #42. MapView includes CITY_COORDS (11 cities), the Google Maps initialization, marker management, info windows, and the 'Search this area' button. All self-contained with its own styles. The re-export from SubComponents ensures zero import breakage."

**Sarah Nakamura (Lead Eng):** "SubComponents drops from 660→396 LOC — a 40% reduction. 4 test files needed updates: sprint418 tests redirect to MapView.tsx, sprint144 tests updated for the re-export pattern. Zero functional changes."

**Priya Sharma (Design):** "No visual changes. The extraction is purely structural. Users won't notice anything different — the map, markers, and search area button all work exactly as before."

**Marcus Chen (CTO):** "This closes the M1 finding from Audit #43. SubComponents is now at 396 LOC with massive headroom. We won't need to worry about this file for a long time."

**Nadia Kaur (Security):** "The Google Maps API key handling moved with MapView. Same initialization pattern, same auth failure handling. No security surface area change."

## Changes

### New Files
- `components/search/MapView.tsx` (284 LOC) — MapView component, CITY_COORDS, haversineKm utility, map styles

### Modified Files
- `components/search/SubComponents.tsx` (660→396 LOC, -264) — Removed MapView, CITY_COORDS, haversineKm, map styles. Added re-export from MapView.tsx
- `tests/sprint144-product-validation.test.ts` — Redirected MapView and CITY_COORDS checks to MapView.tsx
- `__tests__/sprint418-map-improvements.test.ts` — Redirected all MapView tests to read from MapView.tsx

### Test Files
- No new test file (extraction only — all existing tests updated to point to new file)

## Test Results
- **323 files**, **7,675 tests**, all passing
- Server build: **601.1kb**, 31 tables
- 4 test file redirects, 0 test cascades

## File Health After Sprint 426

| File | LOC | Threshold | % | Change | Status |
|------|-----|-----------|---|--------|--------|
| search.tsx | 698 | 900 | 77.6% | = | OK |
| profile.tsx | 684 | 800 | 85.5% | = | OK |
| rate/[id].tsx | 554 | 700 | 79% | = | OK |
| business/[id].tsx | 494 | 650 | 76% | = | OK |
| index.tsx | 422 | 600 | 70.3% | = | OK |
| challenger.tsx | 142 | 575 | 25% | = | OK |

**SubComponents health after extraction:**
| File | LOC | Previous | Change |
|------|-----|----------|--------|
| search/SubComponents.tsx | 396 | 660 | -264 |
| search/MapView.tsx | 284 | NEW | NEW |

**All 6 key files at OK status. Audit #43 M1 finding RESOLVED.**
