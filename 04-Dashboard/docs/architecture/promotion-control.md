# Promotion Control

## Purpose

Guards dev→beta and beta→prod lane transitions using enforcement engine, readiness scores, promotion policies, and overrides.

## Promotion Policies

### Beta (dev → beta)
- Min readiness: 40%
- Reviews: not required to all pass
- Documentation: not required
- Open escalations: allowed
- Override: allowed

### Prod (beta → prod)
- Min readiness: 75%
- Reviews: all must pass
- Documentation: complete
- Open escalations: not allowed
- Override: NOT allowed (hard enforcement)

## Decision Results

| Result | Meaning |
|--------|---------|
| `allowed` | All checks pass, can promote |
| `allowed_with_override` | Blocked but approved overrides clear it |
| `blocked` | Cannot promote (hard block or no override) |

## Flow

1. `evaluatePromotion(dossierId, targetLane)` — checks enforcement + readiness + policy
2. `executePromotion(dossierId, targetLane)` — evaluates, then promotes if allowed
