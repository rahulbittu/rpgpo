```
You are ChatGPT, the builder for RPGPO. Implement Part 71.

Part 71: End-to-End Workflow Orchestration + Autopilot Mode
Goal: Wire the full lifecycle (intake → deliberate → plan → schedule → execute → merge → validate → approve → release) into a unified, typed workflow orchestrator with:
- A durable workflow state machine and timeline
- Autopilot toggle (per-tenant, per-project, per-workflow) that auto-advances when governance allows
- Scheduler integration with approval gates and capacity/backpressure
- Automatic release triggering when deliverables are approved
- Full observability, evidence, and hardening aligned to Parts 65, 67-70

Repository baseline:
- Parts 19-70 complete, 100+ TS modules, ~839 API routes, ~485+ types, 224 tests
- Structured outputs pipeline (67), board/worker structured integration with retries (68)
- Observability (69), parallel execution engine with capacity semaphores and backpressure (70)
- Hooks available: onTaskStart/onSubtaskComplete/onTaskComplete (65)
- Deliverables lifecycle (62-66) and release orchestration (64) exist but are not auto-triggered

Constraints:
- Preserve all current working behavior
- Typed, contract-driven design (new types must be strict)
- Raw Node.js HTTP server, CommonJS TypeScript modules
- Route guards, mutation guards, deep redaction must remain 100% enforced
- JSON file state, deterministic IDs, idempotency
- Tenant and project isolation, privacy-first

High-level deliverables:
1) New core modules (04-Dashboard/app/lib/)
   - workflow-types.ts
   - workflow-orchestrator.ts
   - workflow-store.ts
   - autopilot-controller.ts
   - approval-gate-adapter.ts
   - scheduler-bridge.ts
   - release-trigger.ts
   - orchestrator-telemetry.ts
   - orchestrator-events.ts
   - feature-flags.ts (if not already present; otherwise extend existing)
2) Server routes (server.js) for workflow control and metrics
3) UI: Autopilot toggle + Workflow timeline view in Dashboard
4) Docs: ADR, contracts, runbook, failure modes, operator guide
5) Tests: 20+ new acceptance and unit tests
6) Evidence logging for each state transition and auto-release action

Detailed design:

A. Workflow State Machine (types, transitions, timeline)
- Define types in lib/workflow-types.ts (and re-export from lib/types.ts if project expects single import surface):
  - WorkflowId = string (deterministic ULIDs)
  - WorkflowStage:
    - intake_received
    - deliberation_planned
    - scheduled
    - executing
    - merging
    - validating
    - awaiting_approval
    - approved
    - release_candidate_prepared
    - released
    - paused
    - blocked
    - failed
    - cancelled
  - WorkflowTransitionTrigger:
    - intake_enqueued
    - deliberation_completed
    - plan_committed
    - tasks_scheduled
    - task_batch_started
    - task_batch_completed
    - merge_completed
    - validation_passed
    - gate_blocked
    - approval_granted
    - approval_rejected
    - release_candidate_assembled
    - release_promoted
    - pause_requested
    - resume_requested
    - cancel_requested
    - failure_detected
    - system_recover
  - AutopilotPolicy:
    - enabled: boolean
    - scope: 'tenant' | 'project' | 'workflow'
    - max_auto_promotions_per_day?: number
    - gates_allowed: string[] (gate ids allowed for auto-advance)
    - require_human_for: string[] (gate ids requiring manual approval)
    - budget_guardrails: { max_tokens_per_workflow?: number; max_cost_usd?: number; max_parallelism?: number }
  - GateStatus = 'open' | 'blocked' | 'escalated'
  - WorkflowInstance:
    - id: WorkflowId
    - tenantId: string
    - projectId: string
    - intakeRef: { intakeId: string; source: 'api' | 'ui' | 'file' }
    - state: WorkflowStage
    - autopilot: AutopilotPolicy
    - createdAt: string
    - updatedAt: string
    - retries: { count: number; lastAt?: string }
    - counters: { tasksScheduled: number; tasksCompleted: number; merges: number; validations: number; autoAdvances: number }
    - approvals: { gateId: string; status: GateStatus; decidedBy?: string; decidedAt?: string; reason?: string }[]
    - deliverableRefs: { id: string; version: string; contract: string }[]
    - releaseRef?: { candidateId?: string; releaseId?: string; status?: 'pending' | 'released' | 'failed' }
    - timeline: { at: string; from?: WorkflowStage; to: WorkflowStage; trigger: WorkflowTransitionTrigger; by: 'system' | 'operator' | 'autopilot'; evidenceId?: string; note?: string }[]
    - flags: { paused: boolean; blockedReason?: string; circuitOpen?: boolean }
    - idempotencyKeys: string[]
  - OrchestratorEvent union types for strong event handling:
    - WorkflowCreated, DeliberationCompleted, PlanCommitted, TasksScheduled, TaskBatchStarted, TaskBatchCompleted, MergeCompleted, ValidationPassed, GateBlocked, ApprovalGranted, ApprovalRejected, ReleaseCandidateAssembled, ReleasePromoted, PauseRequested, ResumeRequested, CancelRequested, FailureDetected, SystemRecover

- Transitions map in workflow-orchestrator.ts:
  - intake_received -> deliberation_planned (on deliberation_completed)
  - deliberation_planned -> scheduled (on plan_committed)
  - scheduled -> executing (on tasks_scheduled -> task_batch_started)
  - executing -> merging (on task_batch_completed)
  - merging -> validating (on merge_completed)
  - validating -> awaiting_approval (if gates present and any blocked/escalated)
  - validating -> approved (if no gates or all open)
  - awaiting_approval -> approved (on approval_granted)
  - awaiting_approval -> failed (on approval_rejected with policy require_human_for or explicit rejection)
  - approved -> release_candidate_prepared (auto assemble RC)
  - release_candidate_prepared -> released (on release_promoted)
  - Any -> paused (on pause_requested), paused -> previous pending stage (on resume_requested)
  - Any processing stage -> failed (on failure_detected, circuit breaks)
  - failed/blocked -> scheduled/executing via system_recover (idempotent resume)

- All transitions must:
  - Append timeline entry
  - Emit evidence (link to Evidence Hub) with redaction
  - Persist to workflow-store atomically
  - Be idempotent via idempotency keys

B. Persistence: workflow-store.ts
- Backed by state/workflows.json (append-only log + materialized view file if necessary)
- APIs:
  - create(instance: WorkflowInstance): WorkflowInstance
  - get(id: WorkflowId): WorkflowInstance | null
  - list(filter?: { tenantId?: string; projectId?: string; state?: WorkflowStage[] }): WorkflowInstance[]
  - update(instance: WorkflowInstance, options?: { idempotencyKey?: string }): WorkflowInstance
  - appendTimeline(id: WorkflowId, entry: TimelineEntry, evidence?: EvidencePayload): { instance: WorkflowInstance; evidenceId: string }
  - recoverDangling(): RecoveryReport // find in-flight instances and reconcile/resume
- Use deterministic ULIDs for ids
- Concurrency-safe: file lock with retry/backoff; verify no torn writes
- Enforce tenant/project isolation in queries

C. Orchestration core: workflow-orchestrator.ts
- Exports:
  - init(): Promise<void> // boot-time scan & reconcile (crash recovery)
  - createFromIntake(intakeId: string, options: { tenantId: string; projectId: string; autopilot?: Partial<AutopilotPolicy> }): Promise<WorkflowInstance>
  - handleEvent(event: OrchestratorEvent): Promise<void> // central event handler with state machine
  - advance(id: WorkflowId, reason: string, by: 'system' | 'operator' | 'autopilot'): Promise<void>
  - pause(id: WorkflowId, by: string, reason?: string): Promise<void>
  - resume(id: WorkflowId, by: string, reason?: string): Promise<void>
  - cancel(id: WorkflowId, by: string, reason?: string): Promise<void>
  - evaluateGates(id: WorkflowId): Promise<{ status: GateStatus; blocked: string[]; open: string[] }>
- Integrations:
  - deliberation.ts: invoke to produce plan aligned with structured contracts (67-68)
  - scheduler-bridge.ts: enqueue tasks DAG (70), honor provider semaphores
  - chief-of-staff/board worker hooks (65): map task/subtask events into OrchestratorEvents
  - deliverables merge/validate pipeline (61-66): on merges -> validation; on validation -> gates
  - approval-gate-adapter.ts: check/mutate gate state; subscribe to approval decisions
  - release-trigger.ts: assemble RC (64), promote when approved
  - orchestrator-telemetry.ts: record metrics
  - orchestrator-events.ts: evidence emission and notifications

D. Autopilot: autopilot-controller.ts and feature-flags.ts
- Read default flag from state/config/feature-flags.json: { autopilot: { defaultEnabled: false, maxAutoPromotionsPerDayDefault: 3 } }
- Compute effective policy by combining tenant → project → workflow override
- Enforce:
  - Only auto-advance when budgets/guardrails (enforcement engine) permit
  - Only auto-approve gates listed in gates_allowed; never auto-approve require_human_for
  - Respect daily caps and circuit breakers (integrate with 69)
- Expose:
  - getPolicyFor(workflowId): AutopilotPolicy
  - canAutoAdvance(workflowId, nextStage): boolean
  - recordAutoAdvance(workflowId, action): void

E. Scheduler Integration: scheduler-bridge.ts
- Bridge orchestrator to existing scheduler/parallel engine (70)
- API:
  - schedulePlan(workflowId, plan): Promise<{ tasks: number }>
  - holdForApproval(workflowId, gates: string[]): Promise<void>
  - requeueStalled(workflowId): Promise<void>
- Respect provider semaphores, priority, backpressure
- Ensure idempotent scheduling (no duplicate DAG nodes)

F. Approvals: approval-gate-adapter.ts
- Wrap existing approvals workspace to a uniform contract:
  - registerRequiredGates(workflowId, gates: GateDescriptor[]): Promise<void>
  - getGateStatuses(workflowId): Promise<{ [gateId: string]: GateStatus }>
  - onApprovalDecision(cb: (e: { workflowId; gateId; decision: 'approve' | 'reject'; by: string; at: string; reason?: string }) => void): unsubscribe
- When decisions land, emit OrchestratorEvent ApprovalGranted/ApprovalRejected

G. Release: release-trigger.ts
- When a workflow hits approved stage:
  - assembleReleaseCandidate(deliverableRefs)
  - lock, validate, and, if autopilot allowed and budgets permit, promote release
  - On success: transition to release_candidate_prepared then released
  - On failure: transition to failed with reason
- Record evidence and telemetry

H. Observability: orchestrator-telemetry.ts
- Metrics:
  - orchestrator.state_transition_count{from,to}
  - orchestrator.stage_duration_ms{stage}
  - orchestrator.backlog
  - orchestrator.error_rate
  - autopilot.enabled_workflows
  - autopilot.auto_advances
  - release.auto_triggers
  - release.failures
- EWMA per-provider integration (69) for stage durations
- Circuit breaker signals surfaced (open/half-open/closed)
- Emit alerts on:
  - Stuck stage > SLO
  - Excess failures > threshold
  - Auto-promotion cap exceeded

I. Evidence: orchestrator-events.ts
- For each transition and critical action:
  - createEvidence({ kind: 'workflow_event', workflowId, from, to, trigger, redactedPayload })
  - Ensure deep redaction on PII fields per deep-redaction.ts
  - Link to deliverable/release evidence chain

Server API routes (server.js), raw HTTP:
- All routes must include:
  - Tenant/project isolation checks
  - Route guards (inline via http-response-guard.ts)
  - Input validation, redaction of responses

1) POST /api/workflows
   - Body: { intakeId: string; tenantId: string; projectId: string; autopilot?: Partial<AutopilotPolicy> }
   - Returns: { workflow: WorkflowInstanceSummary }
2) GET /api/workflows?tenantId=&projectId=&state=
   - Returns: { workflows: WorkflowInstanceSummary[] }
3) GET /api/workflows/:id
   - Returns: { workflow: WorkflowInstance }
4) POST /api/workflows/:id/pause
   - Body: { reason?: string }
5) POST /api/workflows/:id/resume
6) POST /api/workflows/:id/cancel
   - Body: { reason?: string }
7) POST /api/workflows/:id/advance
   - Body: { reason?: string }
8) POST /api/workflows/:id/autopilot
   - Body: { enabled: boolean; gates_allowed?: string[]; require_human_for?: string[]; budget_guardrails?: {...} }
   - Returns: { autopilot: AutopilotPolicy }
9) GET /api/workflows/:id/timeline
   - Returns: { timeline: TimelineEntry[] }
10) GET /api/metrics/orchestrator
   - Returns: metrics snapshot, redacted

UI changes (04-Dashboard/app):
- Add Autopilot toggle:
  - Location: Workflow detail panel and project-level settings
  - Controls: On/Off, gates allowed, require human for, caps
  - Shows current policy and last auto-advances
- Add Workflow Timeline view:
  - Pipeline stages as a horizontal flow with current stage highlighted
  - Timeline list with evidence links
  - Actions: Pause, Resume, Cancel, Advance (if permitted)
  - Approval gates status chips with Approve/Reject (if operator has permission)
- Release auto-trigger status in Releases tab:
  - Shows if auto-promoted, by whom, evidence link

Docs:
- 04-Dashboard/docs/adr/ADR-0071-workflow-orchestrator-and-autopilot.md
  - Problem, decision, alternatives, consequences
- 04-Dashboard/docs/contracts/workflow-state-machine.md
  - Types, transitions, invariants, idempotency, evidence
- 04-Dashboard/docs/runbooks/workflow-orchestrator-runbook.md
  - Start/stop, recovery, drain, inspect, debug, SLOs
- 04-Dashboard/docs/operator-guides/autopilot.md
  - How to enable, guardrails, overrides
- 04-Dashboard/docs/security/workflow-privacy-and-redaction.md
  - Data handling, redaction fields, isolation

Acceptance criteria:
1) Creating a workflow from an intake item transitions to deliberation_planned with a timeline entry and evidence
2) Plan commit automatically schedules tasks via scheduler-bridge with provider capacity constraints observed
3) Execution events drive transitions to merging, then validating
4) If gates are required, orchestrator moves to awaiting_approval and scheduler pauses further execution
5) With autopilot disabled, the workflow waits until an operator approves; with autopilot enabled and gate in gates_allowed, orchestrator auto-approves and advances
6) On approval, orchestrator assembles a release candidate; on success, triggers promotion to released if autopilot permits; otherwise leaves as prepared
7) Orchestrator is crash-safe: after simulated crash, init() recovers in-flight workflows, requeues stalled tasks idempotently
8) Observability endpoints show non-zero transitions, durations, and alert on induced stuck conditions
9) Evidence chain includes workflow_event entries per transition, linked to deliverables and releases, with PII redacted
10) All new routes are guard-protected, inputs validated, outputs redacted, and respect tenant/project isolation
11) Backpressure: simulate provider capacity saturation; orchestrator delays scheduling and resumes when capacity frees
12) Circuit breaker: simulate repeated provider failures; orchestrator opens circuit, pauses appropriate workflows, and later half-opens per 69
13) Daily auto-promotion caps are enforced; exceeding cap prevents auto-release and surfaces alert
14) 20+ new tests pass; total tests increased accordingly; no regression in existing 224 tests

Testing:
- Add tests in 04-Dashboard/app/tests/:
  - workflow-orchestrator.spec.ts
  - workflow-store.spec.ts
  - autopilot-controller.spec.ts
  - scheduler-bridge.spec.ts (mocks for scheduler/engine)
  - approval-gate-adapter.spec.ts (mocks approvals UI/service)
  - release-trigger.spec.ts
  - orchestrator-recovery.spec.ts
  - orchestrator-telemetry.spec.ts
- Add 8 scenario acceptance tests to the mission suite to cover autopilot on/off, approvals, release auto-trigger, crash recovery, backpressure, circuit breaker, caps, isolation

Security and hardening:
- Enforce redaction rules for timeline, evidence, and API responses
- Validate autopilot config inputs; floor/ceil for caps and budgets
- Idempotency headers/keys for mutating routes; deduplicate transitions
- Lock state writes; safe concurrent updates; atomic timeline + state update
- Strict TypeScript with exhaustive switch on states/events
- Feature-flag Autopilot default OFF; ensure serial-mode fallback if parallel engine is feature-flagged OFF
- Respect autonomy budgets and enforcement engine; deny auto-advance if budget exceeded
- Ensure cross-project isolation: workflows cannot leak peer project identifiers in API/list responses

Implementation plan (ordered):
1) Add workflow-types.ts with all types and enums; export stable contracts
2) Implement workflow-store.ts with file-backed persistence, locking, idempotency
3) Implement orchestrator-events.ts for evidence logging and redaction mapping
4) Implement orchestrator-telemetry.ts with metrics counters and alert hooks
5) Implement autopilot-controller.ts and feature-flags.ts with policy evaluation
6) Implement scheduler-bridge.ts to existing scheduler/engine per Part 70
7) Implement approval-gate-adapter.ts integrating the approvals workspace
8) Implement release-trigger.ts integrating RC assembly and promotion per Part 64
9) Implement workflow-orchestrator.ts with init(), handleEvent(), state transitions, and gate evaluation
10) Wire event hooks: from board/worker/deliverables modules to orchestrator.handleEvent
11) Add server.js routes with guards, validators, and redaction
12) UI: add Autopilot toggle and Workflow timeline views
13) Docs: ADR, contracts, runbook, operator guide, security doc
14) Tests: units and acceptance; add fixtures and mocks
15) Manual validation on a sample intake: run through end-to-end both manual and autopilot modes

API payload contracts (types):
- Define request/response interfaces in workflow-types.ts for strong typing in server handlers
- Validate via existing input validation utilities; reject on unknown fields

Idempotency and recovery:
- Each transition appends a deterministic idempotency key (stage + nonce)
- init() scans workflows.json for in-progress states; for:
  - scheduled/executing older than timeout -> requeueStalled
  - merging/validating without corresponding evidence -> resume via handleEvent(SystemRecover)
  - awaiting_approval -> no-op (waiting)
- Poison pill detection: if the same stage fails 3 times sequentially -> open circuit, pause, alert

Observability and alerts wiring:
- Increment/observe metrics per transition; timing per stage using monotonic clock
- Integrate with Part 69 alert dispatcher

Acceptance data:
- Add seed sample in state/seeds/sample-intake.json and a corresponding end-to-end workflow test harness

What to change safely:
- Only extend types.ts by re-exporting workflow types or adding a narrow import surface; do not modify existing type contracts
- Only add routes; do not alter behavior of existing routes
- Wire hooks non-invasively; ensure they short-circuit if orchestrator is disabled via feature flag

Output expectations:
- One PR with commit history:
  - feat(orchestrator): add workflow types/store and core state machine
  - feat(orchestrator): add autopilot, approvals adapter, scheduler bridge
  - feat(orchestrator): add release trigger and evidence logging
  - feat(api): workflow routes with guards and validation
  - feat(ui): autopilot toggle and workflow timeline
  - docs: ADR-0071 and runbooks
  - test: add orchestrator suite and acceptance scenarios
- All tests green locally; lint/tsc clean; route guard coverage unchanged or improved

Runbook essentials (to include in docs and validate manually):
- Enabling Autopilot at tenant/project/workflow levels
- Pausing/resuming workflows
- Observing stuck workflows and triggering recovery
- Verifying auto-release and caps behavior
- Draining orchestrator for maintenance (no new schedules; finish in-flight)

Now implement Part 71 accordingly. Start by creating lib/workflow-types.ts and lib/workflow-store.ts, then proceed with orchestrator core and integrations. Keep changes tightly scoped, typed, and covered with tests. Preserve existing functionality.
```
