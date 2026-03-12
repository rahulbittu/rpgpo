# Sprint 291: Search Cuisine Filter

**Date:** March 9, 2026
**Story Points:** 3
**Focus:** Enable cuisine filtering on Search/Discover API and autocomplete

## Mission
Close the gap identified in Sprint 289's retro: search results can now be filtered by cuisine. When a user searches on the Discover page, they can pass a cuisine filter (e.g., "indian") and results are limited to that cuisine. Additionally, typing a cuisine name (e.g., "mexican") in the search bar will match restaurants of that cuisine via the LIKE query.

## Team Discussion

**Marcus Chen (CTO):** "This completes the API layer for cuisine filtering across both surfaces — leaderboard got it in Sprint 286, and now search gets it in 291. Same pattern: optional parameter, clean fallback to unfiltered."

**Sarah Nakamura (Lead Eng):** "Three files touched: storage adds cuisine to WHERE and LIKE, route extracts the query param, client API passes it through. Minimal diff, maximum impact."

**Amir Patel (Architecture):** "The autocomplete now searches cuisine too — typing 'indian' in the typeahead returns Indian restaurants even if 'indian' isn't in the business name. That's a nice UX win."

**Jasmine Taylor (Marketing):** "For the WhatsApp campaign, users search 'biryani' and get Indian restaurants. But now they can also just type 'indian' and see the full list. Two paths to the same cuisine — that's discoverability."

**Priya Sharma (QA):** "15 tests covering storage layer, route layer, client API, and full-stack wiring. All assertions are source-level checks for the cuisine parameter flow."

## Changes
- `server/storage/businesses.ts` — `searchBusinesses()` accepts optional `cuisine` param, adds `eq(businesses.cuisine, cuisine)` to WHERE, includes `COALESCE(businesses.cuisine, '')` in LIKE search
- `server/storage/businesses.ts` — `autocompleteBusinesses()` LIKE query now includes cuisine field
- `server/routes-businesses.ts` — `/api/businesses/search` extracts `?cuisine=` query param, passes to `searchBusinesses()`
- `lib/api.ts` — `fetchBusinessSearch()` accepts optional `cuisine` param, appends `&cuisine=` to URL
- 15 tests in `tests/sprint291-search-cuisine-filter.test.ts`

## Test Results
- **212 test files, 5,690 tests, all passing** (~3.0s)
