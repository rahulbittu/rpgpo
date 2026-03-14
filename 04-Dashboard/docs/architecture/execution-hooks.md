# Execution Hooks

## Purpose

Reusable hook layer that attaches runtime enforcement checks to execution graph transitions. Hooks are typed, inspectable, and auditable.

## Hookable Transitions

| Transition | When |
|------------|------|
| graph_create | Execution graph is being created |
| node_queue | Node is being queued for execution |
| node_start | Node transitions to running |
| node_complete | Node transitions to completed |
| review_complete | Review contract is completed |
| dossier_generate | Promotion dossier generation |
| promotion_attempt | Lane promotion attempt |

## Hook Lifecycle

1. `attachHooks(graphId)` — Creates hooks for all 7 transitions
2. `executeHooks(transition, graphId, nodeId?)` — Runs all enabled hooks
3. `allHooksPass(transition, graphId, nodeId?)` — Convenience check

## API

- `POST /api/execution-hooks/attach/:graphId` — Attach hooks
- `GET /api/execution-hooks/graph/:graphId` — Get hooks for graph
