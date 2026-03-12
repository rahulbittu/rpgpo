# Sprints 510–514 External Critique

## Verified wins
- Push A/B wiring is implemented on all 4 notification triggers, with fallback copy when no experiment is active.
- Push experiment admin UI exists via `PushExperimentsCard` and is rendered in the admin dashboard overview.
- Claim evidence now has PostgreSQL persistence via a new `claimEvidence` table with `jsonb`, match fields, score, and an upsert path.
- Evidence reads have a DB fallback on admin routes, which is a real step beyond in-memory-only operation.
- Notification preferences gained finer granularity: `claimUpdates` and `newRatings`, and at least 2 handlers were updated to use them.
- Governance cadence happened: SLT-510, Audit #60, and prior critique request were completed.

## Contradictions / drift
- The biggest drift is obvious: you added PostgreSQL persistence for claim evidence, but the write path remains dual-write with in-memory first and fire-and-forget DB writes. That is not a completed persistence migration; it is a transitional reliability gap.
- “Zero critical/high findings” is weak evidence of progress when the packet itself still names 2 medium findings around in-memory stores and then adds another transitional in-memory+DB pattern.
- You are still expanding the notification subsystem after explicitly raising concern that it has consumed 23 sprints. These sprints add more notification complexity: A/B wiring, admin UI, and more preference granularity. That is continued investment in the meta-system, not reduction.
- Preference granularity increased from 8 to 10 toggles while the packet still asks whether the system is already too complex. You are adding knobs before proving users need them.
- `admin/index.tsx` crossing 603 LOC is not an isolated watch-file problem if you also keep inserting new admin features like experiment cards into the overview. That indicates ongoing dashboard accretion without structural cleanup.

## Unclosed action items
- Resolve the medium-risk in-memory store issue. It is explicitly still open.
- Finish claim evidence persistence migration: decide whether in-memory is cache-only or remove it from the source-of-truth path.
- Close durability semantics for fire-and-forget DB writes; as stated, write success is not guaranteed before returning.
- Decide whether the notification subsystem is still earning sprint budget versus core rating-loop work; the packet asks the question because it is not resolved.
- Refactor `admin/index.tsx`; Sprint 516 extraction is mentioned as future work, so this remains open.
- Decide settings strategy for 10 notification toggles, including whether a “Mute All” control is necessary.

## Core-loop focus score
**4/10**
- Only Sprint 513 clearly touches a core product flow: claim evidence persistence.
- Three of five sprints are notification/admin/governance work, which are support systems, not the rating loop.
- Sprint 514 adds settings complexity rather than increasing core-loop throughput or user value evidence.
- Sprint 512 is internal UI for experiment management; useful, but far from end-user value.
- The packet itself questions whether 23 sprints on notifications is disproportionate. That is a strong sign of focus drift.

## Top 3 priorities for next sprint
1. **Complete claim evidence persistence properly**
   - Stop treating fire-and-forget dual-write as “done.”
   - Make DB write semantics explicit and reliable, then demote in-memory to cache or remove it from authority.

2. **Freeze notification feature expansion**
   - No more toggles, A/B surface area, or admin embellishments until you can show core-loop impact.
   - Pay down notification complexity before adding more branches.

3. **Refactor admin structure, not just one extraction**
   - A claims-tab extraction may reduce LOC, but the pattern problem is broader.
   - Move toward tab/component boundaries so new admin features stop landing in one growing file.

**Verdict:** This sprint set delivered real implementation work, but too much of it is still meta-system expansion around notifications and admin tooling. The strongest product-facing item—claim evidence persistence—is not actually finished because the system still relies on in-memory state plus fire-and-forget DB writes. You are adding complexity faster than you are closing architectural loops.
