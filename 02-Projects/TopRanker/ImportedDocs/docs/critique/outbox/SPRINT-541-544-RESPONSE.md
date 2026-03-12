# Sprints 541-544 External Critique

## Verified wins
- Sprint 541 found and fixed a real production-path bug: `approvePhoto()` marked photos approved without inserting into `businessPhotos`, so approved community photos were invisible. That is a verified behavioral correction, not cosmetic work.
- Sprint 542 added the receipt verification foundation: a `receiptAnalysis` table and admin review pipeline. This is concrete delivery, though it came at clear schema-cost.
- Sprint 543 shipped a city expansion dashboard for beta cities with health/engagement/promotion tracking. That is a delivered admin capability tied to the stated 11-city footprint.
- Sprint 544 shipped search autocomplete support via an in-memory popular query tracker and `PopularQueriesPanel` with social proof. This is a real feature addition, even if persistence was deferred.
- The codebase still reports 10,175 tests, 67 consecutive A-range architecture grades, and a 705.7kb build. Those are stability signals, though not proof of behavioral quality.

## Contradictions / drift
- The biggest contradiction is quality signaling vs actual bug detection: 10,175 tests and 67 A-range grades did not catch a broken photo approval core flow that had existed since Sprint 441. Your test suite is large, but the packet itself implies it is over-weighted toward source-shape checks rather than end-to-end behavior.
- Sprint 544 optimized for avoiding schema growth by using in-memory tracking, but the feature is explicitly framed as “social proof.” Social proof that resets on restart is not trustworthy proof; it is a UI flourish with unstable backing data.
- Sprint 542 added a 996 LOC schema table while simultaneously asking whether future tracking should move in-memory to avoid crossing an arbitrary file-size ceiling. That is drift from domain-driven persistence decisions to file-budget-driven architecture decisions.
- The admin dashboard continues to absorb unrelated responsibilities as tabs in one file (`admin/index.tsx` at 561/650 LOC). You are treating admin growth as a UI organization problem when it is already a routing/module-boundary problem.
- The sprint set spans photo moderation, OCR prep, city operations, and search autocomplete. That is broad surface-area expansion, not tight core-loop concentration. Isolation of modules does not change the fact that focus is diluted.
- “Schema at capacity” is a self-imposed constraint, not a product constraint. If ORM tooling requires indexes with tables, then “extract indexes” is not a real plan; it is wishful thinking in conflict with tool reality.

## Unclosed action items
- Add behavioral integration coverage for the photo approval flow: submit photo → moderate → approve → appears in gallery. This is directly unclosed by the discovered bug.
- Decide whether the 1000 LOC schema limit is actually a rule worth keeping. If yes, define the compression/refactor path that works with Drizzle. If no, stop making storage architecture decisions to protect an arbitrary threshold.
- Resolve whether popular query counts need persistence. Right now the packet presents a trust-risk and no acceptance criteria for when reset behavior is acceptable.
- Split the admin dashboard before more tabs/features are added. The packet asks “at what point”; the evidence says you are already past it.
- Define a threshold for server build intervention or stop treating incremental build growth as an issue. Right now there is concern but no stated performance or deployment pain tied to 705.7kb.
- Audit other moderation/approval pipelines for “state updated but downstream materialization missing” failures. The photo bug survived ~100 sprints; assuming it is isolated would be careless.

## Core-loop focus score
**4/10**

- Four sprints covered four different areas: photo gallery, receipt verification, city dashboard, search autocomplete. That is breadth over loop focus.
- Only the photo approval bug clearly impacts a user-visible core path end-to-end.
- Receipt verification and city dashboard are support/admin infrastructure, not direct evidence of tighter user loop performance.
- Search autocomplete adds surface polish, but the chosen in-memory implementation weakens reliability of the social-proof component.
- The packet shows more concern with file-size ceilings, admin tab growth, and architecture hygiene than with proving repeated improvement in one primary user journey.

## Top 3 priorities for next sprint
1. **Add end-to-end behavioral tests for approval/moderation flows**  
   Start with photos, then cover any analogous approval pipelines. Stop relying on source-based assertions for workflows that mutate multiple tables/surfaces.

2. **Refactor structural bottlenecks instead of coding around them**  
   Split admin into route-based pages/modules and make a real decision on schema organization/limits compatible with Drizzle. Do not keep using in-memory workarounds to dodge file-size ceilings.

3. **Set persistence rules for user-visible counters/social proof**  
   If a number is shown to users as evidence of activity, define whether restart-reset is acceptable. If not, persist it. If yes, relabel/reframe it so it is not implied to be durable truth.

**Verdict:** The headline problem is not build size or schema size; it is that your process is producing clean-looking architecture around unverified behavior. A photo approval flow was broken for roughly 100 sprints despite a huge test count, while recent work keeps spreading across unrelated areas and introducing workaround-driven decisions like in-memory social proof. Tighten around behavioral correctness and structural refactors before adding more feature surface.
