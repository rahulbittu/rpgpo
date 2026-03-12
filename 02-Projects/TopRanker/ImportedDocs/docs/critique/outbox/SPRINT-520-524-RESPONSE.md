# Sprints 520-524 External Critique

## Verified wins
- Sprint 524 shipped a real extraction: `api.ts` moved 141 LOC to `api-admin.ts`, with backward-compatible re-exports.
- Sprint 521 appears to have completed the planned notification wiring: frequency checks were wired into notification triggers per sprint scope.
- Sprint 522-523 added admin product surface in two distinct areas: `TemplateManagerCard` and `ExperimentResultsCard`.
- Governance work was explicitly tied to prior critique and audit inputs in Sprint 520 (`Audit #62 + Critique 515-519`), which is better than ignoring review feedback.
- Current codebase health indicators are at least being tracked: tests, build size, architectural grade streak, file growth, and threshold proximity are all visible.

## Contradictions / drift
- You are asking whether reactive extraction is sustainable while the packet already shows the pattern is reactive. `admin/index.tsx` grew `585→618→622` over two sprints and is now at `96%` of threshold, but extraction is deferred to Sprint 526 instead of preceding feature growth.
- The stated sprint scope includes “Governance + Notification Wiring + Admin UX + Code Extraction,” but the actual work is fragmented across unrelated domains. That is throughput, not focus.
- You are celebrating extraction discipline while explicitly keeping compatibility re-exports that preserve old surface area. That is partial extraction, not full simplification.
- Sprint 522-523 continued adding admin UI while acknowledging the file was nearing threshold. That is known drift accepted in real time, not an unforeseen issue.
- A 4-sprint health block is being considered only after multiple signals accumulated: admin file growth, `search.tsx` at `798 LOC`, API extraction needs, persistence/store debt. Again reactive, not controlled.
- “40+ admin endpoints” plus ongoing admin UI growth conflicts with the idea of delaying structural work. The surface is expanding faster than the containment strategy.

## Unclosed action items
- `admin/index.tsx` extraction remains unclosed and already deferred to Sprint 526 despite threshold pressure.
- `search.tsx` at `798 LOC` with complex coupled state is unaddressed until Sprint 527; scope sizing is still unresolved.
- `api.ts` extraction is not actually complete while re-exports remain; consumer migration decision is still open.
- The 4-sprint codebase health block (`526-529`) is still a planning question, not a closed commitment.
- In-memory store debt across `push-ab-testing.ts`, `notification-templates.ts`, and `notification-frequency.ts` remains open with no stated mitigation or graduation criteria.

## Core-loop focus score
**4/10**

- Five sprints covered governance, notification policy wiring, admin template UX, experiment dashboard UX, and API extraction. That is broad portfolio movement, not a tight loop.
- Some work supports operations/admin capabilities rather than the user-facing product loop; may be necessary, but it dilutes sprint-level focus.
- Structural maintenance is happening, but mostly after growth pressure appears, which creates avoidable churn.
- The team is measuring thresholds and architecture health, which prevents this from being a lower score.
- The open questions are mostly about controlling sprawl that already happened, which signals weak focus discipline.

## Top 3 priorities for next sprint
1. **Do the admin extraction before adding more admin UI.** Stop the grow-then-extract pattern on `admin/index.tsx`; no more admin feature expansion until the file is decomposed.
2. **Finish extractions fully, not cosmetically.** For `api.ts`, migrate consumers and remove re-exports on a defined timeline; otherwise the old dependency shape persists and the cleanup benefit is overstated.
3. **Split and front-load high-risk structural work.** Treat `search.tsx` decomposition and in-memory store risk as separate scoped efforts, not optimistic single-sprint cleanup bundled into a generic health block.

**Verdict:** The main issue is not lack of activity; it is acceptance of repeated reactive maintenance. You are letting files and surfaces grow to the edge, then planning cleanup later while still adding scope. The packet shows decent instrumentation and some completed extraction work, but the operating pattern is drift first, containment second. That is manageable at current size, but it is still drift.
