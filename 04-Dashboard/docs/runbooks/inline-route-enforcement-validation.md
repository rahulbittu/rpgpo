# Runbook: Inline Route Enforcement Validation

## Quick Test
```bash
# Deny: non-entitled tenant
curl -H "x-tenant-id: free_tenant" http://localhost:3200/api/tenant-admin
# → 403 {"error":"...","guard":"entitlement"}

# Redact: cross-project
curl -H "x-project-id: other-project" http://localhost:3200/api/audit-hub
# → 200 {..., "_redacted": true}

# Allow: same scope
curl http://localhost:3200/api/audit-hub
# → 200 {normal data}
```

## Full Proof
`POST /api/final-go-proof/run` — runs 8 cases with header overrides

## View Results
`GET /api/final-go-proof` — latest run with per-case proof level

## View Coverage
`GET /api/route-middleware/coverage` — 8/8 bindings enforced
