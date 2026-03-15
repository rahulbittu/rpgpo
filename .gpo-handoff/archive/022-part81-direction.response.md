```text
You are ChatGPT implementing RPGPO Part 81.

Title: Part 81 — Analytics & Insights Dashboard
Objective: Build a first-class analytics layer and operator-facing dashboard that computes and surfaces productivity metrics, cost efficiency, engine usage patterns, and value-delivered insights from historical task, deliverable, and cost/provider data. Preserve all existing functionality. Add typed, contract-driven modules, secure APIs, UI, docs, and tests.

Baseline
- Repo: 04-Dashboard (raw Node.js HTTP server, CommonJS TS, JSON state)
- Current: Parts 19–80 implemented; 135+ TS modules, ~930 routes, ~640+ types, 218+ tests
- Recent: Parts 75–79 (learning, conversations, task chaining, smart templates, recurring scheduler, compound workflows, state backup), Part 80 (in progress: integration gateway + webhooks)
- Constraints: No external packages. Privacy-first. Tenant/project isolation. Maintain route guards, deep redaction, middleware truth. Preserve operator UX patterns in index.html/app.js/operator.js. Keep JSON state-based persistence. Maintain acceptance suite integrity.

Non-Goals
- Do not introduce a separate DB.
- Do not add heavy charting libraries; use existing UI primitives.
- Do not change existing telemetry semantics or rewrite server routing.

High-Level Requirements
1) Analytics Data Model and Contracts
- Define typed contracts for analytics in lib/types.ts (additive only; do not break existing types):
  - AnalyticsVersion = '1.0.0'
  - AnalyticsGranularity: 'hour' | 'day' | 'week' | 'month'
  - AnalyticsMetricKey (string union; see Metrics Catalog below)
  - AnalyticsPoint { t: string (ISO), v: number }
  - MetricSeries { key: AnalyticsMetricKey; label: string; unit: 'count'|'ms'|'usd'|'ratio'|'score'|'hours'; points: AnalyticsPoint[]; source: 'rollup'|'live' }
  - AnalyticsTotals { tasksCompleted: number; tasksFailed: number; avgCycleTimeMs: number; timeSavedMs: number; costUSD: number; costPerTaskUSD: number; approvalRate: number; reworkRate: number; autonomyOverrunCount: number; engineCalls: Record<string, number>; engineCostsUSD: Record<string, number>; providerCostsUSD: Record<string, number>; deliverablesApproved: number; deliverablesProduced: number; valueScore: number }
  - InsightCard { id: string; type: 'anomaly'|'milestone'|'opportunity'|'regression'|'goal-status'; title: string; body: string; severity: 'info'|'low'|'medium'|'high'; metricRefs: AnalyticsMetricKey[]; timeWindow: { from: string; to: string }; tags?: string[]; createdAt: string; actions?: { label: string; action: 'open-route'|'recompute'|'view-tasks'|'view-costs'; href?: string }[] }
  - AnalyticsSnapshot { id: string; version: AnalyticsVersion; tenantId: string; projectId?: string; granularity: AnalyticsGranularity; from: string; to: string; totals: AnalyticsTotals; series: MetricSeries[]; insights: InsightCard[]; computedAt: string; source: 'batch'|'incremental' }
  - AnalyticsGoal { id: string; tenantId: string; projectId?: string; metric: AnalyticsMetricKey; target: number; comparator: 'lte'|'gte'|'eq'|'lt'|'gt'; window: { granularity: AnalyticsGranularity; lookbackDays: number }; unit: MetricSeries['unit']; owner: string; createdAt: string; updatedAt: string; active: boolean }
  - AnalyticsHealth { status: 'ok'|'degraded'|'stale'; lastComputedAt?: string; backlog: number; notes?: string[] }

2) Metrics Catalog (enumerate as keys in AnalyticsMetricKey)
- productivity.tasks.completed
- productivity.tasks.failed
- productivity.cycle_time.ms.avg
- productivity.time_saved.ms
- quality.approval.rate
- quality.rework.rate
- quality.override.count
- cost.total.usd
- cost.per_task.usd
- cost.engine.usd (series per engine)
- cost.provider.usd (series per provider)
- usage.engine.calls (series per engine)
- usage.workflow.runs (series per workflow)
- delivery.deliverables.produced
- delivery.deliverables.approved
- delivery.value.score
- sla.start_to_first_output.ms.avg
- sla.end_to_approval.ms.avg
- autonomy.overrun.count
- reliability.error.rate
- roi.value_per_usd (if baselines present; else null)
Notes:
- time_saved.ms: Estimate using baselines/goals (per task type/workflow) minus actual cycle time; never negative.
- value.score: Prefer explicit value ratings if present in approvals/deliverables; else 0–5 heuristic (e.g., approved=3, strongly approved=5, rejected=0) configurable.

3) Data Sources (adapters must be defensive)
- Tasks: task lifecycle records (created, started, completed, failed), durations, workflow/work item metadata, project/tenant, autonomy budget overruns.
- Subtasks/Engines: engine/provider call logs (counts, durations, token usage if available), errors.
- Costs: provider cost records (USD), per call/task rollups, engine-level cost attribution if present.
- Deliverables: produced/approved counts, approval decisions, timestamps, optional value rating.
- Existing Observability/Audit: reuse audit hub and evidence chain where possible.
Implementation detail: Implement adapter functions to read from existing JSON in state/ and any designated logs without assuming exact filenames; discover via lib/config or established registries. Provide configuration discovery with safe defaults and tests.

4) Computation and Rollups
- Implement derivation functions that compute per-task derived metrics:
  - computeTaskCycleTimes, computeTaskOutcome, computeTaskCost, computeTaskEngineUsage, computeTaskTimeSaved (using baseline lookup), computeTaskValueScore.
- Implement rollups:
  - aggregateByTimeWindow(records, granularity)
  - rollupSeriesForMetric(metricKey, from, to, tenantId, projectId?)
  - buildTotalsFromSeries(series[])
- Insight generation:
  - detectAnomalies (e.g., cost spike vs 4-week mean), detectRegressions (e.g., rising cycle time), detectMilestones (e.g., 100th approved deliverable), detectOpportunities (e.g., engine substitution lowering cost), goalStatus (evaluate goals vs current metrics).
- Idempotent batch recompute for time windows; incremental update on task completion/provider cost events.

5) State and Persistence
- New directory structure (create if missing):
  - state/analytics/
    - index.json (registry of snapshots with id, from, to, granularity, tenantId, projectId, computedAt, version)
    - snapshots/YYYY/MM/DD-<granularity>-<tenantId>-<projectId|all>.json
    - goals.json (array of AnalyticsGoal)
    - meta.json (version, lastComputedAt, lastBackfillAt)
    - cache/ (memoized partials; optional)
- JSON schema versioning: include version field and migration hook.
- File locking: use existing file/state lock if available; else add simple lock utility to ensure atomic writes.

6) Background Scheduling (Part 79 integration)
- Register a recurring job analytics.daily-rollup that computes daily snapshots for the last N days (configurable; default N=7), per tenant and per project, and updates index.json and meta.json. Respect backpressure (compute up to a max windows per run).
- Register analytics.hourly-health to update health status (staleness, backlog).
- On demand recompute via API (see APIs).

7) Security, Privacy, Isolation
- Route-level guards: reuse http-response-guard.ts and existing middleware. Enforce tenant and project scoping on every analytics API.
- Redaction: ensure no PII or content bodies are returned in analytics responses; only aggregate numeric/time series and IDs. Use deep-redaction.ts if necessary.
- Parameter validation: strict allowlists for metrics, granularity, date ranges (cap at 180 days), pagination limits.
- Multi-tenant isolation: never mix tenants in a single snapshot unless explicitly requested by operator and authorized.

8) Performance and Limits
- Rollups must handle at least: 25k tasks, 250k provider calls. Use streaming reads or chunked loading if necessary.
- Cache computed series per window in state/analytics/cache keyed by hash of inputs.
- Avoid N^2 scans; index by date and task id where possible.
- Fail safe with degraded health status when data volume exceeds configured cap; surface operator guidance.

Deliverables
A) New Modules (04-Dashboard/lib/analytics/)
- analytics-types.ts: Expose Analytics* types (re-export core contracts added to lib/types.ts), metric unit helpers, parsing utilities.
- analytics-sources.ts: Adapters to load tasks, provider calls, costs, deliverables. Contracts: loadTasks({from,to,tenantId,projectId?}): Promise<TaskLike[]>; loadProviderCalls(...): Promise<ProviderCallLike[]>; loadCosts(...): Promise<CostLike[]>; loadDeliverables(...): Promise<DeliverableLike[]>. Implement defensive discovery. Include source health signals.
- analytics-baselines.ts: Manage baselines/goals for time_saved and ROI computations. Exports: getBaselineForTaskType, upsertGoal, listGoals, evaluateGoalStatus.
- analytics-derive.ts: Compute per-task derived measures. Pure functions, fully typed.
- analytics-rollup.ts: Time window aggregation and metric series assembly. Pure functions, deterministic.
- analytics-insights.ts: InsightCard generation (anomalies, regressions, milestones, opportunities, goal status).
- analytics-store.ts: Read/write snapshots, index, meta, cache. Provide atomic write and versioning. Exports: saveSnapshot, getSnapshots, getSnapshotById, upsertIndex, readMeta, writeMeta.
- analytics-service.ts: Orchestration for recompute and queries. Exports: recomputeWindow, recomputeRange, getSummary, getSeries, getInsights, getHealth.
- analytics-export.ts: CSV/JSON exporters with column contracts. Enforce redaction.
- analytics-permissions.ts: Tenant/project permission checks, scoping.
- analytics-scheduler.ts: Register recurring jobs (daily rollup, hourly health) with existing scheduler from Part 79.
- analytics-api.ts: Wire HTTP routes. Validate inputs, enforce guards, respond via http-response-guard.ts.
- analytics-bridge.ts: Hook into runtime pipeline (Parts 65–66) to enqueue incremental updates on task/subtask completion and deliverable approval.

B) Server Integration
- server.js: Mount new analytics routes (see APIs). Ensure placement respects existing middleware order and guards. Keep raw Node HTTP patterns.
- Wire analytics-scheduler.ts registration during server boot after scheduler init.

C) UI
- index.html: Add "Analytics" tab in main nav; new sections:
  - #analytics-controls (date range, granularity selector, tenant/project scope)
  - #analytics-kpis (KPI cards)
  - #analytics-trends (line charts for key metrics)
  - #analytics-breakdowns (engine/provider usage and costs)
  - #analytics-insights (insight cards with quick actions)
  - #analytics-compare (period-over-period comparison)
- app.js/operator.js:
  - Add tab registration, event handlers for controls.
  - Fetch from /api/analytics/* endpoints.
  - Render KPI cards: tasks completed, approval rate, avg cycle time, time saved (hours), total cost, ROI/value score.
  - Render trends: tasks completed, cost total, cycle time, engine calls (stacked by engine), approval rate.
  - Render breakdowns: engine usage pie/list, provider cost table.
  - Render insights: list with severity coloring, actions to navigate to tasks/cost views or trigger recompute.
- style.css/operator.css: Minimal styles for cards/grids consistent with existing UI.

D) APIs (prefix with /api/analytics)
- GET /api/analytics/summary?from=ISO&to=ISO&granularity=day|week|month&tenant=...&project=... 
  - Returns: AnalyticsSnapshot (totals + selected key series + insights limited to top 5).
- GET /api/analytics/series?metric=<AnalyticsMetricKey>&from=ISO&to=ISO&granularity=...&tenant=...&project=...
  - Returns: MetricSeries
- GET /api/analytics/insights?from=ISO&to=ISO&tenant=...&project=...&limit=20
  - Returns: InsightCard[]
- POST /api/analytics/recompute
  - Body: { from?: ISO; to?: ISO; granularity?: AnalyticsGranularity; tenant: string; project?: string; force?: boolean }
  - Returns: { status: 'ok'; windowsComputed: number; computedAt: string }
- GET /api/analytics/goals?tenant=...&project=...
  - Returns: AnalyticsGoal[]
- POST /api/analytics/goals
  - Body: AnalyticsGoal (upsert by id); enforce permission and validation
  - Returns: { status: 'ok'; goal: AnalyticsGoal }
- GET /api/analytics/export?format=csv|json&metrics=key1,key2&from=ISO&to=ISO&granularity=...&tenant=...&project=...
  - Returns: streamed CSV or JSON with appropriate content-type
- GET /api/analytics/health?tenant=...
  - Returns: AnalyticsHealth
All endpoints must:
  - Validate query/body strictly (reject unknown metrics/params, clamp ranges).
  - Enforce tenant/project scoping with analytics-permissions.ts.
  - Use http-response-guard.ts and deep-redaction.ts where applicable.
  - Log to audit hub minimally (action + scope + count), no payloads.

E) Docs
- 04-Dashboard/docs/parts/081-analytics-insights.md (architecture, module map, data flow)
- 04-Dashboard/docs/contracts/analytics-contract.md (types, metrics catalog, API contracts, examples)
- 03-Operations/runbooks/analytics-recompute.md (how to backfill/recompute safely; lockfiles; tuning)
- 00-Governance/policies/analytics-privacy.md (aggregation, thresholds, PII exclusions)
- 04-Dashboard/docs/adr/ADR-081-analytics-layer.md (rollup vs live compute, JSON state rationale)

F) Tests
- Unit (lib/analytics/*.ts): 
  - analytics-derive: 8 tests (cycle time, cost, time saved, value score)
  - analytics-rollup: 8 tests (hour/day/week, boundary conditions, empty sets)
  - analytics-insights: 6 tests (anomaly, regression, milestone, goal status)
  - analytics-baselines: 4 tests (goal eval, baseline lookup, clamping)
- Integration (server APIs):
  - /summary, /series, /insights, /recompute, /goals (10 tests) with guards, invalid params, tenant isolation
- Acceptance (Operator flows):
  - 10 scenarios: operator views analytics, changes range/granularity, sees insights, triggers recompute, exports CSV, verifies tenant isolation, stale health warning.

Implementation Details and Contracts
- Pure functions where possible; deterministic outputs given inputs.
- CommonJS TS modules; no default exports; named exports only.
- Types first: add Analytics* types to lib/types.ts and re-export in analytics-types.ts.
- Input validation: implement local guard functions (no external libs), e.g., isISODate, isValidGranularity, isMetricKey.
- File IO: debounced writes, atomic replace; ensure state backup (Part 79) includes state/analytics/ (update backup include list if required).
- Hash/cache: compute content hash of input window (task ids + lastUpdated timestamps) to skip recompute when unchanged.
- ID generation: snapshot.id = deterministic hash of {tenantId, projectId, from, to, granularity, version}.
- Insight ids: deterministic from type + refs + window + hash of rationale.
- Goal evaluation: comparator logic; produce goal-status InsightCard if active.
- Health: staleness threshold (e.g., lastComputedAt older than 24h => degraded), backlog = number of pending windows not computed.
- Privacy: enforce minimum aggregation threshold (e.g., suppress per-engine breakdowns when fewer than K tasks in window; default K=3).

Wiring to Existing Systems
- analytics-bridge.ts: Subscribe to existing runtime hooks (Parts 65–66) such as onTaskStart/onSubtaskComplete/onTaskComplete/onDeliverableApproved to:
  - enqueue lightweight “dirty window” marks (hour/day) in state/analytics/cache/dirty.json
  - optionally trigger incremental recompute for those windows (bounded by rate limit)
- analytics-scheduler.ts: integrate with recurring scheduler from Part 79; register jobs with IDs:
  - analytics.daily-rollup (cron: 02:15 local)
  - analytics.hourly-health (cron: 15 minutes past hour)
- If scheduler APIs differ, adapt to existing registerJob signature and lifecycle.

Routing
- Mount under /api/analytics/ prefix; add to server.js route match table near reporting endpoints.
- Ensure pre-route parsing of query parameters using existing utilities.
- Every response goes through http-response-guard.ts with appropriate contract keys to enable inline route guard enforcement.
- Add route-level docs strings in analytics-api.ts for discovery scripts (if present).

Migrations and Backfill
- On first run, attempt to index last 30 days by default (configurable).
- Provide POST /api/analytics/recompute with force to backfill larger windows in batches (max windows per call configurable; default 30).
- Write meta.json with lastBackfillAt and version.
- If types or version change in future, create migrateSnapshots(versionFrom, versionTo) stub and log migrate-needed until implemented.

UI Implementation Notes
- Keep DOM-first approach (no framework). Add new tab <button id="tab-analytics">Analytics</button>.
- Add functions:
  - initAnalyticsTab(), loadAnalyticsSummary(), renderKpis(), renderTrends(), renderBreakdowns(), renderInsights(), bindAnalyticsControls()
- Use lightweight SVG or existing canvas utilities for trend lines; fallback to simple sparkline-like divs if no utilities exist.
- Graceful empty states (no data message).
- Controls: date range presets (7/30/90 days), granularity selector (day/week/month), project filter.
- Clicking KPI updates primary trend to that metric.
- Recompute button (operator only): POST /api/analytics/recompute with current filters.

Acceptance Criteria
- Operator can open Analytics tab and see:
  - 6 KPI cards: Tasks Completed, Approval Rate, Avg Cycle Time, Time Saved (hours), Total Cost, Value Score/ROI.
  - Trends for Tasks Completed, Cost (USD), Cycle Time (ms), Engine Calls (stacked), Approval Rate (%).
  - Breakdown of engine usage and provider costs with top-5 lists.
  - At least 3 InsightCards when data present (anomaly/regression/milestone/goal-status).
- API returns within 800ms for 30-day windows on 10k tasks dataset (local).
- No PII or content text is returned in analytics responses.
- Tenant isolation verified: cross-tenant query returns 403 or empty based on policy.
- Background jobs produce daily snapshots; health degrades if snapshots older than 24h.
- Recompute endpoint is idempotent and honors force flag.
- State/analytics/ is included in backups (Part 79).

Hardening and Edge Cases
- Handle missing or partial data gracefully; default zeros and include notes in insights when heuristics applied.
- Clamp outliers; guard against negative costs/time.
- Enforce maximum lookback window (<=180 days).
- Protect against path traversal in export filenames; only stream from in-memory buffers.
- Concurrency: implement simple file lock around snapshot writes; de-dupe concurrent recomputes via in-memory semaphore.
- Logging: minimal, structured, no payloads; tie to audit with event:analytics.*.

Change List (expected)
- New: lib/analytics/*.ts (12–14 modules)
- Modified: server.js (route mounts), app.js/operator.js/index.html/styles, lib/types.ts (additive)
- New: docs files (5)
- New: tests (>=30)

Implementation Steps
1) Add types in lib/types.ts; implement analytics-types.ts re-exports and helpers.
2) Implement analytics-sources.ts with defensive adapters (tasks, provider calls, costs, deliverables).
3) Implement analytics-baselines.ts (goals store + baseline lookup).
4) Implement analytics-derive.ts and analytics-rollup.ts pure functions with unit tests.
5) Implement analytics-insights.ts with anomaly/regression detection and goal status.
6) Implement analytics-store.ts (atomic write, index, meta).
7) Implement analytics-service.ts orchestration.
8) Implement analytics-export.ts.
9) Implement analytics-permissions.ts.
10) Implement analytics-api.ts and mount in server.js with guards.
11) Implement analytics-scheduler.ts (daily rollup + hourly health) and register with scheduler.
12) Implement analytics-bridge.ts to hook into runtime events; enqueue dirty windows.
13) UI: add tab, controls, renderers; wire events and fetch calls.
14) Docs: part doc, contract, runbook, privacy policy, ADR.
15) Tests: unit + integration + acceptance. Ensure CI green.

Review Checklist
- Types: All APIs and modules are strongly typed; no any.
- Guards: All endpoints validate and enforce tenant/project scope; route guard passes.
- Privacy: No PII/content fields emitted; deep redaction where necessary.
- Performance: Rollups cached; recompute idempotent; no blocking long IO on request path (use precomputed snapshots).
- UX: Accessible tab; responsive layout; empty/error states present.
- Backups: state/analytics included in backup set; restore verified in runbook.
- Docs: Contracts match implemented responses; examples included.

Deliver this as a single PR labeled "Part 81 — Analytics & Insights Dashboard" with a detailed CHANGELOG entry and update to Parts index.
```
