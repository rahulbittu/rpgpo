# Sprint 307: Dish Leaderboard Pagination

**Date:** March 9, 2026
**Story Points:** 2
**Focus:** Client-side pagination for dish leaderboard entries

## Mission
As dish leaderboards grow beyond 10 entries, rendering all cards at once creates a long scroll with no natural break point. Add "Show More" pagination that initially displays the top 10 entries and reveals more in batches of 10.

## Team Discussion

**Marcus Chen (CTO):** "Simple client-side pagination. We already fetch all entries — this just controls how many render. No API changes needed. The page stays fast because we're not loading more data, just showing more of what's already there."

**Amir Patel (Architecture):** "The hero banner and SEO metadata still show the total entry count (`board.entryCount`). Pagination only affects the visible list. Users always know the full leaderboard size."

**Sarah Nakamura (Lead Eng):** "The 'Show more (N remaining)' copy tells users exactly what's hidden. The button uses the amber brand color for consistency. When all entries are visible, the button disappears."

**Priya Sharma (QA):** "15 tests covering: pagination state, PAGE_SIZE, slicing, hasMore computation, Show More behavior, remaining count, accessibility, styles, and total count preservation."

## Changes
- `app/dish/[slug].tsx` — Added `useState` import; `PAGE_SIZE = 10`, `visibleCount` state, `allEntries`/`entries` split, `hasMore` flag; Show More button with remaining count; 2 new styles

## Test Results
- **228 test files, 5,910 tests, all passing** (~3.2s)
