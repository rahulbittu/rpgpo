# Sprints 581-584 External Critique

## Verified wins
- Claim progress timeline shipped as a 4-step vertical timeline in `ClaimStatusCard`.
- City dimension averages cache shipped with explicit constraints: 5-minute TTL, `Map`-based, eviction at 50.
- Photo hash verification shipped with SHA-256 dedup and cross-member flagging.
- Profile extraction shipped into `ProfileIdentityCard` and `ProfileBottomSection`.
- `profile.tsx` reduction is concrete: 465 → 352 LOC.
- Current reported quality baseline is strong: 11,096 tests across 472 files and 8 consecutive A-grade audits.

## Contradictions / drift
- “2 new anti-gaming layers (photo hash, claim timeline)” is overstated. Photo hash is anti-gaming. Claim timeline is described elsewhere as “purely UI” and inferred from a status string. That is not an anti-gaming layer.
- The same in-memory pattern is now repeated across multiple reliability-sensitive paths: city dimension cache, photo hash index, moderation queue. This is not an isolated tradeoff anymore; it is architectural drift.
- You already know DB persistence is planned in Sprint 587, but still added another restart-volatile store in Sprint 583. That is conscious debt expansion, not just temporary pragmatism.
- Cross-member duplicate detection is positioned as a meaningful anti-gaming measure, but its output goes to an in-memory moderation queue with max 2000 items. That weakens the claimed enforcement value.
- Claim timeline improves UX, but the underlying claim process still has no server-side transition history/state machine. The sprint summary frames progress visibility as product progress while the backend remains string-inference-based.
- Build-size management is drifting toward threshold management. Asking whether to raise the 725kb threshold before doing dependency audit is the wrong default.

## Unclosed action items
- Persistence strategy for repeated in-memory stores is unresolved: generic abstraction vs isolated implementations.
- DB persistence for photo-hash-related review flow is unresolved because moderation queue remains in-memory.
- Moderation queue reliability is unresolved; current max-2000 in-memory design is legacy from Sprint 242 and now being reused for newer trust/safety workflows.
- Claim status model remains unresolved: inferred UI timeline vs server-side state machine with transition timestamps.
- Build-size control is unresolved; threshold headroom is only 3.8kb by the packet’s numbers.
- Extraction policy remains unresolved: no clear rubric for when component extraction reduces real complexity versus redistributes LOC.

## Core-loop focus score
**6/10**

- Claim UX and profile extraction are adjacent to the core loop, but mostly presentation-layer work.
- Photo dedup is core-loop relevant because it protects rating integrity.
- Cache work supports performance, but it adds more local state patterns without resolving the persistence problem.
- Too much sprint surface area went to structure/UI while foundational workflow correctness remains loose: no persisted moderation queue, no claim transition history.
- The work improves usability and maintainability, but not enough of it closes reliability gaps in the actual claim/review pipeline.

## Top 3 priorities for next sprint
1. **Stop adding new one-off in-memory stores.** Decide and implement a persistence-backed pattern for trust/safety and workflow-critical queues/indexes, starting with moderation queue and photo-hash flags.
2. **Add backend claim transition history/state handling.** Even a minimal persisted transition log with timestamps is better than a UI inferred from a single status string.
3. **Do a server build audit before touching thresholds.** Treat 725kb as a constraint, not a number to move, and identify the worst contributors now.

**Verdict:** These sprints shipped visible features, but the deeper pattern is drift: more UI polish and more restart-volatile infrastructure layered onto workflows that are starting to matter operationally. The biggest issue is not LOC or a 4kb build increase; it is that anti-gaming and claim-progress features are being presented as stronger than they are while persistence and state correctness are deferred again.
