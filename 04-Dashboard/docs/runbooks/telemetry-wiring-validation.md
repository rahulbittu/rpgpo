# Runbook: Telemetry Wiring Validation

## Check Coverage
`GET /api/telemetry-wiring` — shows 15 flows with wiring state

## Expected: 8 fully wired, 4 partial, 3 missing

## Verification
1. Approve an item → check `/api/observability` for approval_workflow event
2. Triage an escalation → check for escalation_workflow event
3. Execute a release → check for release_pipeline event
4. Approve an override → check for governance_runtime event
