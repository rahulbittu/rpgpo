# Retrospective — Sprint 312

**Date:** March 9, 2026
**Duration:** 1 session
**Story Points:** 3
**Facilitator:** Sarah Nakamura

## What Went Well

**Marcus Chen:** "Clean hook extraction. Both Rankings and BestInSection now use the same data source. The React Query cache means one API call serves both surfaces."

**Amir Patel:** "CUISINE_DISH_MAP stays as the authoritative source for cuisine→dish associations. The hook enriches it with live data. When we add a new cuisine→dish mapping to the static file, the hook automatically fetches its entry count."

**Sarah Nakamura:** "Entry counts on dish chips are a nice progressive enhancement. '🍛 Best Biryani · 3' is more informative than just '🍛 Best Biryani'. And if the API fails, chips still render without counts."

## What Could Improve

- **Still semi-static** — The cuisine→dish association still requires a code change in CUISINE_DISH_MAP. True dynamic would derive associations from leaderboard metadata (adding a `cuisine` column to dish_leaderboards table).
- **No loading state** — Dish chips show without entry counts until the API responds, then flash in. Should consider skeleton or defer rendering.
- **Shared cache could be stale** — If a user rates and the leaderboard updates, the 120s stale time means the count doesn't update immediately.

## Action Items
- [ ] Sprint 313: Dish photo upload in rating flow
- [ ] Future: Add `cuisine` column to dish_leaderboards for fully dynamic mapping
- [ ] Future: Optimistic updates for entry counts after rating

## Team Morale: 8/10
Good refactor. Hook pattern reduces duplication and adds live data enrichment.
