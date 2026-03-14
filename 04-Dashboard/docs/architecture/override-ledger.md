# Override Ledger

## Purpose

Append-only audit trail for governance overrides. When enforcement blocks an action with `soft_block` or `override_required`, the operator can request an override.

## Override Types

| Type | When Used |
|------|-----------|
| `promotion_block` | Promotion is blocked by enforcement |
| `documentation_gap` | Required documentation is missing |
| `readiness_shortfall` | Readiness score below threshold |
| `review_failure` | One or more reviews failed |
| `escalation_conflict` | Unresolved escalation events |
| `provider_instability` | Provider fit is deprecated or low confidence |
| `experimental_dependency` | Using experimental recipes or fits |

## Lifecycle

```
Request (pending) → Approve → Available for enforcement clearing
                  → Reject → Not available
                  → Expire → No longer valid
```

## API

- `POST /api/overrides/request` — Create override request
- `POST /api/overrides/:id/approve` — Approve
- `POST /api/overrides/:id/reject` — Reject
- `GET /api/overrides/pending` — Pending overrides
