# GPO Changelog

## 2026-03-15 — Part 74: Comprehensive Integration Test Suite + Acceptance Harness
- 2 new test infrastructure modules: lib/test/provider-sim.ts, lib/test/scenario-runner.ts
- Provider simulator: seeded deterministic RNG, contract-aware output generation for TopRanker/newsroom/general, configurable error/slow/invalidJson rates
- Scenario runner: end-to-end workflow execution through all 14 stages with assertions on deliverables, evidence, and stage transitions
- 14 new acceptance tests: provider sim (8), scenario runner (6) covering TopRanker, newsroom, general engines
- Multi-engine acceptance scenarios: happy paths, evidence verification, field validation, batch execution
- All core 258 tests pass, 297 total including integration scenarios

## 2026-03-14 — Part 73: Mission Control Dashboard + Operator Notifications
- 2 new modules: mission-control.ts (aggregation), in-app-notifications.ts (notification engine)
- Mission Control aggregator: collects workflow, provider, scheduler, alert, deliverable, approval state into unified payload with health computation (green/yellow/red)
- In-app notification engine: emit/list/ack/markRead with rolling 2000-entry persistence, 60s dedup window, badge counts
- 10+ new types: MissionControlSummary, MissionControlPayload, GPO_Notification, NotificationBadgeCounts, MCHealth, NotificationType, etc.
- 5 new API routes: /api/mission-control/summary, /api/mission-control/full, /api/notifications, /api/notifications/ack, /api/notifications/mark-read
- 13 new tests (283 total), 0 regressions

## 2026-03-14 — Part 72: TopRanker Engine Deep Integration
- 3 new modules: contracts/topranker.contracts.ts, engines/topranker-engine.ts, integrations/topranker-repo-adapter.ts
- 4 TopRanker contracts: leaderboard.v1, scorecard.v1, review-aggregation.v1, release-artifact.v1 with JSON Schema validation
- TopRanker engine template: 3 task templates (weekly-leaderboard, scorecards, review-aggregation), domain-specific prompts with governance rules, merge with de-dup by businessId, deterministic deliverable IDs
- Repo adapter: detect/prepare/build/collect with dry-run mode, checksum-verified artifacts, redacted env vars, build logs
- 4 TopRanker types: TopRankerLeaderboardEntry, TopRankerBusinessScorecard, TopRankerReviewAggregation, TopRankerReleaseArtifact
- 4 new API routes: /api/topranker/contracts, /api/topranker/tasks/run, /api/topranker/build, /api/topranker/deliverables
- Sample data: state/samples/topranker/sample-leaderboard.json with 3 Austin coffee shops
- 21 new tests (270 total), 0 regressions

## 2026-03-14 — Part 71: End-to-End Workflow Orchestration + Autopilot Mode
- 9 new modules: workflow-types.ts, workflow-store.ts, workflow-orchestrator.ts, autopilot-controller.ts, scheduler-bridge.ts, approval-gate-adapter.ts, release-trigger.ts, orchestrator-events.ts, orchestrator-telemetry.ts
- Durable workflow state machine: 14 stages (intake_received → released) with typed transitions and idempotency keys
- Autopilot controller: per-tenant/project/workflow policies, daily caps, gate allow/deny lists, budget guardrails
- Scheduler bridge: integrates with Part 70 parallel execution engine
- Approval gate adapter: uniform gate status interface
- Release trigger: auto-assemble RC and promote on approval
- Evidence emission: per-transition records with redaction
- Telemetry: transition counts, stage durations, auto-advance/release tracking
- 10 new API routes: workflow CRUD, pause/resume/cancel/advance/autopilot, timeline, metrics
- Feature flags config: state/config/feature-flags.json with autopilot defaults
- Docs: ADR-0071 workflow orchestrator and autopilot
- 25 new tests (249 total), 0 regressions

