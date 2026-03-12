# Sprint 493: Enhanced Search Autocomplete

**Date:** 2026-03-10
**Duration:** 1 sprint cycle
**Story Points:** 3
**Owner:** Sarah Nakamura (Lead Eng)

## Mission

Enhance search autocomplete with dish name matching and fuzzy search. "biryani" should match businesses that serve biryani, and "biriyani" (typo) should still find results. Result types tagged as business/dish for distinct UI treatment.

## Team Discussion

**Sarah Nakamura (Lead Eng):** "New pure function module search-autocomplete.ts with Levenshtein edit distance for fuzzy matching, typed suggestions (business/dish/cuisine/category), and merge+dedup logic. The autocomplete endpoint now fetches businesses AND top dishes in parallel, merges them by relevance score."

**Amir Patel (Architect):** "The fuzzy matching uses adaptive thresholds: 2 edits for queries >= 4 chars, 1 edit for shorter. This prevents false positives on short queries while being lenient on longer ones. 'biriyani' → 'biryani' is 1 edit, well within threshold."

**Marcus Chen (CTO):** "Dish-based autocomplete is a competitive advantage. When someone types 'biryani' and sees 'Biryani at Paradise Indian (42 votes)', that's more specific than any review app's autocomplete. Specificity is our moat."

**Jasmine Taylor (Marketing):** "This directly supports the 'Best biryani in Irving' marketing. When a WhatsApp user clicks our link and types 'biryani', they should immediately see dish-matched results. This closes that loop."

**Dev Kapoor (Frontend):** "The AutocompleteSuggestion interface has a type field — the client can render dish suggestions with a dish icon and business suggestions with a restaurant icon. The merged list is limited to 8 for a clean dropdown."

## Changes

### New: `server/search-autocomplete.ts` (~135 LOC)
- `editDistance(a, b)` — Levenshtein algorithm for fuzzy matching
- `isFuzzyMatch(query, target)` — prefix > contains > edit distance
- `scoreSuggestion(query, text, type)` — relevance ranking (business > dish > cuisine > category)
- `mergeSuggestions(suggestions, limit)` — dedup + sort + truncate
- `buildDishSuggestions(query, dishes)` — map dish data to typed suggestions
- `AutocompleteSuggestion` interface: id, text, subtext, type, slug, score

### Modified: `server/storage/businesses.ts` (+25 LOC)
- `getTopDishesForAutocomplete(city, limit)` — joins dishes with businesses, ordered by vote count

### Modified: `server/routes-businesses.ts` (+15 LOC)
- Autocomplete endpoint now fetches businesses AND dishes in parallel
- Merges typed suggestions using search-autocomplete functions
- Returns max 8 merged results sorted by relevance

### New: `__tests__/sprint493-search-autocomplete.test.ts` (21 tests)
- Pure functions: editDistance, isFuzzyMatch, scoreSuggestion, mergeSuggestions, buildDishSuggestions
- Storage: getTopDishesForAutocomplete query structure
- Route: parallel fetch, merge, limit

## Test Coverage
- 21 new tests, all passing
- Full suite: 9,101 tests across 382 files, all passing in ~4.9s
- Server build: 658.1kb (+4.2kb from autocomplete module)
