# Sprint 327: Sticky Cuisine Chips on Scroll

**Date:** March 9, 2026
**Story Points:** 3
**Focus:** DoorDash-style sticky category bar — cuisine chips pin to top when scrolled past

## Mission
When users scroll down the Rankings page, the cuisine chips (Indian, Chinese, Mexican, etc.) disappear off screen. DoorDash solves this with a sticky category bar: when the category row scrolls past the top edge, a fixed copy appears at the top of the screen with a subtle shadow. This sprint implements that pattern for cuisine chips on the Rankings page.

## Design Reference
**DoorDash sticky category bar:**
- User scrolls → categories disappear above viewport
- Fixed category bar appears at top with shadow
- Tap a category → filters the list without scrolling back up
- Bar disappears when user scrolls back to the original category row

**Implementation:**
- Track scroll position via `onScroll` + `scrollEventThrottle={16}`
- When `scrollY > 80px`, show sticky cuisine bar below fixed header
- Sticky bar mirrors the in-scroll cuisine chips (same state, same analytics)
- Shadow + border-bottom for visual separation

## Team Discussion

**Marcus Chen (CTO):** "This is the second half of the DoorDash pattern. Sprint 325 put filters in the scroll. Sprint 327 makes the most-used filter (cuisine) sticky. Users can filter by cuisine at any scroll position."

**Amir Patel (Architecture):** "Simple state-based approach: `showStickyCuisine` toggles on scroll threshold. No Animated API needed — the bar appears/disappears, doesn't animate. The onScroll handler only updates state when the threshold crossing changes, avoiding unnecessary re-renders."

**Sarah Nakamura (Lead Eng):** "The sticky bar uses the same `setSelectedCuisine` callback and Analytics events as the in-scroll chips. One source of truth for cuisine state. Scroll threshold of 80px accounts for category chips (~52px) + bestIn header (~25px)."

**Jasmine Taylor (Marketing):** "This solves the UX gap from Sprint 325 retro: 'When user scrolls past the cuisine chips, they disappear.' Now they stick. The app feels like DoorDash — categories are always one tap away."

**Priya Sharma (QA):** "12 tests verifying: sticky bar appears on scroll, threshold defined, onScroll handler present, Analytics fires on sticky bar taps, existing in-scroll chips preserved."

**Rahul Pitta (CEO):** "This completes the navigation story. Sprint 323 cleaned up broken features, 325 put filters in scroll, 326 applied to Discover, 327 makes cuisine sticky. The ranking page now feels like a real food app."

## Changes
- `app/(tabs)/index.tsx` — Added `showStickyCuisine` state, `CUISINE_STICKY_THRESHOLD = 80`, `onScroll` handler with `scrollEventThrottle={16}`. Sticky cuisine bar renders below fixed header when threshold crossed. 6 new styles: `stickyCuisineBar`, `stickyCuisineContainer`, `stickyCuisineChip`, `stickyCuisineChipActive`, `stickyCuisineText`, `stickyCuisineTextActive`. +71 LOC (579→650).

## Test Results
- **248 test files, 6,208 tests, all passing** (~3.3s)
- **Server build:** 606.6kb (under 700kb threshold)
