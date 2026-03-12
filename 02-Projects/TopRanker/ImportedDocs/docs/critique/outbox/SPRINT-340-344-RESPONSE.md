# External Critique Request — Sprints 340-344 External Critique

## Verified wins
- City promotion work touched isolated server files (`server/city-promotion.ts`, `server/routes-admin-promotion.ts`) instead of bloating the already-large rating screen.
- Per-dimension timing stored in refs for submit-time use is a defensible performance choice given the packet states it is “only read at submission time.”
- Architecture audit remained A-range with schema tables unchanged at 31, so these sprints did not create obvious data-model sprawl.
- Build growth was small in absolute terms: server bundle +3.2kb across five sprints.

## Contradictions / drift
- The sprint mix is drift-heavy: 2 UX polish sprints, 1 analytics sprint, 1 infrastructure sprint, and 1 governance sprint. That is fragmented work, not tight core-loop concentration.
- You call out `rate/[id].tsx` as “critical” at 686 LOC with only 14 lines of margin, then added more code to it in Sprints 342 and 343 anyway. That is direct contradiction between architecture warning and implementation behavior.
- Extraction is “planned for Sprint 346,” but LOC already grew 36 lines in 2 sprints. Planning refactor later while continuing to add to the hotspot is classic deferred maintenance drift.
- Animated highlight likely over-serves a 3-point UX polish item: replacing simple class swaps with Reanimated `interpolateColor` and 4 shared values increases implementation complexity in the most fragile file.
- Governance sprint 340 did not prevent the exact architecture pressure the audit flagged. An audit without enforcement is bookkeeping, not control.
- Promotion progress uses a flat average while the packet itself questions whether criteria have different importance. Shipping a refresh without resolved metric semantics suggests implementation moved ahead of product definition.

## Unclosed action items
- `app/rate/[id].tsx` extraction remains unclosed and was deferred to Sprint 346 despite continued growth.
- The packet raises unresolved design questions on animation complexity, timing storage, promotion weighting, and cuisine emoji semantics. Those are still open decisions, not closed work.
- `SubComponents.tsx` is at 572 LOC with only 28 lines of margin and was also touched in Sprint 341. That warning file is still trending the wrong way.
- Promotion readiness weighting is explicitly undecided; the current equal-weight formula appears provisional, not settled.
- Cuisine fallback priority may produce confusing results, and no evidence is provided that this was validated.

## Core-loop focus score
**4/10**

- The sprint set is split across governance, polish, analytics, and infrastructure rather than concentrated on one measurable user outcome.
- Two of five sprints were cosmetic/polish items, while the main rating screen was already at critical LOC pressure.
- Work repeatedly landed in `rate/[id].tsx`, but without paying down the structural risk in that file.
- Analytics timing may support future understanding of the loop, but by itself it does not improve the loop unless tied to decisions.
- City promotion refresh is adjacent to supply/infrastructure, not direct user rating throughput or quality.
- The package shows activity, not disciplined prioritization.

## Top 3 priorities for next sprint
1. Extract `app/rate/[id].tsx` immediately before adding any more rating-flow features; stop treating a critical LOC warning as future work.
2. Resolve product semantics before more implementation: define promotion weighting and validate cuisine fallback behavior instead of shipping provisional logic.
3. Simplify the rating highlight implementation if possible; reduce animation complexity in the hottest, riskiest UI file unless there is measured UX impact that justifies Reanimated.

**Verdict:** This was a busy but unfocused block. The main contradiction is obvious: you recognized `rate/[id].tsx` as a critical architecture hotspot and then kept adding polish and analytics into it anyway. The audit grade is flattering but not persuasive when enforcement is absent. Most of the shipped work is incremental, some of it likely over-engineered, and several decisions are still conceptually unresolved after implementation.
