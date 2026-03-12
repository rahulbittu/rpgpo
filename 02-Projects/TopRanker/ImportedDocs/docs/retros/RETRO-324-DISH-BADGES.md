# Retrospective — Sprint 324

**Date:** March 9, 2026
**Duration:** 1 session
**Story Points:** 3
**Facilitator:** Sarah Nakamura

## What Went Well

**Marcus Chen:** "The batch query pattern is correct — single JOIN for all businesses instead of N+1. This is the pattern we should use everywhere: enrich the leaderboard response with related data in parallel."

**Amir Patel:** "The dishRankings field on MappedBusiness is additive — empty array default means no breaking changes for existing consumers. Cards without dish rankings render identically to before."

**Jasmine Taylor:** "The amber badges create visual continuity with the dish leaderboard system. Users learn: amber badge = dish ranking. Tapping opens the leaderboard. It's a discovery mechanism built into every card."

## What Could Improve

- **Badge overflow** — If a business has 3 dish rankings with long names (e.g., 'Butter Chicken'), the badge row could wrap to 2 lines. Consider truncating dish names in badges.
- **No loading state for badge data** — The batch query runs server-side in the leaderboard API, so there's no separate loading state. But if the dish tables are slow, the entire leaderboard response is delayed.
- **Badge count of 3 is hardcoded** — Should be configurable or adaptive based on card width.

## Action Items
- [ ] Sprint 325: SLT Q2 Final + Arch Audit #47 (governance)
- [ ] Future: Consider dish name truncation in badges for long names
- [ ] Future: Make badge count responsive to card width

## Team Morale: 8/10
Connecting the dish leaderboard system to ranking cards. The product feels more integrated — every ranking card now shows what makes that business special.