## 2026-03-14 — Part 70: Parallel Execution Engine + Resource-Aware Scheduling + Backpressure
- 9 new modules: scheduler/scheduler.ts, work-queue.ts, provider-capacity.ts, backpressure.ts, dag-runner.ts, recovery.ts, ids.ts, state/scheduler-store.ts
- DAG runner: execution graph → queue items with dependency tracking, ready set transitions on node completion
- Priority work queue: JSON-persisted with priority ordering, lease management, dead letter queue
- Provider capacity: per-provider/tenant/project concurrency semaphores with dynamic limits from backpressure
- Backpressure: integrates circuit breaker state and error rates to scale concurrency
- Recovery: lease expiration sweep, crash recovery, graceful drain on shutdown
- 15+ new types: SchedulerConfig, SchedulerFeatureFlags, BackpressureSignal, CapacityWindow, QueueItem, QueueStats, etc.
- 10 new API routes: scheduler state/pause/resume/config, queue stats/reprioritize/cancel, provider limits, run progress/cancel
- Feature-flagged (enabled=false, globalMaxConcurrent=1 by default, preserving serial behavior)
- Config: state/scheduler/config.json with full scheduler configuration
- Docs: ADR-0070 parallel execution and backpressure
- 25 new tests (224 total), 0 regressions

## 2026-03-14 — Part 69: Structured I/O Observability + Metrics + Provider Learning + Evidence Lifecycle
- 5 new modules: structured-io-metrics.ts, structured-io-cost.ts, provider-learning.ts, evidence-lifecycle.ts, structured-io-alerts.ts
- `structured-io-metrics.ts` — In-memory event ring buffer, rolling aggregation, latency histograms, p50/p95/p99 percentiles, per-provider and per-schema metrics
- `structured-io-cost.ts` — Per-call cost estimation from provider pricing table, accumulation by task/provider
- `provider-learning.ts` — EWMA scoring (alpha=0.2, weights: 60% success + 25% latency + 15% cost), circuit breaker (50% threshold, 5min sleep), routing bias (±20%)
- `evidence-lifecycle.ts` — TTL cleanup (30d default), max bytes enforcement (500MB LRU), file indexing with age distribution
- `structured-io-alerts.ts` — parse_spike and provider_error_spike detection, cooldown, acknowledgement lifecycle
- 11 new API routes: metrics, providers, schemas, histogram, costs, alerts, ack, learning, override-score, reset, evidence index
- UI: New "Structured I/O" tab with KPI dashboard, per-provider table, latency histogram, alerts with ack, evidence summary
- Config: state/config/structured-io.json with metrics, learning, evidence, alerts, cost settings
- 12 new types: StructuredIoEvent, StructuredIoMetricsSnapshot, ProviderMetrics, SchemaMetrics, ProviderLearningConfig, StructuredIoConfig, StructuredIoAlert
- Docs: ADR-0069, structured-io-alerts runbook
- 25 new tests (199 total), 0 regressions

## 2026-03-14 — Part 68: Board + Worker Structured Integration + Retry + Provider-Aware Routing
- 3 new modules: ai/provider-capabilities.ts, ai/backoff.ts, contracts/board-phase.ts
- `provider-capabilities.ts` — 5-provider capability registry with structured output support flags; `decideProviderRouting()` with 3 routing modes (capability-preferred, force-config, legacy)
- `backoff.ts` — Exponential backoff with jitter for parse retry (250ms base, 1.7x multiplier, 0.2 jitter)
- `board-phase.ts` — JSON Schema for all 8 board lifecycle phases
- `executeWithParseRetry()` — Unified retry loop in structured-output.ts; loops up to maxParseAttempts with backoff, records evidence per attempt
- Board integration: `executeBoardPhaseStructured()` wraps each phase with structured pipeline; falls back to legacy on failure
- Chief of Staff: `getStructuredIOStatus(taskId)` and `getStructuredIOBriefSnippet(taskId)` surface structured status in briefs
- Config v2: boardStructuredEnabled, workerStructuredEnabled, providerRouting, backoffMs/Multiplier/Jitter, exposeStatusToOperator, allowManualRetry
- 6 new types: GPO_ProviderCapability, GPO_ProviderRoutingDecision, GPO_StructuredIOAttempt, GPO_StructuredIOStatus, GPO_BoardPhaseOutput, GPO_ProviderMode
- 3 new API routes: GET /api/ai-io/status/:taskId, POST /api/ai-io/retry/:taskId, GET /api/providers/capabilities
- UI: Structured IO status badge with provider/mode/attempts/status
- Docs: ADR-0068, ai-io-ops runbook
- 27 new tests (174 total), 0 regressions

