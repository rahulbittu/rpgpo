# Sprint 167: Dish Leaderboard V1 UI — "Best In Dallas" Discovery Section

**Date:** 2026-03-09
**Story Points:** 8
**Focus:** Discovery screen dish leaderboard UI with chip rail, entry cards, building state, suggest modal

---

## Mission Alignment
Making dish-level rankings visible to users is the highest-leverage UI change since the leaderboard launch. Users don't search for "restaurants" — they search for "biryani." This UI answers that question directly.

---

## Team Discussion

**Priya Sharma (Design):** "The chip rail follows iOS design conventions — horizontal scroll, pill shapes, 38px height. Active chip flips to amber background. The '+ Suggest' chip at the end invites participation without cluttering the rail."

**Marcus Chen (CTO):** "The entry card layout prioritizes the dish photo, then rank badge, then score. Users see the visual first, then the data. The dish-specific score in amber Playfair Display at 28px makes it unmistakable — this is a different metric than the overall restaurant score."

**Sarah Nakamura (Lead Eng):** "DishLeaderboardSection is a self-contained component — 320 lines with its own queries, state, and styles. It integrates into search.tsx with a single `<DishLeaderboardSection city={city} />` line. Only shows when not searching."

**Jasmine Taylor (Marketing):** "Product messaging follows the rules: 'Community-ranked by dish', 'Based on N biryani ratings', 'Early Rankings' for new boards. No 'AI-ranked', no 'we recommend'. Trust through transparency."

**Nadia Kaur (Cybersecurity):** "Suggest modal uses credentials: 'include' for auth. Vote and suggestion endpoints are server-authenticated. Rate limit errors (429) are displayed to users."

**Amir Patel (Architecture):** "The component follows our established patterns: useQuery for data, useMutation for writes, useCallback for handlers, SafeImage for photos with gradient fallback."

---

## Changes

### DishLeaderboardSection Component (components/DishLeaderboardSection.tsx — NEW)
- Horizontal chip rail with dish emoji + name
- Hero banner showing "Best [Dish] in [City]" with emoji and spot count
- Ranked entry cards: photo strip, rank badge, dish score, neighborhood, rater count
- "Early data" badge for entries with < 5 ratings
- "Early Rankings" provisional badge for new boards
- Building state card when below threshold ("We need N more reviews")
- CTA to rate a spot from building state

### DishSuggestModal (in same file)
- Bottom sheet modal with text input
- Submit suggestion (POST /api/dish-suggestions)
- View existing suggestions sorted by vote count
- Vote on suggestions (POST /api/dish-suggestions/:id/vote)
- Error handling for rate limits and duplicate votes

### Discovery Screen Integration (app/(tabs)/search.tsx)
- Imported DishLeaderboardSection
- Positioned between Trending section and results count
- Only renders when `!debouncedQuery` (not searching)

---

## Test Results
- **2298 tests** across 101 files — all passing, 1.69s
- 39 new tests covering: component structure, chip rail, entry cards, low-data honesty, suggest modal, product messaging rules, brand consistency, discovery integration

---

## Low-Data Honesty Enforced
- Building state shown when entries < 5 and minRatingsNeeded > 0
- "Early data" badge on entries with < 5 dish-specific ratings
- "Early Rankings" badge on boards activated in last 14 days
- NO fake data, NO simulated rankings, NO placeholder content
