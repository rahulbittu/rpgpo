# Enforcement Evidence Architecture

## Purpose
Durable, auditable records proving that middleware actually executed and made specific decisions on specific routes for specific scopes.

## Record Schema
Each evidence record contains:
- `area` — which middleware area (api_entitlements, boundary_enforcement, etc.)
- `middleware_ran` — the specific function that executed
- `decision_made` — what the middleware decided (allowed, denied, blocked, etc.)
- `response_effect` — what happened to the response (request_denied, request_allowed, boundary_blocked)
- `scope_type` / `scope_id` — tenant/project/extension scope
- `route` — the API route involved
- `linked_path_id` — which protected path triggered this evidence

## Storage
`state/enforcement-evidence.json` — rolling 500 records, newest first

## Integration Points
- Protected path validation creates evidence automatically
- Live middleware wiring checks evidence to determine `executed_and_verified` state
- Audit hub / traceability ledger can query evidence by area or scope
- Memory viewer shows evidence count in governance artifacts
- API: `GET /api/enforcement-evidence`, `GET /api/enforcement-evidence/area/:area`
