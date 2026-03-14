# ChatGPT Response

## Decision
Adopt a contract-first deliverable pipeline for Part 59:
- Define a typed StructuredDeliverable union with per-engine variants and a RenderModel abstraction.
- Enforce contracts at two points: plan-time (board contract awareness + scaffold/assembler subtasks) and completion-time (runtime validator + closure gating).
- Introduce a renderer registry with per-engine-family renderers, server-normalized RenderModel, and lightweight client JS renderers.
- Make the mission acceptance suite minimally executable via a contract-shape runner using the new validators and renderer snapshot checks (no new external deps).

This preserves all existing behavior (raw text fallback) while making structured deliverables the default for the 15 engines.

## Recommended Direction
- Types: Add StructuredDeliverable and RenderModel to types.ts; create ContractEnforcementResult and BoardContractContext types.
- Modules:
  1) lib/structured-deliverables.ts — schema, normalization, and runtime validators.
  2) lib/contract-enforcement.ts — plan-time and completion-time enforcement; assembler/scaffold helpers.
  3) lib/deliverable-rendering.ts — transforms StructuredDeliverable → RenderModel; registry for engine-family renderers.
- Integrations:
  - deliberation.ts reads engine contract → BoardContractContext → produces a contract-aware plan (adds “Assemble Deliverable” and “Validate Deliverable” gate).
  - workflow.ts captures subtask outputs into a deliverable scaffold; blocks closure if required fields missing; emits remediation checklist.
  - final-output-surfacing.ts requests RenderModel and persists deliverable JSON alongside the task.
  - app.js uses new client renderers per engine type; falls back to raw text when absent.
- Acceptance: Add a mission-acceptance-runner to execute seeded scenarios in “contract-mode” (shape and renderer snapshot checks), with an option to run full pipeline later.

## Required Modules
1) app/lib/structured-deliverables.ts
- Responsibility: Typed deliverable variants; schema registry; normalization; field-level validators; diff helpers.
- Key exports:
  - getDeliverableSchema(engineId: string): DeliverableSchema
  - normalizeDeliverable(engineId: string, input: unknown): StructuredDeliverable
  - validateDeliverable(engineId: string, d: StructuredDeliverable): ContractEnforcementResult
  - listMissingFields(engineId: string, d: StructuredDeliverable): string[]
  - computeDeliverableDiff(prev: StructuredDeliverable|null, next: StructuredDeliverable): { changed: string[] }

2) app/lib/contract-enforcement.ts
- Responsibility: Contract-aware planning and runtime enforcement.
- Key exports:
  - buildBoardContractContext(engineId: string): BoardContractContext
  - applyContractToPlan(ctx: BoardContractContext, plan: SubtaskPlan): SubtaskPlan
  - initDeliverableScaffold(taskId: string, ctx: BoardContractContext): StructuredDeliverable
  - mergeSubtaskOutput(taskId: string, subtaskId: string, output: unknown): { updated: StructuredDeliverable }
  - enforceAtCompletion(taskId: string, engineId: string): ContractEnforcementResult
  - remediationFromFailures(res: ContractEnforcementResult): RemediationChecklist

3) app/lib/deliverable-rendering.ts
- Responsibility: Server-side normalization of deliverables into RenderModel; registry + per-engine-family transformers.
- Key exports:
  - toRenderModel(engineId: string, d: StructuredDeliverable): RenderModel
  - getRendererKey(engineId: string): RendererKey
  - isRenderable(engineId: string, d: StructuredDeliverable): boolean

UI (client):
- app/renderers/newsroom.js, shopping.js, code.js, document.js (or single app/renderers.js with registry):
  - window.GPO_RENDERERS.register(key, fn)
  - fn takes RenderModel and returns a DOM fragment.
- app/app.js integration at Final Result block:
  - fetch /api/tasks/:id/deliverable
  - choose renderer by model.rendererKey; fallback to raw text.

