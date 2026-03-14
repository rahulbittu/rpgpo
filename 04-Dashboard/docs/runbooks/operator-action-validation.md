# Runbook: Operator Action Validation

## Checking Action Visibility
`GET /api/action-visibility` — shows all 15 actions with activation state

## Finding Gaps
`GET /api/action-visibility-gaps` — shows remaining hidden/partial actions

## Runtime Completion
`GET /api/runtime-completion` — shows 14 enforcement paths with state

## After Adding Actions
Re-run `GET /api/workflow-activation` to verify workflow scores improved.
