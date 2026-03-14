# Reliability Governance

## 6 Subsystems
execution_runtime, governance_runtime, release_pipeline, provider_routing, approval_workflow, audit_compliance

## Health States
healthy, watch, degraded, critical

## Incidents
Recorded with subsystem, severity, affected scope, remediation guidance

## API
- `GET /api/reliability` — Service health
- `GET /api/reliability/incidents` — All incidents
- `POST /api/reliability/incidents` — Record incident
