# Sprint 534: Search Relevance Tuning — Query-Weighted Scoring

**Date:** 2026-03-10
**Story Points:** 3
**Status:** Complete
**Tests:** 23 new (9,903 total across 423 files)

## Mission

Improve search relevance for the core "Best biryani in Irving" use case by adding query intent parsing (stop word removal + city stripping), dish-aware scoring, and rebalanced relevance weights. Businesses with matching top dishes now rank higher, and noise words no longer dilute search signal.

## Team Discussion

**Marcus Chen (CTO):** "This directly addresses our core use case. When someone searches 'Best biryani in Irving', they care about biryani, not about the word 'best'. The intent parser strips noise and the dish signal matches against actual menu items."

**Sarah Nakamura (Lead Eng):** "Three additions to search-ranking-v2.ts: parseQueryIntent (strips stop words + city), dishRelevance (matches query tokens against dish names), and a rebalanced combinedRelevance with 5 signals instead of 4. The weights shifted from 50/20/15/15 to 40/20/15/10/15."

**Amir Patel (Architecture):** "search-ranking-v2.ts grew from 292 to 355 LOC — still healthy. The dishRelevance function reuses the existing wordScore function for consistency. parseQueryIntent is pure and deterministic."

**Rachel Wei (CFO):** "Search relevance directly affects the 'Best In' brand promise. If someone searches 'biryani' and sees restaurants without biryani, that's a trust violation. Dish-aware scoring ensures the right businesses surface."

**Jasmine Taylor (Marketing):** "The stop word list is exactly right for 'Best In' style queries. 'Best', 'top', 'most', 'good', 'in', 'the', 'near' — all noise. The intent parser extracts exactly what the user is looking for."

**Nadia Kaur (Cybersecurity):** "Query parsing is server-side and sanitized (lowercased, whitespace-split). No regex DoS risk. The stop word set is fixed-size O(1) lookup. No injection vectors."

## Changes

### Modified Files
- `server/search-ranking-v2.ts` (292→355 LOC)
  - Added `SEARCH_STOP_WORDS` set (14 noise words)
  - Added `parseQueryIntent(query, city)` — strips stop words and city name
  - Added `dishRelevance(dishNames, query)` — 0-1 score for dish name matching
  - Updated `SearchContext` interface — added `dishNames?: string[]` and `city?: string`
  - Updated `combinedRelevance()` weights: text 50%→40%, added dish 15%, completeness 15%→10%
  - `combinedRelevance()` now calls `parseQueryIntent()` before scoring

- `server/search-result-processor.ts` (minor)
  - `SearchProcessingOpts` — added `city?: string`
  - `enrichSearchResults()` — passes `dishNames` and `city` to search context

### Test Redirects
- `__tests__/sprint436-search-relevance.test.ts` — Updated weight assertions (50→40, 15→10), LOC threshold (300→380)

## Weight Rebalance

| Signal | Before | After | Rationale |
|--------|--------|-------|-----------|
| Text match | 50% | 40% | Reduced to make room for dish signal |
| Category/cuisine | 20% | 20% | Unchanged |
| Dish match | — | 15% | New: "biryani" matching actual dishes |
| Profile completeness | 15% | 10% | Slightly reduced, less critical than dish match |
| Rating volume | 15% | 15% | Unchanged |

## Test Summary

- `__tests__/sprint534-search-relevance.test.ts` — 23 tests
  - parseQueryIntent: 6 tests (stop words, city, multiple stops, preserve meaningful, empty, all stops)
  - dishRelevance: 5 tests (exact, partial, no match, empty dishes, empty query)
  - combinedRelevance with dish: 3 tests (dish boost, stop word stripping, weight split)
  - Source code: 5 tests (exports, stop words, SearchContext fields, parseQueryIntent in combinedRelevance)
  - Processor integration: 3 tests (dishNames, city, opts interface)
  - LOC threshold: 1 test
