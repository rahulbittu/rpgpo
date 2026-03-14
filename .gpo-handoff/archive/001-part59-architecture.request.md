# Handoff Request

## Objective
Design Part 59 for GPO/RPGPO: Structured Deliverable Rendering + Runtime Contract Enforcement + Board Contract Awareness.

The platform has 15 engines with output contracts and 150 acceptance scenarios, but three critical gaps remain before the product feels shippable to an end user:

1. **Task deliverables render as raw text** — the Final Result block shows unstructured subtask output rather than engine-appropriate formatted deliverables (ranked lists, comparison tables, formatted documents, code diffs)
2. **Output contracts are validated by keyword heuristics after the fact** — the pipeline doesn't enforce contracts during execution, so a task can complete without producing the required deliverable shape
3. **Board deliberation doesn't consume engine contracts** — the subtask plan doesn't target contract-required fields, so the right deliverable may never be produced even if the task "succeeds"

## Current Implementation State

- **15 engines** defined in `engine-catalog.ts` with output types (ranked_list, document, code_change, recommendation, schedule, creative_draft, analysis, action_plan)
- **15 output contracts** in `output-contracts.ts` with required_fields, approval_model, final_action
- **Final Result block** in `app.js` renders raw text from `final-output-surfacing.ts`
- **Board deliberation** in `deliberation.ts` (307 lines) produces interpretation, strategy, subtask plan — but doesn't consume engine contracts
- **Workflow** in `workflow.ts` orchestrates subtask execution but doesn't validate contract compliance mid-execution
- **150 acceptance cases** seeded but not executable
- **Task closure states**: final_deliverable_visible, awaiting_operator_approval, blocked_with_remediation, action_executed_with_proof, failed_with_reason

## Relevant Files

- `app/lib/engine-catalog.ts` — 15 engine definitions
- `app/lib/output-contracts.ts` — per-engine contracts and validation
- `app/lib/final-output-surfacing.ts` — synthesizes final answer from subtask outputs
- `app/lib/deliberation.ts` — Board deliberation (interpretation, strategy, subtask plan)
- `app/lib/workflow.ts` — task orchestration and subtask execution
- `app/lib/mission-acceptance-suite.ts` — 150 seeded scenarios
- `app/app.js` — Final Result block rendering (lines ~2230-2280)
- `app/lib/types.ts` — all typed contracts (6141 lines)

## What Changed Recently

Part 58 added:
- Engine catalog with 15 engines
- Output contracts per engine
- 150 mission acceptance scenarios
- Deliverable-first task closure states
- Intake engine selector with contract hints
- Contract validation (keyword heuristic)

Part 57 added:
- Final Result block in task timeline
- Product shell consolidation
- Task experience tracking

## Open Gaps / Risks

1. **Raw text rendering**: A newsroom task showing "here are the top 10 news..." as plain text is not a product-quality experience. It needs structured card/list rendering with headlines, summaries, and links.

2. **No runtime enforcement**: The pipeline can complete a task where the compile/store step fails and no structured deliverable is produced. The contract says "ranked_items + summaries + source_links" but nothing blocks completion if these are absent.

3. **Board doesn't target contracts**: When the board plans a newsroom task, it doesn't know it needs to produce "ranked_items, summaries, source_links". It may produce subtasks that research but never compile into the contract shape.

4. **Acceptance suite is passive**: 150 cases are definitions, not executable tests.

5. **Engine-specific rendering absent**: All engines render the same way (raw text block). Shopping needs comparison tables, legal needs document sections, code needs diff viewers.

## Specific Questions for ChatGPT

1. **Deliverable schema per engine**: What's the right typed structure for each engine's deliverable? Should we define a `StructuredDeliverable` with engine-specific variants (NewsroomDeliverable, ShoppingDeliverable, CodeDeliverable, etc.)? Or a generic schema with engine-specific field sets?

2. **Contract enforcement insertion point**: Where in the pipeline should contract enforcement happen?
   - Option A: After all subtasks complete, validate and block if missing
   - Option B: During subtask plan generation, ensure contract fields are explicit goals
   - Option C: Both — plan-time and completion-time
   - What's the right balance between enforcement and graceful degradation?

3. **Board contract awareness**: Should the board's deliberation prompt include the engine's output contract so it plans subtasks that target the right deliverable shape? How should this be wired without making deliberation too rigid?

4. **Renderer architecture**: Should engine-specific renderers live in:
   - A single `deliverable-renderer.ts` with a switch on engine type?
   - Separate renderer modules per engine family?
   - A template-based system with JSON schemas?

5. **Acceptance execution**: What's the minimum viable approach to make the 150 seeded cases executable? Full pipeline execution per case, or lighter contract-shape validation?

6. **Graceful degradation**: When a contract can't be fully satisfied (e.g., source links unavailable), what's the right closure state? Should partial deliverables still render with clear "missing" indicators?

## Desired Output

1. **Architecture recommendation** for Part 59 covering:
   - Structured deliverable types and rendering
   - Contract enforcement points in the pipeline
   - Board contract awareness wiring
   - Acceptance execution approach

2. **Type definitions** for:
   - StructuredDeliverable (with engine variants)
   - DeliverableRenderer interface
   - ContractEnforcementResult
   - BoardContractContext

3. **Module decomposition** for the 3 new modules:
   - What each module is responsible for
   - How they integrate with existing modules
   - Key functions and their signatures

4. **Risk assessment** for:
   - Breaking existing task completion flow
   - Over-constraining board deliberation
   - Renderer maintenance burden

## Constraints

- Preserve all existing Part 19-58 functionality
- TypeScript CommonJS modules (compiled via tsc, `module.exports`)
- No Express or new framework dependencies
- Chief of Staff pattern: all new capabilities exposed through CoS
- Privacy-first: no external data leakage
- Documentation required: architecture docs, contracts, runbooks
- Prefer typed enterprise-grade structure over ad-hoc solutions
- The board already uses 4 AI providers — contract awareness should enhance, not replace, their reasoning
