```
You are implementing Part 66 of GPO/RPGPO.

Title: Worker + Board Wiring — Connect actual execution worker and board deliberation to the structured deliverable pipeline so real tasks produce real deliverables.

Objective:
- Ensure the real task execution path (worker.js) invokes the runtime pipeline hooks: onTaskStart, onSubtaskComplete, onTaskComplete.
- Ensure Board deliberation/planning includes engine contract context so subtasks target contract-required fields and map cleanly into the deliverable.
- Preserve all existing working functionality, guards, governance, and UI. No regressions.

Current baseline:
- Parts 19-65 complete. 75 TS modules, ~810 API routes, ~430+ types.
- Part 65 added runtime pipeline integration: onTaskStart creates scaffold, onSubtaskComplete merges output, onTaskComplete validates contract and gates closure.
- Full deliverable lifecycle exists: scaffold → merge → validate → store → approve → release assembly.
- Worker currently runs tasks/subtasks but does not call the hooks.

High-level Changes:
1) Wire worker.js to runtime pipeline hooks with typed, idempotent calls and evidence/metrics propagation.
2) Update Board deliberation prompt builder to inject engine contract context and require subtask → contractField targeting.
3) Record deliverable handle in TaskRun state and surface in UI (link only; no UX overhaul).
4) Tests: unit and integration for worker/pipeline and board prompt planning.
5) Docs: runbook updates, contracts in prompts, and operational guidance.
6) Feature flags and rollbacks to avoid downtime.

Constraints:
- CommonJS modules with TypeScript. Preserve existing module patterns.
- Raw Node.js HTTP; no new framework.
- Maintain route/mutation guards and deep redaction paths already wired.
- No schema-breaking changes to state JSON; additive fields only.
- Preserve provider governance, budgets, enforcement integration.

Repository targets (verify paths; adjust if slightly different in repo):
- 04-Dashboard/app/worker.js (or worker.ts if already migrated)
- 04-Dashboard/app/lib/runtime-pipeline.ts (Part 65 hooks live here)
- 04-Dashboard/app/lib/board-of-ai.ts (or lib/board-deliberation.ts)
- 04-Dashboard/app/lib/types.ts
- 04-Dashboard/app/lib/engine-catalog.ts (or engine-registry.ts)
- 04-Dashboard/app/state/ (deliverables, tasks, runs)
- 04-Dashboard/app/app.js and UI task details (link surfacing)
- 04-Dashboard/app/server.js (only if needed for surfacing link in API)

Step-by-step Implementation:

A) Types and Contracts
1. lib/types.ts — ensure or add the following types (align with Part 65; if already present, extend, don’t duplicate):
- PipelineContext:
  - taskId: string
  - runId: string
  - engineKey: string
  - contractId: string
  - deliverableId: string
  - startedAt: string
  - actor: 'worker' | 'board' | 'manual'
  - tenantId: string
  - projectId: string
- SubtaskPlan:
  - id: string
  - name: string
  - description?: string
  - providerKey: string
  - targetContractFields: string[] // names as per contract schema
  - dependencies?: string[]
- SubtaskResult:
  - subtaskId: string
  - name: string
  - targetContractFields: string[]
  - output: unknown // raw model output
  - normalized?: Record<string, unknown> // partially extracted mapping
  - evidence?: { logs?: string[]; citations?: string[]; attachments?: string[] }
  - metrics?: { tokensIn?: number; tokensOut?: number; costUSD?: number; latencyMs?: number }
  - provider?: { key: string; model?: string; configHash?: string }
  - startedAt?: string
  - completedAt?: string
  - success: boolean
  - error?: { message: string; code?: string; retriable?: boolean }
- TaskRun.pipeline (augment existing TaskRun type):
  - enabled: boolean
  - deliverableId?: string
  - contractId?: string
  - lastHook?: 'onTaskStart' | 'onSubtaskComplete' | 'onTaskComplete'
  - lastUpdatedAt?: string

2. Ensure engine contract registry types exist:
- EngineContract:
  - id: string
  - engineKey: string
  - version: string
  - requiredFields: string[] // list of required top-level fields
  - jsonSchema: object // canonical JSON Schema for validation
  - guidance?: string // tips for producers
- Export a typed getter: getEngineContract(engineKey: string): EngineContract

B) Runtime Pipeline Hook Integration in Worker
1. Locate task execution entry (likely in 04-Dashboard/app/worker.js):
- Identify the primary function executing a task, e.g., executeTask(task) or runTask(taskId).
- Identify the subtask execution loop, where providers are called and results resolved.
- Identify the finalization point marking task completion.

2. Import hooks and types:
- Import from runtime pipeline:
  const { onTaskStart, onSubtaskComplete, onTaskComplete } = require('./lib/runtime-pipeline');
- Import types (use JSDoc type annotations if file is .js):
  /** @type {import('./lib/types').PipelineContext} */ // for ctx variable
  /** @type {import('./lib/types').SubtaskResult} */

3. Build PipelineContext and call onTaskStart exactly once per run:
- Derive:
  - taskId from current task entity
  - runId from existing run tracking (or generate stable per-execution UUID)
  - engineKey from task.engine or plan selection
  - contractId via getEngineContract(engineKey).id
  - tenantId, projectId from task metadata
  - actor = 'worker'
- Guard idempotently using TaskRun.pipeline.lastHook or deliverableId presence.
- Sample insertion (pseudo; adjust to surrounding code):

  // before subtask planning/execution
  const engineKey = task.engineKey || plan.engineKey;
  const contract = getEngineContract(engineKey);
  const ctx = {
    taskId: task.id,
    runId: run.id,
    engineKey,
    contractId: contract.id,
    tenantId: task.tenantId,
    projectId: task.projectId,
    actor: 'worker',
    deliverableId: undefined,
    startedAt: new Date().toISOString()
  };

  if (!run.pipeline || !run.pipeline.enabled || !run.pipeline.deliverableId) {
    const startRes = await onTaskStart(ctx, { taskSummary: task.summary, seed: task.seed || null });
    ctx.deliverableId = startRes.deliverableId;
    run.pipeline = { enabled: true, deliverableId: ctx.deliverableId, contractId: contract.id, lastHook: 'onTaskStart', lastUpdatedAt: new Date().toISOString() };
    await persistRun(run); // existing persistence
  } else {
    ctx.deliverableId = run.pipeline.deliverableId;
  }

4. After each subtask completes (success or failure), call onSubtaskComplete:
- Construct SubtaskResult with:
  - targetContractFields: from subtask plan (see Section C)
  - output: raw model output before normalization
  - normalized: if you already map to contract fields, include it; else omit
  - evidence: logs, citations, attachments if available
  - metrics: cost, latency, tokens
  - provider: providerKey, model
  - success: boolean, error if failed
- Ensure this call happens in finally to record even failures.
- Respect concurrency: if you run subtasks in parallel, serialize the pipeline merges by awaiting onSubtaskComplete for each completed subtask in completion order. Do not interleave multiple merges concurrently for the same ctx.deliverableId.
- Update run.pipeline.lastHook and lastUpdatedAt.

  try {
    const res = await runProviderCall(subtask); // existing
    const result = /** @type {import('./lib/types').SubtaskResult} */ ({
      subtaskId: subtask.id,
      name: subtask.name,
      targetContractFields: subtask.targetContractFields || [],
      output: res.raw,
      normalized: res.normalized || undefined,
      evidence: res.evidence || { logs: res.logs || [] },
      metrics: res.metrics,
      provider: { key: subtask.providerKey, model: res.model },
      startedAt: res.startedAt,
      completedAt: res.completedAt,
      success: true
    });
    await onSubtaskComplete(ctx, result);
  } catch (e) {
    const result = {
      subtaskId: subtask.id,
      name: subtask.name,
      targetContractFields: subtask.targetContractFields || [],
      output: null,
      evidence: { logs: [String(e && e.stack || e)] },
      metrics: { latencyMs: Date.now() - subtask.startedAt },
      provider: { key: subtask.providerKey },
      success: false,
      error: { message: e.message || 'unknown', code: e.code, retriable: !!e.retriable }
    };
    await onSubtaskComplete(ctx, result);
    throw e; // preserve existing failure semantics unless policy overrides
  } finally {
    run.pipeline.lastHook = 'onSubtaskComplete';
    run.pipeline.lastUpdatedAt = new Date().toISOString();
    await persistRun(run);
  }

5. On final completion (before marking task success), call onTaskComplete:
- Provide any task-level summary, aggregated metrics, and rawOutputs if captured.
- Gate task status by the hook’s validation result. If it fails contract validation or gates closure, mark task as needs_review or blocked per existing governance (do not falsely mark success).

  const completion = await onTaskComplete(ctx, {
    summary: run.summary || '',
    rawOutputs: aggregateRawOutputs(run) || {},
    metrics: run.metrics || {}
  });

  if (completion.validated && !completion.blocked) {
    // existing path: mark task completed
  } else {
    // route to human approval or needs review per existing governance
  }
  run.pipeline.lastHook = 'onTaskComplete';
  run.pipeline.lastUpdatedAt = new Date().toISOString();
  await persistRun(run);

6. Ensure any previous direct writes to deliverable stores are not duplicated. The pipeline is the single writer for deliverables. Worker should not write deliverable JSON files directly.

7. Telemetry/observability:
- Emit existing events, enriched with deliverableId and contractId:
  - task.pipeline.started
  - task.pipeline.subtask_merged
  - task.pipeline.completed
- Ensure they flow into 03-Operations logs and audit evidence chain already present.

C) Board Deliberation Prompt: Inject Contract Context
1. Locate the board prompt construction module (likely lib/board-of-ai.ts or lib/board-deliberation.ts). Identify the function that produces the planning prompt for a new task, e.g., buildBoardPlanningPrompt(task, engineKey) or similar.
2. Import and fetch the engine contract:
  const { getEngineContract } = require('./engine-catalog'); // or registry module
3. Modify the prompt to include:
- Contract name, version, requiredFields
- Canonical JSON Schema (redacted if too long; include the fields and required section at minimum)
- Explicit directive: "Plan subtasks whose outputs populate the contract-required fields. Each subtask must declare targetContractFields."
- Include a skeleton JSON example of the deliverable with keys set to null/empty to anchor planning.
- Require dependencies where needed so fields that depend on others come after.

Example additions to the prompt:

  CONTRACT CONTEXT
  - Engine: ${engineKey}
  - Contract: ${contract.id} (version ${contract.version})
  - Required fields: ${contract.requiredFields.join(', ')}
  - JSON Schema (excerpt): ${prettyPrintSubset(contract.jsonSchema, ['properties', 'required'])}

  PRODUCER INSTRUCTIONS
  - You must propose subtasks such that each subtask clearly lists targetContractFields it will populate.
  - Prefer one subtask per logically cohesive field or group of fields.
  - Keep within budget and parallelize independent subtasks.
  - Output strictly in JSON with the shape:
    {
      "subtasks": [
        {
          "id": "s1",
          "name": "Collect sources",
          "providerKey": "perplexity",
          "targetContractFields": ["sources"],
          "dependencies": []
        }
      ]
    }

4. Parse and persist the board plan to include targetContractFields on each planned subtask. Update the SubtaskPlan type usage accordingly. If board omits targetContractFields, backfill using heuristics (e.g., name contains field) but warn and mark needs_review flag in plan metadata.

5. Ensure the worker consumes SubtaskPlan.targetContractFields and passes them through to SubtaskResult for onSubtaskComplete.

D) Server/API/UI Minimal Surfacing
1. If not already present, expose deliverableId on task run GET routes under a redacted-safe field (respecting deep redaction rules).
- server.js: in handlers returning Task/Run, include run.pipeline.deliverableId and contractId behind existing response guard with proper allowlist.

2. UI: app.js / operator.js task detail panel:
- If run.pipeline.deliverableId present, show a small link/button “Open Deliverable” that routes to the existing deliverable viewer panel (added in Parts 62-64).
- Do not introduce new API endpoints; reuse existing deliverable retrieval route(s).

E) Feature Flags and Config
1. Add env/config flags (default enabled):
- RUNTIME_PIPELINE_ENABLED=true
- BOARD_INCLUDE_CONTRACT_IN_PROMPT=true
- PIPELINE_ENFORCE_VALIDATION=true
2. Worker should check RUNTIME_PIPELINE_ENABLED; if false, do not call hooks but proceed as before.
3. When PIPELINE_ENFORCE_VALIDATION=false, onTaskComplete validation failure should not block task completion (but log and flag needs_review).

F) Governance and Redaction
1. Ensure any content sent to hooks is passed through the existing redaction utility before persistence where appropriate. The pipeline module should already be doing deep redaction; do not double-redact. Worker should avoid logging PII-heavy raw outputs; pass them to hook, not logs.
2. Budget and provider governance:
- Ensure metrics passed in SubtaskResult include token usage and cost so enforcement engines maintain accurate accounting already implemented in prior parts.

G) Tests
1. Unit tests (lib-level):
- worker-pipeline.spec.ts:
  - Calls onTaskStart once per run; idempotent if rerun.
  - onSubtaskComplete called for every subtask, success and failure.
  - onTaskComplete called exactly once and gates final status by validation outcome.
- board-contract-planning.spec.ts:
  - Given a contract with requiredFields, generated plan subtasks include targetContractFields covering all required fields.
  - If missing, worker warns and sets needs_review in plan metadata.

2. Integration tests:
- task-exec-pipeline.int.spec.ts:
  - Simulate a simple engine with a 2-field contract.
  - End-to-end: create task → board plan → worker execute → deliverable scaffolded, merged, validated → deliverable stored with both fields populated.
  - Verify deliverableId appears on run and UI surface link appears.

3. Property tests (optional but preferred):
- Fuzz subtask completion order; ensure final deliverable consistent regardless of ordering (pipeline merges are associative/commutative for distinct fields).

4. Mocks and fixtures:
- Mock AI providers to deterministic outputs.
- Contract fixtures with small JSON schemas.

H) Docs
1. 04-Dashboard/docs/runbooks/runtime-pipeline.md — add “Worker Wiring” section with:
- When hooks are called
- Payload shapes
- Error handling and backoff
- Idempotency rules
2. 04-Dashboard/docs/architecture/board-planning.md — add “Contract-aware Planning” with prompt excerpts and mapping rules.
3. 04-Dashboard/docs/operations/observability.md — add new event names and fields.

I) Migration and Rollback
1. Migration:
- No schema changes; new optional fields added to TaskRun.pipeline only.
- On first run after deploy, existing runs simply won’t have pipeline.deliverableId; onTaskStart will populate.
2. Rollback:
- Gate by RUNTIME_PIPELINE_ENABLED=false to bypass hooks.
- BOARD_INCLUDE_CONTRACT_IN_PROMPT=false to revert to previous prompts.

J) Acceptance Criteria
- When a task is executed by the real worker:
  - AC1: onTaskStart is invoked and a deliverableId is created and persisted in run.pipeline.deliverableId.
  - AC2: Each subtask completion triggers onSubtaskComplete with targetContractFields and metrics; merges are reflected in deliverable JSON.
  - AC3: onTaskComplete runs and blocks completion if contract validation fails (when PIPELINE_ENFORCE_VALIDATION=true).
  - AC4: Board planning prompt includes the engine contract context; generated plan includes targetContractFields covering all contract.requiredFields.
  - AC5: Deliverable link is visible in the task detail UI and opens the assembled deliverable.
  - AC6: No regressions in route guards, mutation guards, deep redaction, or provider governance.

K) Hardening Notes
- Ensure concurrency control when multiple subtasks finish simultaneously: serialize pipeline merges per deliverableId (e.g., per-deliverable promise chain or queue).
- Add timeouts around hook calls; if hooks stall, apply existing retry/backoff strategy and escalate via enforcement engine.
- Maintain detailed audit entries in the evidence chain for each hook call with correlation IDs (taskId, runId, deliverableId, subtaskId).
- Ensure path traversal safety and JSON size limits when persisting merged deliverables.

Expected changes summary (files to touch; verify exact names in repo):
- 04-Dashboard/app/worker.js (primary)
- 04-Dashboard/app/lib/runtime-pipeline.ts (types import/export only if needed)
- 04-Dashboard/app/lib/board-of-ai.ts or lib/board-deliberation.ts (prompt changes)
- 04-Dashboard/app/lib/engine-catalog.ts or engine-registry.ts (ensure getEngineContract)
- 04-Dashboard/app/lib/types.ts (type additions)
- 04-Dashboard/app/server.js (ensure deliverableId surfaced with response guard)
- 04-Dashboard/app/app.js and/or operator.js (UI link)
- Tests under 04-Dashboard/app/test or similar

Implementation guidance and snippets:

1) Worker hook calls (JS with JSDoc if worker.js):
/**
 * @param {Task} task
 * @param {TaskRun} run
 */
async function executeTask(task, run) {
  const { onTaskStart, onSubtaskComplete, onTaskComplete } = require('./lib/runtime-pipeline');
  const { getEngineContract } = require('./lib/engine-catalog');
  const nowIso = () => new Date().toISOString();

  const engineKey = task.engineKey || (task.plan && task.plan.engineKey);
  const contract = getEngineContract(engineKey);

  /** @type {import('./lib/types').PipelineContext} */
  const ctx = {
    taskId: task.id,
    runId: run.id,
    engineKey,
    contractId: contract.id,
    tenantId: task.tenantId,
    projectId: task.projectId,
    actor: 'worker',
    deliverableId: run.pipeline && run.pipeline.deliverableId || undefined,
    startedAt: run.startedAt || nowIso()
  };

  if (!process.env.RUNTIME_PIPELINE_ENABLED || process.env.RUNTIME_PIPELINE_ENABLED === 'true') {
    if (!ctx.deliverableId) {
      const start = await onTaskStart(ctx, { taskSummary: task.summary, seed: task.seed || null });
      ctx.deliverableId = start.deliverableId;
      run.pipeline = { enabled: true, deliverableId: ctx.deliverableId, contractId: contract.id, lastHook: 'onTaskStart', lastUpdatedAt: nowIso() };
      await persistRun(run);
      emit('task.pipeline.started', { taskId: task.id, runId: run.id, deliverableId: ctx.deliverableId, contractId: contract.id });
    }
  }

  const subtasks = await planSubtasks(task, engineKey); // board-plan or existing
  for (const subtask of schedule(subtasks)) {
    const startedAt = Date.now();
    try {
      const res = await callProvider(subtask); // existing
      /** @type {import('./lib/types').SubtaskResult} */
      const result = {
        subtaskId: subtask.id,
        name: subtask.name,
        targetContractFields: subtask.targetContractFields || [],
        output: res.raw,
        normalized: res.normalized,
        evidence: { logs: res.logs, citations: res.citations, attachments: res.attachments },
        metrics: res.metrics || { tokensIn: res.tokensIn, tokensOut: res.tokensOut, costUSD: res.costUSD, latencyMs: Date.now() - startedAt },
        provider: { key: subtask.providerKey, model: res.model },
        startedAt: new Date(startedAt).toISOString(),
        completedAt: nowIso(),
        success: true
      };
      if (!process.env.RUNTIME_PIPELINE_ENABLED || process.env.RUNTIME_PIPELINE_ENABLED === 'true') {
        await onSubtaskComplete(ctx, result);
        emit('task.pipeline.subtask_merged', { taskId: task.id, runId: run.id, deliverableId: ctx.deliverableId, subtaskId: subtask.id });
        run.pipeline.lastHook = 'onSubtaskComplete'; run.pipeline.lastUpdatedAt = nowIso(); await persistRun(run);
      }
    } catch (e) {
      /** @type {import('./lib/types').SubtaskResult} */
      const fail = {
        subtaskId: subtask.id,
        name: subtask.name,
        targetContractFields: subtask.targetContractFields || [],
        output: null,
        evidence: { logs: [String(e && e.stack || e)] },
        metrics: { latencyMs: Date.now() - startedAt },
        provider: { key: subtask.providerKey },
        success: false,
        error: { message: e.message || 'error', code: e.code, retriable: !!e.retriable }
      };
      if (!process.env.RUNTIME_PIPELINE_ENABLED || process.env.RUNTIME_PIPELINE_ENABLED === 'true') {
        await onSubtaskComplete(ctx, fail);
        run.pipeline.lastHook = 'onSubtaskComplete'; run.pipeline.lastUpdatedAt = nowIso(); await persistRun(run);
      }
      throw e;
    }
  }

  if (!process.env.RUNTIME_PIPELINE_ENABLED || process.env.RUNTIME_PIPELINE_ENABLED === 'true') {
    const completion = await onTaskComplete(ctx, { summary: run.summary || '', rawOutputs: run.rawOutputs || {}, metrics: run.metrics || {} });
    emit('task.pipeline.completed', { taskId: task.id, runId: run.id, deliverableId: ctx.deliverableId, validated: completion.validated, blocked: completion.blocked });
    run.pipeline.lastHook = 'onTaskComplete'; run.pipeline.lastUpdatedAt = nowIso(); await persistRun(run);

    const enforce = !process.env.PIPELINE_ENFORCE_VALIDATION || process.env.PIPELINE_ENFORCE_VALIDATION === 'true';
    if (completion.blocked && enforce) {
      await markTaskNeedsReview(task.id, completion.reasons || []);
      return; // do not mark success
    }
  }

  await markTaskCompleted(task.id); // existing
}

2) Board planning prompt addition (TypeScript or JS):
function buildPlanningPrompt(task, engineKey) {
  const base = existingPrompt(task, engineKey);
  const { getEngineContract } = require('./engine-catalog');
  const contract = getEngineContract(engineKey);
  const schemaExcerpt = redactSchema(contract.jsonSchema); // implement to include properties/required only, avoid huge dumps

  const skeleton = buildSkeletonFromSchema(contract.jsonSchema); // implement simple walker to set fields to null/[]

  const contractBlock = `
