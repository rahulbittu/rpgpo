# Sprint 609: Discover Screen "Rate This" CTA

**Date:** 2026-03-11
**Story Points:** 3
**Owner:** Priya Sharma
**Status:** Done

## Mission

Add a "Rate this" button directly on discover screen business cards. Currently, users must navigate to the business detail page before they can rate. This adds a direct shortcut on every card, reducing friction in the rate → consequence → ranking loop.

## Team Discussion

**Priya Sharma (Engineering):** "Small button, big impact. The 'Rate this' CTA sits at the bottom of each BusinessCard, below the info section. It navigates directly to `/rate/[id]` with the business slug. Amber-tinted background with amber text — consistent with our brand but subtle enough not to overwhelm the card."

**Marcus Chen (CTO):** "This is the kind of core-loop improvement that compounds. Every card on the discover screen is now a potential rating entry point. Before, the path was: see card → tap card → scroll to business detail → find rate button → tap rate. Now it's: see card → tap 'Rate this'. Two steps instead of five."

**Jasmine Taylor (Marketing):** "From a growth perspective, this is a friction reducer. The more places we offer the rate action, the higher our rating submissions per week. Combined with Sprint 608's share prompt, we're creating a tighter loop: discover → rate → share → discover."

**Amir Patel (Architecture):** "Clean implementation — 12 lines of JSX and 8 lines of styles. Uses `e.stopPropagation()` to prevent the card's navigation from firing when the rate button is tapped. The same approach we use for the bookmark button."

**Sarah Nakamura (Lead Eng):** "SubComponents.tsx went from 423→445 LOC. Well within tolerance. The button design follows our pattern: amber text, amber-tinted background, small font, self-start alignment so it doesn't stretch full width."

**James Park (Engineering):** "The haptic feedback on tap is consistent with our other interactive elements. The button is small (11px font, 5px padding) — present but not pushy. Users who want it will find it; users who don't won't be bothered."

## Changes

### Modified: `components/search/SubComponents.tsx` (423→445 LOC, +22)
- Added "Rate this" `TouchableOpacity` at bottom of BusinessCard (below row3, above confTooltip)
- Star-outline icon + "Rate this" text
- `e.stopPropagation()` prevents card navigation when rate button tapped
- Navigates to `/rate/[id]` with business slug
- Added `rateCta` and `rateCtaText` styles
  - Amber-tinted background (`AMBER + 10` opacity), amber border, amber text
  - Self-start alignment, compact padding

## Metrics

| Metric | Before | After | Delta |
|--------|--------|-------|-------|
| SubComponents.tsx LOC | 423 | 445 | +22 |
| Tests | 11,327 | 11,327 | 0 |
| Server Build | 730.0kb | 730.0kb | 0 |
