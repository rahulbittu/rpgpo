# Runbook: Tenant Admin Operations

## Viewing Tenants
`GET /api/tenant-admin` — shows all tenants with plan, engines, modules

## Creating New Tenant
`POST /api/tenant-admin` with `{ name, plan }` — creates with plan-appropriate defaults

## Updating Tenant Config
`POST /api/tenant-admin/:id/update` with partial updates

## Feature Gating
`isModuleEnabled(tenantId, module)` checks if module is in tenant's enabled_modules list
