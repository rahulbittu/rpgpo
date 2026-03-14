# Runbook: Entitlement and Boundary Enforcement Review

## Check Entitlements
`POST /api/api-entitlements/evaluate` with route + tenant_id

## Check Boundaries
`POST /api/boundary-enforcement/evaluate` with request_type + source_scope + target_scope + artifact_type

## Reports
- `GET /api/enforcement-reports/isolation` — full isolation report
- `GET /api/enforcement-reports/entitlements` — entitlement decisions
- `GET /api/enforcement-reports/boundaries` — boundary enforcement results
