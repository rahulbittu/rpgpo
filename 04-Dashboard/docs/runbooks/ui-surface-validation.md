# Runbook: UI Surface Validation

## Running the Audit
`GET /api/ui-surface-audit` — inventories all 28 surfaces with status

## Checking Readiness
`GET /api/ui-readiness` — 12-area scoring with blocking gaps

## Finding Wiring Gaps
`GET /api/ui-wiring-gaps` — 11 gaps with fix suggestions

## E2E Checks
`GET /api/ui-end-to-end-check` — 8 operator flow tests

## After Fixes
Re-run audit and readiness to verify improvement.
