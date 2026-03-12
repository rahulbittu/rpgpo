# Sprint 399: Search Autocomplete Improvements

**Date:** 2026-03-09
**Type:** Feature Enhancement
**Story Points:** 3

## Mission

Enhance search autocomplete with text highlighting, cuisine category suggestions, and result count footer. Constitution #47: "Specificity creates disruption." The faster users find what they're looking for, the faster they rate. Autocomplete is the first step in the rating loop.

## Team Discussion

**Marcus Chen (CTO):** "Autocomplete is the gateway to the rating loop. Every millisecond of friction between 'I want to rate' and 'I found the restaurant' costs us a rating. Text highlighting, cuisine shortcuts, and result counts all reduce that friction."

**Jasmine Taylor (Marketing):** "When someone types 'ind' and sees 'Indian' as a cuisine chip they can tap, that's a two-tap path to every Indian restaurant. Compare that to typing 'Indian restaurant' — we just saved 15 keystrokes. That's growth."

**Amir Patel (Architecture):** "Three additive enhancements: (1) HighlightedName component bolds the query match in AMBER within business and dish names, (2) matchCuisineCategories matches against CUISINE_DISPLAY to show cuisine filter chips, (3) result count footer shows total matches. All client-side, zero new API calls."

**Priya Sharma (Frontend):** "One test cascade in sprint313 — it expected `Best {dish.name}` in JSX but HighlightedName now wraps it in a template literal `Best ${dish.name}`. Updated the test to match the new pattern."

**Sarah Nakamura (Lead Eng):** "SearchOverlays.tsx grew by ~45 LOC. It's still well-structured — HighlightedName and matchCuisineCategories are pure functions at the top, easy to extract if needed. search.tsx only added one line for the new props."

## Changes

### Modified Files
- `components/search/SearchOverlays.tsx` — Added HighlightedName component (text match highlighting), matchCuisineCategories function (cuisine filter suggestions), cuisine match chips, result count footer. +45 LOC.
- `app/(tabs)/search.tsx` — Passed `query` and `onCuisineSelect` props to AutocompleteDropdown. +1 LOC.
- `tests/sprint313-dish-search.test.ts` — Updated assertion for template literal (test cascade).

### New Files
- `tests/sprint399-autocomplete-improvements.test.ts` — 18 tests

## Test Results
- **303 files**, **7,274 tests**, all passing
- Server build: **601.1kb**, 31 tables
