# Retrospective — Sprint 314

**Date:** March 9, 2026
**Duration:** 1 session
**Story Points:** 3
**Facilitator:** Sarah Nakamura

## What Went Well

**Marcus Chen:** "Dish pages are now connected — viewing Biryani surfaces Dosa. This is the discovery loop we needed. Zero new API calls, pure client-side from CUISINE_DISH_MAP."

**Jasmine Taylor:** "The dish_search_match_tap event fills the analytics gap from Sprint 313. We can now measure: how many users discover dish leaderboards through search autocomplete vs. direct navigation."

**Amir Patel:** "The relatedDishes useMemo is clean — reverse lookup through CUISINE_DISH_MAP, filter self, done. The pattern is extensible: as we add more dishes per cuisine, the related section grows automatically."

## What Could Improve

- **Single-dish cuisines show no related section** — Mexican (taco only), Japanese (ramen only), etc. have no siblings yet. Need more dishes per cuisine.
- **No cross-cuisine discovery** — If someone views kebab, they don't see burger or pizza. Could add "Popular in {city}" fallback.
- **Related dish entry counts** — Related chips don't show how many spots are ranked. Would need the dish-leaderboards API data.

## Action Items
- [ ] Sprint 315+: Add more dishes per cuisine to CUISINE_DISH_MAP
- [ ] Future: Cross-cuisine "Popular Dishes" fallback when no siblings
- [ ] Future: Show entry counts on related dish chips (requires API data)

## Team Morale: 9/10
Dish discovery loop complete. Search → leaderboard → related dishes → deeper engagement.
