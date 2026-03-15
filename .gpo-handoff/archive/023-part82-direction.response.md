```
You are ChatGPT operating as the implementation agent for RPGPO Part 82.

Context
- Repo: /Users/rpgpo/Projects/RPGPO
- App: 04-Dashboard/app/ (raw Node.js HTTP server.js, TypeScript modules in lib/, JSON state in state/, UI in index.html/app.js/operator.js)
- Parts 19-81 complete. 140+ TS modules, ~950 API routes, ~660+ types.
- Existing: structured output pipeline, board/worker integration, observability, parallel execution, workflow orchestrator, TopRanker engine, Mission Control, acceptance harness, persistent learning, conversations, task chaining, smart templates, recurring scheduler, compound workflows, state backup, integration gateway, analytics dashboard.
- Governance: inline route guards, deep redaction, provider governance, artifact registry, evidence chain, audit hub, override ledger.
- Privacy-first: tenant/project isolation, secret governance.

Objective — Part 82: Self-Healing System + Onboarding Wizard
Build:
1) Automated health checks that run on startup and periodically.
2) Self-repair routines for common issues: stuck tasks, stale data, provider connectivity problems, scheduler/worker heartbeats, cache/index inconsistencies.
3) First-run onboarding wizard that guides setup of API keys (OpenAI/Anthropic/Gemini/Perplexity optional), mission statement, initial templates selection; validates connectivity; stores secrets via existing governance; persists state; can resume; is idempotent; never leaks secrets.

Constraints
- Preserve existing working functionality, types, contracts, route guards, deep-redaction.
- CommonJS modules, TypeScript strictly typed with new types in lib/types.ts.
- JSON state under state/ with transactional writes.
- Integrate with existing scheduler and observability.
- All new routes must use http-response-guard.ts and redaction.
- All repairs must emit evidence records, be dry-run capable, safe, idempotent, bounded, and respect isolation.
- Do not invent new secret storage; use existing provider governance/secret mechanisms.
- UI minimal but complete, accessible, mobile-friendly; no breaking of current operator UX.

Deliverables
- Code changes across server, lib, UI, and state schemas.
- New TS modules listed below with implementation.
- New HTTP routes + handlers with guards.
- New UI wizard (first-run modal + settings tab entry point).
- State files, migrations, and persistence utilities.
- Docs: runbooks, ADR, operator instructions.
- Acceptance tests added to existing harness.
- Logging, metrics, evidence emission, and redaction wired.

Implementation Plan

A) Types and Contracts (lib/types.ts)
Add strictly typed contracts. Append to existing sections; do not break exports. Namespaces or prefixed interfaces recommended.

- Health
  - type HealthSeverity = 'ok' | 'warn' | 'error'
  - interface HealthCheckId = string
  - interface HealthRepairId = string
  - interface HealthCheckContext { now: string; tenantId?: string; projectId?: string; runId: string; dryRun: boolean; source: 'startup'|'scheduled'|'manual'; }
  - interface HealthCheckResult { id: HealthCheckId; name: string; severity: HealthSeverity; ok: boolean; details: string; startedAt: string; endedAt: string; durationMs: number; items?: Array<{ id: string; label: string; meta?: Record<string, any> }>; suggestedRepair?: HealthRepairId; evidenceRef?: string; redactionApplied?: boolean; }
  - interface HealthRepairPlan { id: HealthRepairId; checkId: HealthCheckId; name: string; description: string; dryRunSupported: boolean; impact: 'low'|'medium'|'high'; steps: Array<{ step: string; description: string }>; safeguards: Array<string>; }
  - interface HealthRepairResult { id: HealthRepairId; ok: boolean; details: string; startedAt: string; endedAt: string; durationMs: number; changes?: Array<{ entity: string; entityId: string; action: 'noop'|'markFailed'|'requeue'|'clear'|'refresh'|'repair'|'rebuild'|'unlink'|'link'|'update'|'migrate'; before?: any; after?: any }>; evidenceRef?: string; redactionApplied?: boolean; }
  - interface HealthRunSummary { runId: string; startedAt: string; endedAt?: string; durationMs?: number; source: 'startup'|'scheduled'|'manual'; dryRun: boolean; overall: HealthSeverity; checks: HealthCheckResult[]; repairs?: HealthRepairResult[]; }

- Onboarding
  - type OnboardingStepId = 'welcome'|'api-keys'|'mission'|'templates'|'verify'|'complete'
  - interface OnboardingState { completed: boolean; currentStep: OnboardingStepId; startedAt: string; updatedAt: string; data: { mission?: string; providers?: { openai?: { configured: boolean }; anthropic?: { configured: boolean }; gemini?: { configured: boolean }; perplexity?: { configured: boolean } }; templates?: { selected: string[] } }; checklist: Array<{ id: string; label: string; done: boolean; at?: string }>; }
  - interface OnboardingStepPayload { step: OnboardingStepId; payload: any }
  - interface OnboardingStepResult { nextStep: OnboardingStepId; state: OnboardingState; messages?: string[] }

- Provider Connectivity
  - interface ProviderPingRequest { provider: 'openai'|'anthropic'|'gemini'|'perplexity'; modelHint?: string }
  - interface ProviderPingResult { provider: string; ok: boolean; latencyMs?: number; message?: string; errorCode?: string }

- Events/Evidence
  - interface EvidenceRecord { id: string; type: 'HEALTH_CHECK'|'HEALTH_REPAIR'|'ONBOARDING'; timestamp: string; actor: 'system'|'operator'|'scheduler'; summary: string; details?: any; links?: Array<{ type: string; id: string }>; redactionApplied?: boolean; }

B) State Files
Create new state area with safe defaults and transactional writes.

- state/health/health-state.json
  - {
      "lastRun": null,
      "lastStartupRun": null,
      "overall": "ok",
      "recentRuns": [] // capped ring buffer of last 25 runIds
    }

- state/health/health-history.jsonl
  - JSONL with HealthRunSummary per line; cap file size to 5MB with rollover to health-history-1.jsonl etc.

- state/health/repairs-ledger.jsonl
  - JSONL of HealthRepairResult records; cap 5MB with rollover.

- state/onboarding/state.json
  - {
      "completed": false,
      "currentStep": "welcome",
      "startedAt": "<iso>",
      "updatedAt": "<iso>",
      "data": { "mission": "", "providers": {}, "templates": { "selected": [] } },
      "checklist": []
    }

C) New Modules (lib/)
Create the following modules with CommonJS exports. Each module must be fully typed and documented in-code. All file paths relative to 04-Dashboard/app/lib.

1) lib/health/contracts.ts
- Re-export Health* interfaces/types from lib/types via import type and export.
- Export const HEALTH_CHECK_IDS and HEALTH_REPAIR_IDS enumerations:
  - 'provider-connectivity', 'stuck-tasks', 'stale-cache', 'worker-heartbeat', 'index-integrity'
  - Repairs: 'reconfigure-providers', 'recover-stuck-tasks', 'clear-stale-cache', 'restart-worker', 'rebuild-indexes'
- Export function buildRepairPlan(id: HealthRepairId): HealthRepairPlan

2) lib/health/persistence.ts
- readHealthState(): Promise<HealthStateLike>
- writeHealthState(p: Partial<HealthStateLike>): Promise<void>
- appendHealthHistory(run: HealthRunSummary): Promise<void>
- appendRepairLedger(repair: HealthRepairResult): Promise<void>
- getRecentRuns(limit: number): Promise<HealthRunSummary[]>
- Handle file locks, atomic writes, size caps, rollovers. No secret leakage.

3) lib/health/checks/provider-connectivity-check.ts
- run(ctx: HealthCheckContext): Promise<HealthCheckResult>
- Uses existing provider governance to list configured providers and perform a lightweight ping (model list or minimal completion) via integration gateway. Redact errors. Attach evidence via audit/evidence hub.

4) lib/health/checks/stuck-tasks-check.ts
- run(ctx): Promise<HealthCheckResult>
- Reads task state (existing state files) to find tasks in 'running' > 30 minutes (configurable), or 'queued' > 2 hours without progress. Suggest 'recover-stuck-tasks'. Do not mutate.

5) lib/health/checks/stale-cache-check.ts
- run(ctx): Promise<HealthCheckResult>
- Detect stale caches (model caches, template caches) older than TTL (e.g., 24h). Suggest 'clear-stale-cache'.

6) lib/health/checks/worker-heartbeat-check.ts
- run(ctx): Promise<HealthCheckResult>
- Verify worker heartbeat/last-seen from existing worker/board/mission control telemetry. Warn if > 2 min.

7) lib/health/checks/index-integrity-check.ts
- run(ctx): Promise<HealthCheckResult>
- Validate index files/artifact registries (deliverable store, lockfiles) against schemas; detect orphaned records; suggest 'rebuild-indexes'.

8) lib/health/repairs/recover-stuck-tasks.ts
- execute(ctx: HealthCheckContext, dryRun: boolean): Promise<HealthRepairResult>
- For each stuck task, mark failed with code 'STUCK_AUTO_RECOVERED' and evidence, or requeue if safe. Idempotent. Caps max 25 per run. No cross-tenant bleed.

9) lib/health/repairs/clear-stale-cache.ts
- execute(ctx, dryRun): Promise<HealthRepairResult>
- Purge caches safely; revalidate on next access. Emit changes list.

10) lib/health/repairs/reconfigure-providers.ts
- execute(ctx, dryRun): Promise<HealthRepairResult>
- NOP by default; emits guidance. If secrets are present but malformed, triggers refresh via provider governance APIs. Never logs secrets.

11) lib/health/repairs/restart-worker.ts
- execute(ctx, dryRun): Promise<HealthRepairResult>
- Signal worker orchestrator to restart/reload via existing runtime pipeline hooks. Safe no-op fallback.

12) lib/health/repairs/rebuild-indexes.ts
- execute(ctx, dryRun): Promise<HealthRepairResult>
- Rebuild in-memory and on-disk indexes for deliverables/artifacts with locking. Caps runtime.

13) lib/health/self-healing.ts
- runHealthChecks(ctx: HealthCheckContext): Promise<HealthRunSummary>
- applyRepair(repairId: HealthRepairId, ctx: HealthCheckContext, dryRun: boolean): Promise<HealthRepairResult>
- listRepairPlans(): HealthRepairPlan[]
- getDefaultSchedule(): { cron?: string; intervalMs: number; jitterPct: number }
- Orchestrates checks in order: provider-connectivity, worker-heartbeat, stuck-tasks, stale-cache, index-integrity.
- Emits evidence records via existing audit hub, updates persistence, returns summary.
- Summarization rule: overall = max severity across checks.

14) lib/onboarding/contracts.ts
- Export Onboarding* types from lib/types.
- Export const ONBOARDING_STEPS: OnboardingStepId[] = ['welcome','api-keys','mission','templates','verify','complete']
- Export interface OnboardingConfig { providerOptions: string[]; templateCatalog: Array<{ id: string; name: string; description: string }>; }

15) lib/onboarding/persistence.ts
- readOnboardingState(): Promise<OnboardingState>
- writeOnboardingState(mutator: (s: OnboardingState) => OnboardingState): Promise<OnboardingState>
- initIfAbsent(): Promise<OnboardingState>

16) lib/onboarding/wizard.ts
- getOnboardingConfig(): Promise<OnboardingConfig>
- submitStep(input: OnboardingStepPayload): Promise<OnboardingStepResult>
- applyApiKeys(payload: { openaiKey?: string; anthropicKey?: string; geminiKey?: string; perplexityKey?: string }): Promise<{ configured: string[] }>
  - Calls existing provider governance/secret registration functions; never persists raw keys in onboarding state; only marks configured flags.
- setMissionStatement(mission: string): Promise<void>
- selectTemplates(ids: string[]): Promise<void>
- verifyConnectivity(): Promise<{ results: ProviderPingResult[]; ok: boolean }>
- complete(): Promise<OnboardingState>
- Emits evidence events of type 'ONBOARDING'.

17) lib/onboarding/redaction.ts
- redactOnboardingState(state: OnboardingState): OnboardingState
- ensure no secrets present, masks any incidental values.

D) Server Routes (server.js)
Add routes with inline guards and redaction. Follow existing route patterns and use http-response-guard.ts.

Health routes:
- GET /api/health/status
  - Returns current health-state.json plus last run summary (redacted).
- GET /api/health/history?limit=25
  - Streams or returns array of recent HealthRunSummary (redacted).
- POST /api/health/run
  - Body: { dryRun?: boolean }
  - Triggers runHealthChecks({ source: 'manual'|'startup'|'scheduled' inferred, runId, now, dryRun })
  - Guarded: operator or system role only. Idempotent safe.
- POST /api/health/repair
  - Body: { repairId: HealthRepairId, dryRun?: boolean, reason?: string }
  - Applies repair. Emits evidence. Guarded.

Onboarding routes:
- GET /api/onboarding/state
  - Returns redacted OnboardingState. Cache-control: no-store.
- POST /api/onboarding/submit-step
  - Body: OnboardingStepPayload
  - Processes via wizard.submitStep, returns OnboardingStepResult.
- POST /api/onboarding/complete
  - Marks completed; future first-run modal suppressed.

Provider ping:
- GET /api/providers/ping?provider=openai&modelHint=gpt-4o
  - Returns ProviderPingResult; guarded, rate-limited.

Startup behavior:
- On server start, ensure onboarding state exists (initIfAbsent).
- If onboarding not completed, do not block app; UI will show wizard modal.
- Kick off a startup health run asynchronously with source='startup'.

Scheduler
- Register periodic health run (if scheduler already exists). Default: every 5 minutes, jitter 10%. Name: 'self-healing/health-run'. Avoid overlapping runs; if run in progress, skip.

E) UI Changes (04-Dashboard/app/)
- index.html
  - Add modal container div#onboarding-modal with wizard step content areas.
  - Add basic form inputs for API keys (password inputs), mission statement textarea, template checklist, verify step results table, and controls (Next, Back, Skip provider, Finish).
  - Ensure ARIA roles, accessible labels, keyboard navigation.

- style.css
  - Minimal styles for modal, steps, buttons, error/success badges. Reuse existing variables.

- app.js (or operator.js if that’s where dashboards live)
  - On load, fetch /api/onboarding/state. If completed=false, display modal wizard.
  - Implement step transitions, form validation, submit payloads to /api/onboarding/submit-step.
  - On 'api-keys' step, post keys to server; never log them; clear inputs after submission.
  - Verify step calls /api/providers/ping for configured providers and displays results.
  - Expose a Settings → Onboarding menu entry to re-open wizard if not completed.
  - Health status badge in header or Mission Control: fetch /api/health/status periodically; reflect overall severity with color; link to a panel showing last run with ability to trigger manual run/repair (operator only; button disabled if not authorized).

- operator.js
  - If operator console owns controls, add "Health" panel with latest checks, severity, and "Run now" / "Apply repair" actions issuing POSTs. Show dry-run first with diff summary, then confirm real run.

F) Integration Points
- Use existing provider governance/secret management to store API keys. If module names differ, implement an adapter in onboarding/wizard.ts that calls existing functions like registerProviderCredential(provider, key, meta) and policy enforcement.
- Use existing audit/evidence hub to write EvidenceRecord for checks/repairs/onboarding with linkage to runId and affected entities.
- Use existing logging and metrics to record health run durations, counts, and outcomes.
- Use deep-redaction.ts to mask fields in any responses and logs.

G) Observability and Redaction
- For all new API responses, apply deep redaction policies: strip any values matching key patterns: 'key', 'token', 'secret', 'apiKey', etc.
- Add per-field redaction masks in health summaries where provider names are shown but never include key material.
- Log only high-level statuses; detailed diffs go to evidence store with redaction flags.

H) Acceptance Tests (extend existing harness)
Add 12 new acceptance cases:

Health
1) Startup health run logs a HealthRunSummary and updates health-state.json.
2) Scheduled health run executes with jitter and does not overlap.
3) Provider connectivity check returns warn/error when provider misconfigured; ok when configured.
4) Stuck tasks detection flags tasks older than threshold; dry-run repair shows changes; real repair marks/requeues safely; idempotent on second run.
5) Stale cache detection and clear-stale-cache repair purges entries; reprime on next access.
6) Index integrity check detects orphan artifacts; rebuild-indexes produces consistent registry.

Onboarding
7) First-run shows wizard modal; /api/onboarding/state returns not completed.
8) Submitting API keys stores via provider governance and does not persist secrets in onboarding state; UI input clears after submit.
9) Setting mission and selecting templates persist and survive reload; redaction honored in API.
10) Verify step pings providers and shows results; failure messaging user-friendly.
11) Completing onboarding sets completed=true; subsequent reload hides wizard; manual entry point remains in Settings.
12) Provider ping endpoint rate-limited and guarded; returns structured result.

I) Security and Hardening
- Route guards: Enforce operator/system role on POST /api/health/* and provider ping; GET routes read-only with redaction.
- Rate limits: provider ping (per provider: max 5/min), manual health run (max 1/min), repairs (max 5/hour).
- Dry-run default true for manual repair unless explicitly confirmed.
- Bounded execution: cap checks to 5s each where possible; total run cap 20s; timeouts with graceful degradation.
- Concurrency control: one health run at a time; in-progress flag in state; fail-fast on overlap.
- File writes: atomic via writeFile to temp then rename; fsync; handle ENOENT by creating dirs.
- Evidence: every check/repair emits EvidenceRecord with redactionApplied=true when needed.
- Idempotency keys: use runId for run, repairId+entityId for changes to avoid duplicate actions.
- Isolation: include tenantId/projectId in ctx when relevant; do not cross-mutate.

J) Documentation (04-Dashboard/docs/)
- ADR-0XX-self-healing-and-onboarding.md — decision, tradeoffs, contracts.
- runbooks/self-healing.md — how checks work, schedules, manual triggers, reading history.
- runbooks/onboarding-wizard.md — steps, provider setup, troubleshooting, re-running.
- operator/health-panel.md — interpreting statuses, safe repair workflow.
- api/health.md and api/onboarding.md — routes, request/response contracts, examples.

K) Step-by-step Tasks
1) Add types in lib/types.ts; compile to ensure no breaks.
2) Implement lib/health/* contracts, checks, repairs, persistence, orchestrator.
3) Implement lib/onboarding/* contracts, persistence, wizard, redaction.
4) Wire server.js routes with guards, redaction, and scheduler registration; add startup run.
5) Implement UI wizard modal and health status panel/buttons; wire to APIs.
6) Implement persistence directories creation and file rollover logic.
7) Emit evidence in all relevant operations.
8) Add acceptance tests and update harness configuration.
9) Update docs with new features and contracts.
10) Manual QA: simulate misconfig providers, create stuck tasks, verify dry-run and real repairs, ensure no secrets in logs/state.

L) Code Quality
- 100% typed exports, no any leaks.
- Prefer pure functions for checks; side-effect-free except persistence/evidence.
- Unit-testable helpers where feasible.
- Keep modules <400 lines; split where necessary.
- Follow existing naming and import patterns.

M) What to Preserve
- Existing provider governance and secret storage flows.
- Route guard and redaction middleware wiring.
- Current operator UX not blocked by wizard; only overlaid until completion.
- Existing scheduler behaviors; just register new job.

Now implement Part 82 across the repository as specified. Produce a complete patch set (files added/modified), focusing on correctness, type-safety, and governance alignment. Include code for all modules, server route additions, UI changes, and docs, along with acceptance test additions.
```
