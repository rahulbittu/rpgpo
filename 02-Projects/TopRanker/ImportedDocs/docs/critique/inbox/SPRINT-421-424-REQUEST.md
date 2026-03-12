# Critique Request: Sprints 421-424

**Requesting review of:** Sprints 421-424 (Search area wiring, review sorting, weekly summary, photo improvements)
**Date:** 2026-03-10
**Requested by:** Sarah Nakamura

## Sprint Summaries

### Sprint 421: Search onSearchArea Wiring
- Completed map "Search this area" feature started in Sprint 418
- 6 lines added to search.tsx: mapSearchCenter state, haversineKm filter, onSearchArea callback to MapView
- 5km radius hardcoded for filtering businesses by map center
- search.tsx: 692→698 LOC

### Sprint 422: Business Detail Review Sorting
- Added sort chips to CollapsibleReviews: Recent, Highest, Lowest, Most Weighted
- Pure client-side sorting with sortRatings function (copy + sort, no mutation)
- ReviewSortChips exported as separate component
- "Most Weighted" sort surfaces trusted rater reviews — differentiator

### Sprint 423: Rankings Weekly Summary Card
- WeeklySummaryCard shows weekly movement: climbers, drops, new entries, top climber
- computeWeeklySummary derives all data from existing rankDelta field
- Card self-hides when zero movement
- Hit `as any` threshold (78/78) — fixed with IoniconsName type from ComponentProps

### Sprint 424: Rate Flow Photo Improvements
- PhotoBoostMeter shows progressive verification % (15% per photo, 25% receipt, 50% cap)
- PhotoTips guides first-time users to take better verification photos
- Photo index badges on thumbnails
- Replaced static boost badge and hint text with new components

## Questions for External Review

1. **5km hardcoded radius** — Sprint 421 hardcodes the map search radius at 5km. Should this be dynamic based on zoom level? Is 5km appropriate for urban areas?

2. **Most Weighted sort value** — Sprint 422 surfaces credibility weight as a sort option. Does exposing weight publicly (even as a sort, not the value itself) create reverse-engineering risk per the anti-requirements?

3. **Weekly summary data accuracy** — Sprint 423 derives movement from rankDelta which reflects all-time delta, not necessarily this week's. Should we add a time-bounded delta field?

4. **Verification boost visibility** — Sprint 424 shows exact boost percentages (+15%, +25%, 50% cap) to users. Does revealing the exact boost math create gaming opportunities?

5. **`as any` threshold exhaustion** — We're at exactly 78/78 total and 35/35 client. Is this sustainable, or should thresholds be lowered to force proactive cleanup?

## Metrics

- 323 test files, 7,675 tests, all passing
- Server bundle: 601.1kb (stable 15 sprints)
- 43rd consecutive A-grade audit
- All 6 key files at OK status
