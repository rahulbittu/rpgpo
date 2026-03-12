# Critique Request: Sprints 546-549

**Date:** 2026-03-10
**Submitted by:** Marcus Chen (CTO)
**Scope:** Feature Sprint Cycle (Query Dedup, Share Domain, Photo Indicators, Leaderboard Filters)

## Sprint Summary

| Sprint | Feature |
|--------|---------|
| 546 | Query deduplication — excludeQueries prop removes recent/popular overlap in search panel |
| 547 | Share domain alignment — topranker.app → topranker.com across all share URLs + deeplinks |
| 548 | Rating photo indicators — "Photo Verified" and "Receipt Verified" badges on rating cards |
| 549 | Leaderboard filters — server-side neighborhood + priceRange filtering with chip UI |

## Current Metrics

- 10,314 tests across 438 files
- 707.1kb server build
- 68 consecutive A-range arch grades
- 11 cities (5 active TX + 6 beta)
- 44+ admin endpoints
- Schema at 996/1000 LOC (unchanged)

## Questions for External Watcher

1. **12 test threshold redirections in 4 sprints:** Source-based tests with LOC assertions require updating every time a file grows. Sprint 549 alone had 7 redirections. Is this a sustainable testing pattern, or should we centralize thresholds (e.g., a `thresholds.json` file referenced by all tests) to reduce maintenance overhead? Would that defeat the purpose of per-sprint contracts?

2. **Share domain was broken for ~8 sprints (539-547):** WhatsApp sharing launched in Sprint 539 with topranker.app URLs, but deeplinks were configured for topranker.com. This wasn't caught because tests verified URL generation (correct) but not deeplink resolution (broken). How should we test that share URLs actually trigger deeplinks? Is there an automated check we can add to prevent domain drift?

3. **Rating photo badges show but photos don't expand yet:** Sprint 548 added "Photo Verified" badges and a fetchRatingPhotos API, but clicking the badge doesn't do anything. Is it confusing to show a photo indicator without a way to view the photo? Should we have deferred the badge UI until the carousel was ready, or is progressive disclosure acceptable here?

4. **Leaderboard filters duplicate the search page's filter pattern:** Sprint 549 added neighborhood + price chips to the Rankings page. The Discover page already has FilterChips, PriceChips, SortChips (all extracted components). Should the Rankings page use the same components, or are the UX requirements different enough to justify separate implementations?

5. **index.tsx grew 82 LOC in one sprint:** The leaderboard page went from 423→505 LOC — a 19% increase — in Sprint 549. The remediation (extract to LeaderboardFilterChips) is planned for Sprint 553. Is a 2-sprint delay between growth and extraction acceptable, or should extraction be same-sprint to prevent debt accumulation?
