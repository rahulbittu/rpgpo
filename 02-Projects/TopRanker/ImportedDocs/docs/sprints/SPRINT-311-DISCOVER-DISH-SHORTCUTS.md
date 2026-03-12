# Sprint 311: Discover Page Dish Shortcuts (BestInSection)

**Date:** March 9, 2026
**Story Points:** 2
**Focus:** Add dish leaderboard shortcuts to BestInSection component on Discover

## Mission
Sprint 306 added dish shortcuts to the Rankings page. The Discover page uses BestInSection which has its own cuisine picker — but no dish drill-down. Parity: when a cuisine is selected in BestInSection, show dish shortcut chips that navigate to dish leaderboards.

## Team Discussion

**Marcus Chen (CTO):** "UX parity between surfaces. If Rankings has dish shortcuts when Indian is selected, Discover should too. Same CUISINE_DISH_MAP, same amber chips, same navigation."

**Amir Patel (Architecture):** "The change is entirely in BestInSection.tsx — a shared component. Both Discover and any future surface using BestInSection get dish shortcuts automatically."

**Sarah Nakamura (Lead Eng):** "The dish chips appear between the cuisine tabs and the Best In cards — a natural visual hierarchy: Cuisine → Dish → Category. The `onSelectDish` callback already exists on the component props."

**Priya Sharma (QA):** "11 tests covering: import, conditional render, chip content, onSelectDish callback, styles, and visual ordering."

## Changes
- `components/search/BestInSection.tsx` — Import CUISINE_DISH_MAP; add dish shortcut ScrollView between cuisine tabs and Best In cards; 3 new styles

## Test Results
- **232 test files, 5,959 tests, all passing** (~3.2s)
