# Sprint 582: City Dimension Averages Caching

**Date:** 2026-03-10
**Story Points:** 2
**Status:** Complete

## Mission

Add in-memory TTL cache to the city dimension averages endpoint. The SQL AVG query runs on every request — caching with a 5-minute TTL reduces database load while keeping data fresh.

## Team Discussion

**Amir Patel (Architecture):** "The AVG aggregation query joins ratings × businesses and scans all non-flagged ratings for a city. At scale, this is O(n) per request. A 5-minute TTL cache means the query runs at most 12 times per hour per city instead of on every page view."

**Marcus Chen (CTO):** "Simple Map-based cache is the right choice for now. If we need cross-process caching later, we can swap to Redis. But for a single-process server, Map is faster and simpler."

**Sarah Nakamura (Lead Eng):** "The cache normalizes keys to lowercase+trimmed so 'Dallas', 'dallas', and ' Dallas ' all hit the same entry. Eviction at 50 entries prevents unbounded growth."

**Nadia Kaur (Security):** "The cache stores aggregated averages, not individual ratings. No PII or per-user data in the cache. Safe."

## Changes

### Modified Files
- **`server/city-dimension-averages.ts`** (50→69 LOC, +19)
  - Added `CACHE_TTL_MS = 5 * 60 * 1000` (5 minutes)
  - Added Map-based cache: `Map<string, { data, expiresAt }>`
  - Cache check before DB query, cache set after
  - Key normalization: `city.toLowerCase().trim()`
  - Eviction: purge stale entries when cache exceeds 50 cities
  - Exported helpers: `getCacheSize()`, `clearDimensionCache()`

### Test Files
- **`__tests__/sprint582-city-dim-cache.test.ts`** (13 tests)
  - TTL constant, Map structure, exports, normalization, cache flow, eviction, route unchanged
- **`__tests__/sprint578-dimension-comparison.test.ts`** — LOC threshold bumped 55→75

### Threshold Updates
- `shared/thresholds.json`: tests 11031→11044, build 716.8→717.2kb

## Test Results
- **11,044 tests** across 470 files, all passing in ~6.0s
- Server build: 717.2kb