## 2026-03-14 — Part 67: Contract-Aware Prompt Augmentation + Structured Output Extraction
- 8 new TypeScript modules across 5 new subdirectories (config/, contracts/, prompt/, ai/, evidence/)
- `config/ai-io.ts` — Feature-flagged config loader with provider mode matrix and sentinel config
- `contracts/schema-encoder.ts` — Engine contract → JSON Schema draft-07 with deterministic hashing
- `prompt/contract-aware.ts` — Builds prompts with schema injection, field policies, per-provider modes
- `ai/providers.ts` — `callProviderStructured()` maps native-json/mime-json/prompt-sentinel to provider calls
- `ai/structured-output.ts` — 4-stage parse pipeline: direct → sentinel → fenced → balanced braces
- `merge/field-populator.ts` — Policy-aware field-level deliverable population from parsed JSON
- `evidence/structured.ts` — Redacted evidence recording (schema hash, prompt ID, parse status, mapping diffs)
- `evidence/reader.ts` — Query structured evidence by deliverable and task
- 6 new types: GPO_StructuredMode, GPO_SchemaEnvelope, GPO_PromptEnvelope, GPO_StructuredExtraction, GPO_FieldMappingResult, GPO_ContractAwareConfig
- `deliberation.ts` — New `executeStructuredSubtask()` with full pipeline + graceful fallback
- `runtime-deliverable-pipeline.ts` — `onSubtaskComplete` now accepts structured results for field-level population
- 2 new API routes: GET /api/deliverables/:id/structured, GET /api/deliverables/:id/structured/:taskId
- UI: "Structured" badge on deliverables, Raw/Parsed toggle with evidence viewer
- Config: state/config/ai-io.json with feature flag, provider modes, parse limits, sentinel markers
- Docs: ADR-0067, structured-output-runbook, schema-encoding contracts doc
- 72 tests (52 unit + 20 integration), 0 regressions on existing 75-test suite

## 2026-03-14 — Part 61: Merge Pipeline + Merge-Time Enforcement + Strategy Registry
- `deliverable-merge.ts` — 5 merge strategies, per-variant field policies, provenance tracking
- Merge-time contract enforcement with variant-specific validation
- Field-level diff between deliverable versions
- 4 new API routes, 3 CoS functions

## 2026-03-14 — Part 60: Deliverable Identity + Versioned Store + Migration
- `deliverable-id.ts` — Deterministic ID (sha256-based), key creation, content hashing
- `deliverable-store.ts` — Versioned append-only persistence with atomic writes, status lifecycle, migration
- Store layout: index.json + per-deliverable folders with version files and meta
- Migration from legacy flat store, reindex from folder contents
- 6 new API routes, 4 CoS functions, memory viewer integration
- Architecture designed via ChatGPT handoff (003-part60-prompt-generation)

## 2026-03-14 — Part 59: Structured Deliverables + Contract Enforcement + Rendering
- `structured-deliverables.ts` — 9 typed deliverable variants, schema registry, validation
- `contract-enforcement.ts` — scaffold lifecycle, subtask merge, completion gate, remediation
- `deliverable-rendering.ts` — StructuredDeliverable → RenderModel with 9 renderer keys
- Plan-time enforcement: BoardContractContext + Assemble/Validate subtask injection
- Completion-time enforcement: soft_fail/hard_fail with remediation checklist
- Structured UI rendering: newsroom cards, shopping tables, code diffs, document sections, etc.
- Final Result block now tries structured deliverable first, falls back to raw text
- Architecture designed with ChatGPT via handoff protocol (001-part59-architecture)
- 3 new API routes, 4 CoS functions, memory viewer integration

