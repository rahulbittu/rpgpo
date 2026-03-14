# Worker Governance Hooks

## Purpose

Runtime-level hooks that evaluate whether a worker action should proceed before work executes. Integrates runtime enforcement with retry budget limits.

## Worker Decision Outcomes

| Outcome | Effect |
|---------|--------|
| proceed | Worker executes normally |
| proceed_with_warning | Worker executes, warning logged |
| block | Worker stops, action recorded |
| require_override | Worker stops, override needed |
| pause_for_escalation | Worker pauses, escalation triggered |

## Retry Governance

Worker decisions include `retry_allowed` and `max_retries_remaining` based on the autonomy budget for the current lane. Prod lane disables retries entirely.

## API

- `GET /api/worker-governance` — All worker decisions
- `GET /api/worker-governance/graph/:graphId` — Decisions for graph
- `GET /api/worker-governance/node/:nodeId` — Decisions for node
