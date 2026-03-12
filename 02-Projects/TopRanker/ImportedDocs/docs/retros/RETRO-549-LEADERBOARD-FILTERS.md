# Retro 549: Leaderboard Filters

**Date:** 2026-03-10
**Duration:** 1 sprint cycle
**Story Points:** 5
**Facilitator:** Sarah Nakamura

## What Went Well

**Marcus Chen:** "Hyperlocal filtering is a major UX win. Users can now drill down from city → cuisine → neighborhood → price range. 'Best biryani in Las Colinas, $$' is the kind of specific query that sparks debate in WhatsApp groups."

**Amir Patel:** "Server-side filtering is clean — 2 optional WHERE clauses with cache-aware keys. No new tables needed, no schema changes. The getNeighborhoods endpoint leverages existing data with selectDistinct."

**Cole Richardson:** "Neighborhoods populate automatically as businesses are added. No configuration needed per city. When we launch a new city, its neighborhoods appear as soon as businesses have neighborhood data."

## What Could Improve

- **7 test threshold redirections** — Growing number of tests referencing file LOC thresholds. This is technical debt from source-based testing. Each time a file grows, multiple old tests need updating.
- **Server build at 707.1kb** — Crossed 705kb. Getting closer to the 720kb soft threshold flagged in Audit #67.
- **index.tsx at 505 LOC (was 423)** — Significant growth (+82 LOC) from filter chip UI. May need extraction if another sprint adds more filters.

## Action Items

- [ ] Sprint 550: Governance (SLT-550 + Audit #68 + Critique) — **Owner: Sarah**
- [ ] Consider extracting filter chips from index.tsx into a LeaderboardFilterChips component — **Owner: Sarah**

## Team Morale
**8/10** — Strong feature sprint completing the SLT-545 roadmap. Neighborhood + price filtering adds genuine utility. Clean server-side implementation.
