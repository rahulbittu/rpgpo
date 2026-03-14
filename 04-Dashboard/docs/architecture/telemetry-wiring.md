# Telemetry Wiring

## Auto-Emit Points
| Module | Action | Category |
|--------|--------|----------|
| approval-workspace | applyDecision | approval_workflow |
| escalation-inbox | updateItem | escalation_workflow |
| release-orchestration | executePlan | release_pipeline |
| override-ledger | approveOverride | governance_runtime |
| execution-graph | updateNodeStatus/updateGraphStatus | execution_runtime |
| runtime-enforcement | checkTransition | runtime_enforcement |

## Coverage: 8/15 fully wired, 4/15 partial, 3/15 missing
