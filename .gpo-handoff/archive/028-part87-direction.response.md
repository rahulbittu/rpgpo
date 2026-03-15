```text
You are the GPO/RPGPO Builder. Implement Part 87 end-to-end.

Title: Part 87 — Error Tracking + Recovery System
Goal: Centralized error tracking with categorization, trending, automated retry for transient failures, and recovery suggestions. Preserve all existing behavior. Typed, contract-driven, CommonJS TS, raw Node HTTP. No regressions.

Repository context:
- 04-Dashboard app with raw Node HTTP server (server.js), 150+ TS modules, ~1000+ routes, ~720+ types.
- Deep redaction and inline route guards exist.
- Runtime hooks exist: onTaskStart/onSubtaskComplete/onTaskComplete.
- Engines: 17 providers; pipeline is structured and governed.
- State: JSON files in state/.

High-level deliverables:
1) New typed error event model, categorization, fingerprinting.
2) Centralized error tracking store with NDJSON log + index + aggregates + trends.
3) Retry policies with jittered backoff for transient categories; safe, budget-aware.
4) Recovery suggestions engine, contextual and data-driven.
5) Server APIs for querying errors, stats, and replay.
6) Operator UI: Errors tab with KPIs, table, detail drawer, retry/ack/snooze.
7) Docs: contracts + runbook.
8) Acceptance suite + fault injection helpers.
9) Hardening: redaction, sampling, dedupe, circuit breaker, idempotency.

Constraints:
- CommonJS modules, TypeScript strictest, no external frameworks for HTTP.
- Preserve all existing functionality and APIs. Additive changes only.
- All new APIs guarded via existing route guard and RBAC (operator role).
- All payloads go through deep redaction before persistence or response.
- File IO safe: queued, atomic writes, backpressure, crash-safe.
- Performance overhead target: <2% CPU increase at 200 RPS synthetic.

===============================================================================
A) Types — lib/types.ts (augment)
===============================================================================
Add the following types. Keep naming v1-stable; do not break existing exports.

export type ErrorCategory =
  | 'Network'
  | 'Timeout'
  | 'RateLimit'
  | 'Provider5xx'
  | 'Provider4xx'
  | 'MalformedResponse'
  | 'ContractViolation'
  | 'ValidationError'
  | 'StateCorruption'
  | 'Authorization'
  | 'QuotaExceeded'
  | 'CircuitOpen'
  | 'Unknown';

export type ErrorSeverity = 'info' | 'warn' | 'error' | 'critical';

export interface ErrorContextV1 {
  taskId?: string;
  subtaskId?: string;
  deliverableId?: string;
  workflowId?: string;
  engine?: string;           // engine name, e.g., 'openai:gpt-4o'
  provider?: string;         // provider id
  route?: string;            // HTTP route or internal call site
  module?: string;           // lib/<module>.ts
  operation?: string;        // function or operation name
  tenant?: string;           // tenant/project id
  attempt?: number;          // retry attempt (0 for first)
  correlationId?: string;    // shared id across retries
  startedAt?: string;        // ISO
  budget?: { ms?: number; cost?: number };
}

export interface ProviderErrorInfoV1 {
  httpStatus?: number;
  code?: string;           // provider-specific error code
  message?: string;        // original message (to be redacted)
  isTimeout?: boolean;
  isRateLimit?: boolean;
}

export interface ErrorEventV1 {
  id: string;               // deterministic ULID
  ts: string;               // ISO time
  category: ErrorCategory;
  severity: ErrorSeverity;
  transient: boolean;
  fingerprint: string;      // stable grouping key
  message: string;          // normalized, redacted
  details?: Record<string, any>; // redacted, size-limited
  provider?: ProviderErrorInfoV1;
  ctx?: ErrorContextV1;
  links?: { taskId?: string; deliverableId?: string };
  retry?: {
    policy?: string;
    attempt?: number;
    maxAttempts?: number;
    nextDelayMs?: number;
    scheduledAt?: string;
    decision?: 'retry' | 'abort' | 'escalate' | 'none';
    reason?: string;
  };
  ack?: {
    by?: string;
    at?: string;
    note?: string;
  };
  snooze?: {
    until?: string;
    by?: string;
    reason?: string;
  };
  counters?: {
    seen?: number;          // occurrences in this fingerprint window
    firstSeen?: string;
    lastSeen?: string;
  };
}

export interface ErrorFingerprintV1 {
  key: string;              // hash
  inputs: {
    category: ErrorCategory;
    code?: string;
    normalizedMessage?: string;
    route?: string;
    engine?: string;
    module?: string;
  };
}

export interface RetryPolicyV1 {
  id: string;                        // e.g., 'default-transient'
  match: {
    categories?: ErrorCategory[];
    codes?: string[];                // provider codes
    engines?: string[];
    routes?: string[];
  };
  strategy: {
    type: 'exponential-backoff';
    baseMs: number;                  // e.g., 300
    factor: number;                  // e.g., 2.0
    jitter: { type: 'full' | 'equal' | 'none'; ratio?: number };
    maxAttempts: number;             // e.g., 3
    maxDelayMs: number;              // cap
    timeoutCeilingMs?: number;       // increase op timeout to this ceiling
  };
  budgetGuards?: {
    maxTotalDelayMs?: number;
    maxConcurrentRetries?: number;
    circuitOpenOn?: { rateLimitPerMin?: number; consecutiveFailures?: number };
  };
}

export interface RetryDecisionV1 {
  shouldRetry: boolean;
  reason: string;
  nextDelayMs?: number;
  attempt: number;
  maxAttempts: number;
  policyId?: string;
}

export interface RecoverySuggestionV1 {
  id: string;
  title: string;
  steps: string[];
  confidence: number; // 0..1
  category?: ErrorCategory;
  appliesTo?: {
    fingerprint?: string;
    engine?: string;
    route?: string;
  };
  refs?: { doc?: string[] };
}

export interface ErrorAggregateV1 {
  window: '5m' | '1h' | '24h';
  from: string;
  to: string;
  totals: {
    count: number;
    byCategory: Record<ErrorCategory, number>;
    byEngine: Record<string, number>;
    byRoute: Record<string, number>;
    bySeverity: Record<ErrorSeverity, number>;
  };
  topFingerprints: Array<{ fingerprint: string; count: number; lastSeen: string; category: ErrorCategory; engine?: string; route?: string; message: string }>;
}

export interface ErrorTrendPointV1 {
  ts: string;
  count: number;
  byCategory: Partial<Record<ErrorCategory, number>>;
}

export interface ErrorQueryV1 {
  from?: string;
  to?: string;
  category?: ErrorCategory;
  engine?: string;
  route?: string;
  taskId?: string;
  severity?: ErrorSeverity;
  fingerprint?: string;
  limit?: number;
  cursor?: string;
}

export interface ErrorStatsV1 {
  now: string;
  last5m: ErrorAggregateV1;
  last1h: ErrorAggregateV1;
  last24h: ErrorAggregateV1;
}

===============================================================================
B) New Modules
===============================================================================
Create the following modules under 04-Dashboard/lib/. CommonJS exports. 100% typed.

1) lib/error-fingerprint.ts
- export function fingerprintError(evt: Pick<ErrorEventV1, 'category' | 'message' | 'provider' | 'ctx'>): ErrorFingerprintV1
  - Normalize message: lowercase, strip digits/uuids/emails/urls, collapse whitespace.
  - Key inputs: category + provider.code + normalizedMessage + route + engine + module.
  - Hash: sha256 over JSON of inputs, hex.
  - Return { key, inputs }.

2) lib/error-categorizer.ts
- export function categorize(err: any, ctx?: ErrorContextV1): { category: ErrorCategory; severity: ErrorSeverity; transient: boolean; normalizedMessage: string; provider?: ProviderErrorInfoV1 }
  - Heuristics:
    - TimeoutError, ETIMEDOUT, ESOCKETTIMEDOUT => Timeout (transient, severity=error)
    - ECONNRESET, ENOTFOUND, EAI_AGAIN => Network (transient)
    - HTTP 429 or code 'rate_limit_exceeded' => RateLimit (transient, severity=warn)
    - HTTP 5xx => Provider5xx (transient, severity=error)
    - HTTP 4xx (except 429) => Provider4xx (non-transient unless code indicates retryable)
    - JSON.parse errors, schema validation => MalformedResponse or ContractViolation
    - Authorization errors => Authorization
    - QuotaExceeded where code indicates quota => QuotaExceeded (transient=false, severity=warn)
    - Fallback: Unknown (severity=error)
  - normalizedMessage: short, redacted string.

3) lib/error-store.ts
- Persistent storage with NDJSON + index + aggregates + trends.
- Files:
  - state/errors/events.log (NDJSON, append-only)
  - state/errors/index.json (map of id -> shallow metadata, plus fingerprint -> counters)
  - state/errors/aggregates.json (precomputed windows)
  - state/errors/trends.json (array of recent trend points)
- API:
  - export function initErrorStore(): Promise<void> // ensures dirs/files exist
  - export function appendEvent(evt: ErrorEventV1): Promise<void>
  - export function getEvent(id: string): Promise<ErrorEventV1 | null>
  - export function query(q: ErrorQueryV1): Promise<{ items: ErrorEventV1[]; cursor?: string }>
  - export function updateAck(id: string, ack: NonNullable<ErrorEventV1['ack']>): Promise<void>
  - export function updateSnooze(id: string, snooze: NonNullable<ErrorEventV1['snooze']>): Promise<void>
  - export function readAggregates(): Promise<ErrorStatsV1>
  - export function writeAggregates(stats: ErrorStatsV1): Promise<void>
  - export function incrementFingerprint(fp: string, atIso: string): Promise<void>
- Implementation notes:
  - Write queue with backpressure; flush every 100 events or 1000ms.
  - Max event details size: 32KB (truncate with '[truncated]').
  - Redact via deep-redaction before write.
  - Dedupe bursts: if same fingerprint within 5s, increment counters and only write a compact reference event (type='seen') in NDJSON to reduce volume.

4) lib/error-tracker.ts
- Central intake and query façade.
- export async function recordError(err: any, ctx?: ErrorContextV1): Promise<ErrorEventV1>
  - categorize -> fingerprint -> build event (id: ULID; ts: now).
  - persist via error-store; update aggregates counters minimalistically.
  - return event (id, fingerprint, category, retry placeholder).
- export async function ackError(id: string, by: string, note?: string): Promise<void>
- export async function snoozeError(id: string, untilIso: string, by: string, reason?: string): Promise<void>
- export async function getErrors(q: ErrorQueryV1): Promise<{ items: ErrorEventV1[]; cursor?: string }>
- export async function getError(id: string): Promise<ErrorEventV1 | null>
- export async function getStats(): Promise<ErrorStatsV1>

5) lib/retry-policy.ts
- Load and evaluate retry policies.
- Files: state/config/retry-policies.json (create with defaults below).
- export function loadRetryPolicies(): RetryPolicyV1[]
- export function decideRetry(evt: ErrorEventV1): RetryDecisionV1
  - Choose first matching policy; compute exponential-backoff with jitter; enforce maxAttempts; consider evt.retry.attempt.
  - Default ‘reason’ includes category and code.
- export function nextDelayMs(policy: RetryPolicyV1, attempt: number): number

Default policies file (seed):
[
  {
    "id": "default-transient",
    "match": { "categories": ["Network", "Timeout", "RateLimit", "Provider5xx"] },
    "strategy": { "type": "exponential-backoff", "baseMs": 300, "factor": 2, "jitter": { "type": "full" }, "maxAttempts": 3, "maxDelayMs": 8000, "timeoutCeilingMs": 45000 }
  },
  {
    "id": "malformed-response-retry",
    "match": { "categories": ["MalformedResponse"] },
    "strategy": { "type": "exponential-backoff", "baseMs": 200, "factor": 1.8, "jitter": { "type": "equal", "ratio": 0.5 }, "maxAttempts": 2, "maxDelayMs": 3000 }
  }
]

6) lib/retry-executor.ts
- export async function executeWithRetry<T>(opName: string, attemptCtx: ErrorContextV1, fn: (attempt: number) => Promise<T>): Promise<T>
  - try/catch; on error: recordError(err, ctxWithAttempt); decideRetry(evt); if shouldRetry, await delay; respect budget guards; short-circuit if circuit open (reuse existing circuit breaker if present; else add a minimal in-module counter by fingerprint).
  - Ensure correlationId constant across attempts; increment ctx.attempt.
  - Emit runtime hook events (use onTaskStart/Complete if appropriate) minimally and without duplicating deliverables.
  - Idempotency: pass attempt number to caller; caller must be idempotent; document this contract.

7) lib/recovery-suggester.ts
- export function suggestRecoveries(evt: ErrorEventV1, aggregates: ErrorStatsV1, ctx?: ErrorContextV1): RecoverySuggestionV1[]
  - Heuristics:
    - Timeout/Network: increase timeout (up to policy ceiling), enable streaming, reduce batch size, backoff with jitter, alternate region.
    - RateLimit/QuotaExceeded: backoff schedule, spread requests, adjust concurrency caps, prefetch tokens.
    - MalformedResponse: enforce JSON schema in prompt, enable auto JSON repair step, reduce temperature, shorter max tokens.
    - Provider5xx: fallback provider/engine if configured, queue and replay later.
    - ContractViolation: validate before merge, tighten schema, add field-level hints.
  - Include doc refs (existing docs if any; else placeholders).

8) lib/error-metrics.ts
- export function incrementCounters(evt: ErrorEventV1): void
- export function getWindow(window: '5m' | '1h' | '24h'): ErrorAggregateV1
- Internal ring buffers per window; periodically flush to error-store.writeAggregates.

9) lib/error-hooks.ts
- Wrappers to instrument provider calls and critical sections.
- export function captureError(err: any, ctx?: ErrorContextV1): Promise<ErrorEventV1>
- export function wrapProviderCall<T>(name: string, ctx: Omit<ErrorContextV1,'operation'>, fn: () => Promise<T>): Promise<T>
  - Executes, catches, recordError; applies retry-executor with opName=name.

10) lib/error-dashboard-data.ts
- Aggregation helpers for UI.
- export async function getTopN(from: string, to: string, n: number): Promise<ErrorAggregateV1['topFingerprints']>
- export async function getHeatmap(window: '5m'|'1h'|'24h'): Promise<Array<{ ts: string; total: number; byCategory: Partial<Record<ErrorCategory, number>> }>>

===============================================================================
C) Integration Points
===============================================================================
1) Wire instrumentation around provider calls
- Identify the central abstraction used by 17 engines to call providers (e.g., lib/provider-*.ts or within chief-of-staff task execution). Without breaking existing signatures:
  - Wrap each external provider invocation site with error-hooks.wrapProviderCall('provider:<name>:<op>', ctx, () => originalCall()).
  - Include ctx: { engine, provider, route: 'engine:<engineName>', module: '<file>', operation: '<fnName>', taskId/subtaskId if available, tenant }.
  - Ensure only one layer of wrapping per callsite (no double-wrapping).

2) Chief of Staff integration
- In lib/chief-of-staff.ts, when executing subtasks/engines, replace direct calls with executeWithRetry where appropriate:
  - For transient classes only; do not change logic for non-transient failures besides recording.
  - Maintain existing autonomy budgets and enforcement. Abort if budget guards trip.

3) Runtime hooks
- In the existing runtime pipeline hooks, on exceptions, call error-tracker.recordError with full ctx (task/subtask/deliverable). Do not alter deliverable lifecycle semantics.

4) Bootstrapping
- In server bootstrap (server.js) or app init path: await initErrorStore(); schedule periodic aggregate flush (every 60s).
- Add health check contribution (see APIs).

===============================================================================
D) Server APIs — server.js (add routes, typed contracts, guards)
===============================================================================
All responses pass through http-response-guard and deep redaction. RBAC: operator or admin.

- GET /api/errors
  - Query: ErrorQueryV1 (via query params)
  - Response: { items: ErrorEventV1[]; cursor?: string }

- GET /api/errors/:id
  - Response: ErrorEventV1 | 404

- POST /api/errors/query
  - Body: ErrorQueryV1
  - Response: { items: ErrorEventV1[]; cursor?: string }

- POST /api/errors/ack
  - Body: { id: string; by: string; note?: string }
  - Response: { ok: true }

- POST /api/errors/snooze
  - Body: { id: string; until: string; by: string; reason?: string }
  - Response: { ok: true }

- POST /api/errors/replay
  - Body: { id?: string; fingerprint?: string; limit?: number }
  - Behavior: If id => locate event, if retryable by policy => schedule immediate retry of the associated subtask/work item. If fingerprint => replay up to N most recent instances that are retryable and not acknowledged/snoozed. Use existing task execution queue; ensure idempotency and respect budgets/RBAC.
  - Response: { scheduled: number, items: Array<{ id: string; correlationId?: string; attempt?: number; nextDelayMs?: number }> }

- GET /api/errors/stats
  - Response: ErrorStatsV1

- GET /api/errors/top
  - Query: from,to,n
  - Response: ErrorAggregateV1['topFingerprints']

- GET /api/errors/trends
  - Query: window=5m|1h|24h
  - Response: ErrorTrendPointV1[]

- GET /api/health/errors
  - Response: { ok: boolean; queueDepth: number; lastFlushAt?: string; eventsLogSize?: number }

All new routes must be registered in server.js with consistent naming, documented, RBAC-guarded, and respond within 200ms for cache hits.

===============================================================================
E) UI — 04-Dashboard/index.html, app.js, operator.js, style.css, operator.css
===============================================================================
Add a new "Errors" tab in Mission Control. No breaking existing UI.

1) Nav
- Add "Errors" to left navigation. Route: #/errors.

2) Errors Overview (route #/errors)
- KPIs header:
  - Error rate last 5m, 1h (per 100 tasks)
  - Top 3 categories chips with counts
  - Top 3 engines with mini-sparklines (use existing chart util if present; else simple inline SVG)
- Filters bar:
  - Time window: 5m, 1h, 24h
  - Category multi-select
  - Engine select
  - Route select
  - Severity select
  - Search (fingerprint/message substring)
  - Persist filters to localStorage key 'errors.filters.v1'
- Table:
  - Columns: Time (lastSeen), Category, Severity, Engine, Route, Message (normalized), Count (grouped by fingerprint), Actions
  - Row click opens detail drawer.

3) Detail Drawer
- Header: Category, Severity, Engine, Route, Last seen, Occurrences.
- Sections:
  - Suggestions (from recovery-suggester; render title + steps; confidence badge)
  - Last event sample (redacted details, ctx, provider info)
  - Retry policy applied (id, attempts, nextDelay if applicable)
  - Links: open task/deliverable
  - Controls:
    - Retry now (calls POST /api/errors/replay with id or fingerprint)
    - Acknowledge (POST /api/errors/ack)
    - Snooze (dropdown: 1h/4h/24h/custom => POST /api/errors/snooze)

4) Trends
- Inline trend chart for selected window from /api/errors/trends.

5) Empty State
- "All clear" illustration/text when no errors in selected window.

6) Accessibility and UX
- Keyboard accessible.
- Loading and error states for API calls.
- Do not block main thread; fetch in background; soft auto-refresh every 30s (configurable).

7) CSS
- New classes: .errors-kpi, .errors-table, .errors-drawer, .chip-category-<name>.
- Respect existing color tokens; severity colors: info=blue, warn=amber, error=red, critical=deep-red.

===============================================================================
F) Aggregates & Trends
===============================================================================
- Maintain rolling aggregates per window (5m,1h,24h). Update in-memory counters; flush to disk every 60s and on shutdown.
- Trend points: every minute, snapshot totals, keep last 24h points for 5m/1h windows, 14 days for 24h window (downsample if needed).

===============================================================================
G) Defaults, Config, and Migration
===============================================================================
- Create state/errors/ with files:
  - events.log (create if missing)
  - index.json (seed: { byId: {}, fingerprints: {} })
  - aggregates.json (seed empty stats object)
  - trends.json (seed empty array)
- Create state/config/retry-policies.json with defaults from B.5.
- If existing analytics or config loaders exist, register retry-policies load there.
- Add boot-time check and create files/dirs atomically.

===============================================================================
H) Recovery & Replay Wiring
===============================================================================
- Replay scheduling:
  - For an event tied to a subtask/task, call an existing queue/enqueuer to re-run that subtask with correlationId preserved and attempt incremented. If there’s no direct link, respond scheduled=0.
  - Prevent retry storms: cap concurrent retries via in-memory token bucket (e.g., 10 concurrent default; configurable).

- Suggestions:
  - Expose suggestions at GET /api/errors/:id by computing on the fly (no need to persist).
  - In UI, render actionable guidance; where possible deep-link to config docs.

===============================================================================
I) Health, Observability, and Webhooks
===============================================================================
- Health endpoint /api/health/errors returns queueDepth and lastFlushAt.
- Integrate with existing analytics: emit counters for error categories and retries.
- If webhooks system exists, optionally send a webhook on threshold breach:
  - Condition: error rate > X in last 5m or specific fingerprint spikes.
  - Non-blocking, sampled (max 1/min/fingerprint).

===============================================================================
J) Security, Privacy, Hardening
===============================================================================
- Redact:
  - Run all err.message/details through deep-redaction; strip secrets, emails, auth headers, tokens, payload fields marked sensitive.
- Size and sampling:
  - Truncate details >32KB; mark truncated.
  - If >50 errors/sec, sample to 20/sec globally while keeping aggregate counters accurate.
- Isolation:
  - Include tenant/project in ctx; ensure queries are scoped if multi-tenant views exist.
- Dedupe:
  - Fingerprint grouping window: 5 seconds for write dedupe; keep accurate counters.
- Circuit breaker:
  - On repeated transient failures for the same fingerprint: if consecutiveFailures >= policy.guard, open circuit for 60s; avoid retries; emit CircuitOpen event.
- Idempotency:
  - Retries must be safe; include attempt number and correlationId; callers responsible to make operations idempotent. Document this.

===============================================================================
K) Documentation
===============================================================================
Add:
- 04-Dashboard/docs/specs/error-events-contract.md
  - Event schema (ErrorEventV1), fingerprinting, categorization rules, retry policy format, API contracts, redaction rules, size limits.
- 04-Dashboard/docs/runbooks/error-tracking-runbook.md
  - How to use Errors UI, acknowledge/snooze, replay, configure retry policies, interpret trends, handle high error rate, known categories and playbooks.

Update:
- CHANGELOG.md with Part 87 summary.

===============================================================================
L) Acceptance Criteria
===============================================================================
Implement automated tests or scripted scenarios (consistent with repo’s acceptance style):

1) Timeout retry
- Inject a provider call that times out once then succeeds.
- Expect: categorize=Timeout, transient=true, 1 retry scheduled with delay ~300-600ms (jitter), success on attempt 2, 2 events recorded (1 original, 1 success not counted as error), UI shows 1 error with retry info.

2) 429 RateLimit
- Simulate HTTP 429 three times then success.
- Expect: category=RateLimit, 3 retries max per default policy, exponential delays, stop after success or max; aggregates reflect counts; circuit does not open.

3) MalformedResponse
- Simulate provider returning invalid JSON once, then valid; ensure category=MalformedResponse; at most 2 attempts; suggestions include "enforce JSON schema" and "enable JSON repair".

4) Provider5xx
- Simulate 502 twice then fail permanently.
- Expect retries attempted up to policy; final error recorded; replay via POST /api/errors/replay schedules another attempt; RBAC enforced.

5) Non-transient 4xx
- Simulate 400; ensure no retries; suggestions include "validate input" not "retry".

6) Trending & Top
- Generate controlled errors over 10 minutes; GET /api/errors/trends window=5m returns expected shape; GET /api/errors/top lists correct top fingerprints with counts.

7) Redaction & size limit
- Simulate error with tokens/emails; ensure response and stored event are redacted; details truncated at 32KB with marker.

8) Snooze & Ack
- POST /api/errors/ack and /api/errors/snooze; GET /api/errors shows updated flags; snoozed items excluded from replay-by-fingerprint.

9) Health endpoint
- GET /api/health/errors reports ok:true, queueDepth, lastFlushAt.

10) Performance budget
- Under synthetic load (200 RPS, 5% errors), CPU overhead <2% vs baseline; no event loss; NDJSON grows; aggregates flush per minute.

===============================================================================
M) Implementation Notes
===============================================================================
- IDs: Use existing ULID util if present; else create minimal ulid() using monotonic time; ensure sortable.
- Hash: Use existing crypto module in Node (createHash('sha256')).
- Time: Use ISO strings everywhere (new Date().toISOString()).
- Backoff jitter:
  - 'full': delay = base * factor^attempt; jitter = rand(0..delay); final = min(maxDelay, delay + jitter)
  - 'equal': jitter = delay * ratio; final = delay + rand(-jitter..+jitter)
- File IO:
  - Append NDJSON with fs.appendFile; queue writes; handle backpressure.
  - Use a simple in-process lock to update index/aggregate files atomically.
- Guards:
  - All new routes integrate with http-response-guard and RBAC (operator).
- No silent catches: every caught error is either recorded or intentionally ignored with a comment.
- Keep module boundaries clean; no circular deps.

===============================================================================
N) Commit Plan
===============================================================================
- Commit 1: Types + config + store scaffolding
- Commit 2: Categorizer + fingerprint + tracker
- Commit 3: Retry policy + executor
- Commit 4: Hooks integration at provider call sites + chief-of-staff touchpoints
- Commit 5: Server APIs + guards + health
- Commit 6: UI (Errors tab, table, drawer, actions)
- Commit 7: Recovery suggester + UI rendering
- Commit 8: Aggregates/trends periodic flush
- Commit 9: Docs (spec + runbook), CHANGELOG
- Commit 10: Acceptance scenarios + fault injection harness

Deliver only working, typed, enterprise-grade code and docs. Preserve all existing routes and behaviors. Guard everything. Redact everything sensitive. Additive, safe, and reversible.
```
