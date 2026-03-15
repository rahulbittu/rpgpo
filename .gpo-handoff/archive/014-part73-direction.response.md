```
You are ChatGPT implementing GPO/RPGPO Part 73.

Title: Part 73 — Mission Control Dashboard + Operator Notifications

Objective:
Build a unified, contract-driven Mission Control view that aggregates all critical system state (workflows, providers, scheduler, alerts, deliverables, approvals) into a single operator-facing panel with real-time polling. Add an in-app notification system with badge counts and toast notifications for actionable events. Preserve existing functionality, respect existing route guard and redaction policies, and adhere to typed, enterprise-grade contracts.

Constraints and context:
- Repo: 04-Dashboard/app is main application
- Server: raw Node.js HTTP (no Express), inline route guards + deep redaction are mandatory
- CommonJS TypeScript modules, compiled by tsc
- State: JSON files in state/
- Parts 67-72 delivered: structured output pipeline + worker integration; observability/metrics/cost/alerts; parallel DAG runner with work queue/backpressure; workflow orchestrator (14-stage state machine, autopilot, gates, release); TopRanker engine (contracts/templates)
- Current stats: 112+ TS modules, ~853 routes, ~510+ types, 270 tests passing
- No SSE/WebSockets; implement real-time via polling (with visibility-aware backoff)
- Multi-tenant/privacy-first, project isolation, route and mutation guards fully in effect

Deliverables:
1) New typed contracts in lib/types.ts for Mission Control and Notifications
2) Aggregation module: lib/mission-control.ts
3) Notification engine: lib/notifications.ts with state persisted in state/notifications.json (rolling window)
4) Server routes in server.js under /api/mission-control/* and /api/notifications/*
5) UI: index.html nav/tab, operator.js + app.js to render Mission Control, polling, badge counts, actionable toasts
6) Docs: architecture/contracts/runbook/ADR for Mission Control and Notifications
7) Tests: route contracts, guard/redaction, notification lifecycle, UI integration smoke tests
8) Acceptance scenarios added to the suite

Decision:
- Build a single-pass aggregator (read-only) that composes data from existing orchestrator, scheduler, provider governance, alerts, deliverables store, and approvals workspace with strict typed view models.
- Implement an in-app notification engine (persisted, queryable, ack/read) and emit notifications from existing hooks: onTaskStart/onSubtaskComplete/onTaskComplete, workflow state transitions, alert creation, provider circuit breaker transitions, approval requests, deliverables entering pending approval, release candidate ready.
- Use short-interval polling (default 5s) with page-visibility-aware backoff to 30s when hidden; no push transports.
- Keep module responsibilities narrow: aggregation/view models; notification lifecycle; server routing; UI rendering/interaction.

Required Modules and Files:

A) Types (lib/types.ts)
- Add the following interfaces and enums:

  export type MCHealth = 'green' | 'yellow' | 'red';

  export interface MissionControlSummary {
    timestamp: number; // epoch ms
    health: MCHealth;
    counts: {
      workflowsActive: number;
      workflowsStuck: number;
      pendingApprovals: number;
      openAlerts: number;
      recentDeliverables: number;
      providersDegraded: number;
      queueDepth: number;
      runningTasks: number;
    };
    notes?: string[];
  }

  export type WorkflowStage =
    | 'INIT'
    | 'PLANNING'
    | 'EXECUTION'
    | 'WAITING_APPROVAL'
    | 'APPROVED'
    | 'RELEASE_PREP'
    | 'RELEASING'
    | 'COMPLETE'
    | 'FAILED'
    | 'CANCELLED'
    | 'BLOCKED'
    | 'RETRYING'
    | 'ON_HOLD'
    | 'ROLLBACK';

  export interface WorkflowSummary {
    id: string;
    name: string;
    template?: string;
    state: WorkflowStage;
    startedAt: number;
    updatedAt: number;
    etaMs?: number;
    stuck: boolean;
    blockedReason?: string;
    progressPct?: number; // 0-100
  }

  export type ProviderCircuitState = 'closed' | 'open' | 'half_open';

  export interface ProviderStatus {
    id: string;          // provider key
    name: string;
    health: 'healthy' | 'degraded' | 'down';
    circuit: ProviderCircuitState;
    errorRate1m: number; // 0-1
    p95LatencyMs1m: number;
    cost1h: number;      // minor units
    lastErrorAt?: number;
    lastErrorMessage?: string; // redacted by server
  }

  export interface SchedulerState {
    queueDepth: number;
    runningTasks: number;
    capacity: number;
    backpressure: boolean;
    blockedCauses?: string[];
    dagRunners: Array<{
      id: string;
      running: number;
      capacity: number;
      blocked?: boolean;
    }>;
  }

  export type AlertSeverity = 'info' | 'warning' | 'error' | 'critical';

  export interface AlertSummary {
    id: string;
    severity: AlertSeverity;
    source: string;       // module or provider
    message: string;      // redaction applies
    createdAt: number;
    acknowledged: boolean;
  }

  export interface DeliverableSummary {
    id: string;
    contract: string;     // contract key
    title?: string;
    variant?: string;
    status: 'scaffold' | 'merged' | 'validated' | 'approved' | 'rejected' | 'released';
    createdAt: number;
    updatedAt: number;
    releaseCandidateId?: string;
  }

  export interface ApprovalItem {
    id: string;
    type: 'deliverable' | 'workflow' | 'release' | 'override';
    title: string;
    requestedBy: string;
    requestedAt: number;
    dueAt?: number;
    status: 'pending' | 'approved' | 'rejected';
    entityRef: { kind: string; id: string };
  }

  export type NotificationSeverity = 'low' | 'medium' | 'high' | 'urgent';

  export type NotificationType =
    | 'approval.requested'
    | 'alert.fired'
    | 'provider.circuit.open'
    | 'provider.circuit.closed'
    | 'workflow.stuck'
    | 'workflow.failed'
    | 'deliverable.pending-approval'
    | 'release.ready'
    | 'system.info';

  export interface NotificationAction {
    label: string;
    action: 'viewWorkflow' | 'viewApproval' | 'viewAlerts' | 'viewDeliverable' | 'viewRelease' | 'noop';
    ref?: { kind: string; id: string };
  }

  export interface Notification {
    id: string;
    type: NotificationType;
    severity: NotificationSeverity;
    title: string;
    message: string; // must be redaction-safe
    createdAt: number;
    readAt?: number;
    acknowledgedAt?: number;
    actions?: NotificationAction[];
  }

  export interface NotificationBadgeCounts {
    unread: number;
    unackedAlerts: number;
    pendingApprovals: number;
  }

  export interface MissionControlPayload {
    summary: MissionControlSummary;
    workflows: WorkflowSummary[];
    providers: ProviderStatus[];
    scheduler: SchedulerState;
    alerts: AlertSummary[];
    deliverables: DeliverableSummary[];
    approvals: ApprovalItem[];
    badgeCounts: NotificationBadgeCounts;
  }

- Ensure added enums/types reuse existing foundational types where available (e.g., reuse existing workflow stage enums if present). If duplicates exist, alias to canonical ones and deprecate the older via JSDoc.

B) Aggregator (lib/mission-control.ts)
- Create a new module responsible for:
  - Collecting and composing data for MissionControlPayload
  - Calculating health based on rules:
    - red if any critical alerts open OR providers down >=1 OR backpressure + queueDepth > capacity*2 OR workflowsStuck > 0 and >10% of active
    - yellow if warnings or degraded providers or queueDepth > capacity
    - green otherwise
  - Computing badge counts from notifications + approvals + alerts

- Exports:

  export function getMissionControlPayload(opts?: { limit?: { workflows?: number; deliverables?: number; alerts?: number } }): MissionControlPayload;

  export function getMissionControlSummary(): MissionControlSummary;

- Implementation notes:
  - Pull workflows from workflow orchestrator module (Part 71) via its listing API; map to WorkflowSummary.
  - Pull scheduler state from DAG runner/queue (Part 70).
  - Pull provider statuses from provider governance/observability (Part 69), including circuit breaker state.
  - Pull alerts from alert hub (Part 69); apply deep redaction on messages via deep-redaction.ts.
  - Pull deliverables from deliverable store (Parts 59-66) limited to last 20 by updatedAt.
  - Pull pending approvals from human approval workspace; map to ApprovalItem.
  - Pull badge counts from notifications module (below) and approvals module.
  - NEVER leak tenant/project cross-boundaries; respect current operator’s context if applicable.

C) Notifications (lib/notifications.ts)
- Create a dedicated module for in-app notifications.

- State:
  - Persist at state/notifications.json as an array with max 2000 entries (rolling).
  - On write, fsync-safe write via existing state writer utility; include a compact-and-trim function.

- Exports:

  export interface EmitNotificationInput {
    type: NotificationType;
    severity: NotificationSeverity;
    title: string;
    message: string; // pre-redacted
    actions?: NotificationAction[];
  }

  export function emitNotification(input: EmitNotificationInput, source?: { module: string; entityRef?: { kind: string; id: string } }): string; // returns id

  export function listNotifications(since?: number, limit?: number): Notification[];

  export function ackNotifications(ids: string[]): { acknowledged: string[] };

  export function markRead(ids: string[]): { read: string[] };

  export function getBadgeCounts(): NotificationBadgeCounts;

  export function bootstrapNotificationWiring(): void; // idempotent hook wiring

- Behavior:
  - ID scheme: `${createdAt}-${hash(type+title+message+(entityRef?.kind||'')+(entityRef?.id||'')}` using existing deterministic ID util from Part 60.
  - ack sets acknowledgedAt; markRead sets readAt; both are no-ops if already set.
  - getBadgeCounts computes:
    - unread = notifications readAt == undefined
    - unackedAlerts = alerts in alerts store with acknowledged == false and severity in ['error','critical']
    - pendingApprovals = approvals with status == 'pending'
  - bootstrapNotificationWiring subscribes/patches into:
    - Workflow orchestrator transition events: on entering BLOCKED-> workflow.stuck (high), FAILED-> workflow.failed (urgent)
    - Alert hub on alert creation: alert.fired (map severities; include link to viewAlerts)
    - Provider governance/circuit breaker: state changes open/closed
    - Deliverable lifecycle: on validated->pending approval emit deliverable.pending-approval
    - Release pipeline: on RC assembled and ready emit release.ready
    - Existing Part 65 hooks: onTaskStart/onTaskComplete can emit system.info low-severity to be tested (keep volume sampled to 1/100 if high rate)
  - All emitted messages must run through deep redaction before persist.

D) Server routing (server.js)
- Add the following guarded routes; integrate with existing router and http-response-guard:

  GET /api/mission-control/summary
    - Returns MissionControlSummary
    - Read-only; ensure project/tenant scope enforced
    - Apply deep redaction to strings

  GET /api/mission-control/full
    - Returns MissionControlPayload
    - Supports query params: ?w=20&d=20&a=20 to limit lists
    - Read-only; redaction applies

  GET /api/mission-control/workflows?status=active&limit=50
    - Returns WorkflowSummary[]; filters by status when provided

  GET /api/mission-control/providers
    - Returns ProviderStatus[]

  GET /api/mission-control/scheduler
    - Returns SchedulerState

  GET /api/mission-control/alerts?includeAck=false&limit=50
    - Returns AlertSummary[]

  GET /api/mission-control/deliverables?recent=20
    - Returns DeliverableSummary[]

  GET /api/mission-control/approvals?pending=1&limit=50
    - Returns ApprovalItem[]

  GET /api/notifications?since=<epochMs>&limit=50
    - Returns Notification[]; default since = now-24h; limit default 50

  POST /api/notifications/ack
    - Body: { ids: string[] }
    - Returns: { acknowledged: string[] }
    - Mutation guard required; audit entry via override/enforcement engine if applicable

  POST /api/notifications/mark-read
    - Body: { ids: string[] }
    - Returns: { read: string[] }
    - Mutation guard required

- Route guards:
  - Use existing inline guards; assign route keys and protection levels consistent with prior parts.
  - Ensure deep redaction is applied on all string fields.
  - Ensure CORS/middleware standards maintained.

E) UI (04-Dashboard/app/)
- index.html
  - Add a top-level nav item "Mission Control" with a badge bubble (data-bind) showing badgeCounts.unread + pendingApprovals + unackedAlerts collapsed appropriately.
  - Add a main panel container with id="mission-control-panel" hidden by default.
  - Add a toasts container <div id="toasts-container"></div> near body end.

- style.css
  - Add styles for mission control grid:
    - Header summary strip with health indicator (green/yellow/red dot)
    - Two-column responsive layout: Left: Workflows, Approvals; Right: Providers, Scheduler, Alerts, Deliverables
  - Toast styles: small card, shadow, severity color accents, dismiss button.

- app.js / operator.js
  - Implement MissionControlController with:
    - state: { payload: MissionControlPayload|null, lastPollAt: number, lastNotificationTs: number }
    - methods:
      - init(): wire tab click, start polling, visibility API backoff
      - poll(): fetch /api/mission-control/full and /api/notifications?since=lastNotificationTs
      - render(): render sections; virtual DOM or direct DOM update consistent with current codebase
      - updateBadgeCounts(): update nav badge from payload.badgeCounts
      - showToasts(notifications): render actionable toast cards; dedupe by id; auto-dismiss low after 8s, medium 12s, high stays until dismissed/ack
      - onToastAction(action): navigate to appropriate panel (e.g., approvals tab) and focus entity
      - ackAlertsFromToast(): POST /api/notifications/ack for selected ids
    - polling behavior:
      - interval 5000ms when document.visibilityState === 'visible'; else 30000ms
      - exponential backoff on network errors up to 60s; reset on success
    - persist lastNotificationTs in memory; initialize to Date.now() - 3600*1000

  - Rendering details:
    - Summary header: counts + health dot + timestamp "Updated Xs ago"
    - Workflows list: top N active; show state chip, progress bar if available, stuck badge if stuck
    - Providers table: name, health, circuit, errorRate, p95, cost1h; color by health/circuit
    - Scheduler: queue depth, running, capacity, backpressure, per-runner mini-bars
    - Alerts: list severities; provide "Acknowledge selected" button that calls /api/notifications/ack
    - Approvals: list pending with "Open" button navigates to existing approval workspace
    - Deliverables: recent list with status chips and link to deliverable details
    - All navigation should reuse existing router/linking conventions already in UI

- Accessibility:
  - Ensure focus states, aria-live for toast container (polite for low/medium, assertive for high/urgent)
  - Keyboard dismiss (Esc) for toast overlay if used

F) Wiring notifications
- In lib/notifications.ts bootstrapNotificationWiring(), integrate with:
  - Workflow orchestrator events bus: on state transitions => emit relevant notifications
  - Alert hub: on alert creation => emit alert.fired notifications
  - Provider governance/circuit breaker: on state changes => emit provider.circuit.*
  - Deliverables lifecycle: when item becomes 'validated' and requires approval => deliverable.pending-approval
  - Release pipeline: when RC becomes promotable => release.ready
- Idempotency: guard against duplicate emissions by coalescing duplicates within 60s window per (type, entityRef.id)
- Sampling: for high-frequency system.info, sample to 1%

G) Observability
- Emit metrics:
  - notifications.emitted.count{type, severity}
  - notifications.ack.count
  - notifications.read.count
  - mission_control.poll.count
  - mission_control.api.latency_ms{route}
- Log notable events with existing audit/observability facilities with category "mission_control" or "notifications"
- Track last compaction time for notifications store

H) Docs
- 04-Dashboard/docs/mission-control.md
  - Purpose, architecture diagram (textual), data sources, health computation rules, API contracts
- 04-Dashboard/docs/notifications.md
  - Notification lifecycle, emission points, persistence model, badge counts, redaction policy
- 04-Dashboard/docs/api/api-mission-control.md
  - Route list, request/response examples, types
- 04-Dashboard/docs/runbooks/mission-control-operations.md
  - How to troubleshoot red state, how to ack alerts, adjust polling, feature flags
- 04-Dashboard/docs/adr/ADR-00xx-mission-control-and-notifications.md
  - Decision to use polling, in-app notifications, rolling store, alternatives considered

I) Feature Flags and Config
- Add config in existing config module/state:
  - missionControl: { enabled: true, pollingMs: 5000, hiddenPollingMs: 30000, notificationStoreMax: 2000 }
- Ensure safe defaults if config missing

J) Tests
- Unit tests (lib):
  - mission-control aggregator computes health correctly (green/yellow/red thresholds)
  - notifications: emit/list/ack/markRead with rolling trim behavior and idempotency
  - redaction: ensure messages pass through deep redaction
- Server route tests:
  - Contracts: shape matches types; invalid params handled with 400
  - Guards: GET routes read-only; POST routes require mutation guard; audit entries created
- Integration tests:
  - Simulate alert firing => appears in /api/mission-control/alerts and /api/notifications
  - Simulate workflow stuck => notification emitted; badgeCounts update
  - Simulate deliverable pending approval => approvals list + notification
- UI tests (lightweight):
  - Controller polling cadence respects visibility
  - Badge count updates on new notifications
  - Toast rendering and action navigation stubs

K) Acceptance Criteria
- AC1: Mission Control tab displays unified summary with accurate counts and health within 5s of state change
- AC2: Providers panel reflects circuit breaker open within 5s and health changes color/code appropriately
- AC3: Scheduler panel shows queueDepth, runningTasks, capacity, and backpressure flag consistent with Part 70 state
- AC4: Workflows panel lists active workflows with stuck badges for BLOCKED or exceeding SLA thresholds
- AC5: Alerts panel lists open alerts; acknowledging via UI reduces unacked count and updates server state
- AC6: Approvals panel lists all pending approvals; clicking navigates to approval workspace
- AC7: Deliverables panel shows last 20 recent deliverables with correct status chips
- AC8: In-app notifications are emitted for alert fired, approval requested, workflow stuck, provider circuit open, deliverable pending approval, and release ready, with actionable toast items
- AC9: Nav badge aggregates unread notifications, unackedAlerts, pendingApprovals
- AC10: All API responses pass through deep redaction; no PII or secrets leak in messages
- AC11: Route guards enforced on all new routes; POST routes audited
- AC12: Polling backs off when tab hidden, recovers immediately on visibility change
- AC13: Notification store trims to <=2000 entries without data corruption; metrics emitted
- AC14: 25+ new tests pass; total test count increases; no regression in 270 existing tests

L) Hardening
- Enforce max limits on list queries (cap at 100)
- Timeouts on aggregator data sources; degrade gracefully with partial data and summary.notes entries
- Defensive JSON parsing and state file I/O with retry/atomic write
- De-dup notifications and avoid leaking internal error messages; always redact
- Ensure all dates are epoch ms; no timezone surprises in UI
- N+1 prevention: batch reads where possible; cache provider statuses for 2s if needed
- Treat unknown provider states as degraded
- Validate request bodies for POST routes strictly; reject invalid IDs with 400
- Avoid toast storms: collapse identical high-severity notifications into a single toast with a counter

Implementation Steps:

1) Types: Extend lib/types.ts with the new interfaces/enums (A). Add JSDoc and mark any deprecated duplicates.

2) Notifications module: Implement lib/notifications.ts (C). Include persistence utils, rolling trim, redaction, deterministic IDs, badge counts.

3) Aggregator: Implement lib/mission-control.ts (B). Integrate with orchestrator, scheduler, provider, alerts, deliverables, approvals. Add health computation and notes.

4) Wiring: Implement bootstrapNotificationWiring() calls from server startup (server.js) or a central init in Chief of Staff (lib/chief-of-staff.ts) ensuring idempotency.

5) Server routes: Add handlers in server.js (D). Wrap with existing http-response-guard/deep-redaction. Update route protection matrix. Add to mutation guards for POST routes and ensure audit.

6) UI:
   - Update index.html to add tab, panel, and toast container (E).
   - Implement MissionControlController in operator.js/app.js, consistent with existing conventions.
   - Add CSS styles.

7) Config: Add missionControl defaults to config/state, wire into polling intervals (I).

8) Observability: Add metrics counters/timers at emission points and API route timings (G).

9) Docs: Author the 4 docs (H).

10) Tests: Add unit, server route, and light UI tests (J).

11) Acceptance: Add 12-15 acceptance scenarios covering AC1-AC14; ensure suite passes.

API Contracts (examples):

- GET /api/mission-control/summary
  -> 200 { timestamp, health, counts: { workflowsActive, workflowsStuck, pendingApprovals, openAlerts, recentDeliverables, providersDegraded, queueDepth, runningTasks }, notes? }

- GET /api/mission-control/full?w=20&d=20&a=20
  -> 200 MissionControlPayload

- GET /api/notifications?since=1710000000000&limit=50
  -> 200 Notification[]

- POST /api/notifications/ack
  <- { ids: string[] }
  -> 200 { acknowledged: string[] }

- POST /api/notifications/mark-read
  <- { ids: string[] }
  -> 200 { read: string[] }

Guarding and Redaction:
- All new routes must call response guard with a specific route key, e.g., 'mission_control.summary', 'mission_control.full', 'notifications.list', etc.
- Messages and error strings must be passed through deep-redaction.ts prior to emit and before response serialization.
- Apply project/tenant scoping filters in aggregator and notifications listing if applicable.

Success criteria:
- Unified Mission Control is usable and becomes the primary operator surface to understand system state quickly.
- Operator receives timely, actionable notifications with minimal noise and can ack/read them.
- No regressions; all existing functionality preserved; route and mutation guards in place; privacy ensured.

Produce:
- Code for all modules, routes, and UI
- Docs (4 files)
- Tests (>=25 new)
- Update CHANGELOG with Part 73 summary

Now implement Part 73 exactly as specified.
```
