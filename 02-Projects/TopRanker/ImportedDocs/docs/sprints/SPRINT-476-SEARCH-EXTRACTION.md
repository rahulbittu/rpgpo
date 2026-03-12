# Sprint 476: Search Result Processing Extraction

**Date:** 2026-03-10
**Duration:** 1 sprint cycle
**Story Points:** 2
**Owner:** Sarah Nakamura (Lead Eng)

## Mission

Extract search result processing from routes-businesses.ts to a dedicated `search-result-processor.ts` module. Resolves H-2 finding from Audit #53 (routes-businesses.ts at 97.7% threshold).

## Team Discussion

**Sarah Nakamura (Lead Eng):** "The search endpoint had 7 inline processing stages crammed into one route handler. Extracting to three pure functions — enrichSearchResults, applySearchFilters, sortByRelevance — makes each stage testable and the route handler readable."

**Amir Patel (Architect):** "Clean extraction following the established pattern. The SearchProcessingOpts interface bundles all filter parameters into a single object, which is much cleaner than passing 8 individual arguments."

**Marcus Chen (CTO):** "routes-businesses.ts dropped from 376 to 305 LOC — well within the 385 threshold. The search-result-processor.ts at 124 LOC is a focused utility module with clear responsibilities."

**Rachel Wei (CFO):** "This is pure technical debt repayment. No user-facing changes, but the codebase is healthier for it. The extraction makes future search enhancements easier to implement."

**Nadia Kaur (Cybersecurity):** "The haversineKm function was a private function in routes-businesses.ts — now it's exported from the processor module. This is fine since it's a pure math function with no security implications."

## Changes

### New: `server/search-result-processor.ts` (~124 LOC)
- `haversineKm()` — Haversine distance calculation (moved from routes-businesses.ts)
- `SearchProcessingOpts` interface — bundles query, location, dietary, hours filter params
- `enrichSearchResults()` — relevance scoring, distance calculation, open status computation
- `applySearchFilters()` — dietary, distance, and hours-based post-query filtering
- `sortByRelevance()` — relevance + weighted score sort for search queries

### Modified: `server/routes-businesses.ts` (-71 LOC, 376→305)
- Removed inline haversineKm function
- Removed search-ranking-v2 and isOpenLate/isOpenWeekends imports (now in processor)
- Search endpoint calls enrichSearchResults → applySearchFilters → sortByRelevance
- processingOpts object passed to all three functions

### Modified test files (redirected to search-result-processor.ts):
- `tests/sprint392-search-relevance.test.ts` — relevance scoring checks
- `__tests__/sprint436-search-relevance.test.ts` — search context field checks
- `__tests__/sprint447-hours-filter.test.ts` — hours filter logic checks
- `__tests__/sprint442-search-filters-v2.test.ts` — dietary/distance filter checks

### New: `__tests__/sprint476-search-extraction.test.ts` (23 tests)
- Processor module exports and functionality
- Route integration (imports, function calls, LOC reduction)

## Test Coverage
- 23 new tests, all passing
- Full suite: 8,796 tests across 367 files, all passing in ~4.7s
- Server build: 637.2kb (unchanged — code reorganization only)