## 2026-03-14 — Part 58: Engine Catalog + Output Contracts + Mission Acceptance Suite
- `engine-catalog.ts` — 15 core engines with definitions, capabilities, output types, approval models
- `output-contracts.ts` — Per-engine output contracts with deliverable validation and visibility reporting
- `mission-acceptance-suite.ts` — 150 seeded acceptance scenarios (10 per engine)
- Deliverable-first task closure: 5 valid closure states, no invisible completions allowed
- Intake selector expanded to 15 engines with contract hint showing expected output
- 10 new API routes, 4 CoS functions, memory viewer integration
- Newsroom fix: final answers now surfaced via Part 57 + contract validation ensures visibility
- 30/30 existing tasks have visible deliverables, 150 acceptance cases seeded

## 2026-03-14 — Part 57: Product UX Consolidation + Final Output Surfacing + Shippable App Shell
- `product-shell.ts` — 18-section product classification with role-based hierarchy
- `final-output-surfacing.ts` — Synthesizes final answers from subtask reports and outputs
- `task-experience.ts` — Task lifecycle tracking and shippable surface assessment
- Final Result block in task timeline for completed tasks — shows actual answer, artifacts, reports
- Sidebar reorganized into Product / Advanced / Operator role sections
- Dossiers tab: empty state added
- 20/20 completed tasks now show surfaced final answers (100% quality)
- 14/18 sections shippable, 17/18 tabs with real content
- 7 new API routes, 3 CoS functions, memory viewer integration

## 2026-03-14 — Part 56: Broad Route Protection Expansion + Mutation Guarding + Deep Redaction
- `route-protection-expansion.ts` — 22 guarded routes across ship-critical + sensitive categories
- `mutation-route-guards.ts` — 10 mutation route rules with inline enforcement
- `deep-redaction.ts` — Field-level stripping/masking with configurable rule sets
- Wired guards into 14 additional server.js route handlers (skill-packs, templates, extensions, integrations, security, observability)
- Deep redaction strips api_key/secret/content/token, masks scope/actor fields
- 4/4 regression checks pass — ship-critical protection intact
- Route coverage: 8 → 22 guarded (100% of guardable), mutation coverage: 10/10 (100%)
- 7 new API routes, 4 CoS functions, memory viewer integration

## 2026-03-14 — Part 55: Inline Route Middleware Enforcement + Final Unconditional Go Proof
- `route-middleware-enforcement.ts` — 8 inline route guard bindings with execution recording
- `http-response-guard.ts` — Reusable guard layer: deny (403), redact (_redacted), allow
- `final-go-proof.ts` — 8 route-level validation cases with real HTTP header overrides
- Wired inline guards into 7 server.js route handlers (compliance, tenant-admin, audit-hub, release-orchestration, marketplace, enforcement-evidence, release-provider-gating)
- Real HTTP enforcement: 403 for deny, _redacted payload for redact, 200 for allow
- **UNCONDITIONAL GO at 100%** — 8/8 routes proven at handler level, 0 proof blockers
- 7 new API routes, 3 CoS functions, memory viewer integration

## 2026-03-14 — Part 54: Live Server Proof + Final Production Go Authorization
- `live-server-proof.ts` — 8 proof cases against running server, no fallback counts as final
- `validation-harness-orchestrator.ts` — 4-phase orchestrated validation pipeline
- `go-authorization.ts` — 8-gate authorization with live proof requirement for GO
- Key rule: GO requires live_network proof; function_only caps at CONDITIONAL_GO
- Server running: **GO at 100%**, fully_proven, 0 proof gaps
- Server not running: CONDITIONAL_GO (88%), partially_proven, 1 gap (fallback_only)
- 6 new API routes, 3 CoS functions, memory viewer integration

## 2026-03-14 — Part 53: Network-Level HTTP Validation + Final Reliability Closure + Clean-State Go
- `network-http-validation.ts` — True network-level HTTP validation with server probe + function fallback
- `reliability-closure.ts` — Closes all reliability metrics, 0 proxy-only remaining
- `clean-state-verification.ts` — Stale state detection + clean validation + Final Go verification
- 8-gate production decision model: GO requires all required gates pass
- With clean state: **GO at 100%, 8/8 gates pass, 0 remaining gaps**
- 7 new API routes, 4 CoS functions, memory viewer integration

