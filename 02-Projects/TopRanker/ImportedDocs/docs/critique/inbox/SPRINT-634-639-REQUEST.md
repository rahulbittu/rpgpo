# Critique Request: Sprints 634-639

**Date:** 2026-03-11
**Requesting:** External review of 6 sprints addressing CEO visual feedback + feature additions

## Sprints Under Review

### Sprint 634: Alignment Fix Complete
- Fixed BestInSection.tsx double-padding (4 styles: bestInHeader, cuisineTabsScroll, dishShortcutsScroll, bestInScroll)
- Pattern: ScrollViews get `marginHorizontal: -16` to cancel FlatList padding; Views remove their own paddingHorizontal
- 15 total components fixed across Sprints 633-634

### Sprint 635: Map Blue Dot + Filter Spacing
- Added blue dot SVG marker for user location on Google Maps
- Auto-pan on first location acquisition
- Tightened Discover filter row spacing from 6px to 2px

### Sprint 636: Dynamic OG Image Generation
- Server-side SVG generation endpoints: `/api/og-image/business/:slug`, `/api/og-image/dish/:slug`
- 1200×630 branded cards with rank, score, category, TopRanker branding
- Updated prerender middleware to use dynamic OG image URLs

### Sprint 637: Rating Flow Progress Dots
- Replaced continuous fill bar with numbered step dots + checkmarks
- Completed steps show gold circles with checkmark, current step has gold border + shadow

### Sprint 638: Profile Quick Stats Row
- Compact 4-stat row: ratings, places, streak, tier
- Removed dead ActivityFeed import

### Sprint 639: Proximity Search Signal
- Distance-decayed proximity signal (8% weight) in combinedRelevance
- Rebalanced all 7 relevance weights

## Questions for Reviewer

1. **OG Image SVG**: Many social platforms (WhatsApp, Facebook) don't reliably render SVG og:images. Should we add PNG conversion? What's the tradeoff?
2. **Proximity weight at 8%**: Is this too much? Too little? How should we validate it doesn't degrade quality for non-local searches?
3. **FlatList padding pattern**: We established marginHorizontal: -16 as the fix. Is there a better architectural approach to prevent this class of bug?
4. **Profile section count**: Still 13+ sections. The CEO simplification mandate says "remove before adding." Should we more aggressively consolidate?
