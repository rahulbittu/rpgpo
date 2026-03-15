```text
You are implementing Part 78 in the RPGPO repository at 04-Dashboard/app.

Title: Part 78 — Multi-Engine Orchestration + Compound Workflows

Baseline
- Repo: /Users/rpgpo/Projects/RPGPO
- App: 04-Dashboard/app
- Raw Node.js HTTP server (server.js), 125+ TS modules, ~890 API routes, ~590+ types, 218+ tests
- Deliverables: versioned store, deterministic IDs, approval lifecycle, evidence linking
- Worker wired: board creates scaffold, subtasks merge, completion validates contract
- Contracts: 15 engine output contracts, structured deliverable validation
- Parts 75-77: provider perf learning store (EWMA), conversational task refinement + task chaining, smart templates + recurring task scheduler
- Strong governance: route guards, deep redaction, mutation guards, tenant/project isolation, budgets

Goal
Add first-class, contract-driven multi-engine orchestration and compound workflows:
- Define reusable compound workflow templates that chain multiple engines
- Orchestrate execution across engines with typed inputs/outputs, explicit data mapping, and contract validation at each step
- Support sequential, fan-out, and fan-in patterns
- Integrate with scheduler (Part 77), refinement (Part 76), learning store (Part 75), deliverable lifecycle, and approval gates
- Provide UI to browse, create, run, monitor, and schedule compound workflows
- Provide APIs, types, persistence, and tests

Non-Goals
- No third-party orchestration libs; stick to current architecture
- No breaking changes to existing single-engine task flows
- No DB migrations; use existing JSON state model

High-Level Design
- A Workflow is a typed DAG of Nodes where each Node binds to an Engine + OutputContract and has InputBindings mapping from prior nodes, constants, or context.
- A WorkflowTemplate is a reusable definition with parameter schema. A WorkflowInstance is a template plus bound params. A WorkflowRun is an execution record with node runs, states, and artifacts.
- Orchestration runner executes ready nodes respecting dependencies, budgets, approvals, and provider policies. Each node’s output is validated against its contract and persisted as deliverables.
- DataMapper supports field-level mapping using a simple, typed JSONPath subset + templated strings with guardrails.
- Policies enforce cycles detection, fan-in merge validation, cost/latency budgets, retry with backoff, escalation and cancellations.
- Learning store used to select engine variant/prompt configs per node when policy permits.

Implementation Plan
Follow the steps below. Preserve all existing functionality and guards. Write precise, typed code. Keep CommonJS + TS as-is.

1) Types — extend lib/types.ts
Add strongly-typed contracts. Keep within existing patterns and naming. Use readonly, branded IDs, and narrow string unions.

Interfaces to add:
- WorkflowId, WorkflowTemplateId, WorkflowInstanceId, WorkflowRunId, WorkflowNodeId (brand types)
- WorkflowNodeType = 'engine' | 'gate' | 'aggregate'
- WorkflowEdge, WorkflowGraph (DAG)
- WorkflowParameterSpec (name, type, required, default, validator?)
- DataBindingSource = { type: 'const' | 'context' | 'nodeOutput'; path?: JSONPath; nodeId?: WorkflowNodeId; value?: unknown; }
- DataMap = Record<string, DataBindingSource | TemplateString>
- TemplateString type with restricted placeholders ${context.*} ${nodes.<id>.*} and safe formatters (titleCase|slug|trim) limited set
- WorkflowTemplate: { id, name, description, parameters: WorkflowParameterSpec[], graph: WorkflowGraph, nodes: Record<WorkflowNodeId, WorkflowNode>, edges: WorkflowEdge[], createdAt, updatedAt, version }
- WorkflowNode: { id, type: 'engine' | 'gate' | 'aggregate', name, description?, engineId?: EngineId, outputContractId?: ContractId, inputMap?: DataMap, policy?: WorkflowNodePolicy, approvals?: ApprovalGateSpec }
- WorkflowNodePolicy: { maxRetries: number; retryBackoffMs: number; costBudgetUSD?: number; latencySLOms?: number; escalateOnBreach?: boolean; requiredTags?: string[]; }
- WorkflowInstance: { id, templateId, name, params: Record<string, unknown>, createdBy, createdAt, schedule?: ScheduleSpec }
- WorkflowRun: { id, instanceId, templateId, startedAt, completedAt?, status: 'queued' | 'running' | 'succeeded' | 'failed' | 'canceled' | 'paused', nodeRuns: Record<WorkflowNodeId, WorkflowNodeRun>, evidence: EvidenceLink[], summary?: string }
- WorkflowNodeRun: { nodeId, startedAt?, completedAt?, status: 'queued' | 'running' | 'succeeded' | 'failed' | 'skipped' | 'blocked', attempt: number, input: Redactable<any>, output?: Redactable<any>, deliverableId?: DeliverableId, error?: Redactable<any>, costUSD?: number, latencyMs?: number }
- EngineCapabilities: { engineId: EngineId, contracts: ContractId[], tags: string[], strengths?: string[], weaknesses?: string[], preferredFor?: string[] }
- PreviewMappingResult: { ok: boolean, inputPreview?: any, errors?: string[] }

2) New modules — create under lib/
- lib/workflows/workflow-contracts.ts
  - Export narrowed types above (re-export from lib/types.ts where appropriate)
  - Export runtime schema validators (using existing internal validation helpers) for DataMap, WorkflowTemplate, WorkflowInstance
- lib/workflows/workflow-store.ts
  - JSON-backed persistence: list/save/get/delete for templates, instances, runs
  - State layout (see #4)
  - Deterministic IDs, version bumping, optimistic concurrency
- lib/workflows/data-mapper.ts
  - Implement safe DataMap evaluation:
    - Support source types: const, context (instance params + run context), nodeOutput
    - JSONPath subset: $.a.b, $[index], $.a[*] only; reject wildcards in keys that produce non-deterministic shapes at fan-in unless aggregate node type used
    - TemplateString rendering with limited formatters; reject unrecognized placeholders
    - Return PreviewMappingResult for preview
  - Redaction hooks: ensure inputs with secrets are masked in run records
- lib/workflows/workflow-registry.ts
  - In-memory + persisted registry for templates and capabilities
  - Register built-in templates (see #6)
  - Register engine capabilities from engines catalog (introspect from existing engine definitions)
- lib/workflows/workflow-runner.ts
  - Core orchestrator:
    - Build execution plan from DAG, verify acyclicity, topo-sort
    - Node readiness: all incoming deps succeeded
    - Prepare node input via data-mapper; validate against engine input contract if defined
    - Call chief-of-staff/board router to execute engine task using existing structured output pipeline and budgets
    - Validate node output against outputContractId; persist deliverable; link evidence
    - Update nodeRun status, cost, latency; emit telemetry
    - Fan-out: schedule multiple children once ready
    - Fan-in: aggregate node type with merge policies (e.g., array concat, keyed object merge with policy)
    - Retries with backoff; escalation on breach; cancellation support
    - Pause/resume hooks; idempotency via run/nodeRun IDs
- lib/workflows/workflow-scheduler-adapter.ts
  - Bridge to Part 77 recurring task scheduler:
    - Allow binding a WorkflowInstance to a schedule
    - Convert schedule trigger into a WorkflowRun creation and enqueue in runner
- lib/workflows/workflow-controller.ts
  - High-level API functions: createTemplate, updateTemplate, createInstance, runInstance, cancelRun, previewMapping, listRuns, getRun, listTemplates, listInstances
- lib/engines/engine-capabilities.ts
  - Derive EngineCapabilities from current engine catalog and contracts
  - Feed learning store to compute preferred engine variants or prompt configs per node when policy allows
- lib/policies/workflow-policies.ts
  - Cross-cutting policies: budget enforcement, guardrails on DataMap use, approval gating integration, escalation rules
- lib/telemetry/workflow-telemetry.ts
  - Emit structured events for runs and nodes; integrate with existing observability

3) Update existing modules
- lib/chief-of-staff.ts
  - Add orchestrateWorkflow(instanceId: WorkflowInstanceId, options?): Promise<WorkflowRunId>
  - Wire to workflow-runner; ensure hooks onTaskStart/onSubtaskComplete/onTaskComplete produce proper evidence entries per node
- lib/board-of-ai.ts or deliberation.ts (where provider planning occurs)
  - Ensure per-node call includes engine output contract schema and structured output enforcement (already added in Part 67+; reuse)
- server.js
  - Wire new routes (see #5) with http-response-guard and deep redaction
  - Register middleware for workflow-specific redaction keys

4) State files
Create new directories under 04-Dashboard/app/state/workflows:
- templates.json               — Array<WorkflowTemplate> (lightweight index), versioned
- instances.json               — Array<WorkflowInstance> (index)
- runs/index.json              — Array<{ runId, instanceId, templateId, status, startedAt, completedAt? }>
- runs/<runId>.json            — Full WorkflowRun
- logs/<runId>.ndjson          — Telemetry stream of workflow/node events

Use existing deterministic ID generator; ensure atomic writes and rollback on partial failure.

5) HTTP APIs (raw Node.js)
All JSON. Guard with existing inline route guard and mutation guards. Namespaced under /api/workflows and /api/engines.

- GET /api/engines/capabilities
  - 200: { capabilities: EngineCapabilities[] }

- GET /api/workflows/templates
  - 200: { templates: WorkflowTemplate[] }

- POST /api/workflows/templates
  - body: { template: WorkflowTemplate } (id optional if new)
  - 201: { template: WorkflowTemplate }
  - Guards: template validation, acyclicity, reserved nodeId/name protection

- PUT /api/workflows/templates/:templateId
  - body: { template: WorkflowTemplate }
  - 200: { template: WorkflowTemplate }

- DELETE /api/workflows/templates/:templateId
  - 204

- POST /api/workflows/templates/:templateId/instances
  - body: { name: string, params: Record<string, unknown>, schedule?: ScheduleSpec }
  - 201: { instance: WorkflowInstance }

- GET /api/workflows/instances
  - 200: { instances: WorkflowInstance[] }

- GET /api/workflows/instances/:instanceId
  - 200: { instance: WorkflowInstance }

- POST /api/workflows/instances/:instanceId/run
  - body: { reason?: string, dryRun?: boolean }
  - 202: { runId: WorkflowRunId, status: 'queued' | 'dry-run' }

- POST /api/workflows/instances/:instanceId/cancel
  - 202: { instanceId, canceled: boolean }

- GET /api/workflows/runs
  - query: { status?: string, instanceId?: string, templateId?: string, limit?: number }
  - 200: { runs: Array<{ runId, instanceId, templateId, status, startedAt, completedAt? }> }

- GET /api/workflows/runs/:runId
  - 200: { run: WorkflowRun }

- POST /api/workflows/preview-mapping
  - body: { templateOrInstance: WorkflowTemplate | WorkflowInstance, nodeId: WorkflowNodeId, context: any, mockNodeOutputs?: Record<WorkflowNodeId, any> }
  - 200: { result: PreviewMappingResult }

- POST /api/workflows/templates/:templateId/schedule
  - body: { instanceId?: WorkflowInstanceId, schedule: ScheduleSpec }
  - 200: { instance: WorkflowInstance }

Ensure:
- Request/response types added to lib/types.ts
- Route handlers call workflow-controller functions
- Redact secrets in nodeRun.input/output/error in responses

6) Built-in workflow templates
Register 3+ templates in workflow-registry.ts with clear, typed graphs:

a) Research → Analyze → Plan
- Nodes:
  - research: engine=ResearchEngine, outputContract=ResearchSummaryV1
  - analyze: engine=FinanceEngine, outputContract=MarketAnalysisV1, inputMap pulls top3 ideas + market data lookup triggers
  - plan: engine=PlanningEngine, outputContract=ActionPlanV1, inputMap uses analyze results to draft plan with milestones
- Parameters: topic (string), budgetUSD (number), timeframe (string)
- Policies: latencySLO, costBudget per node, retries 2

b) Brainstorm → Score (fan-out) → Select (fan-in) → Plan
- score: N parallel scorer nodes or one node handling batch per engine contract; use aggregate node to combine
- Selection gate applies threshold

c) Scrape → Summarize → Decision Brief
- Uses WebScraperEngine, SummarizerEngine, DecisionEngine

Ensure all outputContractIds correspond to existing deliverable contracts; if needed, add lightweight mapping wrappers but do not break existing contracts.

7) Orchestration semantics
- DAG validation with cycle detection
- Node states: queued → running → succeeded/failed/skipped/blocked
- Fan-out: allow edges from one node to multiple dependents
- Fan-in: aggregate node type with policy:
  - arrayConcat or keyByChildId
  - Validate merged shape against next node’s expected input (best-effort)
- Fail-fast vs continue-on-error: template-level policy; default fail on first hard error
- Retry/backoff: nodePolicy.{maxRetries,retryBackoffMs}
- Budgets: enforce per-node and per-run (sum) using existing governance; escalate on breach via approvals
- Cancellation: cancel run propagates to running nodes (best-effort) and sets remaining to skipped
- Idempotency: re-running a failed node within same run increments attempt; re-running an instance creates a new runId
- Evidence: link each deliverable to run/node IDs

8) UI
Update 04-Dashboard/app UI with minimal but usable panels. Maintain current shell and styling.

- index.html
  - Add "Workflows" tab with:
    - Templates list (name, version, nodes count)
    - Instances list (name, template, schedule badge)
    - Runs list (status, startedAt, duration, success rate)
  - Detail modal/panel:
    - Template detail: nodes and edges visualization (simple list + badges), parameters, policies
    - Instance detail: params, schedule, run buttons (Run, Dry Run, Cancel)
    - Run detail: DAG status view (list with per-node status), input/output previews (redacted), deliverable links, telemetry stream tail

- app.js / operator.js
  - Fetch from new APIs
  - Implement run button flows; show toast/alerts on success/failure
  - Implement preview-mapping action per node with mock outputs
  - Respect route guards errors; display redaction-safe errors

- style.css / operator.css
  - Minimal styles for lists and status badges; reuse existing tokens/components

9) Policies, governance, and redaction
- Use deep-redaction.ts to mask secrets in node inputs/outputs/errors before persistence and response
- Enforce tenant/project isolation in store paths and controller lookups
- Integrate approval gates: if a node has approvals, pause node until approved via existing human approval workspace; surface paused state in UI
- Integrate learning store: prefer engine variants with lower latency/cost for node intents when allowed by nodePolicy.requiredTags
- Ensure middleware truth: add new routes to middleware registry and guards

10) Docs
Add/update under 04-Dashboard/app/docs:
- ADR: adr-0xx-multi-engine-orchestration.md — decision, alternatives, DAG choice, data-mapper DSL
- Contract: contracts/workflows.md — type definitions, DataMap DSL ref, policies
- Runbook: runbooks/workflows-runbook.md — creating templates/instances, running, debugging, approvals, cancellation
- Operator Guide: operator/workflows-ui.md — using the UI panels
- API: api/workflows.md — routes, request/response, examples
- Security: security/workflows-governance.md — redaction, approvals, budgets, isolation

11) Tests
Add 30+ tests under 04-Dashboard/app/tests/workflows/*.test.ts. Cover:
- Types validate sample templates and instances
- DAG cycle detection and topo sort
- DataMap evaluation: const/context/nodeOutput, template strings, formatter bounds, redaction
- Orchestration happy path for built-in templates
- Fan-out/fan-in aggregate node behavior
- Retry/backoff and failover
- Budget breach → escalation path
- Approval-gated node pause/resume flow
- Cancellation mid-run
- Persistence correctness: templates, instances, runs
- API contract tests for all routes (200/4xx/5xx)
- UI integration tests (if existing pattern) for key flows
- Learning store integration for engine variant selection
- Route guards on all new endpoints
- Dry-run mapping preview success and error cases

12) Acceptance criteria
- Define at least 12 new acceptance scenarios (add to 150+ suite) including:
  1) Research→Analyze→Plan produces 3 node deliverables and a final approved plan deliverable
  2) Brainstorm→Score fan-out across 3 scorers with aggregate and selection
  3) Schedule-bound instance runs at schedule, creates runs, and completes
  4) Mapping preview shows expected input for analyze node given mock research output
  5) Budget breach triggers escalation, requires approval to continue
  6) Cancellation marks running node canceled and remaining nodes skipped
  7) Retry on transient node error succeeds on second attempt
  8) Fan-in merge validation prevents incompatible shapes
  9) Redaction masks secrets in persisted nodeRun inputs/outputs/errors
  10) Learning store biases engine variant choice and records perf
  11) API guard denies malformed template (cycle) with 400 and helpful message
  12) UI displays live run state transitions and deliverable links

13) Hardening
- Cycle detection and max node count limit (configurable; default 30) to prevent abuse
- Execution watchdog: per-node and per-run max duration; auto-cancel
- Idempotent route handlers for run creation
- Strict schema validation at all boundaries
- Deterministic mappings only: reject ambiguous JSONPath or wildcards unless aggregate node
- Sandboxed template strings: no eval; only whitelisted formatters
- Concurrency control on run writes; ensure atomic append to NDJSON logs
- Back-pressure: limit concurrent nodes; queue with fairness
- Telemetry sampling sensible defaults; no PII in logs
- Ensure 100% middleware truth for new routes and extend route protection list

14) Wire-up checklist
- Export new types from lib/types.ts and add to barrel exports if used
- Register engine capabilities on startup
- Load built-in templates on startup; persist if not present
- Add new routes to server.js routing table and guards
- Ensure onTaskStart/onSubtaskComplete/onTaskComplete hooks include workflow context tags
- Update operator navigation to include Workflows tab
- Verify no regressions in existing single-engine tasks

Deliverables
- New/updated TS modules as listed
- Updated server.js route handlers
- State files/directories created
- UI changes in index.html, app.js/operator.js, styles
- Docs (ADR, contracts, runbook, operator, API, security)
- Tests (30+), acceptance scenarios (12+)
- Commit messages: "Part 78: Multi-Engine Orchestration + Compound Workflows (templates, runner, APIs, UI, tests)"

Constraints
- CommonJS modules with TypeScript strict mode
- No new external dependencies
- Preserve existing behavior; all prior acceptance cases pass
- All new routes guarded and redacted

Provide:
- Exact file additions/edits with module-level function signatures
- Route registration snippets for server.js
- Sample JSON for one built-in template
- Example DataMap usage with context and nodeOutput
- Test matrices for retries/fan-in variants
- Any minimal shims needed to reuse existing deliverable contracts without breaking them

Begin implementation now. Output code diffs and new files with full content where feasible; otherwise include precise skeletons with TODO markers and all exported types and signatures. Ensure the end-to-end demo: run built-in Research→Analyze→Plan workflow from UI and see all three node deliverables and the final aggregated plan.
```
