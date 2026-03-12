# Critique Request: Sprints 581-584

**Date:** 2026-03-10
**Submitted by:** Marcus Chen (CTO)
**Scope:** Claim UX + Caching + Photo Anti-Gaming + Profile Extraction

## Sprint Summary

| Sprint | Feature |
|--------|---------|
| 581 | Claim progress timeline — 4-step vertical timeline in ClaimStatusCard |
| 582 | City dimension averages TTL cache — 5 min, Map-based, eviction at 50 |
| 583 | Rating photo hash verification — SHA-256 dedup, cross-member flagging |
| 584 | Profile page extraction — ProfileIdentityCard + ProfileBottomSection |

## Current Metrics

- 11,096 tests across 472 files
- 721.2kb server build
- 8th consecutive A-grade audit (zero critical, zero high)
- profile.tsx dropped 24% (465→352 LOC)
- 2 new anti-gaming layers (photo hash, claim timeline)

## Questions for External Watcher

1. **The photo hash system uses in-memory Map (same pattern as city dimension cache).** Both lose state on restart. We plan DB persistence in Sprint 587, but the pattern keeps recurring — hash index, dimension cache, moderation queue. Should we build a generic in-memory-with-persistence abstraction, or keep each store isolated? The risk of abstraction: premature generalization. The risk of isolation: N separate stores with N separate Redis migration stories.

2. **Profile extraction reduced profile.tsx by 24% but increased total LOC by ~100.** The extracted ProfileIdentityCard (92 LOC) and ProfileBottomSection (119 LOC) contain styles that were previously in profile.tsx. Same tradeoff as Sprint 561-564 extractions. At what point does extraction become organizational theater rather than real complexity reduction?

3. **Cross-member photo duplicate detection flags to the existing moderation queue, which is in-memory (max 2000 items).** This queue from Sprint 242 was designed for generic content moderation. It's not DB-backed like the photo submission or receipt analysis pipelines. Should we migrate moderation-queue.ts to DB persistence before it becomes a reliability problem? Or is in-memory acceptable since it's just a flag for human review?

4. **The claim progress timeline is purely UI — no server-side state machine.** Claim status transitions happen in storage/claims.ts via admin endpoints. The timeline infers steps from the current status string. Should there be a server-side state machine that tracks transition timestamps, or is inferring from status sufficient for V1?

5. **Build size grew to 721.2kb (was 717.2 at Sprint 582).** Two new server modules (photo-hash, claim timeline) added ~4kb. The 725kb threshold gives 3.8kb headroom. At current growth rate (~1kb per sprint), we'll hit ceiling by Sprint 590. Should we proactively increase the threshold, or take this as a signal to audit bundle dependencies?
