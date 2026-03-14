# Runbook: Runtime Activation Validation

## Activate Capabilities
`POST /api/runtime-capabilities/activate/:engineId` — activates composed capabilities

## Bind Template
`POST /api/template-runtime-bind/:templateId/:engineId` — applies template defaults to live engine

## Check Report
`GET /api/runtime-activation-report` — shows activated/blocked/conflicts/bindings/permissions

## Verify
After activation, check that provider fits and policies were actually created.
