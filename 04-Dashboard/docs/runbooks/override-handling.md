# Runbook: Override Handling

## When Overrides Are Needed

When enforcement blocks an action with `soft_block` or `override_required`, the operator can request an override to proceed.

## Override Flow

1. **Enforcement blocks action** — returns `soft_block` with `required_override_types`
2. **Request override** — `POST /api/overrides/request` with type, reason, notes
3. **Review override** — shown in override center / governance tab
4. **Approve/reject** — operator decides
5. **Re-evaluate** — enforcement engine checks approved overrides and clears soft blocks

## Override Types and When to Use

| Type | Scenario | Typical Action |
|------|----------|----------------|
| `documentation_gap` | Missing docs but timeline pressure | Approve with remediation: "docs by next sprint" |
| `readiness_shortfall` | Readiness 60% but confident in work | Approve with conditions |
| `review_failure` | Review failed but issue is acceptable | Approve with explanation |
| `escalation_conflict` | Escalation pending but not blocking | Approve after review |
| `promotion_block` | Promotion blocked but override allowed | Approve for beta only (never prod) |

## What Cannot Be Overridden

- `hard_block` enforcement decisions (prod docs, prod reviews)
- Prod promotion when `allow_override: false`
- Dossier recommendation of `rework`
