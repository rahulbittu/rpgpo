# Sprint 284: Cuisine Picker on Discover/Search Page

**Date:** March 9, 2026
**Story Points:** 5
**Focus:** Apply cuisine picker to Discover page — same pattern as Rankings (Sprint 283)

## Mission
Extend the cuisine picker from Rankings to the Discover/Search page. The "Best In [City]" section now has cuisine tabs that filter which subcategories are shown.

## Team Discussion

**Leo Hernandez (Frontend):** "Same two-tier pattern as Rankings: cuisine tabs above, subcategory cards below. The 'All' mode shows top 15 items (not all 48) to keep the scroll manageable. Selecting a cuisine shows all items for that cuisine."

**Marcus Chen (CTO):** "Both main screens now have cuisine pickers. Rankings for leaderboard filtering, Discover for browsing/searching. The experience is consistent — pick a cuisine, see its signature dishes."

**Sarah Nakamura (Lead Eng):** "The `bestInItems` memo uses `getCategoriesByCuisine` when a cuisine is selected, or `getActiveCategories().slice(0, 15)` for 'All'. The 15-item limit in All mode prevents the horizontal scroll from being overwhelming."

**Jasmine Taylor (Marketing):** "The Discover page is the first thing new users see after onboarding. Having cuisine tabs immediately shows the depth of our system — we don't just rank 'restaurants', we rank biryani, tacos, sushi, dim sum. That specificity is our marketing message."

## Changes

### Search/Discover Page
- **`app/(tabs)/search.tsx`**:
  - New imports: `getCategoriesByCuisine`, `getAvailableCuisines`, `CUISINE_DISPLAY`
  - New state: `bestInCuisine`, `bestInCuisines`, `bestInItems`
  - Cuisine tabs ScrollView above Best In card scroll
  - 'All' mode limited to top 15 items
  - New styles: `cuisineTabsScroll`, `cuisineTab`, `cuisineTabActive`, `cuisineTabText`, `cuisineTabTextActive`
- **LOC threshold bumps**:
  - `sprint144-product-validation.test.ts`: 900 → 950
  - `sprint193-search-decomposition.test.ts`: 900 → 950

### Tests
- **11 new tests** in `tests/sprint284-search-cuisine-picker.test.ts`

## Test Results
- **205 test files, 5,590 tests, all passing** (~3.0s)
- +11 new tests from Sprint 284
- 0 regressions
