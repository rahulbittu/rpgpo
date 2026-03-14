# Tuning Application Engine

## Purpose

Converts approved tuning recommendations into real mutations of live governance objects, with preview and rollback support.

## Flow

```
Recommendation (approved) → Preview (dry-run) → Apply → Rollback (if needed)
```

## Preview

`previewApplication(recId)` produces a `TuningApplicationPlan` with:
- Before state snapshot
- Simulated after state
- Change summary
- Risk assessment

## Apply

`applyTuning(recId)` executes the real mutation:
- Captures before state
- Executes change on live governance object
- Captures after state
- Creates rollback record
- Records full audit trail

## Rollback

`rollback(rollbackId)` restores the before state from the application record.

## Supported Targets

| Target | Apply Support |
|--------|--------------|
| operator_policy | Creates permissive policy override |
| escalation_rule | Creates new escalation rule |
| Other targets | Logged but not yet auto-mutated |

## API

- `POST /api/policy-tuning/recommendations/:id/preview-apply` — Preview
- `POST /api/policy-tuning/decisions/:id/apply` — Apply
- `POST /api/policy-tuning/applications/:id/rollback` — Rollback
- `GET /api/policy-tuning/applications` — Application history
- `GET /api/policy-tuning/rollbacks` — Rollback history
