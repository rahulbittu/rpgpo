# Sprint 456: DiscoverFilters Extraction

**Date:** 2026-03-10
**Duration:** 1 sprint cycle
**Story Points:** 3
**Owner:** Sarah Nakamura (Lead Eng)

## Mission

Extract DietaryTagChips, DistanceChips, and HoursFilterChips from DiscoverFilters.tsx (381 LOC, 95.3% of 400 threshold) into a standalone FilterChipsExtended.tsx. This is the P0 finding from Arch Audit #49.

## Team Discussion

**Marcus Chen (CTO):** "DiscoverFilters at 95.3% was our highest-risk file. One more filter type would push it over the 400 LOC threshold. The extraction pattern is proven — we've done this for SubComponents (Sprint 449), RatingConfirmation, and many business detail subcomponents. Re-exports maintain backward compatibility so no import changes needed across the codebase."

**Amir Patel (Architect):** "The extraction boundary is clean — DietaryTagChips, DistanceChips, and HoursFilterChips are self-contained. They share no state with FilterChips, PriceChips, or SortChips. The only shared dependency is the brand colors and Haptics, which each file imports independently."

**Sarah Nakamura (Lead Eng):** "DiscoverFilters drops from 381→213 LOC (44% reduction). FilterChipsExtended is 190 LOC with its own StyleSheet. The re-export line in DiscoverFilters ensures all existing imports from `@/components/search/DiscoverFilters` continue to work — zero changes needed in search.tsx or any other consumer."

**Priya Sharma (Frontend):** "I updated the Sprint 442 and Sprint 447 tests to read from FilterChipsExtended.tsx instead of DiscoverFilters.tsx. The source-based test pattern makes these redirects straightforward — change the readFile path, all assertions pass."

## Changes

### New: `components/search/FilterChipsExtended.tsx` (~190 LOC)
- DietaryTagChips component + DietaryTag type + getDietaryTags helper
- DistanceChips component + DistanceOption type + getDistanceOptions helper
- HoursFilterChips component + HoursFilter type + getHoursFilters helper
- Self-contained StyleSheet with dietary, distance, and hours chip styles

### Modified: `components/search/DiscoverFilters.tsx` (381→213 LOC)
- Removed DietaryTagChips, DistanceChips, HoursFilterChips components
- Removed associated styles (dietary, distance, hours)
- Added re-exports from FilterChipsExtended for backward compatibility
- Retained: FilterChips, PriceChips, SortChips, SortResultsHeader

### Modified: `__tests__/sprint442-search-filters-v2.test.ts`
- Redirected DietaryTagChips and DistanceChips readFile to FilterChipsExtended.tsx

### Modified: `__tests__/sprint447-hours-filter.test.ts`
- Redirected HoursFilterChips readFile to FilterChipsExtended.tsx

## Test Coverage
- 23 tests across 4 describe blocks
- Validates: extracted structure, re-exports, LOC health, docs
