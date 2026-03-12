# Sprint 376: Search Filter Persistence

**Date:** March 10, 2026
**Story Points:** 3
**Focus:** Persist search filters (active filter, price, view mode) across navigation via AsyncStorage

## Mission
Users lost their filter, price, and view mode selections when navigating away from the Discover screen. Sort and cuisine were already persisted (Sprint 361), but three other settings reset on every visit. This sprint adds persistence hooks for activeFilter, priceFilter, and viewMode, and removes the redundant local type definitions.

## Team Discussion

**Amir Patel (Architecture):** "Three new hooks following the exact same pattern as usePersistedSort and usePersistedCuisine — AsyncStorage read on mount, write on setter call. The FilterType validation ensures corrupted storage values don't crash the app."

**Sarah Nakamura (Lead Eng):** "search.tsx got 4 lines smaller by removing local FilterType and ViewMode type definitions. The types now live in the persistence module alongside the hooks. The screen destructures from hooks instead of useState — cleaner separation of concerns."

**Priya Sharma (QA):** "21 new tests covering all three hooks plus search screen integration. Updated sprint292 test to check for usePersistedCuisine instead of raw useState. 284 test files, 6,895 tests, all passing."

**Marcus Chen (CTO):** "Filter persistence is Constitution #3 (structured scoring, fast input). If users have to re-select their filters every time, the experience feels broken. This is table stakes UX — we should have persisted all filters from the start."

**Jasmine Taylor (Marketing):** "Returning users who selected 'Near Me' or 'Top 10' will land right back in their preferred view. Reduces friction for power users who check daily."

## Changes

### `lib/hooks/useSearchPersistence.ts` (87→142 LOC, +55 lines)
- `usePersistedFilter()` — persists active filter (All, Top 10, Challenging, etc.) to `discover_filter` key
- `usePersistedPrice()` — persists price filter to `discover_price` key, handles null removal
- `usePersistedViewMode()` — persists list/map view mode to `discover_view_mode` key
- FilterType and ViewMode type definitions moved here from search.tsx

### `app/(tabs)/search.tsx` (855→851 LOC, -4 lines)
- Replaced `useState<FilterType>` with `usePersistedFilter()`
- Replaced `useState<string | null>` (price) with `usePersistedPrice()`
- Replaced `useState<ViewMode>` with `usePersistedViewMode()`
- Removed local FilterType and ViewMode type definitions
- Added imports for new persistence hooks

### Test updates
- `tests/sprint376-filter-persistence.test.ts` (NEW — 21 tests)
- `tests/sprint292-cuisine-search-wiring.test.ts` — Updated to check persistence hook instead of raw useState

## Test Results
- **284 test files, 6,895 tests, all passing** (~3.8s)
- **Server build:** 599.3kb (unchanged)
