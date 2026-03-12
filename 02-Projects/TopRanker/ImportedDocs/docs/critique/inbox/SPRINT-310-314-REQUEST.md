# Critique Request — Sprints 310-314

**Date:** March 9, 2026
**Requesting team:** TopRanker Engineering

## Sprints Under Review

| Sprint | Feature |
|--------|---------|
| 310 | SLT-310 + Architecture Audit #44 |
| 311 | Dish shortcut chips on Discover BestInSection |
| 312 | useDishShortcuts hook (shared, live entry counts) |
| 313 | Dish search matching in autocomplete |
| 314 | Related dish rankings + dish search analytics |

## Key Technical Decisions

1. **useDishShortcuts hook** — Replaced inline CUISINE_DISH_MAP usage on both Rankings and BestInSection with a shared React Query hook that enriches static data with live entry counts. Is this the right abstraction level?

2. **Client-side dish search matching** — Instead of a server-side dish search endpoint, we filter the already-fetched dish boards array client-side in useMemo. Scales to ~50 boards easily. At what point should this move server-side?

3. **Related dishes from CUISINE_DISH_MAP** — Pure static data lookup, no API call. Trade-off: instant but won't show dishes added via admin that aren't in the static map. Should this use the API instead?

4. **DishMatch interface in SearchOverlays** — Introduced a new typed interface for dish results in autocomplete. Is the component taking on too much responsibility?

## Questions for External Review

1. The dish discovery pipeline (search → autocomplete → leaderboard → related → search) is fully client-side except for the initial data fetch. Is there a risk of data staleness that warrants more frequent refetching?

2. CUISINE_DISH_MAP is a static constant but the dish leaderboards are database-driven. What happens when an admin adds a new dish leaderboard that's not in the static map? Should we derive the map from API data?

3. The useDishShortcuts hook fetches ALL dish boards for a city, then filters by cuisine. At 19 boards this is fine. At 100+, should we add a cuisine filter to the API endpoint?

4. Sprint 314 added analytics events but no dashboard or alert for them. How should we track adoption of the dish discovery pipeline?

## Constitution Alignment Check

- **#3 (Structured scoring):** Dish leaderboards use dimensional scoring per visit type ✓
- **#5 (Live leaderboard):** Dish rankings update in real-time from weighted ratings ✓
- **#9 (Low-data honesty):** Provisional badges and "Early data" labels on thin boards ✓
- **#47 (Specificity):** "Best Biryani in Dallas" > "Best Restaurant in Dallas" ✓

## Test Coverage
- 6,010 tests, 235 files, all green
- Sprint 311-314 added 54 new tests (11+18+15+10)
