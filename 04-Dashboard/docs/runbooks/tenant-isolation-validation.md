# Runbook: Tenant Isolation Validation

## Check Isolation
`POST /api/tenant-isolation/evaluate` with source_tenant + target_tenant

## Expected: same tenant = allow, cross-tenant = deny

## View Decisions
`GET /api/tenant-isolation` — all isolation decisions

## Protected Routes
`GET /api/route-protection` — 12 protected routes with enforcement state
