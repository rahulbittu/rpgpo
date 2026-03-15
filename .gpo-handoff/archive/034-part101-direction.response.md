```
System role: You are the implementation agent for the RPGPO repository. Implement Part 101 end-to-end with production-grade, typed, contract-driven code and docs. Preserve all existing working behaviors; default to current FIFO when the feature flag is off. Use CommonJS TypeScript, raw Node HTTP, existing guard/middleware patterns, JSON state via existing state manager, and tenant/project isolation patterns already present in server.js and lib/.

Part 101 — Task Prioritization Engine
Goal: Build an intelligent, explainable, governable task prioritization system that orders the task queue based on urgency, operator priorities, engine capacity, cost budgets, and historical success patterns to maximize value delivery.

Repo baseline to assume:
- Parts 19–100 complete, ~175+ TS modules, 1070+ API routes, 810+ types.
- Route guards, mutation guards, middleware truth at 100%.
- Worker + Board + Chief of Staff orchestration pipeline already live.
- JSON file-based state with atomic writes, deterministic IDs, evidence chain, override ledger, deliverables, release lifecycles.
- Feature flags in state/config/feature-flags.json (extend, don’t break).
- Deep redaction and route-guard integration already wired.

Non-goals:
- No external DB. No provider changes. Do not alter existing task creation semantics or worker core dequeue behavior beyond adding a prioritization-aware code path controlled by a feature flag.
- Do not remove FIFO as a fallback. Do not weaken tenant/project isolation.

High-level outcomes:
- A Prioritization Engine module with a pluggable scoring strategy interface.
- Deterministic, explainable per-task score breakdowns.
- Policy- and budget-aware hard constraints (do-not-run) with reasons.
- Capacity- and budget-aware soft constraints reflected in scores.
- Historical success uplift/penalty by task type and engine.
- Aging function to prevent starvation.
- Endpoints to recalc, inspect signals, fetch ordered queue, override with audit.
- UI surface to visualize queue order and explanations, and to perform governed overrides.
- Telemetry, audit, evidence linking, and acceptance tests.

1) Types (lib/types.ts)
Add/extend the following interfaces and types (ensure optional fields for backward compatibility; do not break existing Task interface usage):
- export type OperatorPriority = 'P0' | 'P1' | 'P2' | 'P3';
- export interface TaskPriorityMetadata {
  operatorPriority?: OperatorPriority;              // default undefined => P2 behavior
  priorityScore?: number;                           // computed [0,1]
  priorityRank?: number;                            // 1-based
  priorityExplainerId?: string;                     // link to last explanation snapshot
  priorityOverride?: {
    active: boolean;
    rank?: number;
    score?: number;
    reason: string;
    by: string;                                     // operator id/name
    at: string;                                     // ISO timestamp
    expiresAt?: string;                             // optional expiry
  };
}
- extend Task with: priority?: TaskPriorityMetadata;
- export interface PrioritySignalSnapshot {
  at: string;
  projectId: string;
  capacity: CapacitySnapshot;
  budgets: BudgetSnapshot;
  historical: HistoricalPerformanceStats;
  policy: PriorityPolicy;
}
- export interface CapacitySnapshot {
  engines: Record<string, {
    queueDepth: number;
    running: number;
    maxConcurrency: number;
    predictedWaitMs?: number;
    health: 'healthy' | 'degraded' | 'down';
  }>;
}
- export interface BudgetSnapshot {
  engines: Record<string, {
    period: 'daily' | 'weekly' | 'monthly';
    limitUsd: number;
    spentUsd: number;
    remainingUsd: number;
    hardStop: boolean;
  }>;
  project?: {
    period: 'daily' | 'weekly' | 'monthly';
    limitUsd: number;
    spentUsd: number;
    remainingUsd: number;
    hardStop: boolean;
  };
}
- export interface HistoricalPerformanceStats {
  byTaskTypeEngine: Record<string, { // key: `${taskType}::${engineId}`
    successRate: number;             // 0..1
    medianLatencyMs?: number;
    p95LatencyMs?: number;
    avgCostUsd?: number;
    sampleSize: number;
    lastUpdatedAt: string;
  }>;
}
- export interface PriorityPolicy {
  weights: {
    urgency: number;           // default 0.35
    operator: number;          // default 0.25
    capacityFit: number;       // default 0.15
    budgetFit: number;         // default 0.10
    historical: number;        // default 0.10
    aging: number;             // default 0.05
  };
  hardConstraints: {
    respectEngineHardStop: boolean;   // default true
    respectProjectHardStop: boolean;  // default true
    blockEnginesDown: boolean;        // default true
  };
  tieBreakers: Array<'aging' | 'createdAt' | 'operator' | 'urgency'>; // default ['aging','urgency','createdAt']
  aging: {
    horizonMinutes: number;  // default 1440 (1 day)
    cap: number;             // 0..1 cap, default 1
  };
  urgencyMapping?: {
    deadlineImminentMinutes: number; // default 60
  };
  strategy: 'weighted-v1' | 'constrained-weighted-v1';
  version: number;
}
- export interface PriorityScoreBreakdown {
  taskId: string;
  taskType?: string;
  engineId?: string;
  components: {
    urgency: number;
    operator: number;
    capacityFit: number;
    budgetFit: number;
    historical: number;
    aging: number;
  };
  constrained: {
    blocked: boolean;
    reasons: string[];
  };
  totalScore: number; // 0..1 after weights and clamp
  rank?: number;
}
- export interface PrioritizationRun {
  id: string;                 // deterministic: prj + ts + seq
  at: string;
  projectId: string;
  policyVersion: number;
  strategy: string;
  source: 'enqueue' | 'complete' | 'capacity-update' | 'budget-update' | 'operator-change' | 'manual' | 'scheduler';
  signals: PrioritySignalSnapshot;
  tasksEvaluated: number;
  results: {
    orderedTaskIds: string[];
    scores: Record<string, PriorityScoreBreakdown>;
  };
  durationMs: number;
}
- export interface PrioritizedQueue {
  projectId: string;
  at: string;
  runId: string;
  orderedTaskIds: string[];
  ranks: Record<string, number>;
}

2) New modules (create under 04-Dashboard/app/lib/)
- lib/prioritization-engine.ts
  Exports:
  - getCurrentPriorityPolicy(projectId: string): Promise<PriorityPolicy>
  - setPriorityPolicy(projectId: string, policy: PriorityPolicy, actor: string): Promise<void>
  - capturePrioritySignals(projectId: string): Promise<PrioritySignalSnapshot>
  - scoreTasks(projectId: string, taskIds: string[], signals: PrioritySignalSnapshot, policy: PriorityPolicy): Promise<Record<string, PriorityScoreBreakdown>>
  - orderTasks(projectId: string, scores: Record<string, PriorityScoreBreakdown>, policy: PriorityPolicy): Promise<PrioritizedQueue>
  - recalculatePriorities(projectId: string, source: PrioritizationRun['source']): Promise<PrioritizedQueue> // end-to-end: load tasks, signals, score, order, persist, audit
  - getLatestQueue(projectId: string): Promise<PrioritizedQueue | null>
  - getRun(projectId: string, runId: string): Promise<PrioritizationRun | null>
  - listRecentRuns(projectId: string, limit?: number): Promise<PrioritizationRun[]>
  Responsibilities:
  - Orchestrate end-to-end prioritization. Persist run logs and latest queue. Respect feature flag fallback.
  - Link run to evidence chain (existing evidence module) with type "prioritization-run".
- lib/prioritization-scorer.ts
  Exports:
  - computeScore(task: Task, signals: PrioritySignalSnapshot, policy: PriorityPolicy): PriorityScoreBreakdown
  Implementation details:
  - Hard constraints: if policy.hardConstraints.* and engine/project hardStop or engine health 'down', mark constrained.blocked=true with reasons.
  - Components in [0..1]:
    - urgency: From Task.sla.deadlineAt and now. Map: if no deadline, 0.3 baseline; if delta <= 0 -> 1; else exp decay: min(1, exp(-deltaMs / (policy.urgencyMapping.deadlineImminentMinutes*60*1000)))*boost where boost ensures near-deadline inflates; keep simple, deterministic.
    - operator: Map OperatorPriority -> P0=1, P1=0.75, P2=0.5, P3=0.25; default 0.5 if undefined.
    - capacityFit: For chosen/assigned engine (or best candidate via task.enginePreference?), compute 1 - min(1, queueDepth/maxConcurrency capped) and penalize degraded health by -0.2 floor to 0.
    - budgetFit: remaining/limit for engine and project; if hardStop true, component=0; else clamp(remainingFrac, 0, 1).
    - historical: Lookup by `${task.type}::${engineId}`; use successRate (0..1); if sampleSize<5, blend with 0.6 prior.
    - aging: min(cap, waitMinutes / horizonMinutes).
  - totalScore = clamp0to1(sum(w_i * comp_i)) if not blocked; if blocked, totalScore=0 and include reasons.
  - Stable deterministic tie-breaking by subsequent order function.
- lib/prioritization-policies.ts
  Exports:
  - loadProjectPolicy(projectId: string): Promise<PriorityPolicy>
  - saveProjectPolicy(projectId: string, policy: PriorityPolicy, actor: string): Promise<void>
  - getDefaultPolicy(): PriorityPolicy
  Persist in state/prioritization/{projectId}-policy.json with version field; also keep policies.jsonl audit trail.
- lib/prioritization-history.ts
  Exports:
  - recordRun(run: PrioritizationRun): Promise<void>
  - getRun(projectId: string, runId: string): Promise<PrioritizationRun | null>
  - listRuns(projectId: string, limit?: number): Promise<PrioritizationRun[]>
  - saveLatestQueue(queue: PrioritizedQueue): Promise<void>
  - getLatestQueue(projectId: string): Promise<PrioritizedQueue | null>
  Storage:
  - state/prioritization/{projectId}-runs.jsonl
  - state/prioritization/{projectId}-latest-queue.json
- lib/prioritization-explainer.ts
  Exports:
  - explain(task: Task, breakdown: PriorityScoreBreakdown, signals: PrioritySignalSnapshot, policy: PriorityPolicy): { id: string; summary: string; details: Record<string,string|number>; redactions?: string[] }
  Persist explain snapshots in state/prioritization/{projectId}-explain.jsonl; return id to store on task.priority.priorityExplainerId. Redact sensitive fields using deep-redaction.ts rules.
- lib/prioritization-capacity-source.ts
  Responsibilities:
  - Gather capacity metrics from existing engine registry/capacity modules. Provide CapacitySnapshot.
- lib/prioritization-budget-source.ts
  Responsibilities:
  - Gather per-engine and per-project budget snapshot from existing governance/budget modules.
- lib/prioritization-historical-source.ts
  Responsibilities:
  - Build HistoricalPerformanceStats from existing execution/task history, success/failure outcomes, and costs. Cache with TTL 5m per project.

3) Server integration (04-Dashboard/app/server.js and new route module)
- Add feature flag:
  - state/config/feature-flags.json: { prioritization: { enabled: false, explainability: true, autoRecalcOnEvents: true } } (merge into existing structure).
- New routes module lib/routes/prioritization-routes.ts (wire into server.js):
  All routes must:
  - Enforce tenant/project scoping via existing isolation helpers.
  - Use http-response-guard.ts and mutation guards for writes.
  - Redact via deep-redaction.ts where applicable.
  - Require operator role for overrides/policy changes.

  Routes:
  - GET /api/:projectId/prioritization/queue
    Response: PrioritizedQueue | { fallback: 'fifo', orderedTaskIds: string[] } when feature disabled.
  - POST /api/:projectId/prioritization/recalculate
    Body: { source?: PrioritizationRun['source'] }
    Response: PrioritizedQueue
    Side-effects: triggers full recalculation and logs run.
  - GET /api/:projectId/prioritization/runs?limit=50
    Response: PrioritizationRun[]
  - GET /api/:projectId/prioritization/runs/:runId
    Response: PrioritizationRun
  - GET /api/:projectId/prioritization/signals
    Response: PrioritySignalSnapshot
  - GET /api/:projectId/prioritization/policy
    Response: PriorityPolicy
  - PUT /api/:projectId/prioritization/policy
    Body: PriorityPolicy + { reason: string }
    Response: { ok: true, version: number }
  - PATCH /api/:projectId/tasks/:taskId/priority-override
    Body: { rank?: number; score?: number; reason: string; expiresAt?: string }
    Response: Task with updated priority metadata
    Behavior: Writes override ledger entry to existing overrides system with type "priority-override"; requires operator with override permission; immutable reason.

- Hook points:
  - On task enqueue (existing path): if feature flag autoRecalcOnEvents true, trigger recalculatePriorities(projectId,'enqueue') debounced (e.g., 250ms window) to avoid thrash.
  - On task complete/fail: trigger recalc with 'complete'.
  - On budget/capacity change events: trigger recalc with corresponding source.
  - Modify worker dequeue path to use prioritization if enabled:
    - getNextTask(projectId): use prioritization-engine.getLatestQueue(projectId) if fresh (< 60s) else recalc; pop highest-ranked task that is not blocked and not overridden away from execution; fall back to FIFO if disabled or queue empty.

4) Scoring and ordering specifics (in scorer/order functions)
- Compute waitMinutes = (now - task.createdAt)/60000.
- Urgency:
  - If task.sla?.deadlineAt present: deltaMs = deadlineAt - now.
    - If deltaMs <= 0 => 1.
    - Else urgency = min(1, Math.exp(-deltaMs / (policy.urgencyMapping.deadlineImminentMinutes*60*1000))) with floor at 0.05.
  - Else => 0.3 baseline.
- Operator map: P0=1, P1=0.75, P2=0.5, P3=0.25, default 0.5.
- CapacityFit: For target engine (task.engineId or preferred), cf = clamp01(1 - (queueDepth / max(1,maxConcurrency*2))); if health=='degraded' => cf = max(0, cf-0.2); if 'down' => hard constraint if policy.blockEnginesDown.
- BudgetFit: For engine and project: if hardStop => hard constraint; else bf = harmonic mean of engineRemainingFrac and projectRemainingFrac when both present, else whichever exists; if NaN => 0.6 default.
- Historical: Use successRate; if sampleSize<5 => blend: hist = 0.6*1.0 + 0.4*successRate (optimistic prior), clamp01.
- Aging: aging = min(policy.aging.cap, waitMinutes / policy.aging.horizonMinutes).
- Total: weighted sum by policy.weights; clamp 0..1. If constrained.blocked => 0.
- Ordering: Sort by descending totalScore; breakers per policy.tieBreakers:
  - aging desc; urgency desc; createdAt asc; operator desc (P0..P3 map).
  - Ensure stable sort (use index for final deterministic tiebreak).
- Overrides: If task.priority.priorityOverride.active and rank specified, place at that absolute rank (stable) ahead of computed; if score only, recalc score substitution; record reason in override ledger and explanation.

5) State files (create if missing; atomic writes)
- state/prioritization/{projectId}-policy.json
- state/prioritization/{projectId}-runs.jsonl
- state/prioritization/{projectId}-latest-queue.json
- state/prioritization/{projectId}-explain.jsonl
Ensure directories created on boot/init.

6) UI (04-Dashboard/app/)
- Update operator queue view (index.html + operator.js + style additions):
  - Add "Prioritized Queue" toggle (visible when feature flag enabled).
  - Display per-task: rank, total score, compact breakdown bars (urgency/operator/capacity/budget/historical/aging), and top 1-2 constraint notes.
  - Provide "Explain" action to fetch explanation snapshot by id and show modal with components and signals summary (with redactions).
  - Provide "Override" action (role-gated) with form: rank or score, reason, optional expiry; PATCH override route; show audit note on row.
  - Add "Recalculate" button (role-gated) calling POST /prioritization/recalculate and refreshes queue.
  - Add "Policy" panel for admins: view/edit weights, hard constraints, tie-breakers, aging; PUT to policy route with reason; version display and updatedAt.
- Respect tenant/project context already present in UI. No breaking changes to existing tabs; integrate as a panel in Tasks/Queue tab.

7) Governance, audit, evidence
- Every recalc writes a PrioritizationRun to runs.jsonl and creates an evidence record via existing evidence API linking run.id and policy.version.
- All overrides write to overrides ledger with type "priority-override", include before/after, reason, actor, expiresAt.
- Policy updates: append-only audit trail in policies.jsonl with actor, reason, diff summary.

8) Telemetry and observability
- Add counters and histograms:
  - prioritization_runs_total{projectId,source,strategy}
  - prioritization_scoring_latency_ms_p50/p95
  - prioritization_queue_fresh_age_seconds
  - prioritization_overrides_total{projectId}
  - prioritization_blocked_tasks_gauge{reason}
- Log anomalies: >20% tasks blocked, engine down used by many tasks, policy weights invalid (sum>1 not required but each in 0..1).

9) Feature flag and rollout
- Default disabled. When disabled:
  - GET queue returns { fallback: 'fifo', orderedTaskIds } matching current behavior.
  - Worker uses FIFO path.
- Provide migration script to create default policy files for existing projects on first enablement.

10) Migrations and boot
- On server boot, ensure state/prioritization/ exists and backfill default policy per project encountered.
- Add migration doc in 04-Dashboard/app/docs/migrations/101-prioritization-engine.md describing files, defaults, rollback.
- Do not mutate existing tasks on disk beyond adding optional priority fields when first scored.

11) Concurrency and correctness
- Debounce recalc triggers (250ms window per project).
- Use a per-project in-memory lock to prevent overlapping recalc runs; if in-flight, coalesce callers and return latest queue after completion.
- Writes:
  - Write runs.jsonl append-only.
  - Write latest-queue.json atomically via temp + rename.
- If recalc fails, preserve previous latest-queue; return 503 with guard-compliant error shape.

12) Security and privacy
- All routes guarded with existing auth; overrides/policy writes require operator role with appropriate capability (use existing RBAC).
- Deep-redact signals that may include cost or PII in explanations; include redactions list.
- Project isolation: only access state files for that projectId; never leak cross-project signals.

13) Acceptance tests (add to 04-Dashboard/app/tests/acceptance/)
Add test suite: prioritization-engine.spec.ts covering at minimum:
- Feature flag off: returns FIFO; worker path unchanged.
- Basic scoring monotonicity: nearer deadline => higher rank; P0 outranks equal urgency P2; higher aging improves rank over time.
- Capacity down: tasks targeting down engine are blocked with reason.
- Budget hardStop: engine hardStop blocks; project hardStop blocks; when soft, budgetFit influences score but not blocked.
- Historical uplift: higher successRate engine for same taskType ranks higher all else equal.
- Tie-breaking determinism across runs.
- Overrides: absolute rank honored; score override changes rank predictably; audit ledger entries created.
- Signals endpoint returns sane values; policy update persists version bump and audit.
- Concurrency: parallel recalc calls coalesce; no partial writes; queue freshness within 60s on worker dequeue.
- Starvation resistance: long-waiting low-priority task ages into service eventually.
- Redaction: explanations do not leak redacted fields.
- Telemetry counters increment as expected.

14) Hardening
- Handle missing historical samples gracefully with priors.
- Handle tasks without engineId by using default engine selection rules already in Chief of Staff (do not invent new selection; if unknown, assume neutral capacityFit 0.5 and budgetFit 0.6).
- Clamp all components and totals to [0,1]. Validate policy weights (each 0..1) and aging params.
- If policy file corrupted, fall back to default policy in-memory and emit evidence + error log.
- If runs.jsonl exceeds 100MB per project, start a new rollover file with suffix -N.jsonl; document retention.

15) Docs
- 04-Dashboard/app/docs/architecture/part-101-prioritization-engine.md: module diagrams, data flows, scoring math, governance.
- 04-Dashboard/app/docs/runbooks/prioritization-operations.md: how to enable/disable, override, interpret explanations, troubleshoot.
- 04-Dashboard/app/docs/contracts/prioritization-api.md: full route contracts, request/response schemas.
- 04-Dashboard/app/docs/security/prioritization-privacy.md: redaction rules and tenant isolation notes.

16) Deliverables checklist (PR must include)
- New/updated TS modules as listed.
- Server route wiring with guards.
- Feature flag default off.
- State directory creation and atomic writers.
- UI updates with policy/queue/explain/override.
- Tests (unit + acceptance).
- Telemetry integration.
- Docs (architecture, runbook, contracts, security).
- Migration doc.
- Update CHANGELOG with Part 101.

Implementation notes:
- Use existing state I/O helpers, guard utilities, deep-redaction, evidence, override ledger, and logging abstractions in lib/.
- Keep CommonJS import/exports; match repo coding style and lint rules.
- Deterministic IDs: run.id should be `${projectId}-${YYYYMMDDTHHMMSSmmmZ}-${seq}` with seq from an incrementer per project in memory and persisted checkpoint in latest-queue.json if available.

Now implement Part 101 exactly as specified above. Produce:
- Diff or full code blocks for each new/changed file.
- Any schema JSON defaults.
- Tests and docs content.
- Wire-up notes for server.js (line anchors and route registration).
```
