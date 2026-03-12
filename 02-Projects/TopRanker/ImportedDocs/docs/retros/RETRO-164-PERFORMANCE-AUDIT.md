# Retro 164: Performance Audit — N+1 Fixes, Missing Indexes, Query Optimization

**Date:** 2026-03-09
**Duration:** 1 sprint
**Story Points:** 8
**Facilitator:** Sarah Nakamura

---

## What Went Well
- **Amir Patel:** "Featured endpoint went from O(N) to O(1) DB round trips. The batch pattern is reusable for any multi-entity resolve."
- **Sarah Nakamura:** "detectAnomalies FILTER clause is cleaner than the JS filter approach. SQL does what SQL does best — aggregate."
- **Marcus Chen:** "Two missing indexes found and fixed. The businessPhotos table was doing full scans on every leaderboard, featured, and search request."

## What Could Improve
- Should have caught the missing businessPhotos index in an earlier audit — it's been there since the table was created
- updateMemberStats() still makes 4 queries — next optimization target
- No load testing infrastructure to measure actual latency improvement

## Action Items
- [ ] **Sprint 165+:** Consolidate updateMemberStats() into 1-2 queries
- [ ] **Sprint 165+:** Add load testing script (k6 or autocannon) to measure API latency
- [ ] **Consider:** Run `drizzle-kit push` on Railway to apply new indexes to production

## Team Morale
**9/10** — Ten consecutive forward-progress sprints. Performance work feels like the right investment at this stage.
