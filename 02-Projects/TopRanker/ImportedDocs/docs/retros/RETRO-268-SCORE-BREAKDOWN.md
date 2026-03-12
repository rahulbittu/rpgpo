# Retrospective — Sprint 268
**Date:** March 9, 2026
**Duration:** 1 session
**Story Points:** 7
**Facilitator:** Sarah Nakamura

## What Went Well

**Sarah Nakamura:** "Clean API design. One endpoint, one query, all the breakdown data. The pre-computed effective weights from Sprint 267 made the aggregation trivial."

**Amir Patel:** "The component is self-contained. No prop drilling, no parent state management. It fetches, renders, done. This is the pattern we should follow for all data-heavy cards."

**Jasmine Taylor:** "The UI is clear and immediate. Three visit types with scores, three stat numbers below. No clutter, no confusion. Users see the breakdown at a glance."

## What Could Improve

- **No caching strategy for breakdown**: Every visit to a business page triggers a fresh aggregation query. Should add query caching or precomputed snapshots for popular businesses.
- **Photo moderation still not connected**: Rating photos bypass the moderation queue. Not critical for launch but needs addressing.
- **Leaderboard doesn't show visit-type scores yet**: The breakdown is on the detail page but the leaderboard cards still show one number.

## Action Items
- [ ] Low-data honesty: provisional badges, early-state indicators — Sprint 269
- [ ] SLT-270 + Arch Audit #36 — Sprint 270
- [ ] Connect rating photos to moderation queue — backlog
- [ ] Leaderboard visit-type indicators — backlog
- [ ] Score trend sparkline on breakdown card — backlog

## Team Morale: 9/10
Phase 2c complete. The rating system is now fully visible: users see not just a score, but HOW that score was computed across different experience types. The breakdown card on the business page is the clearest expression of "trustworthy rankings" we've built.
