# Critique Request: Sprints 416-419

**Date:** 2026-03-09
**Requesting:** External review of Sprints 416-419

## Sprint Summary

### Sprint 416: Rankings Animated Transitions
- TopRankHighlight: amber shimmer border + pulse scale for #1 card
- RankDeltaBadge: animated badge with flame/trending-down for ±3 movers
- Removed redundant FadeInView wrapper (RankedCard has internal animation)

### Sprint 417: Challenger Comparison Details
- ComparisonDetails: collapsible grid with 5 stat categories
- StatRow: side-by-side values with winner highlighting in amber
- Integrated after VoteBar in ChallengeCard

### Sprint 418: Search Map Improvements
- "Search this area" button on pan/zoom
- Info windows on marker click (name, score, ratings)
- Added 6 beta city coordinates

### Sprint 419: Profile Activity Feed
- ActivityFeed: timeline with score-based icons and time ago
- ActivityRow: tappable rows linking to business detail
- Show 5 initially with show more/less toggle

## Questions for Reviewer

1. **TopRankHighlight uses Animated.loop** — The shimmer and pulse run indefinitely. Should we stop after N cycles or when scrolled off-screen to save resources?

2. **ComparisonDetails winner highlighting is numeric-only** — It compares score and rating count but not cuisine/area/price. Is this misleading, or is it obviously different enough that users won't be confused?

3. **MapView info window uses raw HTML** — No React rendering inside the map popup. Should we invest in a custom OverlayView for branded popups, or is the native InfoWindow sufficient?

4. **ActivityFeed getActivityIcon has 4 tiers** — star (8+), thumbs-up (6+), neutral (4+), thumbs-down (<4). Are these thresholds intuitive? Should we show the numeric score threshold somewhere?

5. **onSearchArea callback exists but isn't wired** — Sprint 418 added the prop to MapView, Sprint 421 will wire it in search.tsx. Is this acceptable technical debt, or should we have completed both in the same sprint?

## Metrics

- 319 test files, 7,603 tests, all passing
- Server build: 601.1kb, 31 tables
- 42 consecutive A-range audits
- All 6 key files at OK status
