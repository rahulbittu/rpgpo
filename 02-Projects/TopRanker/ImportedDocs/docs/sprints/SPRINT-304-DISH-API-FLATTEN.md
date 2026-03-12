# Sprint 304: Dish Leaderboard API Response Flattening

**Date:** March 9, 2026
**Story Points:** 2
**Focus:** Fix API/client data mismatch for dish leaderboard page

## Mission
The dish leaderboard page (`/dish/[slug]`) expects a flat `DishBoardDetail` object with fields like `id`, `city`, `dishName`, `entryCount` directly on the response. But the API was returning a nested structure `{ leaderboard: {...}, entries: [...] }`. This mismatch meant the page couldn't render leaderboard data correctly. Fix: flatten the response in the route handler.

## Team Discussion

**Marcus Chen (CTO):** "This is a silent bug — the page renders the error state instead of leaderboard data because `board.dishName` is undefined when the actual data lives at `result.leaderboard.dishName`. Fixing this unlocks the entire dish deep link flow."

**Amir Patel (Architecture):** "The fix goes in the route handler, not the storage layer. `getDishLeaderboardWithEntries` returns a well-structured internal representation. The route's job is to shape it for the client. One destructure + spread."

**Sarah Nakamura (Lead Eng):** "Also computing `entryCount: entries.length` in the route so the page doesn't need to derive it. The client interface stays clean — just read `board.entryCount`."

**Priya Sharma (QA):** "17 tests covering: every flattened field in the route, entryCount computation, page interface alignment, and no nested `board.leaderboard` access anywhere in the page."

**Jordan Blake (Compliance):** "This is a data integrity fix. If the leaderboard page can't display rankings, users can't verify our ranking claims. Transparency requires working pages."

## Changes
- `server/routes-dishes.ts` — Flatten `getDishLeaderboardWithEntries` result into flat object with `id`, `city`, `dishName`, `dishSlug`, `dishEmoji`, `status`, `entryCount`, `entries`, `isProvisional`, `minRatingsNeeded`
- 17 tests in `tests/sprint304-dish-api-flatten.test.ts`

## Test Results
- **225 test files, 5,865 tests, all passing** (~3.1s)
