# Runbook: Reliability Incident Response

## Detecting Incidents
`GET /api/reliability/incidents` — check for unresolved incidents
`GET /api/service-health` — check subsystem health states

## Triage
1. Identify affected subsystem
2. Check success_rate and incident_count
3. Assess severity: low/medium/high/critical
4. Review remediation guidance

## Resolution
1. Address root cause
2. Mark incident as resolved
3. Verify subsystem returns to healthy state
4. Check SLO budgets are recovering
