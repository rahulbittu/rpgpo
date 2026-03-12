# Sprint 277: Dish Leaderboard Enrichment — Top Dishes per Restaurant

**Date:** March 9, 2026
**Story Points:** 5
**Focus:** Per-business top dishes card on business detail page

## Mission
Constitution #47: "Specificity creates disruption. 'Best biryani in Irving' > 'Best restaurant in Dallas'." The global dish leaderboard exists (Sprint 166). Sprint 277 brings dish specificity to the business level — when you view a restaurant, you see its top-voted dishes ranked #1-#5.

## Team Discussion

**Amir Patel (Architecture):** "The `getBusinessDishes` function already returns top dishes by vote count. Sprint 277 adds a dedicated API endpoint and a TopDishes card component. The endpoint enriches the data with photo URLs for visual display."

**Sarah Nakamura (Lead Eng):** "The TopDishes component follows our self-fetching pattern: it owns its data, handles empty state, and renders independently. Each dish row shows rank number, photo (or placeholder), name, vote count, and navigates to the dish detail page on tap."

**Marcus Chen (CTO):** "This completes the business detail page story. Users now see: overall score, score breakdown by visit type, confidence badge, score trend sparkline, AND the restaurant's top dishes. It's the most comprehensive restaurant page in any ranking app."

**Jasmine Taylor (Marketing):** "'Their biryani is #1 with 12 votes, but the chai is #3 with 4 votes.' That level of dish-specific ranking is what makes us different. It's not just 'good restaurant' — it's 'go here for the biryani.'"

## Changes

### Server — Top Dishes API
- **`server/routes-dishes.ts`**:
  - `GET /api/businesses/:id/top-dishes`: Returns top 10 dishes with id, name, slug, voteCount, photoUrl
  - Uses existing `getBusinessDishes` from storage layer

### Client — TopDishes Component
- **`components/business/TopDishes.tsx`** (NEW):
  - Fetches from top-dishes API
  - Displays ranked list: #1-#5 with photo, name, vote count
  - Navigates to dish page on tap
  - SafeImage for dish photos with placeholder fallback
  - Returns null when no dishes
  - Card styles matching ScoreBreakdown pattern

### Client — Business Page Integration
- **`app/business/[id].tsx`**:
  - Imports and renders TopDishes after ScoreTrendSparkline

### Tests
- **15 new tests** in `tests/sprint277-dish-leaderboard-enrichment.test.ts`
- Component tests: export, API fetch, ranking display, navigation, photos, placeholder, empty state, title
- API tests: endpoint, getBusinessDishes call, data enrichment
- Integration tests: business page import and rendering

## Test Results
- **198 test files, 5,467 tests, all passing** (~2.8s)
- +15 new tests from Sprint 277
- 0 regressions
