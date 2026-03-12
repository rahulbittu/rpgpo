# SLT Backlog Meeting — Sprint 575

**Date:** 2026-03-10
**Attendees:** Marcus Chen (CTO), Rachel Wei (CFO), Amir Patel (Architecture), Sarah Nakamura (Lead Eng)
**Previous:** SLT-570

## Sprint 571-574 Review

### Sprint 571: Search Suggestion History Overlay
- DiscoverSections extracted from search.tsx (154 LOC)
- search.tsx: 588 LOC (down from 670, extraction saved 82 LOC of headroom)
- Suggestion history persisted via AsyncStorage
- 22 new tests

### Sprint 572: Rating Photo Gallery Grid
- RatingPhotoGallery component (194 LOC) on business detail page
- Grid layout with photo count badge, category-colored header
- Reuses existing fetchRatingPhotos API — no new endpoints
- 20 new tests

### Sprint 573: Tier Progress Notification
- TierProgressNotification (207 LOC) on profile page
- Shows proximity to next tier with progress bar, tips, weight multiplier
- PROXIMITY_THRESHOLD at 0.60 — only appears when 60%+ toward next tier
- profile.tsx: 448→455 LOC (+7)
- 26 new tests

### Sprint 574: Dish Vote Streak Tracking + Critical Bug Fixes
- DishVoteStreakCard (152 LOC) on profile page with milestones (3/7/14/30d)
- **Critical fix:** Rankings crash — getMockData prefix match caught `/api/leaderboard/neighborhoods`, returned MOCK_BUSINESSES instead of strings
- **Critical fix:** Discover "Could not load" — `/api/businesses/popular-categories` fell through to slug catch-all; `fetchBusinessSearchPaginated` had no mock fallback
- profile.tsx: 455→465 LOC (+10), api.ts: 550→573 LOC (+23)
- 36 new tests (35 new + 1 redirect)

## Delivery Score: 4/4

Ninth consecutive full-delivery SLT cycle (SLT-535 through SLT-575).

## Current Metrics

- **10,889 tests** across 464 files
- **712.1kb** server build (unchanged since Sprint 566)
- **935 LOC** schema (unchanged)
- **0 threshold violations** across 20 tracked files
- **File health highlights:**
  - api.ts 99% (573/575) — grew from mock data guards, consider getMockData extraction
  - search.tsx 98% (588/600) — healthy after Sprint 571 extraction
  - profile.tsx 98% (465/470) — steady growth from profile features

## Roadmap: Sprints 576-580

| Sprint | Feature | Owner | Points |
|--------|---------|-------|--------|
| 576 | Mock data router refactor (extract from api.ts) | Sarah | 2 |
| 577 | Server-side dish vote streak calculation | Amir | 3 |
| 578 | Rating dimension comparison card | Sarah | 3 |
| 579 | Business claim verification flow | Sarah | 3 |
| 580 | Governance (SLT-580 + Audit #105 + Critique) | Sarah | 3 |

## Key Decisions

1. **api.ts at 99% threshold** — The getMockData function is 40+ lines and growing. Sprint 576 extracts it to `lib/mock-router.ts` to relieve pressure.
2. **Server-side streak calculation priority** — DishVoteStreakCard currently reads from profile props that the server doesn't calculate yet. Sprint 577 implements the actual dishVotes table query.
3. **Two critical demo-mode bugs fixed** — The mock data system's `startsWith` pattern matching was fragile. All known sub-path collisions are now guarded, but Sprint 576's refactor will prevent future issues.
4. **20 files tracked in thresholds.json** — Up from 19. DishVoteStreakCard added at 152/160 LOC.

## Team Notes

**Marcus Chen:** "Ninth consecutive full-delivery. The bug fix in Sprint 574 was critical — demo mode is how we onboard new developers and show the product at events. Rankings crashing in demo mode is unacceptable. Good catch and clean fix."

**Rachel Wei:** "The dish vote streak directly supports our 'rate → consequence → ranking' loop. Users who consistently rate with dish detail produce higher-quality data for dish leaderboards. The 'Best biryani in Irving' use case depends on this behavior."

**Amir Patel:** "api.ts is our one pressure point. The mock data router grew organically from a few `startsWith` checks to a 40-line function with ordering dependencies. The extraction in Sprint 576 will also make it testable — we can unit test mock data routing without touching the real fetch layer."

**Sarah Nakamura:** "The 576-580 roadmap balances maintenance (mock router refactor, streak server impl) with feature work (dimension comparison, claim verification). We're staying honest about technical debt while continuing to ship user-facing value."
