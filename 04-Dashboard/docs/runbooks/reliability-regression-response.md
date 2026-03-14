# Runbook: Reliability Regression Response

## Detecting Regressions
`GET /api/reliability-regressions` — shows metrics that have degraded from baseline

## Response
1. Identify which metric regressed (success rate, block rate, etc.)
2. Check recent telemetry events for failures
3. Check reliability incidents
4. Check SLO breaches
5. Address root cause

## Alert Routing
Regressions trigger alerts routed to admin_workspace or escalation_inbox based on severity.