Chief of Staff (augment existing):
- lib/chief-of-staff.ts new functions:
  - getBoardContractContext(engineId: string): BoardContractContext
  - getDeliverable(taskId: string): StructuredDeliverable | null
  - renderDeliverable(taskId: string): { model: RenderModel, html?: string }
  - validateDeliverableForTask(taskId: string): ContractEnforcementResult

Server routes (raw Node):
- GET /api/tasks/:id/deliverable → deliverable JSON + RenderModel metadata
- POST /api/tasks/:id/deliverable/validate → ContractEnforcementResult
- POST /api/tasks/:id/plan/contract-enforce → contract-aware plan preview (guarded; operator only)

## APIs
- Type signatures (TypeScript, CommonJS)

1) app/lib/types.ts (additions)
- StructuredDeliverable (discriminated union)
- DeliverableRenderer interface (server and client agree on RenderModel contract)
- ContractEnforcementResult
- BoardContractContext
- RenderModel

Proposed types (extract; keep in types.ts)

export type EngineOutputType =
  | 'ranked_list'
  | 'document'
  | 'code_change'
  | 'recommendation'
  | 'schedule'
  | 'creative_draft'
  | 'analysis'
  | 'action_plan';

export interface NewsroomDeliverable {
  kind: 'newsroom';
  engineId: string;
  title: string;
  generatedAt: string; // ISO
  rankedItems: Array<{
    rank: number;
    headline: string;
    summary: string;
    source: { name: string; url: string };
    score?: number;
    tags?: string[];
  }>;
  methodology?: string;
}

export interface ShoppingDeliverable {
  kind: 'shopping';
  engineId: string;
  title: string;
  generatedAt: string; // ISO
  items: Array<{
    name: string;
    price: { amount: number; currency: string };
    url?: string;
    pros: string[];
    cons: string[];
    specs?: Record<string, string | number | boolean>;
    score?: number;
  }>;
  comparisonKeys: string[]; // e.g., ['price','battery','weight']
}

export interface CodeChangeDeliverable {
  kind: 'code_change';
  engineId: string;
  title: string;
  generatedAt: string;
  diffs: Array<{
    filePath: string;
    changeType: 'add' | 'modify' | 'delete' | 'rename';
    before?: string; // optional for new files
    after?: string;  // optional for deleted files
    hunks?: Array<{ header: string; lines: string[] }>;
    rationale?: string;
  }>;
  testNotes?: string;
}

export interface DocumentDeliverable {
  kind: 'document';
  engineId: string;
  title: string;
  generatedAt: string;
  sections: Array<{
    heading: string;
    content: string; // markdown-ish/plain
    anchors?: string[];
  }>;
  references?: Array<{ label: string; url?: string }>;
}

export interface RecommendationDeliverable {
  kind: 'recommendation';
  engineId: string;
  title: string;
  generatedAt: string;
  recommendations: Array<{
    label: string;
    rationale: string;
    confidence?: number;
    action?: { type: string; payload?: Record<string, unknown> };
  }>;
}

export interface ScheduleDeliverable {
  kind: 'schedule';
  engineId: string;
  title: string;
  generatedAt: string;
  events: Array<{
    start: string; end: string; title: string; location?: string; attendees?: string[];
  }>;
}

export interface CreativeDraftDeliverable {
  kind: 'creative_draft';
  engineId: string;
  title: string;
  generatedAt: string;
  artifacts: Array<{ type: 'poem' | 'script' | 'lyrics' | 'story'; content: string }>;
}

export interface AnalysisDeliverable {
  kind: 'analysis';
  engineId: string;
  title: string;
  generatedAt: string;
  findings: Array<{ label: string; detail: string }>;
  charts?: Array<{ type: string; data: unknown }>;
}

export interface ActionPlanDeliverable {
  kind: 'action_plan';
  engineId: string;
  title: string;
  generatedAt: string;
  steps: Array<{ id: string; description: string; owner?: string; eta?: string; status?: 'todo'|'in_progress'|'done' }>;
  risks?: Array<{ risk: string; mitigation: string }>;
}

