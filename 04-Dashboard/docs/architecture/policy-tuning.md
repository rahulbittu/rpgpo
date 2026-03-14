# Adaptive Policy Tuning

## Purpose

Generates evidence-backed recommendations to adjust governance policies, budgets, rules, and thresholds based on drift signals and exception patterns.

## Tuning Actions

| Action | Meaning |
|--------|---------|
| tighten | Make rule stricter |
| loosen | Make rule more permissive |
| add | Create new rule/requirement |
| deprecate | Remove/disable existing rule |
| rescope | Change scope or applicability |

## Tuning Targets

Operator policies, autonomy budgets, escalation rules, documentation requirements, promotion policies, enforcement rules, provider fits.

## Lifecycle

```
Drift/Exception detected → Recommendation generated (pending)
  → Operator reviews rationale + evidence
  → Approve / Reject
  → If approved → Apply (explicit action)
```

## API

- `GET /api/policy-tuning/recommendations` — All recommendations
- `POST /api/policy-tuning/recommendations/:id/approve` — Approve
- `POST /api/policy-tuning/recommendations/:id/reject` — Reject
- `POST /api/policy-tuning/decisions/:id/apply` — Apply approved recommendation
