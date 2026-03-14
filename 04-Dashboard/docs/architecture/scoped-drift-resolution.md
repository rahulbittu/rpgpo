# Scoped Drift Resolution

## Purpose

Generates explicit resolution objects from drift signals with proposed actions, risk assessment, and lifecycle tracking.

## Resolution Actions

| Action | What It Does |
|--------|-------------|
| adjust_policy | Modify operator preference policy |
| adjust_budget | Modify autonomy budget |
| adjust_escalation | Add/modify escalation rule |
| adjust_doc_requirement | Modify documentation requirement |
| adjust_promotion_policy | Modify promotion threshold |
| adjust_enforcement_rule | Modify enforcement rule |
| adjust_provider_fit | Update provider-role fit score |
| require_review | Trigger additional review |
| require_board_recheck | Send back to Board of AI |
| monitor_only | Watch but take no action |

## Lifecycle

```
open → approved → applied → verified → closed
         └→ rejected
```

## API

- `GET /api/scoped-drift-resolutions` — All resolutions
- `POST /api/scoped-drift-resolutions/:id/approve` — Approve
- `POST /api/scoped-drift-resolutions/:id/reject` — Reject
- `POST /api/scoped-drift-resolutions/:id/verify` — Verify after apply
