# Sprint 633: Rankings/Discover Alignment Fix + Search Relevance Tuning

**Date:** 2026-03-11
**Type:** CEO Feedback Fix + Search Improvement
**Story Points:** 3
**Status:** COMPLETE

## Mission

Fix double-padding alignment bug on Rankings and Discover pages. Category chips, cuisine filters, price/dietary/hours filter rows were all indented 32px instead of 16px due to FlatList contentContainerStyle padding stacking with child component padding. Also add city-matching and action URL presence signals to search relevance scoring.

## Team Discussion

**Priya Sharma (Design):** "The alignment bug was subtle but pervasive. Every horizontal scroll row in both Rankings and Discover started 16px too far right because the FlatList adds its own padding to all children including the ListHeader."

**Sarah Nakamura (Lead Eng):** "The fix: remove paddingHorizontal from FlatList contentContainerStyle on both screens, and wrap each renderItem in a View with 16px horizontal padding. This way the ListHeader ScrollViews get full-bleed alignment while cards get correct margins."

**Amir Patel (Architecture):** "The search relevance tuning adds two signals: hasActionUrls boosts profile completeness, and cityMatchBonus gives a 6% weight to businesses matching the user's searched city. Rebalanced weights: text 38%, category 18%, dish 14%, completeness 10%, volume 14%, city 6%."

**Marcus Chen (CTO):** "CEO has been consistent: alignment matters. This double-padding bug affected the visual start line of all chip rows. Fix is minimal — 4 lines changed per screen."

## Changes

### Modified Files
- `app/(tabs)/index.tsx` — Removed paddingHorizontal from FlatList list style, added cardWrap for renderItem
- `app/(tabs)/search.tsx` — Same pattern: removed paddingHorizontal from resultList, added resultCardWrap
- `server/search-ranking-v2.ts` — Added hasActionUrls and businessCity to SearchContext, cityMatchBonus function, rebalanced combinedRelevance weights
- `server/search-result-processor.ts` — Passes hasActionUrls and businessCity to search context
- `shared/thresholds.json` — Build 629.9→630.5kb

### New Files
- `__tests__/sprint633-search-relevance.test.ts` — 14 tests

## Verification
- 11,694 tests passing across 501 files
- Server build: 630.5kb (< 750kb ceiling)
- 30 tracked files, 0 threshold violations
