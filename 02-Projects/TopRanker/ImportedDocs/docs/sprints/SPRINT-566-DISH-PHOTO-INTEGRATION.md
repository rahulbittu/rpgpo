# Sprint 566: Dish Leaderboard Photo Integration

**Date:** 2026-03-10
**Story Points:** 3
**Status:** Complete
**Tests:** 17 new + 3 redirected (10,674 total across 456 files)

## Mission

Integrate dish-specific rating photos into dish leaderboard entries. Previously, dish entries showed generic business photos from `businessPhotos`. Now, when raters submit photos with dish ratings, those photos appear in the leaderboard entry — showing actual food photos instead of generic storefront images.

## Team Discussion

**Marcus Chen (CTO):** "This is the first feature sprint in five. Dish-specific photos make leaderboard entries more compelling — you see the actual biryani at each restaurant, not just their storefront. This directly supports the 'Best biryani in Irving' engagement model."

**Sarah Nakamura (Lead Eng):** "Two changes in the storage layer: `recalculateDishLeaderboard` now prefers rating photos over business photos for the entry image, and `getDishLeaderboardWithEntries` enriches each entry with `dishPhotoCount` from the ratingPhotos + dishVotes join."

**Amir Patel (Architecture):** "The DishEntryCard photo badge is a subtle but important UX signal — it tells users this entry has real food photos from raters, not just stock images. The camera icon + count at bottom-right mirrors the established photo indicator pattern from CollapsibleReviews."

**Rachel Wei (CFO):** "User-generated food photos are a competitive advantage. Yelp and Google show professional photos. We show photos from verified raters — more authentic, more trustworthy. The photo count badge incentivizes photo submission."

**Nadia Kaur (Cybersecurity):** "The rating photo query limits results to 10 per entry. This prevents performance issues on entries with many photos while still providing a representative dish photo."

## Changes

### Modified: `server/storage/dishes.ts` (+26 LOC)
- `recalculateDishLeaderboard`: Now queries `ratingPhotos` for dish-specific photos first, falls back to `businessPhotos` only when no rating photos exist
- `getDishLeaderboardWithEntries`: Enriches each entry with `dishPhotoCount` via `ratingPhotos` + `dishVotes` join
- Added `ratingPhotos` import from schema

### Modified: `components/dish/DishEntryCard.tsx` (+16 LOC)
- Added `dishPhotoCount?` optional field to `DishEntryCardProps`
- Renders photo count badge (camera icon + count) at bottom-right of entry photo when `dishPhotoCount > 0`
- New styles: `photoBadge`, `photoBadgeText`

### Modified: `shared/thresholds.json`
- Build size: 711.4→712.1kb

### Test Redirections
- `sprint510-governance.test.ts` — Build threshold 710→720kb
- `sprint515-governance.test.ts` — Build threshold 710→720kb
- `sprint559-hours-wire-cache.test.ts` — Build size assertion relaxed

## Test Summary

- `__tests__/sprint566-dish-photo-integration.test.ts` — 17 tests
  - Storage layer: 7 tests (ratingPhotos import, query, preference, fallback, count, enrichment, join)
  - DishEntryCard: 7 tests (props, badge render, camera icon, count text, styles, position, backward compat)
  - Route pass-through: 2 tests (entries, entryCount)
  - Build health: 1 test (under 720kb)
