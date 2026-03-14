# Project Isolation

## Access Outcomes
| Outcome | Effect |
|---------|--------|
| allow | Full access |
| deny | No access, violation recorded |
| allow_redacted | Access with sensitive fields removed |
| require_operator_approval | Blocked until operator approves |

## Default Redacted Fields
- remediation_notes, raw_request, custom_notes

## Sensitive Artifact Types (default redacted access)
- context, exception, override

## API
- `GET /api/project-isolation` — All policies
- `POST /api/project-isolation/evaluate` — Evaluate access
- `GET /api/isolation-violations` — All violations
