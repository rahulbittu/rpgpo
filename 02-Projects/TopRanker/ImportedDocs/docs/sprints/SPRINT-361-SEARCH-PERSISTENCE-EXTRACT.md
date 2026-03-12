# Sprint 361: Extract Search Persistence Hooks

**Date:** March 10, 2026
**Story Points:** 2
**Focus:** Extract sort, cuisine, recent searches, and discover tip persistence from search.tsx into reusable hooks

## Mission
search.tsx reached 900 LOC after Sprints 352 and 357. Audit #54 flagged it approaching the 1000 threshold. This sprint extracts all AsyncStorage persistence logic into `lib/hooks/useSearchPersistence.ts`, reducing search.tsx by 45 lines.

## Team Discussion

**Amir Patel (Architecture):** "Four hooks extracted: usePersistedSort, usePersistedCuisine, useRecentSearches, useDiscoverTip. Each encapsulates its own state, persistence, and restore logic. search.tsx dropped from 900 to 855 LOC."

**Sarah Nakamura (Lead Eng):** "Same pattern as the useRatingAnimations extraction in Sprint 346. Move logic, import the hook, update tests. The hooks are fully self-contained with useEffect for restore and useCallback for persist."

**Priya Sharma (QA):** "Updated 5 existing test files to check the hook file for persistence assertions instead of search.tsx. Tests that check search.tsx for UI behavior remain unchanged. 6,620 total tests, +1 from a new import check."

**Marcus Chen (CTO):** "This follows the governance loop: Audit #54 identified the growth, SLT-360 scheduled the extraction, Sprint 361 delivered it. 45 lines extracted is exactly the kind of focused refactoring that keeps the codebase healthy."

## Changes

### `lib/hooks/useSearchPersistence.ts` (NEW — 88 LOC)
- **usePersistedSort():** Sort state + AsyncStorage persist/restore
- **usePersistedCuisine():** Cuisine filter state + persist/restore
- **useRecentSearches():** Recent searches array + save/clear/restore
- **useDiscoverTip():** Discover tip dismissed state + dismiss callback

### `app/(tabs)/search.tsx` (900→855 LOC, -45 lines)
- Replaced inline persistence logic with 4 hook calls
- Replaced `AsyncStorage.setItem("discover_tip_dismissed"...)` with `dismissDiscoverTip`
- Added import for extracted hooks

### Test updates (5 files)
- `sprint106-cross-dept.test.ts` — Check hook for discover tip patterns
- `sprint107-full-team.test.ts` — Check hook for discover tip key
- `sprint184-search-improvements.test.ts` — Check hook for recent searches patterns
- `sprint308-cuisine-persistence.test.ts` — Check hook for cuisine patterns
- `sprint357-sort-persistence.test.ts` — Check hook for sort patterns

## Test Results
- **272 test files, 6,620 tests, all passing** (~3.6s)
- **Server build:** 596.3kb (unchanged)
