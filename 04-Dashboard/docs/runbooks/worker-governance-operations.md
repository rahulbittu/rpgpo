# Runbook: Worker Governance Operations

## How Worker Governance Works

Before a worker executes a subtask or builder action, it can evaluate governance to determine if the action should proceed.

## Worker Decision Flow

1. Worker receives action (e.g., execute subtask)
2. Calls `evaluateWorkerAction(graphId, nodeId, action)`
3. Receives decision with outcome and retry info

## Decision Outcomes

| Outcome | Worker Action |
|---------|--------------|
| proceed | Execute normally |
| proceed_with_warning | Execute, log warning |
| block | Do not execute, record block |
| require_override | Wait for override approval |
| pause_for_escalation | Pause, notify operator |

## Retry Governance

- Dev lane: up to 3 retries, retry allowed
- Beta lane: up to 2 retries, retry allowed
- Prod lane: 1 attempt, no retry

## Monitoring

Worker decisions are visible via:
- `GET /api/worker-governance` — all decisions
- `GET /api/worker-governance/graph/:graphId` — per graph
- `GET /api/worker-governance/node/:nodeId` — per node
