# Sprints 446–449 External Critique

## Verified wins
- Admin dietary management shipped as stated: `server/routes-admin-dietary.ts` with 4 endpoints is listed as delivered.
- Hours-based search filtering shipped: `server/hours-utils.ts` and `DiscoverFilters.tsx` with `HoursFilterChips` are explicitly included.
- City comparison feature shipped: `server/routes-city-stats.ts` and `components/business/CityComparisonCard.tsx` are included in deliverables.
- Rating UI extraction happened: `components/rate/RatingConfirmation.tsx` was extracted from `SubComponents`.
- Test count increased from 8,152 to 8,308 and test files from 339 to 344.
- Search now has 6 filter dimensions, which is a concrete expansion of the discovery surface.

## Contradictions / drift
- `CityComparisonCard` is presented as delivered, but the packet admits `bizAvg` is currently passed as `0`. That means a core comparison input is missing; the feature is visually shipped but analytically incomplete.
- The sprint claims “major component extraction,” but the only concrete extraction cited is `RatingConfirmation.tsx`, while `DiscoverFilters.tsx` is still ~370 LOC and already near the stated extraction threshold. Extraction effort appears uneven and not aligned with the growing search surface.
- Search complexity increased to 6 filter dimensions, but the architecture is already straining: hardcoded cuisine→dietary suggestions, hardcoded `America/Chicago`, and a large filter component. The product surface expanded faster than the configuration/model layer.
- `routes-city-stats.ts` runs full aggregation on every request while also introducing city-level comparison UI. Shipping an aggregation-backed card without even basic caching or precompute strategy is premature coupling of UX to non-scaled backend work.
- The packet frames Dallas scale as justification for hardcoding in multiple places. That is drift from reusable platform design toward local-case shortcuts in server logic.

## Unclosed action items
- Replace hardcoded `CUISINE_TAG_SUGGESTIONS` with a data-backed approach. Minimum acceptable path: admin-configurable or DB table, not more hardcoded expansion.
- Remove timezone hardcoding from `computeOpenStatus`. Best fit from the options given: derive timezone from city mapping now; per-business only if business-level exceptions actually exist.
- Close the `CityComparisonCard` data gap by computing real business-side dimension averages. Best placement: include in business detail response, not a separate endpoint and not duplicated client logic.
- Decide and implement a city stats caching threshold. Do not add Redis “immediately” without need, but do add instrumentation and a trigger; reactive at a measured latency threshold is the sane path.
- Extract `DiscoverFilters.tsx` before URL sync lands. Leaving a 370 LOC multi-responsibility file in place until it crosses an arbitrary 400 LOC line is avoidable debt.

## Core-loop focus score
**6/10**
- Search/filtering improvements are core-loop relevant; adding hours as a sixth filter is directly tied to discovery usefulness.
- Rating confirmation extraction is maintenance work, not core-loop impact by itself.
- City comparison is adjacent value, but shipping it with placeholder `bizAvg = 0` weakens actual user value.
- Admin dietary management helps data quality, but hardcoded suggestion logic suggests the operational model is not mature.
- Multiple infrastructure shortcuts were added in the same cycle: hardcoded timezone, hardcoded cuisine mapping, no caching plan. That lowers focus quality even if the feature choices are directionally relevant.

## Top 3 priorities for next sprint
1. **Finish the incomplete city comparison loop**
   - Compute real business dimension averages and return them in the business detail response.
   - Stop rendering comparison data against placeholder zeros.

2. **Remove hardcoded configuration from search/data logic**
   - Move cuisine→dietary suggestions to a DB/admin-configurable model.
   - Replace `America/Chicago` hardcoding with city→timezone mapping on the server.

3. **Stabilize the search UI/backend before adding more filter features**
   - Extract `DiscoverFilters` into smaller units ahead of URL sync work.
   - Add timing instrumentation for city stats queries and define a concrete caching trigger.

**Verdict:** This cycle shipped visible functionality, but too much of it rests on shortcuts or partial implementations. The clearest problem is shipping comparison UI with fake business-side averages, followed by embedding Dallas/Central-time assumptions directly into server logic while the search stack is actively expanding. The main issue is not lack of output; it is accepting incomplete and non-generalized implementations in parts of the product that are becoming central.
