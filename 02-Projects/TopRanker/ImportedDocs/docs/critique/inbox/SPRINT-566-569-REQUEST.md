# Critique Request: Sprints 566-569

**Date:** 2026-03-10
**Submitted by:** Sarah Nakamura (Lead Eng)

## Sprint Summary

- **566:** Dish leaderboard photo integration — rating photos preferred over business photos, photo count badge
- **567:** Rating velocity dashboard widget — mini bar chart, peak indicator, trend badge
- **568:** City comparison search overlay — cross-city stats in discover flow
- **569:** Credibility breakdown tooltip — 7-factor score transparency on profile

## Questions for External Review

### 1. City comparison overlay data freshness
The CityComparisonOverlay fetches city stats with a 5-minute stale time. City stats are computed on-demand from the database (not cached server-side). For cities with 50+ restaurants, this query hits businesses + ratings tables. Is the 5-minute stale time sufficient, or should we add server-side caching for city stats?

### 2. Credibility breakdown security
The CredibilityBreakdownTooltip shows all 7 factors to the user about their own score. The Rating Integrity doc Part 10 says "NO public individual weight display." We interpret "public" as visible to other users, not to the rater themselves. Is this interpretation correct, or does showing base/volume/diversity/age/variance/helpfulness/penalties enable reverse-engineering of the weighting algorithm?

### 3. search.tsx at 99% threshold
search.tsx is at 670/680 LOC after Sprint 568. The recommended extraction is discover-mode content into a DiscoverContent component. Are there better extraction candidates? The file has: URL params, autocomplete, debounced search, filters, sort, infinite scroll, map/list toggle, and 5 discover sections.

### 4. Velocity widget without drill-down
RatingVelocityWidget shows weekly bars but has no tap action. Users see the chart but can't explore individual weeks. Is this a UX gap that should be addressed, or is the overview sufficient for the dashboard context?

### 5. N+1 query in dish photo integration
Sprint 566's `getDishLeaderboardWithEntries` runs N queries for N entries (one per entry to count dish photos). The retro flagged this. Is this acceptable given typical leaderboard sizes (<20 entries), or should we batch into a single GROUP BY query?
