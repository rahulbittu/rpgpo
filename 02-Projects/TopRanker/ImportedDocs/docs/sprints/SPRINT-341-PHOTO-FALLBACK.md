# Sprint 341: Photo Strip Fallback Improvements

**Date:** March 9, 2026
**Story Points:** 3
**Focus:** Cuisine-specific emoji fallbacks in photo strips and SafeImage, hint text for empty photos

## Mission
When a business has no photos, the gradient fallback should communicate as much context as possible. Sprint 341 adds cuisine-specific emoji priority (e.g., showing a biryani pot emoji for Indian restaurants instead of a generic restaurant emoji), and a subtle "No photo yet" hint to encourage photo uploads.

## Team Discussion

**Sarah Nakamura (Lead Eng):** "This is a small but meaningful UX improvement. Instead of a generic fork-and-knife emoji for every restaurant, Indian restaurants now show cuisine-specific emojis. It's the kind of detail that makes the app feel thoughtful."

**Amir Patel (Architecture):** "The change touches three components — SafeImage, PhotoStrip, and DiscoverPhotoStrip — but the pattern is identical in all three: check cuisine first, fall back to category. Clean and consistent."

**Marcus Chen (CTO):** "The 'No photo yet' hint is subtle encouragement. Users who rated a place but see the hint might think 'I should add a photo next time.' It's a nudge, not a nag."

**Jasmine Taylor (Marketing):** "For WhatsApp shares, when a restaurant card shows a biryani emoji instead of a generic one, it immediately tells the recipient what kind of food we're talking about. Specificity drives engagement — that's Constitution #47."

**Priya Sharma (QA):** "22 tests covering SafeImage props, PhotoStrip wiring, DiscoverPhotoStrip wiring, and cross-component consistency. All 6,292 tests passing."

**Rachel Wei (CFO):** "No server changes, no schema changes, no build size impact. Pure client-side polish at zero infrastructure cost."

## Changes

### `components/SafeImage.tsx`
- Added `cuisine` prop (optional string)
- Added `showHint` prop (optional boolean)
- Fallback now prioritizes cuisine emoji over category emoji: `cuisineEmoji || categoryEmoji`
- Renders "No photo yet" hint text when `showHint` is true
- Added `hint` style: small font, low opacity, letter spacing

### `components/leaderboard/SubComponents.tsx`
- PhotoStrip now accepts `cuisine` prop
- Fallback branch uses `cuisineEmoji || categoryEmoji` pattern
- Added `photoStripHint` style for "No photo yet" text
- RankedCard passes `cuisine={item.cuisine}` to PhotoStrip

### `components/search/SubComponents.tsx`
- DiscoverPhotoStrip now accepts `cuisine` prop
- Fallback branch checks cuisine emoji first, falls back to category
- DiscoverCard passes `cuisine={item.cuisine}` to DiscoverPhotoStrip

### Tests
- `tests/sprint341-photo-fallback.test.ts` — 22 tests covering:
  - SafeImage cuisine prop, showHint prop, emoji priority, hint styling
  - PhotoStrip cuisine wiring, fallback pattern, hint style
  - DiscoverPhotoStrip cuisine wiring, fallback pattern
  - Cross-component consistency checks

## Test Results
- **257 test files, 6,292 tests, all passing** (~3.6s)
- **Server build:** 590.5kb (unchanged)

## Constitution Alignment
- **#47:** Specificity creates disruption — cuisine-specific emojis are more specific than category
- **#3:** Structured scoring, not essays — visual indicators convey information efficiently
- **#9:** Low-data honesty — "No photo yet" is honest about missing data
