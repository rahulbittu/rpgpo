# Part 24: Enforcement Engine + Override Ledger + Promotion Control

## Overview

Part 24 closes the governance loop by adding enforcement that blocks or gates actions based on accumulated governance state, an override ledger for auditable exceptions, and promotion control that guards lane transitions.

## Architecture

```
Action Request (create_graph, promote_to_prod, release, etc.)
  │
  ├── Enforcement Engine
  │     ├── Checks: policies, budgets, escalation, docs, reviews, readiness
  │     ├── Consults: enforcement rules (9 default)
  │     ├── Returns: allow / warn / soft_block / hard_block / override_required
  │     └── Checks approved overrides to clear soft blocks
  │
  ├── Override Ledger (if blocked)
  │     ├── Request override with type, reason, remediation
  │     ├── Approve / reject by operator
  │     └── Append-only audit trail
  │
  └── Promotion Control (for lane transitions)
        ├── Evaluates enforcement + readiness + policy thresholds
        ├── Returns: allowed / allowed_with_override / blocked
        └── Executes promotion if allowed
```

## Enforcement Levels

| Level | Meaning | Override |
|-------|---------|---------|
| `allow` | No issues found | N/A |
| `warn` | Non-blocking issues | N/A |
| `soft_block` | Blocked, can be overridden | Yes |
| `hard_block` | Blocked, cannot be overridden | No |
| `override_required` | Must have approved override | Yes |

## Promotion Policies

| Lane | Min Readiness | All Reviews | Docs Complete | No Escalations | Override Allowed |
|------|--------------|-------------|---------------|----------------|------------------|
| beta | 40% | No | No | No | Yes |
| prod | 75% | Yes | Yes | Yes | No |
