# Retro 574: Dish Vote Streak Tracking

**Date:** 2026-03-10
**Duration:** 1 sprint cycle
**Story Points:** 3
**Facilitator:** Sarah Nakamura

## What Went Well

**Sarah Nakamura:** "Finding the Rankings crash root cause was satisfying. The `startsWith('/api/leaderboard')` prefix match was a classic over-broad pattern — it caught `/api/leaderboard/neighborhoods` and returned MOCK_BUSINESSES instead of strings. Once identified, the fix was surgical: specific handlers before the catch-all, plus a guard to prevent sub-path matching."

**Amir Patel:** "The mock data system now has a clear layering: specific sub-path handlers first, then the base path catch-all. This same pattern prevented the Discover section bug too — `popular-categories` and `popular-queries` were falling through to wrong handlers. The DishVoteStreakCard at 152 LOC is one of our most compact profile components."

**Rachel Wei:** "Two critical user-facing bugs fixed alongside a new engagement feature. The streak card directly incentivizes the behavior that makes our dish leaderboards valuable. Users who see '5 days in a row' and 'Brisket is your top dish' have a personal connection to the ranking ecosystem."

## What Could Improve

- **Mock data is growing fragile** — Every new API endpoint needs a corresponding getMockData handler, and the ordering matters. Should consider a more structured mock router instead of `startsWith` chains.
- **No server-side streak calculation yet** — The dishVoteStreak fields are in the type definition and mock data, but the actual server calculation (counting consecutive days from the dishVotes table) is not implemented. This should be Sprint 575+ priority.
- **No persistence of streak across sessions** — If the server doesn't calculate it, the streak resets to mock data every time. Real implementation needs a scheduled job or on-demand calculation.

## Action Items

- [ ] Sprint 575: Governance (SLT-575 + Audit #73 + Critique) — **Owner: Sarah**
- [ ] Server-side dish vote streak calculation from dishVotes table (future) — **Owner: Amir**
- [ ] Consider refactoring getMockData to a route-map pattern (future) — **Owner: Sarah**
- [ ] A/B test milestone thresholds (3/7/14/30 vs 5/10/21/30) — **Owner: Rachel**

## Team Morale
**9/10** — Two critical bugs found and fixed while delivering a clean new feature. The mock data detective work was the highlight — understanding why `startsWith` ordering matters. The codebase is healthier for it.
