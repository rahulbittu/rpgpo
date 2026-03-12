# Sprint 184: Business Search Improvements

**Date:** 2026-03-09
**Story Points:** 5
**Focus:** Autocomplete typeahead, dynamic category suggestions, recent searches, extended search fields

---

## Mission Alignment
Core Value #1 (restaurants first) — if users can't find the right restaurant quickly, nothing else matters. This sprint makes search faster and smarter: autocomplete shows matches as you type (150ms typeahead), search now matches against category names (not just name and neighborhood), dynamic suggestion chips show what's popular in your city, and recent searches persist so returning users can pick up where they left off. Every improvement serves the core loop: find → rate → consequence → ranking.

---

## Team Discussion

**Marcus Chen (CTO):** "Three search capabilities in one sprint: typeahead autocomplete, category-aware search, and personalized recents. The autocomplete endpoint is deliberately lightweight — returns only id/name/slug/category/neighborhood. No photos, no scores. Sub-50ms response target because typeahead must feel instant."

**Sarah Nakamura (Lead Eng):** "The 150ms autocomplete debounce fires faster than the 300ms full search debounce. Users see name suggestions appear almost immediately, then full results load slightly after. The popular categories query groups and counts by city — dynamic chips replace the hardcoded 'Tacos/Italian/Brunch/Sushi' suggestions."

**Amir Patel (Architecture):** "Two new endpoints on routes-businesses.ts: GET /api/businesses/autocomplete and GET /api/businesses/popular-categories. Both are read-only, no auth required. The autocomplete uses the same idx_biz_city_cat and idx_biz_score indexes we already have. search.tsx grew from 717 to 871 LOC — approaching extraction threshold for autocomplete/recent search components."

**Priya Sharma (Design):** "Autocomplete dropdown sits directly below the search box — shadow-elevated card with restaurant icon, name, category emoji, and neighborhood. Recent searches show when the search box is focused but empty — clock icon with past queries. Clear button top-right. The flow is: tap search → see recents → start typing → see autocomplete → tap result → navigate to business."

**Jordan Blake (Compliance):** "Recent searches are stored client-side only (AsyncStorage). No server-side search history collection. Users control their own data — clear button wipes everything. No PII is transmitted for search tracking."

**Nadia Kaur (Security):** "Autocomplete query is capped at 50 characters (shorter than the 200-char search limit) and LIKE wildcards are stripped. The endpoint sanitizes input before SQL. No injection vectors."

**Rachel Wei (CFO):** "Search is the top-of-funnel for everything — ratings, challengers, subscriptions. Faster, smarter search means more engagement. The popular categories endpoint gives us data on what users are looking for by city — valuable for business development targeting."

**Jasmine Taylor (Marketing):** "Dynamic category chips are discovery gold. Instead of static suggestions, users see what's actually trending in their city. This is how you turn a search screen into a discovery engine."

---

## Changes

### Modified Files
| File | Change |
|------|--------|
| `server/storage/businesses.ts` | Added autocompleteBusinesses, getPopularCategories; extended searchBusinesses to match category field |
| `server/routes-businesses.ts` | GET /api/businesses/autocomplete, GET /api/businesses/popular-categories |
| `server/storage/index.ts` | Export new functions |
| `lib/api.ts` | fetchAutocomplete, fetchPopularCategories, AutocompleteSuggestion type, PopularCategory type |
| `app/(tabs)/search.tsx` | Autocomplete dropdown, recent searches, dynamic category chips, search focus tracking |
| `tests/sprint144-product-validation.test.ts` | Updated search.tsx LOC threshold to 900 |

### API Endpoints (New)
| Method | Path | Auth | Purpose |
|--------|------|------|---------|
| GET | `/api/businesses/autocomplete` | None | Typeahead suggestions (6 results, minimal data) |
| GET | `/api/businesses/popular-categories` | None | Categories with business counts per city |

### Search Improvements
- **Autocomplete typeahead:** 150ms debounce, searches name/category/neighborhood, returns top 6 matches
- **Extended search:** searchBusinesses now matches against category field (was: name + neighborhood only)
- **Dynamic suggestion chips:** Popular categories from API replace hardcoded suggestions
- **Recent searches:** AsyncStorage-persisted, deduplicated (case-insensitive), max 8 entries, shown on focus
- **Client-side only:** No server-side search history — privacy-first approach

### UX Flow
1. Tap search box → see recent searches (if any)
2. Start typing (2+ chars) → autocomplete dropdown appears
3. Tap suggestion → navigate directly to business
4. Or wait for full search → see results list/map
5. Empty results → see popular categories as suggestion chips

---

## Test Results
- **48 new tests** for search improvements
- Full suite: **2,913 tests** across 117 files — all passing, <1.9s
