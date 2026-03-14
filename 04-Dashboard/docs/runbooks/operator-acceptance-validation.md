# Runbook: Operator Acceptance Validation

## Run Acceptance
`POST /api/operator-acceptance/run` or `GET /api/operator-acceptance`

## Expected: 8+ usable, 0 broken, 0 blocked

## For Each Partial Check
1. Identify what's missing (UI button? Drilldown? Refresh?)
2. Wire the missing piece
3. Re-run acceptance to verify improvement

## Target: 100% usable for ship
