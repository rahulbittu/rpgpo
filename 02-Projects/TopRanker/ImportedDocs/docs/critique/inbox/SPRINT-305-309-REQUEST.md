# Critique Request — Sprints 305-309

**Date:** March 9, 2026
**Requesting Team:** TopRanker Engineering
**Sprint Range:** 305-309
**Focus Area:** Complete Category → Cuisine → Dish → Rate pipeline

## What We Built

### Sprint 305 — SLT + Arch Audit #43
19th consecutive A-grade. Governance milestone for Sprints 301-304.

### Sprint 306 — Cuisine-to-Dish Drill-Down
`CUISINE_DISH_MAP` in shared module maps 7 cuisines to dish leaderboard slugs. Rankings page shows amber dish shortcut chips when cuisine is selected.

### Sprint 307 — Dish Pagination
Client-side Show More with PAGE_SIZE=10. Hero count preserves total. "N remaining" on button.

### Sprint 308 — Cuisine Persistence
AsyncStorage save/restore for cuisine filter on both Rankings (`rankings_cuisine`) and Discover (`discover_cuisine`). Separate keys, raw setter for restore.

### Sprint 309 — Dish Rating Flow
"Rate [dish]" button on each leaderboard entry navigates to `/rate/[id]?dish=dishName`. Enhanced CTA with subtext and search icon.

## Questions for External Review

1. **CUISINE_DISH_MAP is static** — Should this be derived from API data (dish leaderboards) or maintained as a curated list? Trade-off: dynamic = automatic but noisy, static = curated but requires manual updates.

2. **Rate button on every entry card** — Is this too noisy? Alternatives: only top 3, floating action button, or sticky bottom bar.

3. **Separate persistence keys per surface** — Rankings and Discover have separate cuisine preferences. Should they sync? User might expect consistency.

4. **PAGE_SIZE=10** — Too many or too few for a dish leaderboard? Should we A/B test this?

5. **Dish engagement loop** — Browse → Rate → Leaderboard updates. Is there a missing step? Should we show "Your rating contributed to this ranking" after submission?

## Architecture Note
The full pipeline is now: Category chips → Cuisine chips → CUISINE_DISH_MAP → dish/[slug] page → /rate/[id]?dish=X → rating submission → leaderboard recalculation → updated dish page. All stages exist and are connected.