export type StructuredDeliverable =
  | NewsroomDeliverable
  | ShoppingDeliverable
  | CodeChangeDeliverable
  | DocumentDeliverable
  | RecommendationDeliverable
  | ScheduleDeliverable
  | CreativeDraftDeliverable
  | AnalysisDeliverable
  | ActionPlanDeliverable;

export type RendererKey =
  | 'newsroom_list'
  | 'shopping_table'
  | 'code_diff'
  | 'document_sections'
  | 'recommendation_list'
  | 'schedule_timeline'
  | 'creative_view'
  | 'analysis_brief'
  | 'action_plan_steps';

export interface RenderModel {
  rendererKey: RendererKey;
  title: string;
  meta?: Record<string, string | number | boolean>;
  // Unionless, flattened fields used by renderers to avoid leaking server types to UI
  // Example fields per rendererKey:
  items?: Array<Record<string, unknown>>;
  table?: { columns: string[]; rows: Array<Record<string, unknown>> };
  diffs?: Array<{ filePath: string; changeType: string; hunks?: Array<{ header: string; lines: string[] }> }>;
  sections?: Array<{ heading: string; content: string }>;
  steps?: Array<{ id: string; description: string; status?: string }>;
  timeline?: Array<{ start: string; end: string; title: string; location?: string }>;
  badges?: string[]; // e.g., “Contract: Missing source_links”
}

export interface DeliverableRenderer {
  key: RendererKey;
  render(model: RenderModel, opts?: { compact?: boolean }): string; // returns HTML string
}

export interface ContractEnforcementResult {
  status: 'pass' | 'soft_fail' | 'hard_fail';
  missingFields: string[];
  details?: Array<{ field: string; message: string }>;
  suggestions?: string[];
}

export interface BoardContractContext {
  engineId: string;
  outputType: EngineOutputType;
  contractVersion: string;
  requiredFields: string[]; // from output-contracts.ts
  // Optional: guidance snippets to steer providers
  examples?: Array<{ description: string; json: unknown }>;
  rubric?: string; // short bullets the Board will see
}

export interface RemediationChecklist {
  items: Array<{ id: string; label: string; fixHint: string; owner: 'agent' | 'operator' }>;
}

2) app/lib/structured-deliverables.ts (CommonJS)
module.exports = {
  getDeliverableSchema,
  normalizeDeliverable,
  validateDeliverable,
  listMissingFields,
  computeDeliverableDiff
};

// Implementation notes:
// - getDeliverableSchema maps engineId -> kind + field requirements.
// - normalizeDeliverable coerces basic shapes (e.g., numbers to strings where safe).
// - validateDeliverable loads output-contracts.ts required_fields and maps them to concrete fields by kind.
// - listMissingFields returns dotted-path missing field names.
// - computeDeliverableDiff used for audit/evidence chain.

3) app/lib/contract-enforcement.ts (CommonJS)
module.exports = {
  buildBoardContractContext,
  applyContractToPlan,
  initDeliverableScaffold,
  mergeSubtaskOutput,
  enforceAtCompletion,
  remediationFromFailures
};

// Key signatures:
// buildBoardContractContext(engineId: string): BoardContractContext
// applyContractToPlan(ctx, plan): SubtaskPlan
// - Inserts “Assemble Deliverable” subtask at end-of-plan
// - Inserts “Validate Deliverable” gate subtask
// initDeliverableScaffold(taskId, ctx): StructuredDeliverable
// mergeSubtaskOutput(taskId, subtaskId, output): merges extracted fields into scaffold; persists state/deliverables/taskId.json
// enforceAtCompletion(taskId, engineId): ContractEnforcementResult
// remediationFromFailures(res): RemediationChecklist

4) app/lib/deliverable-rendering.ts (CommonJS)
module.exports = {
  toRenderModel,
  getRendererKey,
  isRenderable
};

// getRendererKey(engineId) uses engine-catalog.ts output type to registry key mapping:
// ranked_list -> newsroom_list (Newsroom)
// recommendation (Shopping) -> shopping_table
// code_change -> code_diff
// document (Legal, Research, Startup) -> document_sections
// analysis -> analysis_brief
// action_plan -> action_plan_steps
// schedule -> schedule_timeline
// creative_draft -> creative_view

