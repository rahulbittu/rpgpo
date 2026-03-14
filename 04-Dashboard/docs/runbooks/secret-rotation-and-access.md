# Runbook: Secret Rotation and Access

## Viewing Secrets
`GET /api/secret-governance` — shows metadata only (key prefix, age, status, rotation policy)

## Secret Statuses
- active — configured and within rotation window
- stale — beyond rotation policy but still working
- expired — missing or explicitly expired
- rotated — replaced with new value

## Rotation
Default rotation policy: 90 days. No auto-rotation — operator must manually update .env.

## Access Decisions
- Operator: allow (full access to manage secrets)
- System/CoS: redacted (metadata only, for governance audit)
- Other actors: deny by default
