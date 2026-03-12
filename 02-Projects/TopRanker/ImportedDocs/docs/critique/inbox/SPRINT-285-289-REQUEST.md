# Critique Request — Sprints 285-289

**Date:** March 9, 2026
**Requesting Team:** TopRanker Engineering
**Reviewer:** External Watcher (ChatGPT)

## Summary of Changes

### Sprint 285: SLT Review + Arch Audit #39
- Governance sprint: SLT meeting, 15th A-grade audit, critique request for 280-284

### Sprint 286: Cuisine Column + Seed Expansion
- Added `cuisine` as nullable column in businesses schema with index
- Expanded seed data from 35 to 47 businesses across 10 cuisines
- Indian Dallas focus: 5 restaurants in Irving/Plano/Frisco/Richardson
- New API: `GET /api/leaderboard/cuisines`, `?cuisine=` filter on leaderboard
- 29 new tests

### Sprint 287: BestIn Section Extraction
- Extracted ~115 LOC Best In section from search.tsx into `components/search/BestInSection.tsx`
- search.tsx reduced from 917 to 802 LOC
- Zero API changes, purely UI extraction
- 18 new tests

### Sprint 288: Cuisine Types + Mock Data
- Added `cuisine` to `ApiBusiness`, `MappedBusiness`, `mapApiBusiness`
- Updated all 10 mock businesses with cuisine tags
- 5 new tests

### Sprint 289: Cuisine Display on Cards
- Added cuisine with flag emoji to HeroCard, RankedCard, and BusinessCard meta lines
- Visual format: 'Restaurants -> Indian -> Irving -> $$$'
- 8 new tests

## Questions for Review

1. **Cuisine as text column vs enum:** We stored cuisine as a nullable text field. Should this be an enum or a separate lookup table? As we add cities, cuisines may vary (Dallas has strong Indian/Mexican, Memphis may have BBQ/Southern). Is freeform text the right storage strategy?

2. **Seed data scaling:** 47 businesses is good for testing but nowhere near production. When real users start submitting, the seed data becomes noise. Should we have a mechanism to mark seed businesses as "staff-seeded" and eventually deprecate them?

3. **BestIn extraction pattern:** We extracted one section from search.tsx. Should we apply the same pattern proactively to other large files (badges.ts at 886 LOC, routes.ts at 510 LOC) or wait until they approach thresholds?

4. **Indian Dallas focus — is it enough?** 5 Indian restaurants across Irving/Plano/Frisco/Richardson. Phase 1 targets 50 restaurants. Should we be more aggressive with Indian seed data, or is 5 the right starting point before real users contribute?

5. **Anti-requirement violations — 33 sprints:** Sprint 253 (business-responses) and Sprint 257 (review-helpfulness) still exist in the codebase. At what point does engineering remove them without CEO authorization, and what governance mechanism should exist for this?

## Files for Review
- `shared/schema.ts` (cuisine column)
- `server/seed.ts` (47 businesses, 10 cuisines)
- `components/search/BestInSection.tsx` (extracted component)
- `lib/api.ts` (cuisine types)
- `components/leaderboard/SubComponents.tsx` (cuisine display)
- `components/search/SubComponents.tsx` (cuisine display)
