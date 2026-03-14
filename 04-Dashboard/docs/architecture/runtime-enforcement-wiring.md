# Runtime Enforcement Wiring

## Purpose

Connects the enforcement engine (Part 24) to real execution state transitions in the execution graph (Part 20), making governance checks active.

## Check Flow

1. Execution graph or node attempts a state transition
2. `shouldProceed(transition, graphId, nodeId?)` is called
3. Enforcement engine evaluates policies, budgets, escalation, docs, overrides
4. If `proceed` or `proceed_with_warning` → transition allowed
5. If `block`, `require_override`, or `pause_for_escalation` → transition rejected (returns null)

## Persisted Records

- `HookExecutionResult` — every check outcome
- `ExecutionBlockRecord` — every block with transition, reason, lane, domain
- `RuntimeGovernanceEvent` — audit trail of all checks

## API

- `GET /api/runtime-enforcement` — Summary
- `GET /api/runtime-enforcement/graph/:graphId` — Results for graph
- `POST /api/runtime-enforcement/evaluate` — Manual evaluation
- `GET /api/runtime-blocks` — Active blocks
