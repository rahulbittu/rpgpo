```
You are implementing GPO/RPGPO Part 91.

Title: Smart Suggestions Engine — Proactive next-task suggestions with "morning brief" and "evening wrap"

Context
- Baseline: Parts 19-90 complete. 162+ TS modules, ~1040 API routes, ~780+ types. Raw Node HTTP, CommonJS TS, JSON state, route guards, deep redaction, tenant/operator isolation, runtime hooks (onTaskStart/onSubtaskComplete/onTaskComplete), observability/logging exist.
- Requirement: Build a privacy-first, deterministic, contract-driven suggestions engine that analyzes operator patterns, recent task history, time of day, and current priorities to suggest next most valuable tasks. Include "morning brief" and "evening wrap" automated suggestions. No external APIs. Must be typed, modular, governed, and non-breaking.

Non-negotiables
- Preserve all existing functionality and contracts.
- Enterprise-grade: strong types, pure modules, versioned state, contract enforcement, guard all routes, deep redaction, per-tenant/operator isolation.
- Deterministic v1: heuristic scoring only (no LLM). Pluggable strategies for future versions.
- Feature-flagged under governance; safe defaults enabled; never auto-mutate tasks unless operator accepts a suggestion.
- Idempotent generation per window/operator; TTL + cleanup; dedupe across generations.

Deliverables (single PR)
- New TS modules under lib/suggestions/*
- Types added to lib/types.ts (scoped; no breaking changes)
- Server routes (raw Node) with http-response-guard, deep-redaction
- State files + migrations
- UI surfaces (index.html, app.js, operator.js, style.css/operator.css) minimal, accessible
- Docs: ADR, API, Runbook, Privacy/Governance
- Acceptance cases (12+) wired to existing suite
- Observability/metrics; traceability; evidence entries

1) Types — add to lib/types.ts (append-only)
- export type SuggestionId = string;
- export type SuggestionKind =
  | 'next-task'
  | 'follow-up'
  | 'unblock'
  | 'due-soon'
  | 'quick-win'
  | 'maintenance'
  | 'morning-brief'
  | 'evening-wrap';
- export type SuggestionWindow = 'morning' | 'evening' | 'realtime';
- export type SuggestionPriority = 'low' | 'medium' | 'high';
- export interface SuggestionAction {
    type: 'create-task' | 'open-view' | 'start-workflow';
    payload?: Record<string, any>;
  }
- export interface SuggestionSourceSignal {
    type:
      | 'recency'
      | 'frequency'
      | 'due-date'
      | 'staleness'
      | 'blocked'
      | 'owner-focus'
      | 'quick-win'
      | 'priority'
      | 'time-of-day'
      | 'carry-over';
    weight: number; // 0-1 normalized
    value: number;  // raw value in strategy space
    note?: string;
  }
- export interface Suggestion {
    id: SuggestionId;
    tenantId: string;
    operatorId: string;
    kind: SuggestionKind;
    window: SuggestionWindow;
    title: string;            // redacted-safe
    description?: string;     // redacted-safe
    actions: SuggestionAction[];
    score: number;            // 0-100
    confidence: number;       // 0-1
    priority: SuggestionPriority;
    tags?: string[];
    sources: SuggestionSourceSignal[];
    status: 'new' | 'viewed' | 'accepted' | 'ignored' | 'snoozed' | 'expired';
    dedupeKey: string;
    createdAt: string;        // ISO
    expiresAt?: string;       // ISO
    ttlMinutes?: number;
    meta?: Record<string, any>; // only non-sensitive meta
  }
- export interface SuggestionSettings {
    version: 1;
    enabled: boolean;
    windows: {
      morning: { startHour: number; endHour: number };
      evening: { startHour: number; endHour: number };
    };
    limits: { perWindow: number; perRealtime: number };
    weights: {
      recency: number;
      frequency: number;
      dueDate: number;
      staleness: number;
      blocked: number;
      ownerFocus: number;
      quickWin: number;
      priority: number;
      carryOver: number;
      timeOfDay: number;
    };
    quickWinThresholdMins: number; // <= this estimated minutes
    timezone?: string; // IANA TZ for operator
    strategy?: 'v1-baseline';
  }
- export interface OperatorPatternProfile {
    operatorId: string;
    tenantId: string;
    localHourBucket: 'early'|'morning'|'midday'|'afternoon'|'evening'|'late';
    recentActiveDays: number;
    avgSessionMinutes: number;
    lastActiveAt?: string;
    preferredKinds?: SuggestionKind[];
    dePreferKinds?: SuggestionKind[];
  }
- export interface TaskHistorySummary {
    operatorId: string;
    fromISO: string;
    toISO: string;
    totalCompleted: number;
    totalStarted: number;
    totalOverdue: number;
    blockedCount: number;
    dueSoonCount: number;
    quickWinsCompleted: number;
    carryOverCandidates: Array<{
      taskId: string;
      title: string;
      estMinutes?: number;
      priority?: SuggestionPriority;
      dueAt?: string;
      blocked?: boolean;
      lastUpdatedAt?: string;
    }>;
  }
- export interface SuggestionMetrics {
    version: 1;
    generated: number;
    shown: number;
    accepted: number;
    ignored: number;
    snoozed: number;
    expired: number;
    ctr: number; // accepted/shown
    windowBreakdown: Record<SuggestionWindow, { generated: number; accepted: number }>;
    kindBreakdown: Record<SuggestionKind, { generated: number; accepted: number }>;
    lastGeneratedAt?: string;
  }

2) State — new files and conventions
- Directory: state/suggestions/
  - index.json                // { version, lastCleanupAt }
  - by-operator/{operatorId}.json // array<Suggestion> (only for that operator+tenant)
  - settings/{operatorId}.json    // SuggestionSettings
  - metrics/{operatorId}.json     // SuggestionMetrics
- Migration: lib/suggestions/migrations.ts
  - export function ensureSuggestionState(): void
  - Creates folders/files if missing with sane defaults.
  - SuggestionSettings default:
    {
      version: 1,
      enabled: true,
      windows: { morning: { startHour: 7, endHour: 10 }, evening: { startHour: 17, endHour: 20 } },
      limits: { perWindow: 5, perRealtime: 3 },
      weights: { recency:0.15, frequency:0.1, dueDate:0.2, staleness:0.1, blocked:0.15, ownerFocus:0.1, quickWin:0.05, priority:0.1, carryOver:0.03, timeOfDay:0.02 },
      quickWinThresholdMins: 20
    }
  - Wire ensureSuggestionState into server startup without blocking.

3) Modules — add under lib/suggestions/
- contracts.ts
  - export function normalizeSuggestion(s: Partial<Suggestion>, tenantId: string, operatorId: string): Suggestion
  - export function computeDedupeKey(s: Omit<Suggestion,'dedupeKey'>): string // stable hash of kind+title+window+day
  - export function isSuggestionExpired(s: Suggestion, nowISO?: string): boolean
  - export function clampScore(n: number): number
  - export function sanitizeSuggestionForUI(s: Suggestion): Suggestion // deep redaction wrapper
- store.ts
  - export function loadOperatorSuggestions(tenantId: string, operatorId: string): Suggestion[]
  - export function saveOperatorSuggestions(tenantId: string, operatorId: string, items: Suggestion[]): void
  - export function appendSuggestions(tenantId: string, operatorId: string, items: Suggestion[], dedupe: boolean): { added: number; skipped: number }
  - export function markStatus(tenantId: string, operatorId: string, id: SuggestionId, status: Suggestion['status']): Suggestion | null
  - export function expireOld(nowISO?: string): number // returns count expired
- signals.ts
  - export interface SignalContext { tenantId: string; operatorId: string; now: Date; settings: SuggestionSettings; }
  - export async function getOperatorPatternProfile(ctx: SignalContext): Promise<OperatorPatternProfile>
  - export async function getTaskHistorySummary(ctx: SignalContext, lookbackDays: number): Promise<TaskHistorySummary>
    Notes:
    - Reuse existing Chief of Staff/statistics/task modules. If not present, read state files used by current task runtime (do not change their format).
    - No PII beyond titles allowed in Suggestion; if titles contain sensitive info, pass through deep redaction and mask via existing deep-redaction.ts rules.
- score-strategies.ts
  - export type StrategyId = 'v1-baseline'
  - export interface StrategyInput {
      profile: OperatorPatternProfile;
      summary: TaskHistorySummary;
      settings: SuggestionSettings;
      now: Date;
    }
  - export interface Strategy {
      id: StrategyId;
      generate(input: StrategyInput): Suggestion[];
    }
  - export function baselineStrategy(): Strategy
    Implementation details:
    - Construct candidates for:
      - due-soon: tasks due within next 48h, prioritize high-priority
      - unblock: tasks blocked > 24h
      - follow-up: tasks completed in last 48h with obvious follow-up (use tag/relationship if available; else skip)
      - quick-win: tasks with estMinutes <= settings.quickWinThresholdMins
      - carry-over: tasks started before today and not completed
    - Score = weighted sum of normalized signals per settings.weights
    - Confidence derives from dispersion of scores and available signals count
    - Attach actions:
      - create-task suggestions only for meta-tasks (e.g., "Plan today's top 3")
      - for existing items, action open-view with a payload to deep-link to task id
    - Ensure clampScore(0..100), confidence 0..1
- engine.ts
  - export interface SuggestionEngine {
      generateForWindow(tenantId: string, operatorId: string, window: SuggestionWindow, now?: Date): Promise<{ added: number; skipped: number; generated: number }>
      generateRealtime(tenantId: string, operatorId: string, reason?: string, now?: Date): Promise<{ added: number; skipped: number; generated: number }>
    }
  - export function createSuggestionEngine(): SuggestionEngine
    Implementation:
    - Load settings; if disabled, no-op.
    - Compute profile+summary via signals.ts.
    - Use score-strategies baseline.
    - Normalize, dedupe, TTL (default 6h window), apply perWindow/perRealtime caps.
    - Append to store with dedupe.
    - Update metrics.
- scheduler.ts
  - export function startSuggestionScheduler(): { stop(): void }
    Implementation:
    - In-process setInterval every 5 min with jitter.
    - For each active operator (reuse existing operator/tenant registry), check local time window using settings.timezone (fallback to system).
    - Generate for morning between startHour..endHour once/day/operator (idempotent via by-operator lastGenerated marker in metrics).
    - Generate for evening similarly.
    - Do not block main loop; catch/log errors.
- actions.ts
  - export async function acceptSuggestion(tenantId: string, operatorId: string, suggestionId: string): Promise<{ ok: boolean; createdTaskId?: string; updated?: Suggestion }>
    Behavior:
    - Load suggestion, mark viewed->accepted, create a task if action requires via existing task creation API (Chief of Staff).
    - Tag created tasks with "suggested", "window:<window>", "kind:<kind>".
  - export function ignoreSuggestion(...): Promise<Suggestion | null>
  - export function snoozeSuggestion(..., untilISO: string): Promise<Suggestion | null>
- metrics.ts
  - export function recordMetric(tenantId: string, operatorId: string, f: (m: SuggestionMetrics) => void): SuggestionMetrics
  - export function getMetrics(tenantId: string, operatorId: string): SuggestionMetrics

4) Server integration — server.js
- On startup:
  - import { ensureSuggestionState } from './lib/suggestions/migrations';
  - import { startSuggestionScheduler } from './lib/suggestions/scheduler';
  - ensureSuggestionState();
  - const suggestionScheduler = startSuggestionScheduler();
  - On graceful shutdown, call suggestionScheduler.stop().
- Routes (prefix: /api/v1/suggestions). Use existing guard and redaction:
  - GET /api/v1/suggestions?operatorId=...&window=active
    - AuthZ: operator-same-tenant only.
    - Returns non-expired suggestions for operator; apply sanitizeSuggestionForUI; wrap with http-response-guard.
  - POST /api/v1/suggestions/generate
    - Body: { operatorId: string; window?: 'morning'|'evening'|'realtime' }
    - AuthZ: operator self or admin. Rate-limited (reuse middleware truth).
    - Triggers on-demand generation; returns { added, skipped, generated }.
  - POST /api/v1/suggestions/:id/accept
    - AuthZ: operator self.
    - Calls actions.acceptSuggestion; returns updated suggestion + optional createdTaskId.
  - POST /api/v1/suggestions/:id/ignore
    - AuthZ: operator self.
    - Calls actions.ignoreSuggestion; returns updated suggestion.
  - POST /api/v1/suggestions/:id/snooze
    - Body: { untilISO: string }
    - AuthZ: operator self.
    - Calls actions.snoozeSuggestion; returns updated suggestion.
  - GET /api/v1/suggestions/settings?operatorId=...
    - AuthZ: operator self.
    - Returns SuggestionSettings (sanitized).
  - POST /api/v1/suggestions/settings
    - AuthZ: operator self.
    - Validates against SuggestionSettings; persist; returns updated.
- All responses pass through deep-redaction and the existing http-response-guard. No sensitive internals in meta.

5) Chief of Staff/runtime hooks
- lib/chief-of-staff.ts: minimally wire a call to engine.generateRealtime on onTaskComplete and onTaskStart for the same operator to keep suggestions fresh (non-blocking, fire-and-forget). Respect settings.limits.perRealtime and dedupe.

6) UI — index.html, app.js, operator.js, style.css/operator.css
- Add "Suggestions" panel on the main dashboard:
  - Container #suggestions-panel with:
    - Section header with badge count.
    - List of suggestion cards: title, kind badge, window, score, optional description, actions (Accept, Ignore, Snooze), and "Open" for open-view actions.
    - "Generate now" dev button (visible only if window.debug === true; reuse existing debug flag).
  - Morning Brief banner:
    - If current time within window and there are "morning-brief" suggestions, show consolidated header with CTA to view cards.
  - Evening Wrap banner similarly.
- operator.js:
  - Fetch GET /api/v1/suggestions on load and every 5 minutes.
  - Wire button handlers to POST accept/ignore/snooze with optimistic UI update.
  - Handle error toasts via existing notification system.
- style.css/operator.css: Minimal, reuse existing tokens/classes; ensure accessible contrast.
- Do not break existing layouts; panel collapsible and off by default on narrow widths.

7) Governance & Privacy
- Add feature flag: tenant.settings.features.suggestions.enabled (reuse or mirror into SuggestionSettings.enabled). Default true.
- PII/Secrets: route all suggestion text through deep-redaction; never include raw task content fields flagged sensitive by existing redaction rules.
- Isolation: suggestions are always per (tenantId, operatorId); enforce in store paths and route checks.
- Budgets: suggestions generation is CPU-only and low-cost; add to cost ledger with "local:compute:suggestions" event with estimated microcost 0 for transparency.

8) Observability
- Append to existing telemetry:
  - Log events: suggestions.generated, suggestions.shown, suggestions.accepted, suggestions.ignored, suggestions.snoozed, suggestions.expired with tenantId/operatorId/window/kind/score.
  - Persist counters in metrics/{operatorId}.json (SuggestionMetrics).
  - Expose GET /api/v1/suggestions/metrics?operatorId=... (operator self) returning SuggestionMetrics.

9) Docs (04-Dashboard/docs/)
- ADR-0091-smart-suggestions.md
  - Problem, constraints, design, scoring model, windows, idempotency, dedupe, privacy, alternatives.
- API-091-suggestions.md
  - Route contracts, request/response examples, error codes, guards.
- RUNBOOK-091-suggestions.md
  - How to enable/disable, generate on-demand, interpret metrics, debug flags, state paths.
- GOVERNANCE-091-suggestions-privacy.md
  - Data handled, redaction, retention, TTL, operator control.

10) Acceptance Criteria (add 12+ cases; reference as Part 91)
- AC91.1: Default settings created; scheduler starts; no crashes on startup.
- AC91.2: GET suggestions returns 0 when none; after POST generate (morning) returns <= perWindow suggestions.
- AC91.3: Dedupe works: repeated generate within same window adds 0 new items.
- AC91.4: Accept suggestion with create-task action creates a task tagged suggested/window/kind; suggestion status -> accepted.
- AC91.5: Ignore suggestion sets status -> ignored; not returned in next fetch (unless explicitly requested via status=all, optional).
- AC91.6: Snooze suggestion hides until after untilISO.
- AC91.7: Expiration: suggestions older than TTL are marked expired and excluded; expireOld returns count > 0.
- AC91.8: Route guards enforce operator-only access; cross-tenant/operator access denied.
- AC91.9: Deep redaction removes sensitive fields from suggestion titles/descriptions (simulate a sensitive task title).
- AC91.10: Morning brief window produces due-soon and carry-over classes given seeded tasks due in 24-48h and started-yesterday.
- AC91.11: Evening wrap window proposes carry-over and quick-win; includes count summary in description; no PII.
- AC91.12: Metrics increment correctly for generated/accepted/ignored; GET metrics reflects ctr > 0 after acceptance.
- AC91.13: Realtime generation via hooks triggers after onTaskComplete without blocking and respects perRealtime cap.

11) Hardening
- Idempotency tokens per window/operator/day via dedupeKey; store lastGeneratedAt per window in metrics to avoid regen spam by scheduler.
- Backoff and error containment: engine failures must not crash scheduler or server; log once per interval.
- Input validation: settings and API bodies validated; clamp hours 0-23; timezone validated.
- Performance: limit list sizes; in-memory only for current operator; disk writes batched.
- File-locking: reuse existing safe-write utilities; write-then-rename.
- No breaking changes to existing types; append-only modifications.
- Tests: run acceptance suite; add minimal unit tests for computeDedupeKey and clampScore if current test framework supports.

12) Implementation Steps
- Create lib/suggestions/* modules as above with JSDoc for each exported function.
- Update lib/types.ts with new interfaces.
- Implement migrations.ts and wire into server.js.
- Implement server routes with http-response-guard and deep redaction wrappers (reuse existing helper imported across routes).
- Wire scheduler in startup/shutdown.
- Add non-blocking hooks in Chief of Staff.
- Build UI panel and handlers; ensure no layout regressions.
- Add docs (ADR, API, RUNBOOK, GOVERNANCE).
- Seed acceptance cases into acceptance suite under 04-Dashboard/tests/acceptance/part-091-*.json (match existing pattern).
- Update observability/metrics.
- Self-QA using AC91.*; ensure lints/tsc pass.

Constraints
- CommonJS require/module.exports as per repo conventions; TS compiled via tsc.
- Raw Node.js HTTP only; do not add frameworks.
- All new routes prefixed with /api/v1/suggestions and registered alongside existing ~1040 route set.
- Maintain Middleware Truth: run through existing middleware chain; add any new middleware registries if needed, with docs.

Exit Checklist
- All new files committed; server boots; scheduler runs; routes reachable; UI shows panel; suggestions flow works; evidence entries added for generation events; AC91.* pass; no regressions; docs present and cross-linked.

Now implement Part 91 exactly as specified. Include clear commit messages per logical step.
```
