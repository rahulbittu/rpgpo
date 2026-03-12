# Sprint 408: Discover Empty State Enhancements

**Date:** 2026-03-09
**Type:** Feature Enhancement
**Story Points:** 3

## Mission

Enhance the Discover empty state with contextual search suggestions, filter-specific reset actions, and quick search pills. When users hit zero results, guide them toward discovery rather than leaving them at a dead end.

## Team Discussion

**Jasmine Taylor (Marketing):** "'Did you mean?' is the most important addition. A user searches for 'biriyani' (common misspelling) and sees no results — now we suggest 'Biryani' as an alternative. That saves the user from bouncing."

**Priya Sharma (Design):** "The filter reset button is filter-aware. If 'Open Now' is active and nothing matches, we show 'Remove Open Now filter — some places may be closed' with a time icon. The message explains *why* it's empty and gives a one-tap fix."

**Marcus Chen (CTO):** "Quick search pills (Biryani, Tacos, Pizza, Sushi, Brunch, BBQ) are the fallback when there are no popular categories loaded. They serve as discovery prompts — especially valuable for new cities with sparse data."

**Amir Patel (Architecture):** "Also cleaned up 8 `as any` casts in this file — 5 `width: '100%' as any` → `pct(100)`, 3 `textTransform: 'uppercase' as any` → `'uppercase' as const`. Kept the two Ionicons name casts (external lib)."

**Sarah Nakamura (Lead Eng):** "The getSearchSuggestions function is pure — it checks CUISINE_DISPLAY keys and common food terms against the first 3 characters of the query. Limited to 3 suggestions to avoid overwhelming the user."

**Jordan Blake (Compliance):** "The onClearFilter prop is optional (backward compatible). search.tsx passes it to both list and map empty states, wired to `setActiveFilter('All')`."

## Changes

### Modified Files
- `components/search/DiscoverEmptyState.tsx` (238→290 LOC, +52)
  - Added `getSearchSuggestions()` — generates alternative search terms from CUISINE_DISPLAY and common foods
  - Added `getFilterAction()` — returns filter-specific action text and icon
  - Added `QUICK_SEARCHES` constant — 6 common food categories with emoji
  - Added "Did you mean?" section with tappable suggestion chips
  - Added filter-specific reset button with contextual messaging
  - Added quick search pills section (shown when no query, no cuisine, no popular categories)
  - Added `onClearFilter` optional prop
  - Replaced 5 `width: "100%" as any` → `pct(100)`, 3 `textTransform: "uppercase" as any` → `"uppercase" as const`
- `app/(tabs)/search.tsx` (+2 LOC) — Added `onClearFilter` prop to both DiscoverEmptyState usages

### Test Files
- `__tests__/sprint408-empty-state.test.ts` — 19 tests: search suggestions, filter reset, quick search pills, existing functionality

## Test Results
- **310 files**, **7,407 tests**, all passing
- Server build: **601.1kb**, 31 tables
- 0 test cascades (after `as any` fix)
