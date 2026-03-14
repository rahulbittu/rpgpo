```text
GPO Sprint — Part 65 — Runtime Pipeline Integration: Structured Deliverables in Live Execution

Objective
Wire the structured deliverables system into the live runtime pipeline so that board deliberation consumes engine contracts, subtasks map and merge outputs into deliverable scaffolds, validation gates task completion, and the operator UI surfaces contract satisfaction in real time.

Strict Constraints
- Preserve all existing functionality and behaviors from Parts 19–64.
- Do not break server.js routes (≈800), guards, deep redaction, or existing TS module contracts (73 modules, 420+ types).
- Follow current architectural patterns: raw Node.js HTTP, CommonJS TS modules, JSON file-based state, typed contracts, inline route guards, deep redaction.
- Integrate with deliverable store (59–60), merge pipeline (61), evidence and approvals (62), UI deliverables panel (63), release candidate assembly (64).
- Add only minimal UI affordances needed to visualize runtime deliverable status; no redesign.
- All new routes must be guarded, auditable, and tenant/project isolated.
- Deterministic IDs, atomic writes, provenance, and per-field policies must remain true at runtime.
- Idempotent merges; concurrency-safe; content-hash dedupe.

In-Scope
- Runtime bindings from tasks/subtasks to deliverable variants and field paths (contract-aware).
- Scaffold creation per run with deterministic IDs.
- Subtask output mapping → merge into deliverables with 5 strategies and field policies.
- Validation checks that drive gate decisions (block, partial, satisfied).
- Evidence linking to merge events and validation results.
- Task completion must gate on contract satisfaction or recorded override.
- Minimal UI: per-run deliverable status, field coverage meter, last-merge provenance, and gating reason.
- APIs to introspect and drive runtime deliverable state.
- Tracing and audit events for scaffold, merge, validate, finalize.

Out-of-Scope
- New engines or new contracts (reuse existing engine contracts and deliverable variants).
- Major UI redesign. Keep changes to targeted additions in existing panels.
- New approval flows (reuse Part 62 lifecycle; runtime proposes artifacts; operator may approve).

New/Updated Types (lib/types.ts)
Add the following types and JSDoc; do not rename or break existing types:
/**
 * Deliverable binding for a task run and its subtask graph.
 */
export interface TaskRunDeliverableBinding {
  runId: string
  projectId: string
  deliverableId: string           // deterministic: <project>:<run>:<key>
  variant: string                 // variant name from contract (e.g., "summary", "plan")
  key: string                     // human-readable key in run plan (e.g., "research-brief")
  createdAt: string               // ISO
  createdBy: string               // "system:runtime"
  contractRef: {
    engine: string                // engine key
    version: string               // contract version
    schemaId: string              // contract schema id
  }
  fieldPolicies: Record<string, MergePolicy>  // path->policy from Part 61
  status: ContractSatisfactionStatus
}
export type ContractSatisfactionStatus = 'pending' | 'partial' | 'satisfied' | 'violated'

/**
 * Subtask-to-deliverable mapping describing how outputs populate fields.
 */
export interface SubtaskDeliverableMapping {
  runId: string
  subtaskId: string
  deliverableId: string
  variant: string
  fieldMap: Array<{
    from: EngineOutputSelector     // e.g., "json.body.field" or "text.block[0]"
    to: string                     // dotted path in deliverable schema
    strategy?: MergeStrategy       // override per field; else policy default
    required?: boolean             // if true, failing to map marks partial/violated
  }>
  evidenceRefs?: string[]          // evidence ids to attach on merge
}

/**
 * Event emitted for each merge application during runtime.
 */
export interface RuntimeMergeEvent {
  eventId: string                  // deterministic hash of (deliverableId, subtaskId, contentHash, toPaths)
  deliverableId: string
  runId: string
  subtaskId: string
  variant: string
  engine: string
  strategy: MergeStrategy
  fieldResults: Array<{
    path: string
    applied: boolean
    previousVersion?: string
    newVersion?: string
    reason?: string
  }>
  provenance: {
    contentHash: string            // sha256 of normalized mapped content
    promptId?: string
    model?: string
    timestamp: string
  }
  evidenceRefs: string[]
}

/**
 * Validation result against a contract schema for a deliverable version.
 */
export interface DeliverableValidationResult {
  deliverableId: string
  variant: string
  versionId: string
  status: ContractSatisfactionStatus
  missingRequired: string[]        // field paths
  typeViolations: Array<{ path: string; expected: string; actual: string }>
  policyViolations: Array<{ path: string; policy: MergePolicy; detail: string }>
  errors?: string[]
}

export type EngineOutputSelector = string
export type MergeStrategy = 'lww' | 'append' | 'merge-deep' | 'replace' | 'minimize-diff'
export interface MergePolicy {
  defaultStrategy: MergeStrategy
  allowOverride?: boolean
  immutablePaths?: string[]        // cannot be changed after first write
  redactPaths?: string[]           // apply deep redaction on read
  requiredPaths?: string[]
  approvalsRequired?: boolean
}

/**
 * Gate decision produced at task completion time.
 */
export interface DeliverableGateDecision {
  runId: string
  deliverables: Array<{
    deliverableId: string
    variant: string
    validation: DeliverableValidationResult
    approved: boolean
  }>
  decision: 'block' | 'allow' | 'allow-with-override'
  reason?: string
  overrideLedgerId?: string
}

New/Updated Modules (lib/)
Create new modules as specified; export only listed public functions. Keep CommonJS style.

1) lib/engine-contract-loader.ts
- Purpose: Load engine deliverable contracts (schema + policies) for a given engine/version.
- Exports:
  - loadEngineContract(engine: string, version?: string): Promise<{ schema: any; version: string; schemaId: string }>
  - getVariantPolicy(engine: string, variant: string): Promise<MergePolicy>
- Notes: Leverage existing contract registry from Part 59/61; cache in-memory with ttl=300s.

2) lib/runtime-deliverables.ts
- Purpose: Orchestrate runtime deliverable scaffolding, merging, validation, and finalization.
- Exports:
  - createScaffold(binding: TaskRunDeliverableBinding): Promise<{ deliverableId: string; versionId: string }>
  - applySubtaskMerge(mapping: SubtaskDeliverableMapping, engineOutput: unknown): Promise<RuntimeMergeEvent>
  - validateDeliverable(deliverableId: string): Promise<DeliverableValidationResult>
  - getStatus(runId: string): Promise<{ status: ContractSatisfactionStatus; byDeliverable: Record<string, DeliverableValidationResult> }>
  - finalizeRun(runId: string): Promise<DeliverableGateDecision>
- Behavior:
  - createScaffold: deterministic deliverableId = `${projectId}:${runId}:${key}`; atomic initial write; set status=pending.
  - applySubtaskMerge: map engineOutput per mapping.fieldMap; select strategies; call Part 61 merge pipeline; write new version (atomic); link evidence (Part 62); emit artifact + audit events; idempotent via contentHash+paths.
  - validateDeliverable: validate against schema + policies; compute missing/type/policy violations; set status partial/satisfied/violated.
  - getStatus: aggregate across deliverables for run; compute overall status with deterministic rule (violated>partial>pending>satisfied).
  - finalizeRun: block unless all required deliverables satisfied (or approvals fulfilled); support override via override ledger if operator forced allow.

3) lib/deliverable-mapper.ts
- Purpose: Deterministically extract fields from raw engine output per EngineOutputSelector.
- Exports:
  - mapEngineOutput(engineOutput: unknown, selector: EngineOutputSelector): { ok: boolean; value?: any; error?: string }
  - normalizeForHash(value: any): string  // stable JSON string for hashing
- Behavior: Support JSON pointer-like selectors and basic text block selectors; no network calls; pure.

4) lib/runtime-validators.ts
- Purpose: Validate deliverable instance against contract schema and policies.
- Exports:
  - validateAgainstContract(deliverableId: string, schema: any, policy: MergePolicy): Promise<DeliverableValidationResult>
- Behavior: Use existing contract enforcement from Part 59; do not duplicate logic; aggregate results to ContractSatisfactionStatus.

5) lib/pipeline-integration.ts
- Purpose: Hook runtime deliverables into existing Chief of Staff orchestration without broad refactor.
- Exports:
  - beforeBoardPlan(runId: string, projectId: string): Promise<void>                 // preload contracts if needed
  - onGraphScaffold(runId: string, bindings: TaskRunDeliverableBinding[]): Promise<void>  // create scaffolds for run
  - onSubtaskOutput(runId: string, subtaskId: string, mapping: SubtaskDeliverableMapping, output: unknown): Promise<RuntimeMergeEvent>
  - onTaskComplete(runId: string): Promise<DeliverableGateDecision>
- Behavior: Thin glue calling runtime-deliverables + evidence linker; emit audit events.

Updated Module (lib/chief-of-staff.ts)
- Add calls:
  - At board deliberation start: pipelineIntegration.beforeBoardPlan
  - After plan creation: build TaskRunDeliverableBinding[] from plan metadata and call pipelineIntegration.onGraphScaffold
  - After each subtask completes: call pipelineIntegration.onSubtaskOutput with mapping + raw output
  - Before marking task run complete: call pipelineIntegration.onTaskComplete; if decision=block, halt and surface to UI; if allow-with-override, require operator override flow (existing override ledger)
- Do not break existing exports; add new internal helpers if needed.
- Persist subtask mapping as part of run plan state (state/runs/*.json) alongside execution graph.

Server/API (server.js)
Add the following guarded routes; keep raw Node style; wire through http-response-guard and deep redaction. All requests/response bodies must conform to new types above.

1) POST /api/runtime/:runId/deliverables/scaffold
- Auth: internal system or operator with write permission.
- Body: { bindings: TaskRunDeliverableBinding[] }
- Response: { ok: true, created: Array<{ deliverableId: string; versionId: string }> }
- Behavior: Calls pipelineIntegration.onGraphScaffold

2) POST /api/runtime/:runId/subtasks/:subtaskId/merge
- Auth: internal system.
- Body: { mapping: SubtaskDeliverableMapping, output: unknown }
- Response: { ok: true, event: RuntimeMergeEvent }
- Idempotent; dedupe via eventId.

3) GET /api/runtime/:runId/deliverables/status
- Auth: operator read.
- Response: { ok: true, status: ContractSatisfactionStatus, byDeliverable: Record<string, DeliverableValidationResult> }

4) POST /api/runtime/:runId/finalize
- Auth: internal system.
- Body: {}
- Response: { ok: true, decision: DeliverableGateDecision }
- Behavior: Calls pipelineIntegration.onTaskComplete; if decision=block, HTTP 409 with decision.

5) GET /api/deliverables/:deliverableId/provenance
- Auth: operator read.
- Response: { ok: true, merges: RuntimeMergeEvent[] }
- Behavior: Read from artifact/evidence registry; apply deep redaction for redactPaths and secret fields.

All new routes:
- Must call http-response-guard with correct shape.
- Must log to audit hub (action, runId, deliverableId, subtaskId, actor).
- Must enforce tenant/project isolation via runId→projectId resolution.
- Must cap payload size for output field.

State/Persistence
- Use versioned deliverable store (Part 60) for writes; atomic and deterministic version IDs.
- Maintain mapping file state/run-deliverables/<runId>.json containing:
  - bindings: TaskRunDeliverableBinding[]
  - lastStatus: { status: ContractSatisfactionStatus; updatedAt: string }
- Concurrency: acquire per-deliverable write lock files during merges; backoff + retry (bounded).

UI (04-Dashboard/app/)
Minimal, targeted changes:
- operator.js
  - Subscribe to /api/runtime/:runId/deliverables/status for active run; poll every 3s while run is in-progress.
  - On subtask log view, append a small “Merged to deliverable” badge with variant + field paths when RuntimeMergeEvent is received (hook into existing event bus/log stream).
- app.js
  - In Task Run panel, add a “Deliverables” section:
    - Status pill (pending/partial/satisfied/violated)
    - Coverage meter: requiredPaths satisfied vs total
    - List of deliverables with last versionId and “View provenance” link
- index.html/style.css/operator.css
  - Minimal additions: pills and a small progress bar; reuse existing styles where possible.
- Reuse Deliverables UI panel (Part 63) for detailed view via provenance link.

Docs
Add/Update the following in 04-Dashboard/docs/:
- ADR: 065-runtime-pipeline-integration.md: rationale, options considered, selected approach.
- Contract: runtime-deliverables-contract.md: types, route schemas, merge/validation rules.
- Runbook: incident-runtime-deliverables.md: handling validation failures, overrides, stuck locks.
- Developer Guide: integrating-new-subtasks-to-deliverables.md: how to define SubtaskDeliverableMapping in plans.

Telemetry & Audit
- Emit audit events:
  - runtime.scaffold.created
  - runtime.merge.applied
  - runtime.validate.completed
  - runtime.finalize.decision
- Include runId, deliverableId, variant, subtaskId, eventId, actor, and contentHash (never raw content).
- Emit metrics counters: merges_applied, merges_deduped, validations_failed, overrides_used.
- Update observability dashboard wiring (reuse existing metrics module).

Acceptance Criteria
Implement the following end-to-end scenarios; provide fixtures and JSON snapshots in 03-Operations/acceptance/part-065/:

1) Board deliberation loads engine contracts and produces a plan with two deliverables (summary, plan); scaffolds created with deterministic IDs.
2) Subtask A produces JSON; mapped to summary.title and summary.points using merge-deep; event recorded and idempotent under replay.
3) Subtask B produces text; mapped to plan.body with replace; previous version retained; provenance links include promptId and model.
4) Policy immutablePaths enforced: attempt to change immutable field fails to apply; validation marks partial; policy violation recorded.
5) RequiredPaths missing causes status=partial; after subsequent subtask fills it, status becomes satisfied.
6) RedactPaths are masked in GET provenance route while raw store remains intact.
7) Concurrent merges (2 subtasks writing different fields) both succeed; version history linearized; no lost updates.
8) Deduplication: re-post of identical merge (same contentHash and to paths) returns ok with same eventId; no new version created.
9) Finalize blocks when at least one required deliverable is pending/violated; 409 returned with decision.reason.
10) Operator override path allows finalize; override ledger entry is created and linked; decision=allow-with-override captured.
11) Evidence refs passed in mapping are linked to merge event and visible in evidence chain.
12) ApprovalsRequired policy: after validation satisfied, approval remains pending; finalize blocks until approval granted (Part 62 flow).
13) Tenant isolation enforced: cross-project runId access denied for all new routes.
14) Deep redaction still strips secrets from any surfaced deliverable fields in API responses.
15) Release candidate assembly (Part 64) now includes satisfied deliverables from an integrated run; diff shows correct versions.
16) Failure path: invalid selector in mapping yields applied=false with reason; does not crash; validation reflects missing field.
17) Large output payload rejected with 413; error logged; run continues and can recover with smaller payload.
18) Audit log contains complete sequence for a run: scaffold→merge→validate→finalize.
19) UI live polling reflects transitions pending→partial→satisfied without full page reload.
20) No regressions in Parts 59–64 acceptance suites; all previous tests pass.

Security & Hardening
- Route guards: enforce internal-only on merge/finalize; operator read on status/provenance.
- Input validation: strict schema checks for mappings and bindings; reject unknown fields.
- Concurrency: per-deliverable lock files; detect and clear stale locks > 60s with audit trail.
- Idempotency keys: use eventId for merge; support If-None-Match style via custom header X-Event-Id (optional).
- Tamper evidence: record sha256 contentHash and versionId linkage in artifact registry; include in audit events.
- Error handling: never include raw output in error bodies; reference evidence/event ids.
- Performance: cache contract schemas; cap merge compute time; avoid synchronous FS loops in hot path (use async).

Migration
- Add new state/run-deliverables/ directory; backfill script to create empty bindings files for existing active runs.
- No schema changes to existing deliverable store; only new linkage files.
- Add lightweight migration note in ADR with rollback instructions (delete linkage files).

Implementation Notes
- Keep server.js changes localized; add routes near existing runtime/task routes; reuse helper auth/resolution utilities.
- Keep functions small and composable; write unit tests for mapper and validators.
- Use existing merge engine (Part 61) via import; do not duplicate.
- For hashing, use existing crypto util from lib/ if present; else Node crypto.

Deliverables Checklist
- Code: new/updated modules and server routes implemented and tested.
- Types: added to lib/types.ts with JSDoc.
- UI: operator.js/app.js/index.html/style.css minimal updates and wired.
- Docs: 4 files added/updated.
- Acceptance: 20 scenario artifacts + scripts/logs.
- Telemetry: events and metrics emitted; dashboards updated if applicable.

Developer Tasks
1) Define new types in lib/types.ts; run tsc and fix any cascade issues.
2) Implement engine-contract-loader with caching.
3) Implement deliverable-mapper with selectors and stable normalization.
4) Implement runtime-deliverables using deliverable store + merge pipeline + evidence linker.
5) Implement runtime-validators using Part 59 enforcement.
6) Implement pipeline-integration and wire into chief-of-staff.ts orchestration points.
7) Add server routes with guards, validation, and audit logging.
8) Update UI for status/coverage and merge badges in subtask logs.
9) Write docs (ADR, contract, runbook, dev guide).
10) Create acceptance fixtures and run end-to-end tests; ensure no regressions.

Submission
- Open a PR titled: Part 65 — Runtime Pipeline Integration (Scaffold→Merge→Validate→Gate)
- Include screenshots/gifs of UI status transitions and provenance view.
- Provide a summary of audit and metrics events from a sample run in PR description.
```
