# Sprint 436: Search Relevance Improvements

**Date:** 2026-03-10
**Type:** Feature — Core Loop
**Story Points:** 3

## Mission

Enhance search result ranking with multi-signal relevance scoring. The current `textRelevance` function only does exact/starts-with/contains matching — no fuzzy tolerance, no multi-word queries, no category/cuisine/neighborhood matching. Sprint 436 adds 5 new scoring signals to surface better results for ambiguous or misspelled queries.

## Team Discussion

**Marcus Chen (CTO):** "This is the first search improvement since Sprint 392. The current text matching misses results for typos ('biriyani' vs 'biryani'), multi-word queries ('best indian irving'), and doesn't reward businesses with matching cuisine or neighborhood. The new combined relevance formula gives us a solid foundation — text 50%, category/cuisine 20%, completeness 15%, volume 15%. This directly strengthens the discovery → rate loop."

**Sarah Nakamura (Lead Eng):** "The Levenshtein implementation is bounded — `maxDist=3` with early termination. For our dataset sizes (20 results max per query), performance is negligible. The `wordScore` function creates a clean abstraction: exact=1.0, starts-with=0.8, contains=0.6, fuzzy-1=0.3, fuzzy-2=0.15. Multi-word queries average the best per-token score."

**Amir Patel (Architecture):** "Search ranking v2 grew from 168 to ~260 LOC — still well under any threshold. The new exports (`levenshtein`, `wordScore`, `categoryRelevance`, `ratingVolumeSignal`, `combinedRelevance`) are all pure functions with no side effects, which makes them easy to test and reason about. The route integration is clean — `combinedRelevance(name, searchCtx)` replaces the inline scoring formula."

**Priya Sharma (Design):** "The sort hint for 'Relevant' now says 'name match, category, and rating volume' — more informative than the previous generic 'search relevance'. Users should notice better results for cuisine-specific searches like 'biryani' or 'thai irving'."

**Rachel Wei (CFO):** "Search quality directly impacts the discovery → rate funnel. If a user searches 'biryani irving' and gets relevant results, they're more likely to visit a business page and submit a rating. This is exactly the kind of core loop improvement that drives our north star metric."

**Nadia Kaur (Security):** "No new endpoints or data exposure. The Levenshtein function operates on already-sanitized input. The bounded `maxDist` parameter prevents computational DoS on long strings."

## Changes

### Modified Files
- `server/search-ranking-v2.ts` (168→~260 LOC) — Added `levenshtein`, `wordScore`, `categoryRelevance`, `ratingVolumeSignal`, `combinedRelevance`. Enhanced `textRelevance` with multi-word tokenization and improved scoring tiers. Extended `SearchContext` with `category`, `cuisine`, `neighborhood`, `ratingCount`.
- `server/routes-businesses.ts` — Updated search endpoint to use `combinedRelevance` with full search context (category, cuisine, neighborhood, ratingCount).
- `components/search/DiscoverFilters.tsx` — Updated "Relevant" sort hint text.
- `tests/sprint347-search-ranking.test.ts` — Updated for new scoring values (0.5→0.6/0.7, wordScore replaces word-starts-with).
- `tests/sprint392-search-relevance.test.ts` — Updated for `combinedRelevance` integration.

### New Files
- `__tests__/sprint436-search-relevance.test.ts` — 44 tests: Levenshtein, wordScore, textRelevance, categoryRelevance, ratingVolumeSignal, combinedRelevance, route integration, file health.

## Scoring Formula

```
combinedRelevance = textMatch × 0.50 + categoryRelevance × 0.20 + profileCompleteness × 0.15 + ratingVolume × 0.15
```

### Text Match Scoring (0-1)
- Full exact match: 1.0
- Full starts-with: 0.9
- Full contains: 0.7
- Per-word: exact=1.0, starts-with=0.8, contains=0.6, fuzzy-1=0.3, fuzzy-2=0.15
- Multi-word: average of per-token best scores

### Category Relevance (0-1)
- Cuisine exact match: 1.0
- Cuisine starts-with/contains: 0.7
- Cuisine fuzzy (1-edit): 0.4
- Category exact: 0.8, starts-with/contains: 0.5
- Neighborhood match: 0.6

### Rating Volume Signal (0-1)
- Logarithmic: log10(count) / log10(50), capped at 1.0
- 1 rating = 0, 10 = 0.5, 50+ = 1.0

## Test Results
- **331 files**, **7,866 tests**, all passing
- Server build: **604.0kb** (+2.9kb), 31 tables
- 2 test file updates (sprint347, sprint392) for new scoring values
