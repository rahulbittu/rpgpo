# Runbook: Operator Workflow Validation

## Running the Report
`GET /api/workflow-activation` — shows all 10 workflows with activation state

## E2E Flow Check
`POST /api/e2e-flow/run/:flowId` — runs step-by-step assessment

## Operator Actions
`GET /api/operator-actions` — shows all 22 actions with visibility status

## Priority: Fix partial workflows first
Focus on workflows that have working APIs but missing UI controls.