## 2026-03-14 — Part 52: Final Ship Decision Reconciliation + HTTP Middleware Validation
- `http-middleware-validation.ts` — 8 HTTP validation cases with enforcement evidence + redaction tracking
- `final-blocker-reconciliation.ts` — Reconciles stale blockers across Parts 48-51 into single truth
- `final-ship-decision.ts` — Evidence-backed GO/CONDITIONAL_GO/NO_GO from 7 weighted dimensions
- Closed last workflow: audit traceability drilldown → usable (13/13 workflows)
- Resolved stale ship-blocker: provider governance in releases → resolved
- Fixed redaction vs deny: data-boundaries now uses two-pass matching (specific artifact first)
- Final Ship Decision: **GO at 99%** — all 7 evidence dimensions pass
- 8 new API routes, 4 CoS functions, memory viewer integration

## 2026-03-14 — Part 51: Middleware Enforcement Completion + Real Protected Path Validation
- `protected-path-validation.ts` — 8 end-to-end protected paths with real middleware execution
- `live-middleware-wiring.ts` — Honest wire states (design_only/evaluated_only/wired/executed_and_verified)
- `enforcement-evidence.ts` — Durable evidence records for live enforcement truth
- Updated middleware-enforcement to delegate to live-middleware-wiring truth
- Updated readiness-reconciliation to consume truth_score instead of assumed coverage
- Governance tab: Middleware Truth panel with score cards, protected paths, evidence
- 8 new API routes, 4 CoS functions, memory viewer integration
- Middleware truth: 0% → 100%, Protected paths: 8/8 validated, Reconciliation: 53% → 73%

## 2026-03-14 — Part 50: Final Go-Live Closure + Ship Readiness Reconciliation
- `go-live-closure.ts` — Aggregates all ship blockers into unified closure report
- `release-provider-gating.ts` — Provider health gates for release approval
- `readiness-reconciliation.ts` — Weighted readiness score with stale contradiction resolution
- Updated operator-acceptance: rollback, skill packs, templates, extensions now usable
- Releases tab: reconciliation dashboard, closure report, provider gate panel
- 4 new API routes, 3 CoS functions, memory viewer integration
- 10 documentation artifacts: 3 contracts, 1 ADR, 1 runbook, 1 architecture, changelog, modules, operator guide update, releases update

## 2026-03-13 — Platform Foundation

### Part 1: GPO Core vs RPGPO Instance
- Separated GPO platform from RPGPO instance configuration
- Created instance model with operator, missions, capabilities, privacy, budget
- Added mission plugin framework with 9 missions
- Added capability registry with 10 capabilities

### Part 2: Context Engine
- Built privacy-first structured context engine
- Operator profile, mission context, decisions, artifacts, approval patterns
- Auto-update pipeline on task lifecycle events
- Privacy-aware context injection into deliberation

### Part 3: Platform Hardening
- Migrated all 20 lib modules to TypeScript (6,800+ lines)
- Added runtime validation for all persisted data
- Migrated deliberation.js and repo-scanner.js to TypeScript

### Part 4: Operator Product Layer
- Needs Operator priority surface with one-click actions
- Mission templates for quick task creation
- Board Discussion panel showing 4 voices
- Enhanced Live Feed with signal classification
- Enhanced Mission Snapshot with objective/blocker/progress

### Part 5: Governed Autonomy
- Pre-execution checks: provider, privacy, budget, capability, risk
- Continuation decisions with typed blockers
- Mission loops for 9 domains with health tracking
- Notification hooks: dashboard (live), webhook (prepared)
- Agent hook points for future external interaction

### Part 6: Shippable Product Layer
- Product plan model: Starter, Pro, Private tiers
- Instance provisioning with privacy presets
- Health checks and admin summary
- Instance export/import (privacy-safe)
- Plan-aware capability/provider enforcement

### Part 7: Visual System Map & Agent Interop
- 34-node system map with layered architecture view
- Mission map modals with task/blocker/context detail
- Task flow cards with stage progression
- Agent registry with 4 built-in agents
- Typed handoff contracts with privacy scopes

### Part 8: Documentation, GitOps, Real 4-Agent Board
- Real multi-agent board execution across OpenAI, Gemini, Perplexity
- Governed GitOps layer with git state and release summaries
- Structured documentation: architecture, board, privacy, operator guide
- Git state visibility in dashboard
