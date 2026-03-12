# Sprint 553: Leaderboard Filter Chip Extraction — index.tsx Decomposition

**Date:** 2026-03-10
**Story Points:** 3
**Status:** Complete
**Tests:** 17 new (10,385 total across 442 files)

## Mission

index.tsx was flagged at 505 LOC in Arch Audit #68 (Sprint 550) with a Medium finding. This sprint extracts the neighborhood + price filter chip UI into a standalone `LeaderboardFilterChips` component, reducing index.tsx from 505→443 LOC (12% reduction). Addresses the SLT-550 action item for Sprint 553.

## Team Discussion

**Marcus Chen (CTO):** "index.tsx was the only Medium finding in Audit #68. Dropping 62 LOC puts it safely back under the 450 threshold. The extracted component is reusable — if we add filters to Discover or business pages later, we have the chip row ready."

**Amir Patel (Architecture):** "Clean extraction pattern. Props interface makes the contract explicit: neighborhoods, filter state, and setters. No behavioral changes — purely structural. Build size unchanged at 707.1kb."

**Sarah Nakamura (Lead Eng):** "The sprint549 test needed 4 redirections — tests that checked index.tsx for inline chip code now check the extracted component. Also removed the unused ScrollView import from index.tsx."

**Rachel Wei (CFO):** "Technical debt reduction sprint. Two consecutive cleanup sprints (551 schema, 553 extraction) keep the codebase healthy for the next feature cycle."

**Cole Richardson (City Growth):** "The LeaderboardFilterChips component is city-aware through the neighborhoods prop. Different cities surface different neighborhoods — this extraction doesn't change that behavior."

## Changes

### New Component (`components/leaderboard/LeaderboardFilterChips.tsx` — 80 LOC)
- `LeaderboardFilterChipsProps` interface: neighborhoods, filter state, setters
- Horizontal `ScrollView` with neighborhood chips (location-outline icon, max 8)
- Price chips ($, $$, $$$, $$$$) with active state styling
- Clear button with close-circle icon (conditional on active filters)
- Haptics feedback on chip selection
- Self-contained styles: chip, chipActive, chipText, chipTextActive, clearChip

### index.tsx Reduction (`app/(tabs)/index.tsx` — 505→443 LOC)
- Removed 41-line inline filter chip JSX block → replaced with `<LeaderboardFilterChips ... />`
- Removed 28-line filterChip styles block (moved to component)
- Removed `PRICE_OPTIONS` constant (moved to component)
- Removed unused `ScrollView` import

### Test Redirections (4 total)
- `sprint549-leaderboard-filters.test.ts` — 4 tests redirected from index.tsx assertions to component file

## Test Summary

- `__tests__/sprint553-filter-chip-extraction.test.ts` — 17 tests
  - Component: LOC bounds, export, props interface, PRICE_OPTIONS, neighborhood chips, price chips, clear button, Haptics, ScrollView, styles
  - index.tsx: under 450 LOC, imports component, no inline PRICE_OPTIONS, no filterChip styles, no ScrollView, state vars preserved, props passed
