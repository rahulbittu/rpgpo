# Sprint 331: Extract CuisineChipRow Shared Component

**Date:** March 9, 2026
**Story Points:** 3
**Focus:** Reduce index.tsx LOC by extracting duplicated cuisine chip rendering into shared component

## Mission
The Rankings page (index.tsx) had duplicated cuisine chip rendering: once in the ListHeaderComponent (in-scroll) and once in the sticky bar (Sprint 327). Both rendered the same "All" + cuisine list with identical state management. This sprint extracts a `CuisineChipRow` component that both locations use, reducing index.tsx from 650 to 572 LOC (-78).

## Design Reference
**Before:** Two inline ScrollView blocks with identical cuisine chip rendering (30+ LOC each)
**After:** `<CuisineChipRow cuisines={...} selectedCuisine={...} onSelect={...} variant="default|sticky" />`

**Component props:**
- `cuisines` — array of cuisine slugs
- `selectedCuisine` — currently selected cuisine (null = All)
- `onSelect` — callback to set selected cuisine
- `analyticsSource` — string for Analytics tracking ("rankings", "discover")
- `variant` — "default" (in-scroll) or "sticky" (pinned bar)

## Team Discussion

**Marcus Chen (CTO):** "This is the right decomposition. Two places rendering the same UI = one component. The variant prop handles the style differences between in-scroll and sticky rendering."

**Amir Patel (Architecture):** "index.tsx dropped from 650 to 572 LOC — below the previous 600 threshold, well under the 660 threshold. The component handles its own styles, Analytics, and Haptics. The parent just passes data and callbacks."

**Sarah Nakamura (Lead Eng):** "Updated 5 test files that were checking for inline cuisine chip patterns. All now verify CuisineChipRow usage instead. Net test change: same coverage, better abstraction."

**Jasmine Taylor (Marketing):** "No user-facing changes. Same UI, cleaner code. Important for maintainability as we add more cuisines."

**Priya Sharma (QA):** "18 tests in the new sprint331 file verifying: component props, variant support, analytics integration, accessibility, import in index.tsx, usage in both sticky and scroll contexts."

## Changes
- `components/leaderboard/CuisineChipRow.tsx` — NEW: Shared component for cuisine chip rendering. Supports "default" and "sticky" variants. Handles Analytics, Haptics, accessibility. 108 LOC.
- `app/(tabs)/index.tsx` — Replaced inline cuisine chips in both sticky bar and ListHeaderComponent with `<CuisineChipRow />`. Removed 6 cuisine chip styles and 6 sticky cuisine styles. -78 LOC (650→572).
- Updated 5 test files: sprint283, sprint302, sprint323, sprint325, sprint327.

## Test Results
- **251 test files, 6,247 tests, all passing** (~3.5s)
- **Server build:** 607.4kb (under 700kb threshold)
