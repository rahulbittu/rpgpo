# GPO Module Reference

*Auto-generated: 2026-03-14*

## Modules (87 total, ~17000 lines)

| Module | Lines | Purpose |
|--------|-------|---------|
| `activity` | 132 | GPO Structured Activity Events |
| `agents` | 225 | GPO Agent Interoperability — Governed multi-agent foundation |
| `ai` | 229 |  |
| `autonomy` | 307 | GPO Governed Autonomy Engine |
| `board` | 285 | GPO Board of AI — Full-discipline multi-agent deliberation |
| `capabilities` | 177 | GPO Capability / Skill Framework |
| `clean-state-verification` | 143 | GPO Clean State Verification — Stale state detection + Final Go production decision |
| `context` | 443 | GPO Context Engine — Instance-scoped, privacy-first structured context |
| `context-updater` | 246 | GPO Context Updater — Automatic context pipeline |
| `conversations` | 324 | GPO Multi-Agent Conversation Fabric |
| `costs` | 183 |  |
| `deep-redaction` | 108 | GPO Deep Redaction — Field-level stripping and masking |
| `deliberation` | 307 | RPGPO Board Deliberation Engine |
| `docs-generator` | 289 | GPO Enterprise Documentation Generator |
| `environments` | 215 | GPO Environment Lanes — dev / beta / prod |
| `enforcement-evidence` | 72 | GPO Enforcement Evidence — Durable evidence records for live enforcement truth |
| `engine-catalog` | 56 | GPO Engine Catalog — 15 core engines with definitions and output types |
| `events` | 29 |  |
| `final-blocker-reconciliation` | 107 | GPO Final Blocker Reconciliation — Reconcile stale state across Parts 48-51 |
| `final-ship-decision` | 117 | GPO Final Ship Decision — Evidence-backed GO/CONDITIONAL_GO/NO_GO |
| `files` | 76 |  |
| `final-output-surfacing` | 102 | GPO Final Output Surfacing — Synthesize task answers from subtask reports |
| `final-go-proof` | 148 | GPO Final Go Proof — Route-level validation proving inline enforcement |
| `http-response-guard` | 82 | GPO HTTP Response Guard — Reusable deny/redact/allow guard layer |
| `gitops` | 153 | GPO GitOps Layer — Git state, change summaries, commit/release helpers |
| `go-authorization` | 126 | GPO Go Authorization — Final production authorization from live proof |
| `http-middleware-validation` | 163 | GPO HTTP Middleware Validation — Route-level middleware validation with evidence |
| `go-live-closure` | 67 | GPO Go-Live Closure — Final closure report aggregating all ship blockers |
| `instance` | 225 | GPO Instance Model |
| `intake` | 184 |  |
| `live-server-proof` | 155 | GPO Live Server Proof — Network-level proof against running server |
| `live-middleware-wiring` | 130 | GPO Live Middleware Wiring — Honest wire states for middleware enforcement |
| `loops` | 245 | GPO Mission Loops — Governed loop definitions and health tracking |
| `mission-acceptance-suite` | 332 | GPO Mission Acceptance Suite — 150 seeded engine acceptance scenarios |
| `missions` | 147 | GPO Mission Framework — Core plugin system |
| `mutation-route-guards` | 62 | GPO Mutation Route Guards — Inline POST/PUT/DELETE protection |
| `network-http-validation` | 198 | GPO Network HTTP Validation — True network-level route validation |
| `notifications` | 238 | GPO Notification & Hook System |
| `operator-profile` | 230 | GPO Adaptive Operator Profile — Learns how the operator works |
| `plans` | 176 | GPO Product Plans — Tier definitions and enforcement |
| `output-contracts` | 106 | GPO Output Contracts — Per-engine deliverable requirements and validation |
| `privacy` | 134 | GPO Privacy Framework |
| `product-shell` | 90 | GPO Product Shell — Section classification and workflow definition |
| `protected-path-validation` | 196 | GPO Protected Path Validation — End-to-end middleware validation with evidence |
| `provisioning` | 414 | GPO Instance Provisioning — Create, validate, export, manage instances |
| `queue` | 66 |  |
| `reliability-closure` | 86 | GPO Reliability Closure — Close all reliability metrics to measured status |
| `readiness-reconciliation` | 80 | GPO Readiness Reconciliation — Final weighted ship readiness score |
| `release-provider-gating` | 70 | GPO Release Provider Gating — Provider governance for release approval |
| `release-ops` | 164 | GPO Release Operations — Governed commit/push/promote workflow |
| `releases` | 220 | GPO Release Discipline — Candidates, promotion, blockers, rollback |
| `repo-scanner` | 266 | RPGPO Repo Scanner — Grounding layer for code tasks |
| `route-protection-expansion` | 68 | GPO Route Protection Expansion — Broad coverage reporting |
| `route-middleware-enforcement` | 53 | GPO Route Middleware Enforcement — Inline guard bindings and coverage |
| `rpgpo-missions` | 144 | RPGPO Instance — Rahul Pitta's mission configurations |
| `state-machine` | 127 | RPGPO State Machine — Validated transitions for tasks and subtasks |
| `task-experience` | 77 | GPO Task Experience — Lifecycle tracking and surface assessment |
| `system-map` | 198 | GPO System Map — Visual architecture data for the dashboard |
| `types` | 1688 | RPGPO Domain Types — Single source of truth for all typed objects |
| `validate` | 369 | GPO Runtime Validation |
| `validation-harness-orchestrator` | 86 | GPO Validation Harness — 4-phase orchestrated validation pipeline |
| `workflow` | 279 | RPGPO Workflow Engine — Auto-Continue Logic (TypeScript) |
| `config/ai-io` | 48 | GPO Contract-Aware AI I/O Config — Feature flag, provider modes, sentinel config |
| `contracts/schema-encoder` | 155 | GPO Schema Encoder — Engine contract → JSON Schema draft-07 with stable hashing |
| `prompt/contract-aware` | 72 | GPO Contract-Aware Prompt Builder — Schema injection, field policies, mode selection |
| `ai/providers` | 74 | GPO Provider Structured Call — Mode-specific structured AI calls |
| `ai/structured-output` | 163 | GPO Structured Output Parser — 4-stage JSON extraction pipeline with validation |
| `merge/field-populator` | 107 | GPO Field Populator — Policy-aware structured field mapping |
| `evidence/structured` | 66 | GPO Structured Evidence Recorder — Redacted schema/prompt/parse/mapping evidence |
| `evidence/reader` | 67 | GPO Evidence Reader — Query structured evidence by deliverable and task |
| `ai/provider-capabilities` | 110 | GPO Provider Capabilities — Structured output capability registry + routing decisions |
| `ai/backoff` | 35 | GPO Backoff — Exponential backoff with jitter for parse retry |
| `contracts/board-phase` | 100 | GPO Board Phase Schema — JSON Schema per board lifecycle phase |
| `structured-io-metrics` | 180 | GPO Structured I/O Metrics — Event ingestion, aggregation, histograms, percentiles |
| `structured-io-cost` | 56 | GPO Structured I/O Cost — Per-call cost estimation and accumulation |
| `provider-learning` | 130 | GPO Provider Learning — EWMA scoring, circuit breaker, routing bias |
| `evidence-lifecycle` | 108 | GPO Evidence Lifecycle — TTL cleanup, size enforcement, indexing |
| `structured-io-alerts` | 115 | GPO Structured I/O Alerts — Spike detection, alert lifecycle, acknowledgement |
| `scheduler/scheduler` | 130 | GPO Scheduler — Orchestrator loop for parallel execution |
| `scheduler/work-queue` | 180 | GPO Work Queue — Priority queue with persistence and lease management |
| `scheduler/provider-capacity` | 90 | GPO Provider Capacity — Concurrency semaphores with dynamic backpressure |
| `scheduler/backpressure` | 50 | GPO Backpressure — Policy engine for dynamic throttling |
| `scheduler/dag-runner` | 110 | GPO DAG Runner — Execution graph to queue items, ready set transitions |
| `scheduler/recovery` | 50 | GPO Scheduler Recovery — Lease expiration and crash recovery |
| `scheduler/ids` | 15 | GPO Scheduler IDs — Deterministic queue item ID generation |
| `state/scheduler-store` | 55 | GPO Scheduler Store — Config and state persistence |