5) Chief of Staff additions (lib/chief-of-staff.ts)
module.exports = {
  // existing exports …
  getBoardContractContext,
  getDeliverable,
  renderDeliverable,
  validateDeliverableForTask
};

// getBoardContractContext(engineId)
// getDeliverable(taskId)
// renderDeliverable(taskId) -> { model, html?: string } (server may pre-render HTML for email/exports later)
// validateDeliverableForTask(taskId) -> ContractEnforcementResult

6) Server routes (server.js)
- GET /api/tasks/:id/deliverable
  - Reads state/deliverables/:id.json (via CoS.getDeliverable) and returns { deliverable, model: RenderModel }
- POST /api/tasks/:id/deliverable/validate
  - Returns ContractEnforcementResult
- POST /api/tasks/:id/plan/contract-enforce
  - Returns contract-aware plan preview (uses CoS + deliberation.applyContractToPlan)
All 3 guarded via existing http-response-guard middleware; redact deliverable PII if tenant boundary requires (deep-redaction.ts).

## UI
- app/app.js (Final Result block, lines ~2230-2280):
  - Change data load: fetch GET /api/tasks/:id/deliverable
  - If model present, call window.GPO_RENDERERS.render(model); inject result HTML into Final Result block.
  - If missing, show existing raw text fallback with “Unstructured output” badge and link “Validate deliverable”.
- New client registry:
  - app/renderers.js
    - window.GPO_RENDERERS = {
        register: function(key, fn) { registry[key] = fn; },
        render: function(model) { return (registry[model.rendererKey] || fallback)(model); }
      }
  - app/renderers/newsroom.js: cards for rankedItems with source links
  - app/renderers/shopping.js: comparison table from items/specs
  - app/renderers/code.js: simple unified diff blocks from diffs
  - app/renderers/document.js: sectioned document view
  - Minimal CSS in style.css/operator.css additions: .deliverable-card, .diff, .comparison-table, .badge-missing
- Degradation:
  - If RenderModel.badges contains missing field indicators, show yellow badges and actionable hints.

## Docs
- 04-Dashboard/docs/adr/ADR-0059-structured-deliverables-and-contract-enforcement.md
  - Decision, alternatives considered, renderer registry rationale.
- 04-Dashboard/docs/runbooks/deliverables-runbook.md
  - How deliverables are scaffolded, assembled, validated, and rendered. Operator remediation steps.
- 04-Dashboard/docs/contracts/output-contracts-v2.md
  - Mapping from output-contracts.ts required_fields to StructuredDeliverable fields by engine.
- 04-Dashboard/docs/testing/mission-acceptance-runner.md
  - How to run the new contract-mode acceptance execution, expected outputs, failure triage.

## Acceptance Criteria
- Types
  - types.ts compiles with new StructuredDeliverable union, RenderModel, DeliverableRenderer, ContractEnforcementResult, BoardContractContext.
- Plan-time enforcement
  - For each of the 15 engines, a new plan generated via deliberation.ts includes:
    - A terminal “Assemble Deliverable” subtask.
    - A terminal “Validate Deliverable” gate subtask.
  - Subtasks include explicit goals referencing required_fields from the engine’s contract.
- Runtime enforcement
  - During workflow execution:
    - A deliverable scaffold file is created at state/deliverables/:taskId.json.
    - mergeSubtaskOutput merges at least one required field contribution.
    - Completion gate runs validateDeliverable; if missingFields non-empty:
      - Task closure set to blocked_with_remediation.
      - Remediation checklist recorded in task timeline and visible to operator.
- Rendering
  - For Newsroom, Shopping, Code Change, and Document engines:
    - Final Result block renders a structured view appropriate to the engine.
    - Missing fields render with a visible badge.
    - Raw text fallback available via a “Show raw output” link.
- API
  - GET /api/tasks/:id/deliverable returns 200 with JSON when deliverable exists; 404 when absent.
  - POST /api/tasks/:id/deliverable/validate returns ContractEnforcementResult.
  - All new routes pass guard checks and redact according to deep-redaction rules.
