# Policy History

## Purpose
Version and track every change to governance policies.

## Tracked Policy Types
operator_policy, autonomy_budget, escalation_rule, documentation_requirement, promotion_policy, enforcement_rule, isolation_policy, governance_boundary

## Change Records
Each change captures: before_state, after_state, actor, reason, linked tuning ID, timestamp.

## Versions
Sequential version numbers per target. Previous versions marked as superseded.

## API
- `GET /api/policy-history` — All versions + changes
- `GET /api/policy-history/:type/:id` — History for specific target
- `GET /api/policy-history/diff/:type/:id` — Latest diff
