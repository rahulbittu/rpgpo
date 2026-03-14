# Runbook: Policy History Audit

## Viewing Policy History
1. `GET /api/policy-history` — all versions and changes
2. `GET /api/policy-history/:type/:id` — specific target history
3. `GET /api/policy-history/diff/:type/:id` — latest diff (before/after)

## What to Look For
- Unexpected actor (policy changed by system vs operator)
- Rapid version churn (frequent changes suggest instability)
- Missing reasons (changes without documented rationale)
- Tuning-linked changes (verify the tuning recommendation was appropriate)

## Recording Changes
Every policy mutation should call `appendPolicyChangeRecord` to maintain history.
Tuning application engine should link `linked_tuning_id` when applicable.
