# Sprint 323: Rankings Page Cleanup — Unified Category→Cuisine→Dish Flow

**Date:** March 9, 2026
**Story Points:** 3
**Focus:** Remove broken Best In subcategory chips, simplify Rankings to clean Category→Cuisine→Dish→Rankings flow

## Mission
The Rankings page had 5 layers of horizontal filter rows stacked before any content: Category chips, "Best In" header, Cuisine picker, Best In subcategory chips, and Dish shortcuts. The Best In subcategory chips were **broken** — `selectedBestIn` was set on tap but never passed to the leaderboard query, making them purely decorative. The Dish shortcuts row duplicated the same concept but actually worked (navigating to leaderboard pages). This sprint removes the broken layer and simplifies to the CEO's original vision: "category cuisine and dish is the one workflow."

## Team Discussion

**Marcus Chen (CTO):** "Five horizontal scroll rows before any ranking data is a UX disaster. Users scroll through filters instead of seeing content. The subcategory chips were a dead feature — `selectedBestIn` was never wired to the query. Removing them is both a bug fix and a UX improvement."

**Amir Patel (Architecture):** "This is a subtraction sprint. Removed: `selectedBestIn` state, `bestInCategories` computed value, `getCategoriesByCuisine`/`getActiveCategories` imports from index.tsx, the entire subcategory ScrollView, and 6 unused style definitions. Net: -54 LOC. The functions still exist in `shared/best-in-categories.ts` for the Discover page's BestInSection."

**Sarah Nakamura (Lead Eng):** "The Rankings page is now 592 LOC, down from 646. Three clear sections above the fold: Category → Cuisine → Dish Shortcuts. Each does one thing: Category filters business type, Cuisine filters cuisine, Dish Shortcuts navigate to leaderboard pages. Clean hierarchy."

**Jasmine Taylor (Marketing):** "The flow now matches our WhatsApp demo: pick Indian → see dish shortcuts (Best Biryani, Best Dosa) → tap into leaderboard. Three taps, no confusion. The old UI had users wondering which row to use."

**Priya Sharma (QA):** "Updated sprint283 test to remove assertions for the deleted `getCategoriesByCuisine` import and `setSelectedBestIn` reset. Added 12 new tests confirming the removal (no `selectedBestIn`, no `bestInChip` styles) and verifying surviving features (cuisine picker, dish shortcuts, category chips)."

## Changes
- `app/(tabs)/index.tsx` — Removed `selectedBestIn` state, `bestInCategories` memo, subcategory chips ScrollView, 6 unused styles. Renamed `bestInChipsRow` → `cuisineChipsRow`. -54 LOC.
- `tests/sprint283-cuisine-ui.test.ts` — Updated 3 tests to reflect removal of `getCategoriesByCuisine` import and `setSelectedBestIn` from Rankings page.
- `tests/sprint323-rankings-cleanup.test.ts` — NEW: 12 tests confirming cleanup (no `selectedBestIn`, no `bestInChip` styles, cuisine picker preserved, dish shortcuts preserved).

## Test Results
- **244 test files, 6,157 tests, all passing** (~3.4s)
