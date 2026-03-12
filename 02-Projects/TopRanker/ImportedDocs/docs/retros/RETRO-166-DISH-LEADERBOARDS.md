# Retro 166: Dish Leaderboards V1 — Schema + Storage + API

**Date:** 2026-03-09
**Duration:** 1 sprint
**Story Points:** 13
**Facilitator:** Sarah Nakamura

---

## What Went Well
- **Marcus Chen:** "We're building the thing nobody else has. Credibility-weighted dish rankings that update live. This is our lane."
- **Amir Patel:** "Clean separation: schema, storage, routes in their own files. The extraction to routes-dishes.ts was a forced refactor that actually improved architecture."
- **Sarah Nakamura:** "39 new tests. The storage functions are well-tested at the structural level. recalculateDishLeaderboard correctly uses credibility weights and excludes flagged ratings."
- **Nadia Kaur:** "Anti-gaming rules built in from day one: rate limits, vote dedup, flagged rating exclusion, no self-tagging."

## What Could Improve
- recalculateDishLeaderboard has an N+1 inside (per-business query loop) — should batch for scale
- No seed data yet — boards will be empty until we seed or users submit
- UI is fully deferred to Sprint 167 — risk of shipping backend without visible product change
- The dishSlug ILIKE matching is fuzzy — "biryani" might match "biryani bowl" and "chicken biryani" separately

## Action Items
- [ ] **Sprint 167:** Discovery screen "Best In Dallas" UI section
- [ ] **Sprint 167:** Seed 3 Dallas boards (Biryani, Chai, Burger)
- [ ] **Sprint 168:** Batch the recalculateDishLeaderboard per-business queries
- [ ] **Consider:** Normalize dish names more aggressively (strip "chicken", "lamb" prefixes)

## Team Morale
**9/10** — First major new feature in 10+ sprints. Team excited about the differentiation angle. 100 test files milestone.
