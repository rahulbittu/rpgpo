# Sprint 349: Profile Saved Places Improvements

**Date:** March 9, 2026
**Story Points:** 3
**Focus:** Cuisine-specific emoji, relative saved date, optional remove button in saved places

## Mission
The saved places section on the profile page shows bookmarked businesses but lacks context. Sprint 349 adds cuisine-specific emoji (biryani restaurant shows Indian emoji instead of generic fork), relative saved date ("2d ago", "Yesterday"), and an optional remove button for inline unbookmarking.

## Team Discussion

**Sarah Nakamura (Lead Eng):** "The savedTimeAgo helper handles 5 time ranges: Today, Yesterday, days ago, weeks ago, months ago. Simple and human-readable — no moment.js dependency needed."

**Marcus Chen (CTO):** "Cuisine-specific emoji in saved places follows the same pattern we established in Sprint 341 for photo strip fallbacks. Consistent design language across the app."

**Amir Patel (Architecture):** "BookmarkEntry now has an optional cuisine field. Existing bookmarks without cuisine still work — the emoji falls back to category. Zero migration needed."

**Jasmine Taylor (Marketing):** "When users see their saved list with specific cuisine emojis and saved dates, it feels like a personal food journal. That's engagement through personalization."

**Priya Sharma (QA):** "20 new tests covering cuisine priority, time ago ranges, remove button behavior, and meta row styling. 6,443 tests total."

**Rachel Wei (CFO):** "The remove button is opt-in via onRemove prop. The profile page doesn't use it yet — it's wired for the /saved full-page view. Clean progressive enhancement."

## Changes

### `lib/bookmarks-context.tsx`
- Added `cuisine?: string` to BookmarkEntry interface
- Updated toggleBookmark meta type to accept cuisine

### `components/profile/SavedRow.tsx` (45→73 LOC)
- `savedTimeAgo()` helper: Today / Yesterday / Xd ago / Xw ago / Xmo ago
- Cuisine-specific emoji: checks `entry.cuisine` first, falls back to `entry.category`
- `onRemove` optional prop: shows close-circle-outline instead of chevron
- `savedMeta` row: category label + saved date side by side
- Updated accessibility label to include saved date

### Tests
- `tests/sprint349-saved-places.test.ts` — 20 tests

## Test Results
- **264 test files, 6,443 tests, all passing** (~3.6s)
- **Server build:** 593.7kb (unchanged)

## Constitution Alignment
- **#47:** Specificity — cuisine-specific emojis in bookmarks
- **#9:** New users see progress — saved places show when they saved, creating a timeline
- **#10:** Premium feel, free access — polished saved places UI
