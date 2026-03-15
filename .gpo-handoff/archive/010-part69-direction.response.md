```
You are ChatGPT acting as the GPO/RPGPO builder for Part 69.

Context
- Repo: /Users/rpgpo/Projects/RPGPO
- App: 04-Dashboard/app (raw Node.js HTTP, CommonJS TS modules)
- Baseline (post-Part 68): 87 TS modules, ~818 API routes, ~458+ types. Structured output pipeline is end-to-end: contract → schema → prompt → provider (native-json/mime-json/sentinel) → parse → retry → field merge → evidence → operator visibility. 5 providers, capability-preferred routing, exponential backoff retry (3 attempts), board phase schemas, executeWithParseRetry unified loop, structured IO status surfaced in Chief of Staff, +3 routes, 174 tests passing.
- Gap: No aggregate observability (metrics, histograms, error rates), no alerting, no structured IO health dashboard, no cost tracking for structured calls, evidence has no TTL/cleanup, provider capability data is static with no learning from outcomes.

Objective
Part 69: Structured I/O Observability + Metrics + Provider Learning + Evidence Lifecycle
- Add aggregate metrics and histograms for all structured I/O calls
- Provider success tracking with dynamic capability scoring and routing bias
- Evidence lifecycle: TTL/cleanup with governance config
- Cost integration for structured calls (per-call, per-provider, per-task)
- Operator dashboard panel: Structured I/O Health (system and provider level)
- Alerting on parse failure spikes and provider error rates
- Preserve all existing functionality and green tests

Hard Constraints
- Do not regress existing route protections, middleware truth, redaction, budgets, or acceptance cases
- Prefer typed, contract-driven, enterprise-grade design; extend lib/types.ts with explicit interfaces
- Raw Node.js HTTP routes only; integrate with current server.js guard and deep redaction
- JSON file-backed state in state/, plus in-memory rolling windows
- Deterministic IDs, versioning, evidence link continuity
- Backwards compatible defaults; new features disabled or safe by default via config
- Every new route must be guarded and redacted; every mutation must have mutation guard
- UI additions must not break current shell; lazy-load panel data; polling ≤ 10s

Deliverables
- New/updated TS modules (with explicit APIs)
- New API routes (+ route guards)
- UI: new Structured I/O Health panel
- Config: structured I/O observability configuration
- Evidence TTL cleanup job
- Provider learning with dynamic scoring
- Cost tracking integration
- Docs: ADR, runbook, operator guide
- Tests: unit + integration; keep 174 green; add new passing tests
- Acceptance criteria (below) must be met

Implementation Plan

A) Types (lib/types.ts)
Add the following types. Keep names stable and exported. Update any central type registries if present.

- StructuredIoEvent
  - id: string
  - taskId: string | null
  - subtaskId: string | null
  - deliverableId: string | null
  - schemaId: string
  - phase: 'scaffold' | 'plan' | 'deliberate' | 'execute' | 'merge' | 'validate' | 'complete'
  - providerKey: string
  - capability: 'native-json' | 'mime-json' | 'sentinel'
  - attempt: number
  - startedAt: number
  - endedAt: number
  - latencyMs: number
  - outcome: 'success' | 'parse_failure' | 'provider_error' | 'timeout' | 'rate_limited' | 'cancelled'
  - errorCode?: string
  - errorMessageRedacted?: string
  - retryCount: number
  - inputTokens?: number
  - outputTokens?: number
  - costUsd?: number

- StructuredIoMetricsSnapshot
  - windowStart: number
  - windowEnd: number
  - totalCalls: number
  - successRate: number
  - parseFailureRate: number
  - providerErrorRate: number
  - avgLatencyMs: number
  - p50LatencyMs: number
  - p95LatencyMs: number
  - p99LatencyMs: number
  - retryRate: number
  - avgAttempts: number
  - totalCostUsd: number
  - byProvider: Record<string, ProviderMetrics>
  - bySchema: Record<string, SchemaMetrics>

- ProviderMetrics
  - providerKey: string
  - totalCalls: number
  - successRate: number
  - parseFailureRate: number
  - providerErrorRate: number
  - avgLatencyMs: number
  - p50LatencyMs: number
  - p95LatencyMs: number
  - p99LatencyMs: number
  - avgAttempts: number
  - totalCostUsd: number
  - dynamicScore: number
  - samples: number
  - circuitOpen: boolean
  - lastUpdated: number

- SchemaMetrics
  - schemaId: string
  - totalCalls: number
  - successRate: number
  - avgLatencyMs: number
  - avgAttempts: number

- ProviderLearningConfig
  - weights: { successRate: number; latency: number; cost: number }
  - minSamples: number
  - decay: 'ewma' | 'sliding'
  - alpha: number
  - circuitBreaker: {
      failureRateThreshold: number
      minimumCalls: number
      sleepWindowMs: number
    }

- StructuredIoConfig
  - metrics: {
      latencyBucketsMs: number[]
      aggregationWindowMinutes: number
      retentionHours: number
    }
  - providerLearning: ProviderLearningConfig
  - evidence: {
      ttlDays: number
      cleanupIntervalMinutes: number
      maxBytes: number
    }
  - alerts: {
      parseFailureRateThreshold: number
      providerErrorRateThreshold: number
      minCalls: number
      evaluationIntervalMinutes: number
      cooldownMinutes: number
    }
  - cost: {
      providerPricing: Record<string, { inputPer1k: number; outputPer1k: number }>
      defaultPricing: { inputPer1k: number; outputPer1k: number }
    }

- StructuredIoAlert
  - id: string
  - kind: 'parse_spike' | 'provider_error_spike' | 'cost_spike'
  - providerKey?: string
  - windowStart: number
  - windowEnd: number
  - observedRate?: number
  - threshold: number
  - totalCalls: number
  - acknowledged: boolean
  - acknowledgedBy?: string
  - acknowledgedAt?: number
  - details: string

B) Config
- New file: state/config/structured-io.json with defaults:
  {
    "metrics": {
      "latencyBucketsMs": [50,100,200,400,800,1600,3200,6400],
      "aggregationWindowMinutes": 5,
      "retentionHours": 168
    },
    "providerLearning": {
      "weights": { "successRate": 0.6, "latency": 0.25, "cost": 0.15 },
      "minSamples": 30,
      "decay": "ewma",
      "alpha": 0.2,
      "circuitBreaker": {
        "failureRateThreshold": 0.5,
        "minimumCalls": 20,
        "sleepWindowMs": 300000
      }
    },
    "evidence": {
      "ttlDays": 30,
      "cleanupIntervalMinutes": 60,
      "maxBytes": 500000000
    },
    "alerts": {
      "parseFailureRateThreshold": 0.2,
      "providerErrorRateThreshold": 0.3,
      "minCalls": 20,
      "evaluationIntervalMinutes": 5,
      "cooldownMinutes": 30
    },
    "cost": {
      "providerPricing": {
        "openai:gpt-4o": { "inputPer1k": 5.0, "outputPer1k": 15.0 },
        "anthropic:claude-3-5": { "inputPer1k": 3.0, "outputPer1k": 15.0 },
        "google:gemini-1.5-pro": { "inputPer1k": 1.25, "outputPer1k": 5.0 },
        "perplexity:sonar-large": { "inputPer1k": 1.0, "outputPer1k": 2.0 },
        "mistral:large": { "inputPer1k": 2.0, "outputPer1k": 6.0 }
      },
      "defaultPricing": { "inputPer1k": 2.0, "outputPer1k": 6.0 }
    }
  }
- Wire this config into existing configuration loader (if present) or introduce a small reader in new modules; do not crash on missing file—generate defaults and persist.

C) New Modules (04-Dashboard/app/lib)

1) structured-io-metrics.ts
- Purpose: event ingestion, rolling aggregation, histograms, snapshots, API for queries
- Exports:
  - initStructuredIoMetrics(config: StructuredIoConfig): void
  - recordStructuredIoEvent(event: StructuredIoEvent): void
  - getCurrentSnapshot(windowMinutes?: number): StructuredIoMetricsSnapshot
  - getProviderMetrics(providerKey: string, windowMinutes?: number): ProviderMetrics
  - getSchemaMetrics(schemaId: string, windowMinutes?: number): SchemaMetrics
  - getLatencyHistogram(windowMinutes?: number): { bucketsMs: number[]; counts: number[] }
  - resetMetrics(scope?: 'all' | 'provider' | 'schema', key?: string): void
- Storage:
  - In-memory ring buffers per provider and global, with time-indexed buckets spanning retentionHours
  - Periodic persistence: state/metrics/structured-io.jsonl (append snapshots every aggregationWindow) — ensure file rotation by date; redact error messages

2) structured-io-cost.ts
- Purpose: compute and track per-call, per-provider, per-task cost
- Exports:
  - initStructuredIoCost(config: StructuredIoConfig): void
  - estimateCostUsd(providerKey: string, inputTokens?: number, outputTokens?: number): number
  - recordCost(event: StructuredIoEvent): void
  - getCostSummary(windowMinutes?: number): { totalUsd: number; byProvider: Record<string, number>; byTask: Record<string, number> }
- Persistence: merge into metrics snapshot; optional daily rollup: state/metrics/structured-io-cost-YYYYMMDD.json

3) provider-learning.ts
- Purpose: dynamic scoring and routing bias, circuit breaker
- Exports:
  - initProviderLearning(config: StructuredIoConfig): void
  - updateProviderFromEvent(event: StructuredIoEvent): void
  - getDynamicScore(providerKey: string): number
  - getRoutingBias(providerKey: string): number
  - isCircuitOpen(providerKey: string): boolean
  - getProviderLearningState(): Record<string, ProviderMetrics>
  - overrideProviderScore(providerKey: string, score: number): void
- Behavior:
  - Maintain EWMA of success, latency, cost; compute dynamicScore = w1*success + w2*(1/latencyNorm) + w3*(1/costNorm), normalized to [0,1]
  - Open circuit when providerErrorRate >= threshold with minimumCalls; auto-close after sleepWindowMs with half-open trial strategy
  - Expose routingBias to adjust provider ordering in capability-preferred routing, never exceeding +/- 20% from baseline preference

4) evidence-lifecycle.ts
- Purpose: TTL and cleanup for evidence files produced by structured pipeline
- Exports:
  - initEvidenceLifecycle(config: StructuredIoConfig): void
  - runEvidenceCleanup(now?: number): { deletedCount: number; freedBytes: number }
  - indexEvidence(): { totalFiles: number; totalBytes: number; byAge: Record<string, number> }
- Behavior:
  - Scan state/evidence/** (or actual evidence root used in Parts 62-66), read metadata timestamps
  - Delete files older than ttlDays; enforce maxBytes by LRU (oldest first) if exceeded
  - Write operations log: state/operations/evidence-cleanup.log (JSONL)

5) structured-io-alerts.ts
- Purpose: detect spikes and manage alert lifecycle
- Exports:
  - initStructuredIoAlerts(config: StructuredIoConfig): void
  - evaluateAlerts(now?: number): StructuredIoAlert[]
  - listActiveAlerts(): StructuredIoAlert[]
  - acknowledgeAlert(id: string, actor: string): void
- Behavior:
  - Every evaluationIntervalMinutes, analyze latest window: raise parse_spike or provider_error_spike if rate > threshold and calls >= minCalls
  - Cooldown per kind/provider to avoid alert storms
  - Persist alerts: state/alerts/structured-io.json

D) Integrations and Wiring

1) Instrument executeWithParseRetry loop (Part 68)
- File(s): the module implementing executeWithParseRetry (likely lib/structured-output-pipeline.ts or lib/deliberation.ts)
- At attempt start: capture startedAt
- On attempt completion (success or failure): compute tokens if available (from provider response metadata), estimate cost via structured-io-cost, build StructuredIoEvent and call:
  - recordStructuredIoEvent(event)
  - recordCost(event)
  - updateProviderFromEvent(event)
- Ensure this runs for all 3 attempt paths and final success/failure; attach taskId/subtaskId/deliverableId/schemaId/phase/providerKey/capability
- Do not leak full prompts or raw model outputs; only store redacted error message and metrics

2) Provider registry bias
- File: provider-capability-registry.ts (from Part 68)
- During provider selection, consult provider-learning.getRoutingBias and isCircuitOpen:
  - Skip providers with open circuits unless all are open, in which case pick least-bad (highest dynamicScore) and log degraded mode
  - Apply bias to existing preference ordering—cap movement to within +/-1 position unless score delta > 0.2
- Expose GET API to view dynamic scores and circuit state

3) Background schedulers (server.js or a scheduler module if exists)
- setInterval loops:
  - metrics snapshot/persist each aggregationWindowMinutes
  - evidence cleanup each cleanupIntervalMinutes
  - alerts evaluation each evaluationIntervalMinutes
- Ensure clean shutdown and no duplicated intervals on HMR/reload if that exists
- Respect budgets/tenancy if multiple tenants exist (isolation per tenant config if applicable)

E) API Routes (server.js)
Add guarded routes. All GETs use inline route guards and deep redaction where applicable.

- GET /api/structured-io/metrics
  - Query: windowMinutes?=number
  - Returns: StructuredIoMetricsSnapshot
- GET /api/structured-io/metrics/providers
  - Returns: ProviderMetrics[] (all known providers)
- GET /api/structured-io/metrics/schemas
  - Returns: SchemaMetrics[] (known schemas)
- GET /api/structured-io/latency-histogram?windowMinutes=number
  - Returns: { bucketsMs: number[]; counts: number[] }
- GET /api/structured-io/costs?windowMinutes=number
  - Returns: { totalUsd: number; byProvider: Record<string, number>; byTask: Record<string, number> }
- GET /api/structured-io/alerts
  - Returns: StructuredIoAlert[]
- POST /api/structured-io/alerts/ack
  - Body: { id: string, actor: string }
  - Mutation guard required
- GET /api/structured-io/providers/learning
  - Returns: Record<string, ProviderMetrics>
- POST /api/structured-io/providers/override-score
  - Body: { providerKey: string, score: number }
  - Mutation guard + audit log; only in dev or with admin role flag from governance
- POST /api/structured-io/metrics/reset
  - Body: { scope?: 'all'|'provider'|'schema', key?: string }
  - Mutation guard; admin only

Route Protection and Redaction:
- Use existing http-response-guard.ts and deep-redaction.ts
- Scrub any nested errorMessage fields; do not return prompts or outputs
- Log admin mutations to override ledger

F) UI (04-Dashboard/app)
Add a new operator-facing panel: Structured I/O Health

1) index.html
- Add a navigation tab "Structured I/O" next to existing panels (shell retains 14/18 shippable)
- Container div id="structured-io-panel" hidden by default

2) app.js
- Add panel routing and lazy data fetch every 10s while visible
- Fetch:
  - /api/structured-io/metrics?windowMinutes=60
  - /api/structured-io/metrics/providers
  - /api/structured-io/latency-histogram?windowMinutes=60
  - /api/structured-io/costs?windowMinutes=1440
  - /api/structured-io/alerts
- Render:
  - Global KPIs: success rate (1h, 24h toggle), p50/p95, retry rate, total cost
  - Per-provider table: success, error rates, p95, attempts, cost, dynamic score, circuit state (chip: open/closed)
  - Histogram bar chart (simple divs) for latency
  - Active alerts list with Acknowledge buttons (POST to /alerts/ack)
  - Sparklines (textual ascii or minimal DOM) for last N windows success rate per provider
- Operator.js (if separation exists) — keep JS in app.js if monolithic pattern used
- CSS: light styles only; reuse operator.css components

3) Chief-of-Staff / Task views
- On existing per-task status surfaces, add a "Structured I/O" summary line (last call latency, attempts, provider, cost) if not already present; do not expand layouts

G) Evidence Lifecycle
- Default TTL 30 days; run cleanup job
- Add a setting in UI panel to display:
  - Total evidence files, total bytes, by-age buckets (0-7d, 7-30d, 30-90d, 90d+)
- Do not add UI controls to change TTL in this part; changes via config file only

H) Docs
- 04-Dashboard/docs/adr/ADR-00XX-structured-io-observability.md
  - Decision: in-app metrics + provider learning with EWMA + circuit breaker + cost tracking + evidence TTL
  - Alternatives considered, data model, retention strategies, privacy
- 04-Dashboard/docs/runbooks/structured-io-alerts-runbook.md
  - How alerts are generated, thresholds, how to acknowledge, how to override provider score, how to interpret circuit states
- 04-Dashboard/docs/operator/structured-io-health.md
  - Panel overview, KPIs, provider table, histogram, costs, evidence summary

I) Tests
Add new tests under 04-Dashboard/app/tests/structured-io/*
- metrics.ingestion-and-snapshot.test.ts
  - recordStructuredIoEvent sequences; validate snapshot aggregates, histograms, p50/p95
- provider.learning-ewma-and-circuit.test.ts
  - simulate outcomes; ensure dynamicScore converges; circuit opens/closes per config
- cost.tracking.test.ts
  - various token counts and providers; validate cost estimates and aggregation
- alerts.spike-detection.test.ts
  - simulate bursts; verify alert creation, cooldown, thresholds; ack flow
- evidence.cleanup.test.ts
  - create temp evidence files with ages; run cleanup; validate deletions and logs
- api.routes-guarding.test.ts
  - ensure new routes are registered, guarded, and redact fields
- ui.structured-io-panel.smoke.test.ts
  - headless DOM render of panel with fixture data; verify key elements and ack button handler

Target: +28 tests; keep prior 174 green; new total ≥ 202 tests

J) Acceptance Criteria
- Aggregation
  - Metrics snapshot exposes correct counts, rates, and latency percentiles across 1h and 24h windows with ≤5% error for simulated data
  - Latency histogram buckets match configured boundaries
  - Cost summaries reflect per-call estimations and roll up by provider and task
- Provider Learning
  - Dynamic scores adjust within 3 windows to reflect improved success/latency/cost
  - Routing bias reorders providers by score within +/-1 position (unless score delta > 0.2)
  - Circuit breaker opens after exceeding failureRateThreshold with minimumCalls and half-opens after sleepWindowMs; selection respects state
- Evidence Lifecycle
  - TTL cleanup deletes files older than ttlDays and enforces maxBytes via LRU; operations log written
- Alerts
  - parse_spike and provider_error_spike alerts fire and persist; acknowledgements clear active state; cooldown respected
- API and Guarding
  - All new routes operational, documented in server.js route index, and pass response guard and deep redaction checks
- UI
  - Structured I/O Health panel renders without blocking other panels; refreshes every 10s; displays KPIs, per-provider table, histogram, cost totals, alerts with ack workflow
- Docs
  - ADR, runbook, and operator guide present and linked from docs index
- Non-regression
  - No changes to existing deliverable pipeline behavior, board/worker flows, or structured IO evidence linking
  - All prior acceptance tests pass

K) Security and Hardening
- Redact errorMessage fields to strip PII/prompts
- Alert payloads must not include raw content or provider secrets
- Admin-only for override-score and metrics reset; log to override ledger with actor, reason
- Tenant/project isolation: if multi-tenant flags exist, partition metrics keys by tenant/project; default single-tenant path for RPGPO
- Backpressure: if metrics persistence falls behind, drop snapshots (log once) rather than blocking calls
- File I/O bounded: evidence cleanup yields to event loop; limit deletions per tick to avoid long blocks

L) Step-by-Step
1) Implement types and config loader with defaults and persistence
2) Create structured-io-metrics.ts with ring buffers, snapshotting, histograms
3) Create structured-io-cost.ts and integrate into metrics
4) Create provider-learning.ts with EWMA, scoring, circuit breaker
5) Create evidence-lifecycle.ts and scheduler
6) Create structured-io-alerts.ts and scheduler
7) Wire instrumentation into executeWithParseRetry
8) Bias provider selection in provider-capability-registry.ts
9) Add API routes with guards/redaction and mutation guards where needed
10) Implement UI panel and polling
11) Write docs (ADR, runbook, operator guide)
12) Add tests; run full suite; fix any regressions
13) Commit with Part 69 message and summary of routes, modules, and UI changes

Output
- Code changes per above with strong typing and preservation of existing behavior
- New routes count: +7 (guarded)
- New modules: +5
- Tests: +28
- Docs: +3
- All acceptance criteria satisfied
```
