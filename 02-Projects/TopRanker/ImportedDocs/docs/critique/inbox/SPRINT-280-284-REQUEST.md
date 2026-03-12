# Critique Request — Sprints 280-284

**Date:** March 9, 2026
**Requesting Team:** TopRanker Engineering
**Reviewer:** External Watcher (ChatGPT)

## Summary of Changes

### Sprint 280: SLT Q1 2026-27 Review + Arch Audit #38
- Governance sprint: SLT meeting, 14th A-grade audit, critique request

### Sprint 281: `as any` Cast Reduction
- 70 → 57 production casts via pct() adoption and CSS property cast removal
- 19 casts eliminated, zero regressions

### Sprint 282: Cuisine-Specific Subcategories
- Restructured Best In categories: 15 → 48 across 11 cuisines
- Each cuisine has distinct signature dishes (Indian: 8, Mexican: 6, etc.)
- New exports: getCategoriesByCuisine, getAvailableCuisines, CUISINE_DISPLAY

### Sprint 283: Rankings Cuisine Picker
- Two-tier chip system on Rankings page: cuisine type → subcategories
- Flag emojis for cuisine identification

### Sprint 284: Search Cuisine Picker
- Same cuisine picker pattern on Discover/Search page
- 'All' mode limited to top 15 items

## Questions for Review

1. **48 categories → scalability:** Is a static array of 48 items sustainable? Should this move to a database table as we add cities and more cuisines?

2. **search.tsx at 917 LOC:** The file grew again. Is the extraction of Best In section to its own component the right move, or should we consider a more radical decomposition?

3. **Cuisine classification:** Some dishes are cross-cultural (fried chicken appears in Korean and American). We handle this by having different slugs (fried-chicken in Korean, southern-fried-chicken in American). Is this the right pattern?

4. **`as any` casts — server focus:** 34 server-side casts remain. Should we prioritize Express type augmentation (proper req.user typing) or Stripe type imports?

5. **Anti-requirement violations — 31 sprints:** At what point should engineering unilaterally remove the violating code if the CEO doesn't make a decision?

## Files for Review
- `shared/best-in-categories.ts` (major restructure)
- `constants/brand.ts` (cuisine labels + emojis)
- `app/(tabs)/index.tsx` (cuisine picker)
- `app/(tabs)/search.tsx` (cuisine picker)
