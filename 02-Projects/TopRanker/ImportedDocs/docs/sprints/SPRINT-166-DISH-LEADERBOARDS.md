# Sprint 166: Dish Leaderboards V1 — Schema + Storage + API

**Date:** 2026-03-09
**Story Points:** 13
**Focus:** "Best [Dish] in [City]" — database, storage layer, API endpoints, route extraction

---

## Mission Alignment
Nobody wakes up thinking "I want a restaurant." They think "I want biryani." Dish leaderboards answer the specific question people actually have: "Where is the best X in this city?" This directly strengthens the rate → consequence → ranking loop by creating dish-specific credibility-weighted rankings.

---

## Team Discussion

**Marcus Chen (CTO):** "This is our differentiator. Yelp doesn't have live, credibility-weighted dish rankings. Google Maps doesn't. We already collect dish data through the rating flow — now we're making it visible. Existing data, new surface."

**Amir Patel (Architecture):** "Four new tables: dishLeaderboards, dishLeaderboardEntries, dishSuggestions, dishSuggestionVotes. Schema follows our established patterns — UUIDs, timestamps, indexes. The unique constraint on (city, dishSlug) prevents duplicates. The recalculation uses credibility-weighted scores from existing ratings."

**Sarah Nakamura (Lead Eng):** "The recalculateDishLeaderboard function computes dish-specific scores by joining dishVotes → ratings → members. Flagged ratings are excluded. Weights come from the credibility system. The algorithm is: find all dishVotes for this dish → get their ratings → compute weighted average → rank by score."

**Rachel Wei (CFO):** "Community suggestions with vote-based activation is smart. 10 votes to activate means we don't waste infrastructure on unpopular dishes. The 3-per-week rate limit prevents spam. This is a free feature that drives engagement."

**Nadia Kaur (Cybersecurity):** "Anti-gaming: flagged ratings excluded, credibility weights apply, rate limits on suggestions (3/week), vote dedup (1 per member per suggestion), no self-tagging by restaurants. The existing abuse detection in detectAnomalies covers rating submission."

**Jasmine Taylor (Marketing):** "'Best Biryani in Dallas' — that's a search query people actually type. If we own that answer with credibility-weighted data, we own the conversation. The provisional/'Early Rankings' flag is honest and builds trust."

**Priya Sharma (Design):** "Routes extracted to routes-dishes.ts to keep routes.ts under 1000 LOC per CI check. The route structure follows established patterns: wrapAsync, requireAuth on mutations, sanitizeString on inputs."

---

## Changes

### New Schema Tables (shared/schema.ts)
- `dishLeaderboards` — city, dishName, dishSlug, dishEmoji, status, minRatingCount, displayOrder
- `dishLeaderboardEntries` — leaderboardId, businessId, dishScore, dishRatingCount, rankPosition
- `dishSuggestions` — city, dishName, suggestedBy, voteCount, activationThreshold
- `dishSuggestionVotes` — suggestionId, memberId (prevents double voting)
- `insertDishSuggestionSchema` — Zod validation: dishName 2-40 chars, city required

### Storage Functions (server/storage/dishes.ts)
- `getDishLeaderboards(city)` — returns active boards with entry counts
- `getDishLeaderboardWithEntries(slug, city)` — ranked entries with business names, provisional flag
- `recalculateDishLeaderboard(id)` — credibility-weighted dish scores from dishVotes + ratings
- `getDishSuggestions(city)` — proposed suggestions sorted by votes
- `submitDishSuggestion(memberId, city, dishName)` — rate-limited 3/week
- `voteDishSuggestion(memberId, suggestionId)` — deduped, auto-activates at threshold

### API Endpoints (server/routes-dishes.ts — new extracted file)
- `GET /api/dish-leaderboards?city=dallas`
- `GET /api/dish-leaderboards/:slug?city=dallas`
- `GET /api/dish-suggestions?city=dallas`
- `POST /api/dish-suggestions` (requireAuth, rate-limited)
- `POST /api/dish-suggestions/:id/vote` (requireAuth, deduped)

### Route Extraction
- Dish routes extracted to `server/routes-dishes.ts` (65 LOC)
- `server/routes.ts` down from 1007 → 961 lines
- Registered via `registerDishRoutes(app)` pattern

---

## Test Results
- **2259 tests** across 100 files — all passing, 1.69s
- 39 new tests covering schema, storage, API, anti-gaming, low-data honesty

---

## Low-Data Honesty Rules (Non-Negotiable)
- Boards only visible when status = "active" (≥5 restaurants with ≥3 dish ratings)
- "Building" state shown below threshold
- "Early Rankings" badge for boards activated in last 14 days
- `minRatingsNeeded` tells users exactly how many more reviews are needed

---

## V2 Deferred (Next Sprint)
- [ ] Discovery screen "Best In Dallas" section with chip rail
- [ ] DishEntryCard component
- [ ] Suggest modal UI
- [ ] Rating flow pre-fill from dish context
- [ ] Seed 3 boards (Biryani, Chai, Burger) for Dallas
