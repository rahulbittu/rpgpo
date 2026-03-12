# Sprint 282: Cuisine-Specific Subcategories

**Date:** March 9, 2026
**Story Points:** 8
**Focus:** Restructure "Best In" categories with cuisine-specific subcategories instead of one flat list

## Mission
The "Best In" subcategory system had all 15 items in a flat list — Indian dishes (biryani, dosa) appeared alongside American items (burgers, wings) for every category. Each cuisine now has its own distinct subcategories.

## Team Discussion

**Marcus Chen (CTO):** "This was a product gap. Showing 'Best Dosa in Dallas' next to 'Best BBQ in Dallas' in the same flat chip rail works for a general discovery page, but when you're browsing an Indian restaurant, you don't need to see BBQ chips. The cuisine grouping makes the data more useful."

**Amir Patel (Architecture):** "The structural change is adding a `cuisine` field to `BestInCategory`. We went from 15 items to 48 across 11 cuisines: Indian (8), Mexican (6), Japanese (4), Chinese (4), Vietnamese (3), Korean (3), Thai (3), Italian (4), American (6), Mediterranean (3), and Universal (4). Each cuisine has its own signature dishes that locals actually debate."

**Jasmine Taylor (Marketing):** "This is the specificity principle in action — Constitution #47. 'Best biryani in Irving' creates a debate in the Indian community. 'Best tamales in Dallas' creates a debate in the Mexican community. Each cuisine has its own set of controversial rankings. We expanded from 15 generic items to 48 cuisine-specific ones."

**Sarah Nakamura (Lead Eng):** "New exports: `getCategoriesByCuisine(cuisine)` returns filtered categories, `getAvailableCuisines()` lists all cuisine types, `CUISINE_DISPLAY` has label + emoji metadata for each cuisine. The `searchCategories` function now also matches the cuisine field, so searching 'indian' returns all 8 Indian subcategories."

**Leo Hernandez (Frontend):** "The UI can now show cuisine-grouped chips. Instead of a flat rail of 15 items, the Rankings page can show an Indian section with 8 items, a Mexican section with 6 items, etc. The `CUISINE_DISPLAY` record provides the flag emoji and label for each section header."

**Jordan Blake (Compliance):** "Using flag emojis for cuisine display is fine for a food app. We're not making political statements — just identifying the origin cuisine of each dish category."

**Nadia Kaur (Cybersecurity):** "No security implications. The data is all static constants. The `searchCategories` change to match cuisine names adds useful functionality without any injection risk."

## Changes

### Shared — Best In Categories Restructure
- **`shared/best-in-categories.ts`**:
  - Added `cuisine` field to `BestInCategory` interface
  - Expanded from 15 → 48 categories across 11 cuisines
  - **Indian (8):** biryani, dosa, butter-chicken, chai, samosa, tandoori, chaat, thali
  - **Mexican (6):** tacos, burritos, enchiladas, queso, margaritas, tamales
  - **Japanese (4):** sushi, ramen, udon, katsu
  - **Chinese (4):** dim-sum, hot-pot, kung-pao, peking-duck
  - **Vietnamese (3):** pho, banh-mi, bun-bo-hue
  - **Korean (3):** korean-bbq, bibimbap, fried-chicken
  - **Thai (3):** pad-thai, green-curry, mango-sticky-rice
  - **Italian (4):** pizza, pasta, tiramisu, gelato
  - **American (6):** bbq, burgers, wings, brisket, southern-fried-chicken, mac-and-cheese
  - **Mediterranean (3):** shawarma, falafel, hummus
  - **Universal (4):** coffee, bubble-tea, ice-cream, brunch
  - New exports: `getCategoriesByCuisine()`, `getAvailableCuisines()`, `CUISINE_DISPLAY`
  - `searchCategories` now also matches cuisine field
  - `getCategoryCount` now includes `cuisines` count

### Constants — Category Labels + Emoji
- **`constants/brand.ts`**:
  - Added cuisine type labels: indian, mexican, japanese, chinese, vietnamese, korean, thai, italian, mediterranean, bbq, pizza, seafood, dessert
  - Added corresponding emoji mappings

### Tests
- **19 new tests** in `tests/sprint282-cuisine-subcategories.test.ts`
  - Per-cuisine subcategory validation (10 cuisines)
  - Minimum 3 subcategories per cuisine
  - No duplicate slugs across cuisines
  - CUISINE_DISPLAY metadata completeness
  - Cross-cuisine uniqueness (Indian ≠ Mexican, Japanese ≠ Korean)
- **4 tests updated** in existing test files:
  - `sprint259`: Count from 15 → 45+
  - `sprint264`: Count from 15 → 45+, "indian" search now returns results

## Test Results
- **203 test files, 5,567 tests, all passing** (~2.9s)
- +19 new tests from Sprint 282
- 0 regressions
