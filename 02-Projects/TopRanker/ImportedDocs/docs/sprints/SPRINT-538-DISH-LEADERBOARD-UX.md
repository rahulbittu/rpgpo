# Sprint 538: Dish Leaderboard UX — Visit Type Filter + Enhanced Photos

**Date:** 2026-03-10
**Story Points:** 5
**Status:** Complete
**Tests:** 27 new (10,006 total across 427 files)

## Mission

Add visit type filtering to dish leaderboard rankings and enhance photo display. Users can now filter "Best Biryani" by dine-in, delivery, or takeaway — leaderboard re-ranks by visit-type-specific scores. Entry card photos increased to 160px height for better visual impact.

## Team Discussion

**Marcus Chen (CTO):** "Visit type separation is our competitive advantage. Extending it to dish leaderboards is the natural next step. 'Best biryani for delivery in Irving' is a question no other platform answers."

**Amir Patel (Architecture):** "The server-side implementation is clean — visit type breakdown counts come from a single grouped query on ratings.visitType. The per-business re-ranking on filtered queries joins dishVotes → ratings with a visitType predicate. No schema changes needed."

**Sarah Nakamura (Lead Eng):** "The filter chips follow the same UX pattern as the dish chip rail — horizontal pills with counts. Color-coding matches our visit type system: amber for dine-in, blue for delivery, green for takeaway. Filter resets when switching dishes."

**Rachel Wei (CFO):** "This is the first user-facing feature after two health sprints. Dish leaderboards with visit type filtering directly supports the Phase 1 marketing angle: 'Best biryani for delivery in Irving' is shareable, debatable content."

**Jasmine Taylor (Marketing):** "The visit type filter creates 3x more shareable rankings from each dish leaderboard. Instead of just 'Best biryani in Irving', we now have 'Best biryani for dine-in', 'for delivery', 'for takeaway'. Each is a separate WhatsApp conversation starter."

**Nadia Kaur (Security):** "The visitType query param is properly sanitized with sanitizeString and validated against the allowed values array. No injection risk."

## Changes

### Server
| File | Before | After | Delta |
|------|--------|-------|-------|
| `server/routes-dishes.ts` | 106 | 109 | +3 |
| `server/storage/dishes.ts` | 474 | 552 | +78 |

**Server changes:**
- `GET /api/dish-leaderboards/:slug` accepts optional `?visitType=dine_in|delivery|takeaway`
- `getDishLeaderboardWithEntries` computes `visitTypeBreakdown` (grouped count per visit type)
- When `visitType` is specified, entries are re-ranked by visit-type-specific weighted scores
- Business with no ratings for selected visit type are filtered out

### Client
| File | Before | After | Delta |
|------|--------|-------|-------|
| `components/DishLeaderboardSection.tsx` | 530 | 590 | +60 |

**Client changes:**
- `VisitTypeFilter` type: `"all" | "dine_in" | "delivery" | "takeaway"`
- `VISIT_TYPE_FILTERS` config with labels and colors (amber/blue/green)
- `visitTypeFilter` state, resets to `"all"` when switching dishes
- Visit type chips rendered below hero banner (only when multiple visit types exist)
- Each chip shows rating count for that visit type
- Chips with 0 ratings hidden
- `visitTypeFilter` added to React Query key for proper cache separation
- `visitType` query param passed to API when not "all"
- Entry card photo height increased from 130px → 160px

## Test Summary

- `__tests__/sprint538-dish-leaderboard-ux.test.ts` — 27 tests
  - Server route: 3 tests (visitType param, pass to storage, response field)
  - Server storage: 5 tests (optional param, breakdown, validation, re-ranking, return)
  - Client filter: 9 tests (type def, config, state, API param, query key, render, count, hide, reset)
  - Client photos: 3 tests (height 160, high confidence, early data)
  - Docs: 7 tests (sprint header, team, visit type, photo, retro header, retro sections)
