# Tenant Isolation Runtime

## Default: deny cross-tenant access
Same tenant = allow. Cross-tenant = deny. No exceptions without explicit policy.

## Scope Filtering
`filterByTenant(data, tenantId)` and `filterByProject(data, projectId)` for query-time filtering.

## Telemetry
Denials auto-emit telemetry events for observability.
