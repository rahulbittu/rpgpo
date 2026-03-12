# Sprint 372: Search Results Card Polish

**Date:** March 10, 2026
**Story Points:** 3
**Focus:** Enhance Discover BusinessCard with Google rating comparison, NEW badge, and claimed indicator

## Mission
Search results cards lacked competitive context. Users couldn't see how TopRanker scores compared to Google, identify newly listed businesses, or distinguish claimed businesses. This sprint adds three visual enhancements to the BusinessCard component: Google rating comparison display, NEW badge for low-rating businesses, and claimed/verified badge.

## Team Discussion

**Amir Patel (Architecture):** "Three lightweight additions to BusinessCard — all guarded by optional fields. No new API calls, just surface data already available in MappedBusiness. The type extensions are backward-compatible optional fields."

**Sarah Nakamura (Lead Eng):** "The Google rating displays as 'G 4.2' next to the TopRanker score — concise comparison without cluttering the card. The NEW badge only shows for 1-4 ratings, so it disappears naturally as businesses accumulate ratings."

**Priya Sharma (QA):** "16 new tests covering all three features plus type extensions and style completeness. 281 test files, 6,839 tests, all passing. The file size guard confirms SubComponents.tsx stays under 650 LOC."

**Marcus Chen (CTO):** "This is direct Constitution compliance — Principle #4 (visible consequence) and #9 (low-data honesty). The NEW badge surfaces provisional state. The Google comparison lets users see our differentiated scoring at a glance."

**Jasmine Taylor (Marketing):** "The Google comparison is a marketing asset. When users see TopRanker's score diverge from Google's, it sparks curiosity — 'Why is this place rated higher here?' That drives engagement and sharing, especially in WhatsApp groups."

## Changes

### `components/search/SubComponents.tsx` (585→588 LOC, +3 lines)
- Added Google rating display (`G {rating}`) in cardRow3, guarded by null + zero check
- Added NEW badge for businesses with 1-4 ratings (ratingCount > 0 && < 5)
- Added claimed badge (shield-checkmark icon) for `isClaimed` businesses
- Added 3 new styles: `cardGoogleRating`, `newBadge`, `newBadgeText`

### `types/business.ts` (21→23 LOC, +2 lines)
- Added `googleRating?: number` optional field
- Added `isClaimed?: boolean` optional field

### Test updates
- `tests/sprint372-search-card-polish.test.ts` (NEW — 16 tests)

## Test Results
- **281 test files, 6,839 tests, all passing** (~3.7s)
- **Server build:** 599.3kb (unchanged)
