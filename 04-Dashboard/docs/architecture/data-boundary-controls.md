# Data Boundary Controls

## Default Policies
| Source → Target | Artifact | Decision |
|----------------|----------|----------|
| tenant:* → tenant:* | * | deny |
| project:* → project:* | context | redact |
| tenant:* → external | compliance_export | redact |
| project:* → project:* | collaboration | redact |

## Boundary Decisions
allow, deny, redact, require_approval

## Violations
Denied cross-boundary access creates a violation record with severity.

## API
- `GET /api/data-boundaries` — Policies
- `POST /api/data-boundaries/evaluate` — Evaluate access
- `GET /api/boundary-violations` — Violation records
