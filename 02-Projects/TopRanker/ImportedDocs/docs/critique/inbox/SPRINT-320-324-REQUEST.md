# Critique Request — Sprints 320-324

**Submitted:** March 9, 2026
**Sprints covered:** 320 (Chinese cuisine + governance), 321 (Discover empty states), 322 (Business dish rankings), 323 (Rankings cleanup), 324 (Dish badges on cards)

## Key Changes
1. **Sprint 320:** Chinese cuisine dish map (dim-sum, peking-duck, hot-pot), SLT-320 meeting, Arch Audit #46
2. **Sprint 321:** Cuisine-aware empty states on Discover page — dead-end empty states converted to dish discovery paths
3. **Sprint 322:** Full-stack business dish rankings — storage query → API route → React Query component → page integration
4. **Sprint 323:** Removed broken Best In subcategory chips — `selectedBestIn` was set but never passed to the leaderboard query
5. **Sprint 324:** Batch `getBatchDishRankings()` enriches leaderboard API with dish badges per business card

## Areas for Review
1. **Dead code removal (Sprint 323):** Was removing `selectedBestIn` the right call, or should we have wired it to the query instead?
2. **Batch query pattern (Sprint 324):** `getBatchDishRankings` limits to 3 per business. Is 3 the right max? Should it be configurable?
3. **N+1 in getBusinessDishRankings (Sprint 322):** Flagged in retro — count query per entry. The batch version avoids this but the single-business endpoint still has the N+1.
4. **Test threshold bumps:** sprint171 and sprint280 thresholds bumped for routes.ts growth. Are we bumping too freely?
5. **Navigation complexity:** Before Sprint 323 cleanup, the Rankings page had 5 filter row layers. Is this a symptom of incremental feature stacking without UX reviews?
