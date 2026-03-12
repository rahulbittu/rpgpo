# Sprint 673: Leaderboard Layout Refinements

**Date:** 2026-03-11
**Points:** 2
**Focus:** Fix card padding and cuisine chip bleed on Rankings screen

## Mission

The Rankings screen had a redundant cardWrap View wrapping each ranked card. The cuisine chip row and dish shortcuts didn't extend full-bleed to screen edge. This sprint simplifies the FlatList card rendering and fixes horizontal overflow for chip rows.

## Team Discussion

**Sarah Nakamura (Lead Eng):** "The cardWrap View was adding an extra padding layer that didn't match the FlatList's own contentContainerStyle. Moving paddingHorizontal to the list container eliminates the wrapper entirely."

**Amir Patel (Architecture):** "Full-bleed chip rows with negative margins is the standard pattern for ScrollViews inside padded containers. The inner content still pads itself — the outer scroll just extends to the edge."

**Marcus Chen (CTO):** "These are the small layout details that make the app feel polished on native. Chips that stop short of the screen edge look unfinished."

**Jordan Blake (Compliance):** "Also updating the EAS submit config — placeholder Apple Team ID and ASC App ID need to be filled once the CEO enrolls in Apple Developer Program."

## Changes

### `app/(tabs)/index.tsx` (-4 LOC)
- Removed `cardWrap` View wrapper from FlatList renderItem
- Moved `paddingHorizontal` from per-card to list `contentContainerStyle`
- Removed unused `cardWrap` style

### `components/leaderboard/RankingsListHeader.tsx` (+7 LOC)
- Added `fullBleedRow` style with `marginHorizontal: -16`
- Wrapped CuisineChipRow and dishShortcutsRow in full-bleed container
- Fixed `chipsRow` to use negative margin for edge-to-edge scroll
- Removed extra paddingHorizontal from bestInHeader

## Health
- **Tests:** 11,697 pass (501 files)
- **Build:** 659.9kb