CONTRACT CONTEXT
Engine: ${engineKey}
Contract: ${contract.id} (v${contract.version})
Required fields: ${contract.requiredFields.join(', ')}

JSON Schema (excerpt):
${schemaExcerpt}

DELIVERABLE SKELETON (target shape):
${JSON.stringify(skeleton, null, 2)}

INSTRUCTIONS:
- Plan subtasks such that each subtask lists "targetContractFields" it will populate.
- Cover all required fields.
- Keep plan JSON-only with shape:
{"subtasks":[{"id":"s1","name":"...","providerKey":"...","targetContractFields":["fieldA","fieldB"],"dependencies":[]}]}`
  return base + '\n\n' + contractBlock;
}

Ensure BOARD_INCLUDE_CONTRACT_IN_PROMPT gates this addition.

3) Response parsing:
- Update plan parsing to read targetContractFields and persist in SubtaskPlan.
- Validate coverage: if not all required fields are targeted by at least one subtask, log a warning and set plan.needs_review=true.

Commit Plan:
- Commit 1: types + engine contract getter adjustments
- Commit 2: board prompt and plan parsing
- Commit 3: worker hook integration
- Commit 4: server/API redaction-safe surfacing of deliverableId
- Commit 5: minimal UI link surfacing
- Commit 6: tests (unit + integration)
- Commit 7: docs

Definition of Done:
- All Acceptance Criteria met.
- Tests pass locally (unit + integration).
- No new lint/type errors.
- No regressions on guarded routes/mutations.
- Evidence chain has entries for pipeline start/merge/complete with correlation IDs.

Runbook Smoke Test:
1) Set env:
- RUNTIME_PIPELINE_ENABLED=true
- BOARD_INCLUDE_CONTRACT_IN_PROMPT=true
- PIPELINE_ENFORCE_VALIDATION=true
2) Create a task with engineKey referencing a contract with 2+ required fields.
3) Observe board plan includes targetContractFields covering required fields.
4) Run worker; see:
- deliverableId created
- per-subtask merges
- final validation
5) UI: Open task detail → click “Open Deliverable” → structured deliverable present with fields populated.

Proceed to implement exactly as above. Preserve existing behavior elsewhere.
```
