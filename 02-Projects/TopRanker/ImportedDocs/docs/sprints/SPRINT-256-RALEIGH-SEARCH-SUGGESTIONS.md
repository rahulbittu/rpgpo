# Sprint 256: Raleigh Beta Promotion + Search Suggestions

**Date:** 2026-03-09
**Sprint Goal:** Promote Raleigh from planned to beta, build search suggestions module for autocomplete/typeahead

---

## Mission Alignment
Search suggestions directly improve discovery UX -- helping users find trusted businesses faster. Raleigh beta promotion expands our NC footprint to two beta cities (Charlotte + Raleigh), covering the Research Triangle market.

---

## Team Discussion

**Marcus Chen (CTO):**
"Raleigh promotion is clean -- same pattern as Charlotte. The search suggestions module is pure in-memory, zero external deps. I like the score-weighted approach: businesses rank above neighborhoods rank above categories. This keeps typeahead results relevant without needing a full search engine."

**Cole Anderson (Search Infrastructure):**
"I built the suggestion index as a per-city Map so we can scale to hundreds of cities without cross-contamination. The `buildSuggestionIndex` function is idempotent -- calling it again for the same city just replaces the old index. The deduplication on neighborhoods prevents 'Downtown Memphis' from appearing 10 times if all 10 businesses are there."

**Sarah Nakamura (Lead Engineer):**
"Cascade test updates were significant this sprint -- 5 test files needed planned->0 and beta->6 adjustments. The pattern is well-established at this point. We have 36 new tests covering static analysis, runtime behavior, and integration wiring for both the Raleigh promotion and the search module."

**Jasmine Taylor (Marketing):**
"Raleigh is our second NC city. The Research Triangle market (Raleigh-Durham-Chapel Hill) is tech-heavy and review-savvy -- exactly our target demographic. Having search suggestions ready before we ramp up Raleigh marketing means users get a polished first experience."

**Amir Patel (Architecture):**
"The routes-search.ts follows our established pattern: separate route file, registered in routes.ts, uses sanitizeString for input validation. The admin index-stats endpoint gives ops visibility into which cities have been indexed and their suggestion counts. No auth required on the public endpoints since suggestions are read-only and non-sensitive."

---

## Changes

### 1. Raleigh Beta Promotion
- `shared/city-config.ts` -- Raleigh status: "planned" -> "beta", added launchDate "2026-03-09"
- City counts: 5 active, 6 beta, 0 planned, 11 total

### 2. Search Suggestions Module
- **New:** `server/search-suggestions.ts` -- in-memory suggestion index
  - `buildSuggestionIndex(city, businesses)` -- builds per-city index from business data
  - `getSuggestions(query, city, limit)` -- substring match, score-sorted
  - `getPopularSearches(city, limit)` -- top business suggestions
  - `getCitySuggestionCount(city)` -- index size per city
  - `getAllIndexedCities()` -- list of indexed cities
  - `clearSuggestionIndex(city?)` -- clear one or all cities
  - `CATEGORY_SUGGESTIONS` -- 12 standard food categories

### 3. Search Routes
- **New:** `server/routes-search.ts`
  - `GET /api/search/suggestions?q=&city=&limit=` -- typeahead autocomplete
  - `GET /api/search/popular?city=&limit=` -- popular searches per city
  - `GET /api/admin/search/index-stats` -- admin index health

### 4. Route Wiring
- `server/routes.ts` -- imports and calls `registerSearchRoutes(app)`

### 5. Cascading Test Updates
- `tests/sprint218-city-expansion-alerting.test.ts` -- planned=0, beta=6
- `tests/sprint234-memphis-nashville-expansion.test.ts` -- planned=0, beta=6
- `tests/sprint237-memphis-beta-seed-validation.test.ts` -- planned=0, beta=6, Raleigh in beta list
- `tests/sprint241-nashville-notifications.test.ts` -- planned=0, beta=6
- `tests/sprint248-charlotte-raleigh-expansion.test.ts` -- Raleigh status "beta"

### 6. Tests
- **New:** `tests/sprint256-raleigh-search-suggestions.test.ts` -- 36 tests
  - Raleigh beta static/runtime (6)
  - Search suggestions static (8)
  - Search suggestions runtime (12)
  - Search routes static (6)
  - Integration (4)

---

## PRD Gap Status
- Search/discovery UX: suggestion infrastructure now in place (closes gap for autocomplete)
- NC expansion: both Charlotte and Raleigh in beta (closes NC planned gap)
- 0 planned cities remaining -- all 11 cities are active or beta
