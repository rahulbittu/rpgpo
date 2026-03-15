# ADR-0071: End-to-End Workflow Orchestration + Autopilot Mode

**Status:** Accepted
**Date:** 2026-03-14
**Part:** 71

## Context

The system had all components (intake, deliberation, board, execution, merge, validation, approval, release) built individually but lacked unified orchestration. No state machine connected these stages. Approval gates weren't wired to execution. Releases required manual triggering.

## Decision

Build a durable workflow orchestrator with:

1. **State Machine** — 14 stages from `intake_received` to `released` with typed transitions
2. **Autopilot** — Configurable per-tenant/project/workflow auto-advance with gates, daily caps, budget guardrails
3. **Scheduler Integration** — Bridge to Part 70 parallel execution engine
4. **Approval Gate Adapter** — Uniform gate interface connected to existing approvals
5. **Release Trigger** — Auto-assemble and promote release candidates on approval
6. **Evidence Trail** — Per-transition evidence with redaction
7. **Telemetry** — Transition counts, stage durations, auto-advance tracking

### Workflow Stages

```
intake_received → deliberation_planned → scheduled → executing → merging → validating
  → awaiting_approval → approved → release_candidate_prepared → released
```

Plus: `paused`, `blocked`, `failed`, `cancelled`

### Autopilot Policy

- `enabled`: master toggle (default OFF)
- `gates_allowed`: gates autopilot can auto-approve
- `require_human_for`: gates requiring manual approval
- `max_auto_promotions_per_day`: daily cap (default 3)
- `budget_guardrails`: token/cost/parallelism limits

## New Modules (9)

| Module | Purpose |
|--------|---------|
| `workflow-types.ts` | State machine types, transitions map |
| `workflow-store.ts` | File-backed persistence with idempotency |
| `workflow-orchestrator.ts` | Core state machine + event handling |
| `autopilot-controller.ts` | Policy evaluation + daily caps |
| `scheduler-bridge.ts` | Bridge to Part 70 scheduler |
| `approval-gate-adapter.ts` | Uniform gate interface |
| `release-trigger.ts` | Auto RC assembly + promotion |
| `orchestrator-events.ts` | Evidence emission |
| `orchestrator-telemetry.ts` | Metrics collection |

## API Routes (10)

POST /api/workflows, GET /api/workflows, GET /api/workflows/:id, POST pause/resume/cancel/advance/autopilot, GET timeline, GET /api/metrics/orchestrator

## Consequences

### Positive
- Full lifecycle automation with governance guardrails
- Autopilot enables semi-autonomous operation
- Evidence trail for every transition
- Crash recovery via init() scan

### Negative
- Complexity of 14-stage state machine
- Autopilot requires careful configuration to avoid unintended releases
