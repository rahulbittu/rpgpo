# Critique Request — Sprints 300-304

**Date:** March 9, 2026
**Requesting Team:** TopRanker Engineering
**Sprint Range:** 300-304
**Focus Area:** Dish data pipeline completion and analytics instrumentation

## What We Built

### Sprint 300 — SLT + Arch Audit #42
Governance milestone. 18th consecutive A-grade audit. badges.ts tech debt resolved.

### Sprint 301 — Entry Count Preview
Best In cards show "5 ranked" instead of "Best in Dallas". Progressive enhancement — optional prop with graceful fallback.

### Sprint 302 — Cuisine Analytics
3 events: `cuisine_filter_select`, `cuisine_filter_clear`, `dish_deep_link_tap`. Surface parameter distinguishes Rankings vs Discover. Convenience functions on Analytics object.

### Sprint 303 — Dish Seed Expansion
15 new business-dish mappings. 5 new leaderboards (pizza, pho, dosa, kebab, brisket). Total: 10 boards, 36/54 businesses have dishes.

### Sprint 304 — Dish API Flatten
Fixed API/client data mismatch. Route now returns flat `DishBoardDetail` matching the page's `DishBoardDetail` interface. Dish deep links work end-to-end.

## Questions for External Review

1. **Entry count preview** — Is "5 ranked" the right phrasing? Alternatives: "5 spots", "5 rated", "5 entries". What's most compelling for tap-through?

2. **Analytics surface parameter** — We track "rankings" vs "discover". Should we add more surfaces (e.g., "business_page", "notification") or keep it focused?

3. **Dish leaderboard count** — We went from 5 to 10 boards. Is 10 the right number for launch, or should we be more selective (top 5 highest-intent)?

4. **API mismatch pattern** — The Sprint 304 fix was a silent bug. The page rendered the error state because field names didn't match. How do other teams prevent client/server interface drift?

5. **Seed data volume** — 54 businesses, 36 with dishes, 10 leaderboards. Is this enough for a compelling demo/launch, or do we need more variety?

## Files Changed
- `lib/analytics.ts` — 3 new events + convenience functions
- `app/(tabs)/index.tsx` — Analytics tracking on cuisine chips
- `app/(tabs)/search.tsx` — Analytics tracking on cuisine/dish interactions
- `server/seed.ts` — 15 business-dish mappings + 5 new leaderboards
- `server/routes-dishes.ts` — Flatten response for client
- `components/search/BestInSection.tsx` — Entry count display
