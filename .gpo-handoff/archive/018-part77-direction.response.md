```
You are implementing RPGPO Part 77: Smart Templates + Recurring Task Scheduler.

Constraints
- Do not break existing working functionality.
- CommonJS + TypeScript only. Raw Node.js HTTP server (no Express).
- Preserve privacy-first tenancy, route guards, mutation guards, deep redaction.
- Contract-driven, typed modules. Update lib/types.ts and route guards.
- Integrate with Part 75 Learning Store (EWMA), Part 76 SSE streaming, deliverable contracts (Parts 59-66), and Chief of Staff orchestration.
- Operator UI currently has 12 hardcoded templates in operator.js; retain as fallback until migration completes.
- State is JSON-file based under 04-Dashboard/state/.

Goal
- Dynamic template system with:
  - User-created templates (CRUD), sharing scope (private/tenant/global), versioning, tagging.
  - Template execution that resolves a prompt plan and invokes existing task pipeline.
  - Performance tracking per template: latency, cost, success/acceptance rate, operator quality score, EWMA of quality.
  - Learning integration: rank/suggest templates based on EWMA and scenario match.
  - Import/export templates (JSON).
- Recurring Task Scheduler:
  - Cron-like schedules (standard 5-field: minute hour dom month dow) with */N, ranges, lists, wildcard.
  - Timezone: 'UTC' or 'LOCAL' (no external tz deps).
  - Policies: misfire (skip|catchup), concurrency (skip if running), budgets.
  - Automatic execution creating real tasks through Chief of Staff with SSE streaming to UI.
  - Pause/resume/cancel, next-run computation, history and metrics.
- UI:
  - Templates panel (gallery + detail + create/edit modal).
  - "Run from template" and preview-resolved prompt.
  - Schedules panel with create wizard and upcoming runs.
  - Suggestions ranked by performance.
- Governance:
  - Route/mutation guards, audit entries, evidence links to deliverables, tenancy isolation.
  - Redaction for template fields and schedule parameters in all responses and logs.

High-level Plan
1) Types and Contracts
2) Stores and Services (templates, metrics, learning, scheduler)
3) API routes and guards
4) Chief of Staff integration for template execution
5) UI panels and flows
6) State persistence and migration from built-ins
7) Telemetry and learning updates
8) Docs, ADR, runbooks
9) Tests and acceptance suite
10) Hardening and rollout

1) Types (lib/types.ts)
Add the following interfaces and types. Keep names stable and exported. Reuse existing types where possible (TenantId, UserId, CostBreakdown, EvidenceLink, DeliverableId, ScenarioId, etc.).

- TemplateScope = 'private' | 'tenant' | 'global'
- TemplateId = string
- TemplateVersion = {
  version: number
  createdAt: string
  createdBy: UserId
  changeNote?: string
  enginePreset?: {
    provider: 'openai' | 'anthropic' | 'google' | 'perplexity' | 'system'
    model?: string
    temperature?: number
    maxTokens?: number
    topP?: number
  }
  deliverableContractId?: string
  promptBlocks: Array<{
    role: 'system' | 'user' | 'assistant'
    content: string
  }>
  inputSchema?: {
    // simple JSON-schema-lite. Support type: object, properties, required
    type: 'object'
    properties: Record<string, { type: 'string' | 'number' | 'boolean' | 'array' | 'object'; description?: string; enum?: string[] }>
    required?: string[]
  }
  defaults?: Record<string, any>
  tags?: string[]
}
- Template = {
  id: TemplateId
  name: string
  description?: string
  scope: TemplateScope
  owner: UserId
  tenantId: string
  createdAt: string
  updatedAt: string
  active: boolean
  current: TemplateVersion
  versions: TemplateVersion[]
  usageStats?: {
    totalRuns: number
    lastRunAt?: string
  }
  sharing?: {
    // if scope === 'tenant' or 'global', approvals may be required
    approvedBy?: UserId
    approvedAt?: string
  }
}
- TemplateExecutionRequest = {
  templateId: TemplateId
  version?: number
  params?: Record<string, any>
  projectId?: string
  scenarioId?: ScenarioId
  dryRun?: boolean
  runName?: string
}
- TemplateRunOutcome = {
  runId: string
  templateId: TemplateId
  startedAt: string
  completedAt?: string
  status: 'success' | 'failed' | 'cancelled'
  cost?: CostBreakdown
  latencyMs?: number
  deliverableId?: DeliverableId
  evidence?: EvidenceLink[]
  error?: { message: string; code?: string }
  quality?: { operatorScore?: number; acceptance?: 'accepted' | 'rejected' }
}
- TemplatePerformance = {
  templateId: TemplateId
  ewmaQuality: number // 0..1
  avgLatencyMs?: number
  avgCostPerRun?: number
  successRate?: number // last N
  acceptanceRate?: number
  lastUpdatedAt: string
  windowSize: number
  totalRuns: number
}
- CronSpec = string // "m h dom mon dow", support */N, ranges, lists, *
- SchedulePolicy = {
  misfire: 'skip' | 'catchup'
  concurrency: 'skip' | 'allow'
  budget?: { maxCostUSD?: number; maxRuntimeMs?: number }
}
- RecurringJobId = string
- RecurringJobStatus = 'active' | 'paused'
- RecurringJobHistoryItem = {
  runId: string
  startedAt: string
  completedAt?: string
  status: 'success' | 'failed' | 'skipped' | 'cancelled' | 'catchup'
  error?: { message: string; code?: string }
  costUSD?: number
  latencyMs?: number
  deliverableId?: DeliverableId
}
- RecurringJob = {
  id: RecurringJobId
  name: string
  templateId: TemplateId
  templateVersion?: number
  params?: Record<string, any>
  createdBy: UserId
  tenantId: string
  projectId?: string
  scenarioId?: ScenarioId
  scope: TemplateScope // governs visibility
  cron: CronSpec
  timezone: 'UTC' | 'LOCAL'
  policy: SchedulePolicy
  status: RecurringJobStatus
  nextRunAt?: string
  lastRunAt?: string
  history: RecurringJobHistoryItem[]
  createdAt: string
  updatedAt: string
}

Redaction additions (deep-redaction.ts integration):
- Register paths to redact/mask:
  - Template.current.defaults.secret*, Template.params.secret*, any field name containing 'apiKey'|'token'|'password' (mask)
  - RecurringJob.params with same rules
- Ensure http-response-guard.ts picks up these new schemas.

2) Modules (lib/)
Create new CommonJS TypeScript modules with explicit exported contracts:

- lib/template-store.ts
  - listTemplates(tenantId: string, scopeFilter?: TemplateScope | 'any', owner?: UserId): Promise<Template[]>
  - getTemplateById(id: TemplateId, tenantId: string): Promise<Template | null>
  - createTemplate(input: Omit<Template, 'id'|'createdAt'|'updatedAt'|'usageStats'|'versions'|'current'> & { initial: TemplateVersion }): Promise<Template>
  - updateTemplate(id: TemplateId, tenantId: string, patch: Partial<Template>): Promise<Template>
  - addTemplateVersion(id: TemplateId, tenantId: string, version: TemplateVersion): Promise<Template>
  - deleteTemplate(id: TemplateId, tenantId: string): Promise<{ ok: true }>
  - cloneTemplate(id: TemplateId, tenantId: string, newName: string, newScope?: TemplateScope): Promise<Template>
  - recordTemplateRunOutcome(outcome: TemplateRunOutcome, tenantId: string): Promise<void>
  - storage layout:
    state/templates/index.json
    state/templates/{templateId}.json

- lib/template-validation.ts
  - validateParamsAgainstSchema(schema: TemplateVersion['inputSchema'] | undefined, params: Record<string, any>): { valid: true } | { valid: false; errors: string[] }
  - validateTemplate(t: Partial<Template>): { valid: true } | { valid: false; errors: string[] }

- lib/template-resolver.ts
  - resolvePromptBlocks(t: TemplateVersion, params: Record<string, any>): { messages: { role: 'system'|'user'|'assistant'; content: string }[]; missing: string[] }
  - simple {{var}} replacement, with guard for missing values

- lib/template-metrics.ts
  - updateTemplatePerformance(templateId: TemplateId, tenantId: string, outcome: TemplateRunOutcome): Promise<TemplatePerformance>
  - getTemplatePerformance(templateId: TemplateId, tenantId: string): Promise<TemplatePerformance | null>
  - listTemplatePerformances(tenantId: string): Promise<TemplatePerformance[]>
  - persistence: state/metrics/templates.json (aggregate keyed by tenantId/templateId)

- lib/template-learning.ts (integrate with Part 75 learning store)
  - rankTemplatesForScenario(tenantId: string, scenarioId?: ScenarioId, tags?: string[]): Promise<TemplatePerformance[]>
  - updateEwma(templateId: TemplateId, tenantId: string, qualitySignal: number): Promise<void>
  - uses template-metrics.ts and learning store to maintain EWMA

- lib/template-runner.ts
  - executeTemplate(req: TemplateExecutionRequest, actor: UserId, tenantId: string): Promise<{ outcome: TemplateRunOutcome; dryRunPreview?: any }>
  - Path:
    - Fetch template + version
    - Validate params
    - Resolve prompt blocks
    - If dryRun: return preview of resolved messages and execution plan
    - Else: call Chief of Staff to create a task with deliverableContractId and resolved prompt, go through existing pipeline
    - Listen to runtime hooks to measure latency, cost, capture deliverableId
    - Record outcome to template-store and metrics, learning EWMA
    - Emit SSE event 'template:run' with status

- lib/cron.ts
  - parseCron(spec: CronSpec): { valid: true } | { valid: false; error: string }
  - nextRun(spec: CronSpec, from: Date, tz: 'UTC'|'LOCAL'): Date | null
  - supports *, */N, ranges (a-b), lists (a,b,c) for 5 fields
  - unit tests for parser and nextRun edge cases

- lib/schedule-store.ts
  - listJobs(tenantId: string): Promise<RecurringJob[]>
  - getJobById(id: RecurringJobId, tenantId: string): Promise<RecurringJob | null>
  - createJob(job: Omit<RecurringJob, 'id'|'createdAt'|'updatedAt'|'nextRunAt'|'history'|'status'> & { status?: RecurringJobStatus }): Promise<RecurringJob>
  - updateJob(id: RecurringJobId, tenantId: string, patch: Partial<RecurringJob>): Promise<RecurringJob>
  - deleteJob(id: RecurringJobId, tenantId: string): Promise<{ ok: true }>
  - appendHistory(id: RecurringJobId, tenantId: string, item: RecurringJobHistoryItem): Promise<void>
  - recalcNextRun(id: RecurringJobId, tenantId: string): Promise<Date | null>
  - storage layout:
    state/schedules/index.json
    state/schedules/{jobId}.json

- lib/scheduler-lock.ts
  - acquireSchedulerLease(nodeId: string, ttlMs: number): Promise<boolean>
  - renewSchedulerLease(nodeId: string, ttlMs: number): Promise<boolean>
  - releaseSchedulerLease(nodeId: string): Promise<void>
  - isLeaseOwner(nodeId: string): Promise<boolean>
  - storage: state/scheduler/lock.json with { ownerNodeId, acquiredAt, expiresAt }

- lib/scheduler.ts
  - start(options?: { nodeId?: string; tickMs?: number }): { stop: () => Promise<void> }
  - internal:
    - tick: every minute by default; if lease owner, scan due jobs for all tenants, schedule execution respecting concurrency/misfire policy
    - for each due job:
      - if policy.concurrency === 'skip' and a run is in-flight, record history 'skipped'
      - else invoke template-runner.executeTemplate with job params
      - handle misfire='catchup' by running once if missed run detected on restart (within a safety window)
      - update nextRunAt, lastRunAt, record history with status/cost/latency/deliverableId
      - emit SSE 'scheduler:run' events
    - ensure budget limits (policy.budget) are enforced before dispatch
  - expose administrative helpers:
    - triggerNow(jobId, tenantId): Promise<RecurringJobHistoryItem>
    - pause(jobId, tenantId): Promise<RecurringJob>
    - resume(jobId, tenantId): Promise<RecurringJob>

3) Server routes (server.js)
Add guarded routes. Wire through existing http-response-guard.ts and deep-redaction.ts. Namespacing under /api/.

Templates
- GET    /api/templates?scope=(private|tenant|global|any)&q=&tags=tag1,tag2  -> listTemplates
- GET    /api/templates/:id                                                 -> getTemplateById
- POST   /api/templates                                                     -> createTemplate
- PUT    /api/templates/:id                                                 -> updateTemplate
- DELETE /api/templates/:id                                                 -> deleteTemplate
- POST   /api/templates/:id/clone                                           -> cloneTemplate
- POST   /api/templates/:id/execute                                         -> executeTemplate (supports dryRun flag)
- POST   /api/templates/:id/score                                           -> record operator quality score 0..1, updates EWMA and metrics
- POST   /api/templates/import                                              -> import array of Template definitions (validate + assign new ids)
- GET    /api/templates/:id/metrics                                         -> getTemplatePerformance
- GET    /api/templates-suggest?s=SCENARIO_ID&tags=                         -> ranked suggestions via template-learning

Schedules
- GET    /api/schedules                                                     -> listJobs
- GET    /api/schedules/:id                                                 -> getJobById
- POST   /api/schedules                                                     -> createJob (validates cron and template existence)
- PUT    /api/schedules/:id                                                 -> updateJob (recalc nextRunAt)
- DELETE /api/schedules/:id                                                 -> deleteJob
- POST   /api/schedules/:id/trigger-now                                     -> triggerNow
- POST   /api/schedules/:id/pause                                           -> pause
- POST   /api/schedules/:id/resume                                          -> resume
- POST   /api/schedules/cron/preview                                        -> returns next 5 run times for given cron+tz

Route guards
- Enforce tenant isolation on all reads/writes, scope validation for visibility.
- Mutation guards on POST/PUT/DELETE.
- Redact params secrets in responses.
- Rate-limit execute/trigger-now to prevent abuse (reuse existing rate limiter if present).
- Emit audit events and evidence links.

SSE
- If SSE infra exists (Part 76), broadcast:
  - event: 'template:run' data: { runId, templateId, status, deliverableId?, latencyMs?, cost? }
  - event: 'scheduler:run' data: { jobId, runId, status, deliverableId?, latencyMs?, cost?, nextRunAt? }

Server bootstrap
- Import and start scheduler.start({ nodeId: process.pid.toString(), tickMs: 60_000 })
- Add health endpoint augmentation: include { scheduler: { leaseOwner: boolean, tickMs } }

4) Chief of Staff integration (lib/chief-of-staff.ts)
- Add function: fromTemplateExecution(req: { resolvedMessages: Array<{role:'system'|'user'|'assistant'; content: string}>, deliverableContractId?: string, projectId?: string, scenarioId?: ScenarioId, runName?: string }, actor: UserId, tenantId: string): Promise<{ deliverableId?: DeliverableId; cost?: CostBreakdown; latencyMs?: number; evidence?: EvidenceLink[] }>
- Internally map to existing create-task + pipeline execution, hooking into runtime pipeline (onTaskStart/onSubtaskComplete/onTaskComplete).
- Return metrics suitable for TemplateRunOutcome.

5) State and Migration
- New dirs/files:
  - state/templates/index.json
  - state/templates/{id}.json
  - state/metrics/templates.json
  - state/schedules/index.json
  - state/schedules/{id}.json
  - state/scheduler/lock.json
- Migration seed:
  - lib/migrations/m77-templates.ts
    - provide a function seedBuiltinTemplates(tenantId: string, owner: UserId) that creates Template entries for the 12 operator.js built-ins if template store is empty.
  - On server start, if templates index empty for tenant, call the seed to ensure continuity.
- Backward-compat UX:
  - operator.js continues to include embedded built-ins; UI merges API-loaded templates with built-ins if API returns empty; "Save as Template" button to persist a built-in.

6) UI (04-Dashboard/app/)
Changes limited to operator.js, index.html, operator.css, app.js as needed. Keep UI style consistent.

- Templates Panel
  - New left-nav item "Templates"
  - Gallery list with search box, tag filters, scope filter, sort by: 'suggested' (from /api/templates-suggest), 'recent', 'top quality', 'most used'
  - Cards show name, scope pill, tags, quality (EWMA as 0..100), success rate, avg latency, run button
  - Create Template button -> opens modal:
    - Fields: name, description, scope, tags, deliverableContractId (select), prompt editor (multi-block), input schema editor (JSON), defaults editor (JSON), engine preset dropdowns
    - Validate on save (client-side + server-side), show dry-run preview
  - Template detail page:
    - Metadata, versions list with diff notes, usage stats, metrics (sparklines optional), run history table
    - Actions: Edit, Clone, Delete, Export JSON, Execute (with params form auto-built from input schema), Dry-run preview
    - Score run quality: 1-5 stars -> converted to 0..1 and sent to /api/templates/:id/score

- Schedules Panel
  - New left-nav item "Schedules"
  - List of jobs: name, template ref, cron, tz, next run, status pill, last result
  - Create Job wizard:
    - Select template (with search/sort), choose version, set params (form), choose project/scenario, cron spec input with helper presets (Every day at 8am, Every Monday 9am, Every hour, Custom)
    - Timezone select: UTC or Local
    - Policy: misfire (skip/catchup), concurrency (skip/allow), budget limits
    - Preview next 5 runs via /api/schedules/cron/preview
  - Job detail:
    - Edit cron/spec/policy/params, pause/resume, trigger now, delete
    - History list with status and links to deliverables
  - Live updates via SSE 'scheduler:run' and 'template:run' to update UI in real-time

- Operator Home integration
  - "Suggested templates" strip powered by /api/templates-suggest
  - "Create schedule from template" quick action

7) Learning integration (Part 75)
- template-learning.ts updates EWMA on:
  - operator score posts
  - deliverable acceptance (hook into deliverable approval lifecycle to treat accepted=1, rejected=0 quality signal)
- rankTemplatesForScenario uses:
  - performance metrics (ewmaQuality primary, successRate fallback)
  - tag overlap with scenario tags (if available)
  - decay for stale templates
- UI uses /api/templates-suggest to pre-sort.

8) Docs
Add docs under 04-Dashboard/docs/:
- ADR-0077-smart-templates-scheduler.md
  - Context, decision, alternatives, cron limitations, timezone assumptions, misfire policy, concurrency policy
- templates.md
  - Authoring guide, schema reference, examples, versioning, sharing scopes and governance approvals
- scheduler.md
  - Operations runbook: start/stop, lease ownership, misfire behavior, budgets, troubleshooting
- api/templates-and-schedules.md
  - Route specs, request/response examples
- security/redaction-templates-schedules.md
  - Redaction rules, PII handling, auditability
- migration/77-builtin-templates.md
  - Seed and fallback behavior

9) Tests (04-Dashboard/tests/)
Add unit, integration, and acceptance cases. At least 24 tests.

Unit
- cron.spec.ts: parseCron and nextRun covering *, */N, ranges, lists, edge at 59->0 wrap
- template-validation.spec.ts: schema validation, required fields, type mismatches
- template-resolver.spec.ts: param substitution, missing vars detection
- scheduler-lock.spec.ts: lease acquire/renew/release, stale takeover

Integration
- template-store.spec.ts: CRUD, versioning, clone, delete
- template-runner.spec.ts: dry-run preview, happy-path execution (mock Chief of Staff), error path
- template-metrics.spec.ts: update metrics, EWMA updates, acceptance rate aggregation
- schedule-store.spec.ts: CRUD, recalc next run
- scheduler.spec.ts: due job detection, misfire skip/catchup, concurrency skip, budget enforcement, trigger-now

Acceptance (end-to-end)
- A77-01: Create template, dry-run, execute, see deliverable and metrics update
- A77-02: Clone template, edit version, run specific version
- A77-03: Import template JSON, export it back, fields preserved
- A77-04: Operator scores a run; EWMA increases; suggestion ranking updates
- A77-05: Create schedule every day 8am UTC, preview next 5, pause/resume, trigger now
- A77-06: Schedule with misfire=skip does not backfill after restart
- A77-07: Schedule with misfire=catchup runs once after missed window
- A77-08: Concurrency=skip prevents overlapping runs
- A77-09: Budget cap prevents run; history shows skipped with reason
- A77-10: Redaction masks 'apiKey' in template defaults and job params in API responses
- A77-11: Tenant isolation: user from tenant A cannot access tenant B templates/jobs
- A77-12: Suggestions show higher EWMA template first; tag-filtered scenario affects ranking
- A77-13: Route guards enforced on all new routes; mutation guards block invalid updates
- A77-14: SSE events arrive for template and scheduler runs; UI updates accordingly

10) Hardening
- Lease-based scheduler ownership with TTL (default 2 minutes), renewal every tick; recovery after crash with stale takeover threshold 2*TTL.
- Idempotent run dispatch: runId generation deterministic per trigger to avoid duplicate records on retries.
- Rate limit execute/trigger endpoints per user and per tenant (configure via existing middleware).
- Validate cron strictly; reject invalid specs with actionable error.
- Protect against template prompt injection via param sanitization; escape braces in prompt blocks when using substitution.
- Bounds on inputSchema size and template size; reject excessively large payloads.
- Ensure scheduler persists nextRunAt atomically with execution to prevent double-fire.
- Ensure deep-redaction masking is applied before logging/SSE.
- Budget enforcement ties into existing governance cost limits; abort before dispatch if projected costs exceed budget.
- Backpressure: limit number of concurrent scheduled dispatches per tick.

Acceptance Criteria (must all pass)
- Dynamic Template CRUD + versioning works with full tenancy isolation and guards.
- Template execution produces real deliverables via Chief of Staff; metrics and learning update.
- Template suggestions endpoint ranks by EWMA and context tags.
- Recurring scheduler runs jobs on schedule with correct policies and persistence across restart.
- UI surfaces templates and schedules with live updates and allows creating/editing/running both.
- Redaction and route protection applied to all new APIs.
- Migration leaves existing operator.js built-ins usable; when store is empty, seeding makes them available via API; no runtime regression.

Implementation Notes
- IDs: use existing deterministic ID generator (from Part 60) with namespaces: 'tpl_' for templates, 'tplv_' for versions, 'rjob_' for jobs, 'tplrun_' for template runs.
- Keep modules small and cohesive; no circular deps.
- Update server.js route map count and ensure middleware truth remains 100%.
- Update lib/index.ts (if present) to export new modules.
- Ensure types.ts additions do not break compilation; add regression type tests if present.
- Wire docs into docs index if applicable.

Deliverables
- New/updated TS modules per above
- Updated server.js with routes and scheduler bootstrap
- Updated UI files: operator.js, index.html, operator.css (and app.js if needed)
- New state/ JSON stores and seed migration
- Docs (5+ files)
- Tests (24+), all green
- Changelog entry: Part 77 implemented

Now implement Part 77 end-to-end.
```