- Board contract awareness
  - Board prompts include a short rubric and required fields for the selected engine.
  - Generated plans show explicit steps to produce or collect each required field.
- Acceptance suite (minimum executable)
  - mission-acceptance-runner executes 150 scenarios in contract-mode:
    - For each scenario: synthesizes a minimal StructuredDeliverable via scaffold + validator (no external calls), asserts pass/fail on required fields.
    - Produces a summary report in 03-Operations/acceptance/reports/latest.json (pass %, per-engine stats).
- No regressions
  - Existing 13/13 workflows run.
  - Existing routes still guarded; existing Final Result raw output still accessible.

## Hardening Notes
- Backward compatibility:
  - Do not change existing task JSON schema; store deliverables separately in state/deliverables/:taskId.json and reference via a pointer in the task timeline entry.
  - Keep final-output-surfacing.ts capable of old “raw” mode.
- Strict but not brittle:
  - Enforcement defaults: plan-time strict, completion-time soft-to-hard escalation:
    - If missingFields <= 2 and model present → soft_fail; set awaiting_operator_approval with warnings.
    - If missingFields > 2 or top-level array empty → hard_fail; set blocked_with_remediation.
  - Configurable thresholds per engine via output-contracts.ts addition: enforcement: { severity: 'strict'|'balanced'|'lenient' } (default balanced).
- Privacy:
  - Deliberation prompt augmentation includes only contract fields/rubric; no scenario data beyond task input.
  - No new external calls introduced.
- Observability:
  - Log enforcement decisions with contractVersion and missingFields to 03-Operations/logs/contract-enforcement-YYYYMMDD.log.
  - Emit evidence chain entry when scaffold initialized and when diff computed.
- Security:
  - Validate that source URLs in deliverables are http(s) only; strip javascript: links server-side in normalizeDeliverable.
  - Strip/escape HTML in text fields before passing to RenderModel; client renderers must not use innerHTML unsafely. Prefer textContent and simple templating; where HTML is returned, sanitize.
- Renderer discipline:
  - Keep server RenderModel stable; add new renderer keys via a registry with versioning: rendererKey: `${key}@v1`. Client ignores @vN suffix if unknown, using base key.
- Failure modes:
  - If deliverable JSON corrupt, reset scaffold (version bump) and write an evidence note; operator can re-run “Assemble Deliverable”.
- Testing:
  - Unit tests for validateDeliverable (per engine mapping).
  - Snapshot tests for RenderModel (golden JSON fixtures).
  - UI smoke test to ensure renderer registry loads and renders minimal model.

## Answers to Specific Questions
1) Deliverable schema per engine:
- Use a typed StructuredDeliverable discriminated union with per-engine variants (e.g., NewsroomDeliverable, ShoppingDeliverable, CodeChangeDeliverable). This gives compile-time guarantees and clearer runtime validators. Pair with a RenderModel abstraction to decouple server types from the client.

2) Contract enforcement insertion point:
- Both: plan-time and completion-time.
  - Plan-time: BoardContractContext steers planning; inject Assemble + Validate subtasks; create scaffold early.
  - Completion-time: Validate deliverable; gate closure; produce remediation checklist.
- Graceful degradation via balanced enforcement policy and visible UI badges.

3) Board contract awareness:
- Yes. Inject engine’s output contract into deliberation via BoardContractContext (required_fields, rubric, examples). Keep it concise and instructive to avoid rigidity. Also transform the resultant plan by adding the assembly/validation steps programmatically to guarantee the final mile.

4) Renderer architecture:
- Separate renderer modules per engine family with a small registry:
  - Server: deliverable-rendering.ts produces a stable RenderModel.
  - Client: lightweight renderer functions registered by key; easier maintenance and progressive enhancement.

5) Acceptance execution:
- Minimum viable: a contract-mode runner that:
  - Builds scaffolds per scenario and validates required fields.
  - Optionally replays cached/golden deliverables for known cases to test renderers (snapshot-style).
  - Full pipeline execution can be a follow-up part after renderers and enforcement stabilize.

