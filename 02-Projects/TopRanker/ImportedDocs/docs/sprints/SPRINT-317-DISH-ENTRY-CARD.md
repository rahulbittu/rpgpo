# Sprint 317: DishEntryCard Extraction

**Date:** March 9, 2026
**Story Points:** 3
**Focus:** Extract entry card from dish leaderboard page into reusable component

## Mission
Audit #45 flagged dish/[slug].tsx as growing (405→440+ LOC). The ranked entry card — photo, rank badge, score, rating count, early data badge, rate button — is a self-contained unit that belongs in its own component. Extraction reduces page LOC and creates a reusable card.

## Team Discussion

**Amir Patel (Architecture):** "This is textbook extraction. The entry card has its own props (entry data + dishName), its own styles, and no dependency on page state. After extraction, dish/[slug].tsx drops ~80 LOC of inline JSX and 15 style definitions."

**Sarah Nakamura (Lead Eng):** "DishEntryCard exports a typed interface (DishEntryCardProps) with explicit entry shape. The parent page just passes `entry` and `dishName` — clean boundary. Three existing test files needed updates to point at the new component file."

**Marcus Chen (CTO):** "Component extraction isn't glamorous but it's necessary maintenance. The dish leaderboard page was becoming a monolith. This keeps the codebase audit-clean."

**Priya Sharma (QA):** "17 tests on the new component: exports, props, navigation, rank badge, score formatting, early data badge, rate button, SafeImage, pct(), StyleSheet. Plus 5 tests verifying page uses the component correctly."

## Changes
- `components/dish/DishEntryCard.tsx` — NEW: Extracted entry card with DishEntryCardProps interface, all entry card styles
- `app/dish/[slug].tsx` — Replaced inline entry card JSX with `<DishEntryCard>` component; removed entry card styles and unused imports
- `tests/sprint309-dish-rating-flow.test.ts` — Updated to check DishEntryCard component instead of page
- `tests/sprint174-seo-dish-leaderboards.test.ts` — Updated entry check for extracted component
- `tests/sprint281-as-any-reduction.test.ts` — Updated pct() check for DishEntryCard

## Test Results
- **238 test files, 6,078 tests, all passing** (~3.2s)
