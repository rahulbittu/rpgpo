```
You are ChatGPT implementing GPO/RPGPO Part 70.

Title: Part 70 — Parallel Execution Engine + Resource-Aware Scheduling + Backpressure

Baseline
- Repo: 04-Dashboard/app
- Parts 19-69 complete. 92 TS modules, ~829 API routes, ~470+ types, 199 tests passing.
- Part 67: Structured output pipeline (schema → prompt → parse → merge → evidence)
- Part 68: Board/worker structured integration, provider capabilities, retry with backoff
- Part 69: Observability — in-memory metrics with percentiles, provider pricing cost tracking, EWMA provider learning with circuit breaker, evidence TTL/cleanup, parse/error spike alerting, 11 new API routes, Structured I/O Health dashboard panel

Gap
- Worker runs subtasks serially. Execution graphs include depends_on but runtime ignores it.
- No parallel execution of independent subgraphs.
- No resource-aware scheduling (global/per-provider/tenant concurrency caps).
- No backpressure when providers are saturated (no queueing, no 429/retry signaling).

Objective
- Build a concurrent subtask executor that:
  - Executes a DAG with topological readiness and parallelism.
  - Enforces resource-aware scheduling with global, per-provider, per-tenant/project concurrency limits.
  - Applies dynamic throttling/backpressure driven by Part 69 health (EWMA, circuit breaker, p95) and autonomy budgets.
  - Provides safe queueing, fairness, reprioritization, dead-lettering, and crash recovery.
  - Preserves existing functionality by default (feature-flagged; default concurrency=1).

Non-Goals
- Changing provider call semantics or structured I/O pipeline (Parts 67-69 remain as-is).
- Introducing external brokers (stay in-process, file-backed JSON state).
- UI overhaul; only add a focused operator panel.

Guardrails
- Raw Node HTTP (no Express). CommonJS with TypeScript.
- All mutations guarded via existing http-response-guard.ts. Redaction preserved.
- Idempotency and exactly-once subtask completion merge.
- Deterministic IDs, contract-driven types.
- Backward compatible; feature-flag off by default (concurrency=1), operator can enable.

Deliverables
1) New/updated TypeScript types (lib/types.ts)
2) New scheduler, queue, capacity, backpressure, executor, recovery modules
3) Server routes (scheduler/queue/limits/controls)
4) Integration into worker and chief-of-staff
5) State persistence files
6) Observability metrics extensions
7) UI panel updates
8) Docs (ADR, runbook, config)
9) Tests (unit + acceptance) and migration script

Step-by-step Implementation

A) Types — lib/types.ts
- Add the following types (ensure exported, documented, and used across modules):

export type ProviderKey = 'openai' | 'anthropic' | 'google' | 'perplexity' | string;

export interface SchedulerFeatureFlags {
  enabled: boolean;                 // global on/off
  enableFairSharing: boolean;       // tenant/project fairness
  enableDeadLetter: boolean;
  enableDynamicBackpressure: boolean;
}

export type QueuePriority = 'critical' | 'high' | 'normal' | 'low';

export interface SchedulerConfig {
  version: 1;
  featureFlags: SchedulerFeatureFlags;
  globalMaxConcurrent: number;          // default 1 (preserve serial)
  defaultTimeoutMs: number;             // per subtask execution
  perProviderMaxConcurrent: Record<ProviderKey, number>;
  perTenantMaxConcurrent: Record<string, number>;     // tenantId
  perProjectMaxConcurrent: Record<string, number>;    // projectId
  queueCapacity: number;                // total queued items soft cap
  inFlightLeaseMs: number;              // heartbeat lease for recovery
  maxAttempts: number;                  // per subtask
  initialRetryDelayMs: number;          // backoff seed
  maxRetryDelayMs: number;
  fairnessWeights: {
    tenant: Record<string, number>;     // 1.0 default
    project: Record<string, number>;
  };
}

export interface BackpressureSignal {
  provider: ProviderKey;
  reason: 'p95_slow' | 'error_spike' | 'breaker_open' | 'rate_limited' | 'budget_throttle';
  factor: number;  // 0..1 multiplier of allowed concurrency
  observed: {
    p95LatencyMs?: number;
    errorRate?: number;
    open?: boolean;
    lastStatusCodes?: number[];
    budgetRemaining?: number;
  };
  ttlMs: number;
  at: string; // ISO
}

export interface CapacityWindow {
  provider: ProviderKey;
  baseLimit: number;       // from config
  dynamicLimit: number;    // after backpressure
  inUse: number;
  available: number;
  signals: BackpressureSignal[];
}

export interface QueueItemKey {
  runId: string;           // execution run
  nodeId: string;          // graph node id
}

export interface ExecutionAttemptRecord {
  attemptId: string;
  startedAt: string;
  finishedAt?: string;
  status: 'in_progress' | 'succeeded' | 'failed' | 'canceled' | 'expired';
  errorCode?: string;
  errorMessage?: string;
  provider?: ProviderKey;
  durationMs?: number;
}

export interface QueueItem {
  id: string;                  // deterministic from runId+nodeId
  key: QueueItemKey;
  projectId: string;
  tenantId: string;
  provider: ProviderKey;
  priority: QueuePriority;
  enqueuedAt: string;
  leasedBy?: string;          // workerId
  leaseExpiresAt?: string;
  attempts: ExecutionAttemptRecord[];
  status: 'queued' | 'in_flight' | 'done' | 'dead_letter' | 'canceled';
  reason?: string;            // for DLQ
  payloadRef: {
    // sufficient info to execute: references to structured prompt/contract built in Part 67-68
    contractId: string;
    subtaskSpecRef: string;   // path or ID to the subtask spec in state
  };
  deps: string[];             // nodeIds required before ready
  dependents: string[];       // nodeIds unlocked upon completion
  ready: boolean;
  timeoutMs?: number;
  costEstimateCents?: number;
}

export interface QueueStats {
  total: number;
  queued: number;
  inFlight: number;
  done: number;
  deadLetter: number;
  byProvider: Record<ProviderKey, { queued: number; inFlight: number; }>;
  byPriority: Record<QueuePriority, number>;
  byTenant: Record<string, number>;
  byProject: Record<string, number>;
  capacityWindows: CapacityWindow[];
  saturation: number; // inFlight / sum(dynamicLimit)
  avgWaitMs?: number;
  p95WaitMs?: number;
}

export interface SchedulerStateSnapshot {
  config: SchedulerConfig;
  stats: QueueStats;
  paused: boolean;
  updatedAt: string;
}

export interface RunProgress {
  runId: string;
  graphNodes: number;
  completed: number;
  blocked: number;
  ready: number;
  failed: number;
  criticalPathMs?: number;
  startedAt: string;
  updatedAt: string;
}

B) New Modules (create under 04-Dashboard/app/lib/)
1. lib/scheduler/work-queue.ts
- Priority queue with persistence and fairness.
- Exports:
  - enqueue(items: QueueItem[]): Promise<void>
  - dequeueReady(workerId: string, take: number, hints?: { provider?: ProviderKey[]; tenantId?: string; projectId?: string; }): Promise<QueueItem[]>
  - ackSuccess(itemId: string, attemptId: string): Promise<void>
  - ackFailure(itemId: string, attemptId: string, code: string, message: string, requeue: boolean): Promise<void>
  - markCanceled(itemId: string, reason: string): Promise<void>
  - reprioritize(itemId: string, priority: QueuePriority): Promise<void>
  - requeue(itemId: string): Promise<void>
  - get(itemId: string): Promise<QueueItem | null>
  - stats(): Promise<QueueStats>
  - snapshot(): Promise<{ queue: QueueItem[]; inFlight: QueueItem[]; deadLetter: QueueItem[]; }>
  - recoverLeases(nowIso: string): Promise<number>   // requeue expired in-flight
- Implementation:
  - Persist JSON to state/scheduler/queue.json, inflight.json, dead-letter.json.
  - Deterministic id for item: sha1(`${runId}:${nodeId}`) — use existing deterministic id helper from deliverables (Part 60). Create lib/scheduler/ids.ts if needed.

2. lib/scheduler/provider-capacity.ts
- Tracks per-provider/global/tenant/project semaphores.
- Consumes Part 69 metrics + circuit breaker.
- Exports:
  - computeCapacityWindows(config: SchedulerConfig, nowIso: string): Promise<CapacityWindow[]>
  - tryAcquire(item: QueueItem): Promise<boolean>   // checks global/provider/tenant/project
  - release(item: QueueItem): Promise<void>
  - applyBackpressureSignals(signals: BackpressureSignal[]): Promise<void>
  - currentWindows(): Promise<CapacityWindow[]>
- Uses EWMA p95, error rate, breaker state to scale base limits.

3. lib/scheduler/backpressure.ts
- Policy engine integrating autonomy budgets + provider health.
- Exports:
  - evaluate(nowIso: string): Promise<BackpressureSignal[]>
  - shouldRejectNewEnqueues(queueStats: QueueStats, config: SchedulerConfig): { reject: boolean; reason?: string; retryAfterSec?: number; }
- Heuristics:
  - If queue length > queueCapacity: reject new enqueues with 429 suggestion.
  - If provider breaker open or p95 > SLO threshold: emit signals with factor 0.25..0.75.

4. lib/scheduler/dag-runner.ts
- Converts execution graph to queue items, manages ready set transitions on completion.
- Exports:
  - seedRun(runId: string, graph: ExecutionGraph, context: { tenantId: string; projectId: string; providerHints?: Record<string, ProviderKey>; priorityDefault?: QueuePriority; }): Promise<void>
  - onNodeComplete(runId: string, nodeId: string): Promise<void>  // unlock dependents and update ready flags
  - runProgress(runId: string): Promise<RunProgress>
- Uses existing graph type; if not present, create a minimal ExecutionGraph interface import from types.

5. lib/runtime/executor.ts
- Executes a QueueItem using existing structured pipeline (Parts 67-68) and runtime hooks (Part 65).
- Exports:
  - execute(item: QueueItem, signal: AbortSignal): Promise<{ ok: true } | { ok: false; code: string; message: string; retryable: boolean; }>
- Responsibilities:
  - Create attempt record; call provider through existing worker/provider integration; honor timeout.
  - On success: call onSubtaskComplete hook and evidence link; ensure idempotent merge.
  - On failure: classify retryable (429/5xx/timeouts) vs terminal (4xx schema violation after max attempts).
  - Respect retry with exponential backoff + jitter (existing strategy Part 68).

6. lib/scheduler/recovery.ts
- In-flight lease expiration, crash recovery, DLQ promotion after maxAttempts.
- Exports:
  - sweep(nowIso: string): Promise<{ leasesRecovered: number; movedToDLQ: number; }>
  - drainGraceful(timeoutMs: number): Promise<void>   // used on shutdown
  - cancelRun(runId: string, reason: string): Promise<void>

7. lib/scheduler/scheduler.ts
- The orchestrator loop.
- Exports:
  - start(): Promise<void>
  - stop(): Promise<void>
  - isPaused(): boolean
  - pause(): Promise<void>
  - resume(): Promise<void>
  - state(): Promise<SchedulerStateSnapshot>
  - submitRun(runId: string, graph: ExecutionGraph, ctx: { tenantId: string; projectId: string; priorityDefault?: QueuePriority; }): Promise<void>
- Behavior:
  - Ticker loop every 250ms:
    - Evaluate backpressure; refresh capacity windows.
    - Recover leases; compute ready dequeues constrained by capacity.
    - DequeueReady with fairness and provider hints; for each item:
      - Acquire capacity; launch execute(item) in background; wire AbortController per item.
      - On completion, release capacity; ackSuccess/ackFailure; notify dag-runner.onNodeComplete on success; requeue on retryable failures with backoff delay; DLQ after maxAttempts.
  - Pause/resume gates dequeue but still updates metrics and recovery.

8. lib/observability/scheduler-metrics.ts
- Emits metrics: queue_depth, in_flight, wait_time_ms, service_time_ms, saturation, fairness_share_{tenant|project}, provider_capacity_{available|used}, backpressure_factor.
- Wire into Part 69 in-memory metrics and Structured I/O Health.

9. lib/state/scheduler-store.ts
- Simple JSON read/write for config and paused flag:
  - loadConfig(): Promise<SchedulerConfig>
  - saveConfig(cfg: SchedulerConfig): Promise<void>
  - getPaused(): Promise<boolean>
  - setPaused(paused: boolean): Promise<void>

C) Integration Points

1. Chief of Staff (lib/chief-of-staff.ts)
- Where runs are initiated, replace direct serial subtask execution with:
  - scheduler.submitRun(runId, graph, { tenantId, projectId, priorityDefault })
- Ensure existing approvals and gates remain unaffected.
- If scheduler featureFlags.enabled=false, fall back to legacy serial execution to preserve behavior.

2. Worker Wiring (existing worker module from Part 66)
- Expose:
  - buildQueueItemForNode(runId, node): { provider, payloadRef, timeoutMs, priority }
- executor.ts uses existing provider call path (structured contracts) and runtime hooks onTaskStart/onSubtaskComplete/onTaskComplete.

3. server.js — Add routes (ensure route guards + input validation)
- GET /runtime/scheduler
  - Returns SchedulerStateSnapshot
- POST /runtime/scheduler/pause
  - Body: { reason?: string }
- POST /runtime/scheduler/resume
- POST /runtime/scheduler/config
  - Body: Partial<SchedulerConfig> (validate, merge, persist)
- GET /runtime/queue
  - Returns QueueStats + snapshot if ?includeSnapshot=1
- POST /runtime/queue/reprioritize
  - Body: { itemId: string; priority: QueuePriority }
- DELETE /runtime/queue/:itemId
  - Cancels item; moves to DLQ if in flight
- POST /runtime/providers/:provider/limits
  - Body: { maxConcurrent: number }
- GET /runtime/runs/:runId/progress
  - Returns RunProgress
- POST /runtime/runs/:runId/cancel
  - Body: { reason: string }
- All mutation routes wired through http-response-guard.ts and redaction.

4. http-response-guard.ts
- Add allowlist for new routes with roles: operator-only for mutations; viewer for GETs.
- Validate bodies strictly; strip unknown fields.

5. Startup/shutdown
- server.js main: scheduler.start() after loading config.
- On SIGINT/SIGTERM: await recovery.drainGraceful(timeoutMs from config); scheduler.stop().

D) State Files (create if missing)
- state/scheduler/config.json (seed defaults)
- state/scheduler/queue.json
- state/scheduler/inflight.json
- state/scheduler/dead-letter.json
- state/scheduler/paused.json

Default config (config.json)
{
  "version": 1,
  "featureFlags": {
    "enabled": false,
    "enableFairSharing": true,
    "enableDeadLetter": true,
    "enableDynamicBackpressure": true
  },
  "globalMaxConcurrent": 1,
  "defaultTimeoutMs": 180000,
  "perProviderMaxConcurrent": { "openai": 4, "anthropic": 3, "google": 3, "perplexity": 2 },
  "perTenantMaxConcurrent": {},
  "perProjectMaxConcurrent": {},
  "queueCapacity": 200,
  "inFlightLeaseMs": 120000,
  "maxAttempts": 4,
  "initialRetryDelayMs": 2000,
  "maxRetryDelayMs": 45000,
  "fairnessWeights": { "tenant": {}, "project": {} }
}

E) Algorithms and Policies

1. DAG scheduling
- A node is ready when all deps are status=done.
- dag-runner.seedRun creates QueueItem for each node with deps list; ready=true if deps=[].
- onNodeComplete flips dependents’ ready=true if all deps resolved.

2. Priority and fairness
- work-queue.dequeueReady selects by:
  - Priority order: critical > high > normal > low + aging (increase effective priority over time).
  - Fair sharing: weighted round-robin across tenantId, then projectId buckets within priority tiers.
- Avoid head-of-line blocking by allowing limited skip over a stalled tenant bucket.

3. Capacity and backpressure
- provider-capacity.computeCapacityWindows:
  - dynamicLimit = floor(baseLimit * min(backpressureFactors for provider and budgets)) with lower bound 1 if enabled and baseLimit>0.
- tryAcquire enforces global, per-provider, per-tenant, per-project via token accounting.
- backpressure.evaluate:
  - If Part 69 circuit breaker is open for provider → factor 0.25 for 60s.
  - If p95 > 2x SLO or error rate > 10% in last 1m → factor 0.5 for 30s.
  - If 429/5xx spike in last 30s → factor 0.5 for 20s.
  - If autonomy budget nearing cap → factor scales with remaining budget.
- shouldRejectNewEnqueues:
  - If queue.total >= queueCapacity → { reject: true, retryAfterSec: 30 }

4. Retry and DLQ
- executor.ts classifies retryable; schedule requeue with exponential backoff + jitter bounded by maxRetryDelayMs.
- After maxAttempts, move to DLQ with reason and last error.

5. Recovery
- On startup and each tick, recover leases older than inFlightLeaseMs: requeue items and append attempt status=expired.
- drainGraceful marks paused, stops dequeue, waits for in-flight to complete or timeout, then cancels and requeues or DLQ as policy.

F) UI — 04-Dashboard/app/operator.js + operator.css + index.html
- Add “Runtime Scheduler” panel under Structured I/O Health:
  - Shows:
    - Paused status toggle (operator-only).
    - QueueStats with byProvider and byPriority breakdown.
    - CapacityWindows table per provider (base, dynamic, inUse, available, backpressure signals).
    - Per-run progress (search by runId) with completed/ready/blocked.
    - Actions: reprioritize itemId, cancel itemId, set provider limit.
- Use existing fetch helpers and redaction rules; no new framework.

G) Observability
- Emit metrics (in-memory Part 69):
  - runtime.scheduler.queue_depth
  - runtime.scheduler.in_flight
  - runtime.scheduler.wait_time_ms.{p50,p95,p99}
  - runtime.scheduler.service_time_ms.{p50,p95,p99}
  - runtime.scheduler.saturation
  - runtime.scheduler.backpressure_factor.{provider}
  - runtime.scheduler.fair_share.{tenant|project}
- Add alert: parse/error spike already exists; add queue_wait_spike if p95_wait_ms > 2x 24h EWMA for 5m.

H) Server Route Contracts (examples)

GET /runtime/scheduler
- 200: SchedulerStateSnapshot

POST /runtime/scheduler/config
- Body: Partial<SchedulerConfig>
- 200: { ok: true, config: SchedulerConfig }
- 400 on invalid, 403 if unauthorized

POST /runtime/scheduler/pause | /resume
- 200: { ok: true, paused: boolean }

GET /runtime/queue?includeSnapshot=1
- 200: { stats: QueueStats, snapshot?: { queue: QueueItem[]; inFlight: QueueItem[]; deadLetter: QueueItem[] } }

POST /runtime/queue/reprioritize
- Body: { itemId: string; priority: QueuePriority }
- 200: { ok: true }

DELETE /runtime/queue/:itemId
- 200: { ok: true }

POST /runtime/providers/:provider/limits
- Body: { maxConcurrent: number }
- 200: { ok: true, window: CapacityWindow }

GET /runtime/runs/:runId/progress
- 200: RunProgress

POST /runtime/runs/:runId/cancel
- Body: { reason: string }
- 200: { ok: true }

I) Acceptance Tests (add ~28 new tests; update total counts)
1. Scheduler seeds run and marks initial ready nodes correctly.
2. Executes two independent nodes in parallel when limits allow.
3. Enforces globalMaxConcurrent limit.
4. Enforces perProviderMaxConcurrent limit.
5. Enforces perTenantMaxConcurrent limit.
6. Enforces perProjectMaxConcurrent limit.
7. Fairness: high-load tenant does not starve low-load tenant (bounded skew).
8. Priority aging promotes long-waiting low-priority items.
9. Backpressure reduces dynamicLimit when breaker opens.
10. Backpressure reduces dynamicLimit on p95 spike.
11. Queue capacity triggers shouldRejectNewEnqueues 429 behavior.
12. Retry on 429 with backoff; succeed on second attempt.
13. DLQ after maxAttempts on terminal 4xx.
14. Recovery: in-flight lease expiration requeues item.
15. Recovery: on startup, requeue orphaned in-flight.
16. drainGraceful: stops dequeue, waits, then exits.
17. Idempotent onSubtaskComplete merge (no duplicate field merges).
18. onNodeComplete unlocks dependents; dependent runs after deps complete.
19. Cancel run moves queued/in-flight items to canceled/DLQ as policy.
20. Reprioritize API updates priority and reflects in dequeue order.
21. Provider limits API updates dynamic window immediately.
22. UI panel renders stats and toggles pause/resume.
23. Metrics emit queue_depth and p95 wait time as items process.
24. Security: unauthorized cannot mutate scheduler config.
25. Redaction: sensitive fields not leaked in logs/snapshots.
26. Route guards wired for new endpoints.
27. Performance: 100-node DAG completes with expected parallelism within bounds.
28. Crash-recovery end-to-end: simulate process kill mid-flight; after restart, run completes.

J) Docs
- 04-Dashboard/docs/adr/adr-0070-parallel-execution-and-backpressure.md
  - Context, Decision, Consequences, Alternatives.
- 04-Dashboard/docs/runbooks/runtime-scheduler.md
  - Operating procedures: view stats, pause/resume, set limits, reprioritize, cancel runs, interpret backpressure.
- 04-Dashboard/docs/config/scheduler-config.md
  - All fields with defaults and examples.
- 04-Dashboard/docs/testing/scheduler-acceptance.md
  - How to run new tests, expected outputs.

K) Hardening
- Timeouts and AbortSignal in executor.ts; ensure no orphan promises.
- Memory bounds: cap snapshot sizes; paginate if needed.
- Input validation: strict schema checks; clamp config values to sane ranges.
- Deep redaction applied to queue/evidence in responses.
- Clock skew tolerance: use Date.now() only; serialize ISO consistently.
- Feature flag defaults keep serial behavior (enabled=false or globalMaxConcurrent=1).
- Deterministic IDs and exactly-once semantics: ackSuccess only once; guard against duplicate callbacks.

L) Migration
- Add migration step in startup to create state/scheduler/*.json if missing and seed default config.
- If legacy in-progress runs exist, scheduler remains disabled until operator enables to avoid surprise parallelism.

M) Code Pointers (create/update)
- New: lib/scheduler/{scheduler.ts,work-queue.ts,provider-capacity.ts,backpressure.ts,dag-runner.ts,recovery.ts,ids.ts}
- New: lib/runtime/executor.ts, lib/observability/scheduler-metrics.ts, lib/state/scheduler-store.ts
- Update: lib/types.ts, lib/chief-of-staff.ts, lib/worker.ts (or module used in Part 66), server.js, lib/http-response-guard.ts, app/operator.js, app/index.html, app/operator.css

N) Definition of Done
- All new routes functional and guarded.
- Default behavior preserves serial execution.
- Parallelism demonstrably increases throughput under safe limits.
- Backpressure dynamically reduces concurrency when providers unhealthy.
- Queueing and recovery robust across restarts.
- UI exposes status and minimal controls.
- All new tests pass; no regression in existing tests; docs authored.

Now implement the above with production-grade TypeScript, preserving existing functionality and coding style of the repo. Use CommonJS exports, no new external dependencies. Keep functions small, typed, and covered by tests. Wire logs with existing logger, respecting redaction policies.
```
