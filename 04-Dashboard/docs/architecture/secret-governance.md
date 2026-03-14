# Secret Governance

## Scope Types
tenant, environment, engine, project, provider

## Access Decisions
allow (operator), redacted (system), deny (unauthorized)

## Features
- Metadata-only records (key_prefix, never raw value)
- Access decisions per actor
- Usage tracking
- Rotation policy (default 90 days)
- Age/expiry tracking
- Status: active / stale / expired / rotated

## API
- `GET /api/secret-governance` — All secret metadata
- `POST /api/secret-governance/access/evaluate` — Evaluate access
