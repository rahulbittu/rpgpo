# Critique Request — Sprints 290-294

**Submitted:** March 9, 2026
**Requesting review of:** Sprints 290-294 (SLT + Audit #40, Search Cuisine Filter, Cuisine Search Wiring, Cuisine Indicator, Map Cuisine Indicator)

## Summary

Five sprints completing the cuisine filtering UX pipeline:
- Sprint 290: SLT Backlog Meeting + Arch Audit #40 governance checkpoint
- Sprint 291: Search API cuisine filter + autocomplete cuisine matching
- Sprint 292: BestInSection → search results wiring via onCuisineChange callback
- Sprint 293: Active cuisine indicator chip above search results (list view)
- Sprint 294: Cuisine indicator in map view + map card cuisine display

## Questions for External Review

1. **Callback prop pattern (Sprint 292):** We wire BestInSection to search.tsx via `onCuisineChange` callback. Is this the right abstraction level, or should we use a shared context/store for cross-component cuisine state?

2. **Query key design:** `["search", city, debouncedQuery, selectedCuisine]` — is including cuisine in the query key sufficient for cache correctness, or should we also invalidate on cuisine change?

3. **search.tsx growth (802 → 862 LOC):** Added 60 LOC for cuisine indicators. Still under 950 threshold. At what point should we extract the filter indicator logic to a separate component?

4. **Style reuse (Sprint 294):** Map view cuisine chip reuses `activeCuisineRow`/`activeCuisineChip` styles defined once in StyleSheet. Is this sufficient, or should these become shared styles in a constants file?

5. **Anti-requirement violations aging (38 sprints):** Business-responses and review-helpfulness code still exists without CEO decision. Should the engineering team take unilateral action to remove these, or continue waiting for CEO input?

## Files Changed (Sprint 290-294)
- `server/storage/businesses.ts` — cuisine in searchBusinesses + autocomplete
- `server/routes-businesses.ts` — ?cuisine= param
- `lib/api.ts` — fetchBusinessSearch cuisine param
- `components/search/BestInSection.tsx` — onCuisineChange callback
- `app/(tabs)/search.tsx` — selectedCuisine state, query key, indicator chips, map view
- 4 new test files, 47 new tests
