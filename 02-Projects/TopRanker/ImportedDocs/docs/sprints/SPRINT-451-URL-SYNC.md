# Sprint 451: Search Filter URL Sync

**Date:** 2026-03-10
**Duration:** 1 sprint cycle
**Story Points:** 3
**Owner:** Sarah Nakamura (Lead Eng)

## Mission

Sync search filter state to URL query params. Users can bookmark and share filtered views like `?dietary=vegetarian,halal&hours=openLate&cuisine=indian`. Filter state is restored from URL on navigation.

## Team Discussion

**Marcus Chen (CTO):** "Filter state sharing is the bridge between discovery and virality. When a user shares 'Open Late Indian Vegetarian in Irving', the recipient lands on exactly that filtered view. No re-entering filters. This is the kind of zero-friction sharing that drives organic growth."

**Rachel Wei (CFO):** "Shareable URLs are marketing infrastructure. Every filtered search becomes a potential link in WhatsApp groups, Instagram stories, or tweets. 'Best halal near me' as a URL is more powerful than a screenshot."

**Amir Patel (Architect):** "Clean separation — the URL param utility is pure (no React dependencies). encode/decode are inverse functions. The validation in decode prevents injection via URL manipulation. search.tsx reads once on mount via useRef guard."

**Sarah Nakamura (Lead Eng):** "The encode function only includes non-default values — sort=ranked and filter=All are omitted for clean URLs. Decode validates every param against whitelists. Invalid values are silently dropped rather than causing errors."

## Changes

### New: `lib/search-url-params.ts` (~115 LOC)
- `SearchFilterState` interface — typed filter state
- `encodeSearchParams(state)` — state → URL params object
- `decodeSearchParams(params)` — URL params → validated state
- `buildSearchUrl(baseUrl, state)` — full shareable URL builder
- `filterStatesEqual(a, b)` — memoization helper
- Validation whitelists for all filter types

### Modified: `app/(tabs)/search.tsx` (718→733 LOC)
- Imports useLocalSearchParams from expo-router
- Reads URL params on mount via decodeSearchParams
- useRef guard prevents re-reading on subsequent renders
- Restores: query, cuisine, dietary, distance, hours, price, sort, filter

## Test Coverage
- 38 tests across 6 describe blocks (including 12 runtime tests)
- Validates: utility structure, encode/decode logic, runtime behavior, search wiring, docs
