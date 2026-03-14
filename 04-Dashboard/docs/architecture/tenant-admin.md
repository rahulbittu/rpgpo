# Tenant Admin

## Tenant Profile
- ID, name, plan (personal/pro/team/enterprise)
- Enabled engines, enabled modules
- Environment config (lanes, storage, deployment target)
- Governance defaults, isolation state

## Default: RPGPO
tenant_id: rpgpo, plan: pro, all engines, all modules, strict isolation

## API
- `GET /api/tenant-admin` — All tenants
- `POST /api/tenant-admin` — Create tenant
- `POST /api/tenant-admin/:id/update` — Update