6) Graceful degradation:
- If contract not fully satisfied:
  - soft_fail: awaiting_operator_approval with visible missing badges and specific remediation actions.
  - hard_fail: blocked_with_remediation with checklist; operator can re-run specific subtasks.
- Partial deliverables still render with “Incomplete” badges; raw text linked as fallback.

## Module Decomposition (3 new modules)

1) structured-deliverables.ts
- Responsibilities:
  - Provide formal deliverable schemas for all 15 engines (via mapping engineId -> kind).
  - Normalize raw subtask outputs into StructuredDeliverable variants.
  - Validate deliverables against required_fields from output-contracts.ts.
- Key functions:
  - getDeliverableSchema(engineId: string): { kind: StructuredDeliverable['kind']; fields: string[] }
  - normalizeDeliverable(engineId: string, input: unknown): StructuredDeliverable
  - validateDeliverable(engineId: string, d: StructuredDeliverable): ContractEnforcementResult
  - listMissingFields(engineId: string, d: StructuredDeliverable): string[]
  - computeDeliverableDiff(prev: StructuredDeliverable|null, next: StructuredDeliverable): { changed: string[] }
- Integration:
  - Called by contract-enforcement.ts, workflow.ts, final-output-surfacing.ts.

2) contract-enforcement.ts
- Responsibilities:
  - Turn contracts into plan-time constraints and runtime gates.
  - Manage deliverable scaffold lifecycle and merges from subtask outputs.
- Key functions:
  - buildBoardContractContext(engineId: string): BoardContractContext
  - applyContractToPlan(ctx: BoardContractContext, plan: SubtaskPlan): SubtaskPlan
  - initDeliverableScaffold(taskId: string, ctx: BoardContractContext): StructuredDeliverable
  - mergeSubtaskOutput(taskId: string, subtaskId: string, output: unknown): { updated: StructuredDeliverable }
    - Strategy: heuristic extractors per kind (e.g., headlines/summaries/links → rankedItems)
  - enforceAtCompletion(taskId: string, engineId: string): ContractEnforcementResult
  - remediationFromFailures(res: ContractEnforcementResult): RemediationChecklist
- Integration:
  - Used by deliberation.ts after plan creation.
  - Used by workflow.ts at task start (init scaffold), after each subtask (merge), and before closure (enforceAtCompletion).

3) deliverable-rendering.ts
- Responsibilities:
  - Convert StructuredDeliverable to a generic RenderModel understood by clients.
  - Choose rendererKey based on engine family/output type.
- Key functions:
  - toRenderModel(engineId: string, d: StructuredDeliverable): RenderModel
  - getRendererKey(engineId: string): RendererKey
  - isRenderable(engineId: string, d: StructuredDeliverable): boolean
- Integration:
  - Used by final-output-surfacing.ts to attach RenderModel to timeline and by server route to serve /deliverable.

## Risk Assessment
- Breaking existing task completion flow:
  - Risk: Hard failures could block all tasks initially.
  - Mitigation: Start with “balanced” enforcement; soft_fail when close; opt-out flag per engine if needed; keep raw text fallback; keep closure states unchanged but triggered via new logic.
- Over-constraining board deliberation:
  - Risk: Board becomes rigid, ignoring creative strategies.
  - Mitigation: Provide a brief rubric and required_fields only; do not prescribe steps beyond assembler/validator; allow Board to choose methods; keep applyContractToPlan as a post-processor adding only terminal steps.
- Renderer maintenance burden:
  - Risk: Many per-engine renderers.
  - Mitigation: Group by engine family/output type; RenderModel shields UI from server type changes; registry decouples loading; start with 4 families (newsroom_list, shopping_table, code_diff, document_sections); add others incrementally.

This Part 59 plan is implementation-ready, preserves current capabilities, adds typed contracts, plan-time/runtime enforcement, and delivers end-user-quality structured deliverables with maintainable renderers and guardrails.
