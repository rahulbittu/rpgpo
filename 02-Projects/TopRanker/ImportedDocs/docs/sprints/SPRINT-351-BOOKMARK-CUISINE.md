# Sprint 351: Wire Cuisine into Bookmark Creation Sites

**Date:** March 9, 2026
**Story Points:** 2
**Focus:** Pass cuisine field through all 3 bookmark creation sites so SavedRow displays cuisine-specific emoji

## Mission
Sprint 349 added cuisine to the BookmarkEntry interface and SavedRow display, but the field wasn't being populated at any of the 3 bookmark creation sites. Audit #52 flagged this as low-priority item L2. This sprint wires cuisine through all call sites.

## Team Discussion

**Sarah Nakamura (Lead Eng):** "Three call sites, one pattern. Business detail, Discover cards, and Rankings cards all needed the same one-line change — adding `cuisine: item.cuisine ?? undefined` to the toggleBookmark meta object."

**Amir Patel (Architecture):** "The nullish coalescing (`?? undefined`) is intentional — it converts `null` (from the API) to `undefined` (matching the optional interface field). Clean and defensive."

**Priya Sharma (QA):** "19 tests covering all 3 sites plus cross-cutting consistency checks. The test that verifies no toggleBookmark call exists without cuisine is the guardrail for future call sites."

**Marcus Chen (CTO):** "This was flagged in Audit #52 as L2 and planned for Sprint 351 in SLT-350. Governance identified the gap, roadmap prioritized it, sprint delivered it. That's the process working."

**Jordan Blake (Compliance):** "Cuisine data in bookmarks is user-facing metadata, not a ranking signal. No compliance concerns."

## Changes

### `lib/bookmarks-context.tsx`
- Updated `toggleBookmark` implementation signature to include `cuisine?: string` in meta type
- Meta spread already captures cuisine when present: `{ id: businessId, ...meta, savedAt: Date.now() }`

### `app/business/[id].tsx`
- Line 186: Added `cuisine: business.cuisine ?? undefined` to toggleBookmark call

### `components/search/SubComponents.tsx`
- Line 124: Added `cuisine: item.cuisine ?? undefined` to Discover card toggleBookmark call

### `components/leaderboard/SubComponents.tsx`
- Line 323: Added `cuisine: item.cuisine ?? undefined` to Rankings card toggleBookmark call

### `tests/sprint351-bookmark-cuisine.test.ts` (NEW — 19 tests)
- BookmarksContext cuisine support (5 tests)
- Business detail bookmark creation (4 tests)
- Discover card bookmark creation (4 tests)
- Rankings card bookmark creation (4 tests)
- Cross-cutting consistency (2 tests)

## Test Results
- **265 test files, 6,462 tests, all passing** (~3.6s)
- **Server build:** 593.7kb (unchanged)
