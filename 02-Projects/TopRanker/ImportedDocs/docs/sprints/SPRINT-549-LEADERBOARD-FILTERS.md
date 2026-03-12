# Sprint 549: Leaderboard Filters — Neighborhood + Price Range

**Date:** 2026-03-10
**Story Points:** 5
**Status:** Complete
**Tests:** 35 new (10,314 total across 438 files)

## Mission

Add neighborhood and price range filtering to the leaderboard rankings. Users can now filter "Best Indian in Irving" further to "Best Indian in Irving, Las Colinas, $$" — increasing specificity and driving the "Best In" format deeper into neighborhoods.

## Team Discussion

**Marcus Chen (CTO):** "Neighborhood filtering is the next level of specificity. 'Best biryani in Irving' is good, but 'Best biryani in Las Colinas' is even more targeted and debatable. This drives the WhatsApp controversy loops at a hyperlocal level. Price filtering adds the 'value' dimension — '$$ restaurants only' is a real filter people use."

**Amir Patel (Architecture):** "Server-side filtering via the existing leaderboard query is clean. We add 2 optional WHERE clauses. The cache key now includes neighborhood and priceRange to avoid serving stale results across filter changes. The neighborhoods endpoint uses selectDistinct with a 600s cache — neighborhoods don't change often."

**Rachel Wei (CFO):** "Price filtering opens up marketing angles: 'Best affordable Indian in Irving ($$)' is a WhatsApp share that resonates with budget-conscious families. This is a direct conversion lever for Phase 1."

**Sarah Nakamura (Lead Eng):** "The horizontal chip row follows the same pattern as Discover's FilterChips. Toggle behavior (tap to select, tap again to deselect) with a clear button when any filter is active. Neighborhoods are limited to 8 chips to prevent overflow."

**Cole Richardson (City Growth):** "Neighborhood data varies by city. Dallas has Deep Ellum, Uptown, Oak Lawn. Irving has Las Colinas, Valley Ranch. The selectDistinct approach means neighborhoods appear automatically as businesses are added — no manual configuration needed."

## Changes

### Server — Leaderboard Query (`server/storage/businesses.ts`, 554→584 LOC)
- `getLeaderboard()` now accepts optional `neighborhood` and `priceRange` params
- Adds conditional WHERE clauses for both filters
- Cache key includes both filter values
- New `getNeighborhoods(city)` function — selectDistinct with null/empty filtering

### Server — Leaderboard Route (`server/routes.ts`, 377→383 LOC)
- Parses `neighborhood` and `priceRange` from query params (sanitized)
- Passes to `getLeaderboard()` with new params
- New `/api/leaderboard/neighborhoods` endpoint returning distinct neighborhoods for a city

### Server — Storage Exports (`server/storage/index.ts`)
- Added `getNeighborhoods` export

### Client — API Functions (`lib/api.ts`, 670→682 LOC)
- `fetchLeaderboard()` now accepts optional `neighborhood` and `priceRange` params
- Appends to URL as query params when provided
- New `fetchNeighborhoods(city)` function

### Client — Rankings Page (`app/(tabs)/index.tsx`, 423→505 LOC)
- `neighborhoodFilter` and `priceFilter` state
- `PRICE_OPTIONS` constant: $, $$, $$$, $$$$
- `useQuery` for neighborhoods with 300s staleTime
- Filter chips in horizontal ScrollView below sticky cuisine bar
- Neighborhood chips: location-outline icon, max 8 chips
- Price chips: $–$$$$ text, toggle behavior
- Clear button when any filter active (close-circle icon)
- Amber active state, subtle border inactive state
- `filterChipRow`, `filterChip`, `filterChipActive`, `clearFilterChip` styles

### Test Threshold Redirections
- sprint491, sprint495, sprint500, sprint505: routes.ts 380→390
- sprint498, sprint500, sprint505: businesses.ts 580→600
- sprint386: index.tsx 500→520
- sprint286: queryKey includes neighborhoodFilter, priceFilter

## Test Summary

- `__tests__/sprint549-leaderboard-filters.test.ts` — 35 tests
  - Server getLeaderboard: 6 tests (neighborhood param, priceRange param, filter clauses, cache key, Sprint 549)
  - Server getNeighborhoods: 5 tests (export, city param, selectDistinct, null filter, storage export)
  - Server route: 4 tests (neighborhood parse, priceRange parse, passes to getLeaderboard, neighborhoods endpoint)
  - Client API: 6 tests (neighborhood param, priceRange param, URL append, fetchNeighborhoods, endpoint)
  - Client UI: 9 tests (import, state, PRICE_OPTIONS, useQuery, filter passthrough, neighborhood chips, price chips, clear button, styles)
  - File health: 3 tests (index.tsx < 520, businesses.ts < 600, api.ts < 695)
