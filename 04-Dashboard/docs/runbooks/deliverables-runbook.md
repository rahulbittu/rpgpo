# Runbook: Structured Deliverables

## View Deliverable
`GET /api/tasks/:taskId/deliverable` — returns structured deliverable + RenderModel

## Validate Contract
`POST /api/tasks/:taskId/deliverable/validate` — returns ContractEnforcementResult (pass/soft_fail/hard_fail)

## View Contract Context
`POST /api/tasks/:engineId/plan/contract-enforce` — BoardContractContext for an engine

## Enforcement Flow
1. Plan-time: Board receives contract context with required fields
2. Plan augmented: Assemble + Validate subtasks added
3. Scaffold created: state/deliverables/:taskId.json initialized
4. Subtask merge: each subtask output merged into scaffold
5. Completion gate: validate deliverable, gate closure if fields missing
