# Enterprise Audit Hub

## Purpose
Unified audit view across all governance systems. Answers "why" questions about promotions, blocks, overrides, and tuning.

## Filters
lane, domain, project, provider, artifact_type, action_type, severity, time_window

## Audit Packages
Scoped bundles containing artifacts, evidence, ledger entries, and findings for a specific entity.

## API
- `GET /api/audit-hub` — Full view
- `POST /api/audit-hub/query` — Filtered query
- `GET /api/audit-packages/:scopeType/:relatedId` — Build package
