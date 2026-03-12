# Critique Request — Sprints 315-319

**Date:** March 9, 2026
**Requesting team:** TopRanker Engineering

## Sprints Under Review

| Sprint | Feature |
|--------|---------|
| 315 | Expanded CUISINE_DISH_MAP (10→18 dishes) + SLT-315 + Audit #45 |
| 316 | Korean + Thai cuisine dish maps (5 new leaderboards) |
| 317 | DishEntryCard extraction from dish leaderboard page |
| 318 | Dish leaderboard share button for WhatsApp/social |
| 319 | Cuisine-aware empty states on Rankings |

## Key Technical Decisions

1. **CUISINE_DISH_MAP as static constant** — 10 cuisines, 26 dishes stored as TypeScript constant. Enriched at runtime with API data. Is this the right balance vs. fully API-driven?

2. **DishEntryCard extraction** — Single-use component extracted from dish page per audit recommendation. The component is self-contained with typed props. Is extraction warranted for a component used in only one place?

3. **Share API integration** — Uses React Native's built-in Share API with message + url + title. No custom share preview image generation. Is the basic share text sufficient for WhatsApp virality?

4. **Cuisine-aware empty states** — Shows dish suggestions when cuisine filter yields no results. Uses dishShortcuts already available in state. Is this the right UX, or should we show a "contribute" CTA instead?

## Questions for External Review

1. With 26 dish leaderboards, should we add a dedicated "Dishes" tab or section on the home screen? Currently dishes are discoverable only through cuisine → shortcuts, search autocomplete, or related dishes.

2. The SEED_DISHES array allows duplicate businessSlug entries (same business appears multiple times). Is this a data integrity concern or just a cosmetic issue in the seed script?

3. Rankings page is at ~640 LOC. At what point should we extract cuisine-related UI (chips, shortcuts, empty state) into a separate component?

4. Share text includes canonical URL (topranker.com/dish/biryani). For native app users, should we use a deep link (topranker://dish/biryani) instead?

## Constitution Alignment Check

- **#9 (Low-data honesty):** Cuisine-aware empty states honestly communicate when data is thin ✓
- **#14 (TopRanker brand, Best In format):** Share text uses "Best {dish} in {city}" format ✓
- **#39 (Do things that don't scale):** Manual seed data expansion for 10 cuisines ✓
- **#47 (Specificity):** 26 specific dish leaderboards create defensible content ✓

## Test Coverage
- 6,098 tests, 240 files, all green (as of Sprint 319)
