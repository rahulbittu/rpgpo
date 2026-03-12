# Critique Request — Sprints 295-299

**Submitted:** March 9, 2026
**Requesting review of:** Sprints 295-299 (SLT + Audit #41, badges.ts extraction, dish deep links, cuisine seed validation, rankings summary)

## Summary

Five sprints completing cuisine UX polish and resolving tech debt:
- Sprint 295: SLT Backlog Meeting + Arch Audit #41 governance checkpoint
- Sprint 296: badges.ts extraction (886 → 240 LOC)
- Sprint 297: Dish leaderboard deep links from Best In cards
- Sprint 298: Cuisine seed validation — all 10 cuisines ≥3 businesses
- Sprint 299: Rankings summary header with count + cuisine + freshness

## Questions for External Review

1. **badges.ts extraction (Sprint 296):** We split into badges.ts (types + evaluation, 240 LOC) and badge-definitions.ts (data arrays, 661 LOC). Is this the right split, or should evaluation logic also be in a separate file?

2. **Dish deep links (Sprint 297):** `onSelectDish` prefers navigation over `onSelectCategory` search. Is the ternary approach (`onSelectDish ? navigate : search`) clean enough, or should we always navigate?

3. **Seed data validation (Sprint 298):** We added 7 businesses to bring all cuisines to ≥3. The test enforces this minimum per-cuisine. Is 3 the right threshold for a meaningful leaderboard?

4. **Rankings summary (Sprint 299):** "5 Indian restaurants ranked · Updated 2 min ago" in the list header. Is this the right level of information density, or is it adding visual noise?

5. **Overall architecture:** 14 sprints (286-299) delivered the cuisine pipeline. Is the feature set complete, or are there UX gaps we're not seeing?

## Files Changed (Sprint 295-299)
- `lib/badges.ts` — Reduced to 240 LOC, imports from badge-definitions.ts
- `lib/badge-definitions.ts` — NEW: 661 LOC badge data arrays
- `components/search/BestInSection.tsx` — onSelectDish callback
- `app/(tabs)/search.tsx` — dish navigation, cuisine chip
- `app/(tabs)/index.tsx` — rankings summary header
- `server/seed.ts` — 7 new businesses (47→54)
- 5 new test files, 63 new tests
