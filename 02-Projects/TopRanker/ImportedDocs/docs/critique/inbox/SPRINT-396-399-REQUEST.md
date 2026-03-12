# External Critique Request — Sprints 396-399

**Date:** 2026-03-09
**Requesting:** Independent review of Sprints 396-399
**Reviewer:** External watcher (ChatGPT)

---

## Sprint 396: BusinessBottomSection Extraction

**Summary:** Extracted rate button, claim card, and links from `business/[id].tsx` into `BusinessBottomSection.tsx` (165 LOC). Parent went from 596→476 LOC (73% of threshold). 2 test cascades.

**Questions:**
1. The extracted component takes 6 props (businessName, businessSlug, isClaimed, isLoggedIn, hasExistingRating, memberDaysActive). Is 6 props a clean interface or should some be bundled into a context/object?
2. The rate gating logic (3+ days) lives in the extracted component. Should business-rule logic like this stay with the UI or move to a shared hook?

---

## Sprint 397: Dish Leaderboard Enhancements

**Summary:** Added entry count badges in dish chips, high-confidence badge (10+ ratings), and "Rate this dish" CTA to `DishLeaderboardSection.tsx`. +30 LOC.

**Questions:**
1. The high-confidence threshold is hardcoded at 10 ratings. Should this be configurable or is it stable enough to hardcode?
2. The "Rate this dish" CTA navigates to search rather than a dish-specific rating flow. Is this good enough or does it create a confusing redirect?

---

## Sprint 398: Confirmation Screen Enhancements

**Summary:** Enhanced `RatingConfirmation` with verification boost breakdown (photo +15%, dish +5%, receipt +25%, time +5%, capped at 50%), share CTA using native Share API, and "Rate another place" CTA. +60 LOC.

**Questions:**
1. Verification boosts are computed client-side from boolean props (hasPhoto, hasDish, etc.) — not from actual server-side boost values. Is this transparency or misleading if the server applies different weights?
2. The share CTA uses the generic business URL, not a rating-specific URL. Should shared links point to the specific rating or to the business page?
3. "Rate another place" navigates to the search tab. Should it use a smarter recommendation (e.g., nearby businesses, same cuisine)?

---

## Sprint 399: Search Autocomplete Improvements

**Summary:** Enhanced `AutocompleteDropdown` with text highlighting (HighlightedName component), cuisine category suggestions (matchCuisineCategories from CUISINE_DISPLAY), and result count footer. +45 LOC.

**Questions:**
1. Text highlighting uses case-insensitive `indexOf` — only highlights the first match. Should it highlight all occurrences?
2. Cuisine suggestions are limited to 3. Is this the right number? Too few misses options, too many clutters the dropdown.
3. The result count footer counts business + dish results but not cuisine suggestions. Should cuisine suggestions be included in the count?
