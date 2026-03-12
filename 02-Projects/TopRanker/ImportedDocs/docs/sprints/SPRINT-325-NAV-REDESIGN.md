# Sprint 325: DoorDash-Style Navigation Redesign

**Date:** March 9, 2026
**Story Points:** 5
**Focus:** Move all filter rows into scroll content — small top, big middle, small bottom

## Mission
The Rankings page had ~200px of fixed filter rows (category chips + cuisine picker + dish shortcuts) above the fold before any ranking content appeared. Users scrolled through filters instead of seeing restaurants. This sprint applies the DoorDash/Uber/Grab navigation pattern: minimal fixed header (logo + search), all content scrolls together in one continuous feed.

## Design Reference
**Uber/DoorDash/Grab pattern:**
- **Small top (fixed):** Logo + location + search bar — ~100px
- **Big middle (scrollable):** Categories, filters, hero card, ranked cards — fills 80%+ of screen
- **Small bottom (fixed):** Tab bar icons — ~50px

**Before:** Header → Search → Category → Cuisine → Dish → Rankings (5 fixed sections, ~300px before content)
**After:** Header → Search → [FlatList: Category → Cuisine → Dish → Hero → Rankings] (2 fixed sections, ~120px)

## Team Discussion

**Marcus Chen (CTO):** "This is the correct architecture. DoorDash, Uber, and Grab all put filters IN the scroll. The user sees restaurants immediately — filters are discoverable by scrolling up, not blocking the view. Our old layout was a filter-heavy desktop pattern on a mobile app."

**Amir Patel (Architecture):** "Moved category chips, 'Best In' cuisine picker, and dish shortcuts into FlatList's ListHeaderComponent. Removed getItemLayout since the header is now variable height. The fixed area is now just logo + city picker + search bar — about 100px on mobile."

**Sarah Nakamura (Lead Eng):** "The scroll behavior is natural: user opens app → sees the #1 restaurant immediately → scrolls up to filter by cuisine → scrolls down through rankings. No more wall of chips before content."

**Jasmine Taylor (Marketing):** "The WhatsApp demo video improves dramatically. Before: 'here's filters, here's more filters, oh here's the actual ranking.' After: 'here's the #1 restaurant, tap Indian for biryani rankings.' Content first, filters discoverable."

**Rahul Pitta (CEO):** "This is what I meant by 'category cuisine and dish is one workflow.' Not five separate rows — one continuous scroll where you discover and filter as you go. Like DoorDash where food categories are in the scroll, not above it."

**Priya Sharma (QA):** "10 tests verifying: category/cuisine/dish are inside ListHeaderComponent, header/search stay fixed above it, getItemLayout removed, all filter functionality preserved."

## Changes
- `app/(tabs)/index.tsx` — Moved category chips, cuisine picker, and dish shortcuts from fixed position into FlatList ListHeaderComponent. Removed getItemLayout. Fixed area reduced to ~100px (header + search).

## Test Results
- **246 test files, 6,181 tests, all passing** (~3.5s)
