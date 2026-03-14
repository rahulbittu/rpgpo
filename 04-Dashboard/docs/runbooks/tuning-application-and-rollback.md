# Runbook: Tuning Application and Rollback

## Preview Before Apply

Always preview a tuning recommendation before applying:
1. `POST /api/policy-tuning/recommendations/:id/preview-apply`
2. Review the `before_state` and `after_state` diff
3. Check the `change_summary` and `risk`

## Applying Tuning

1. Ensure the recommendation is approved
2. Call apply via API or UI
3. The engine captures before state, executes the mutation, captures after state
4. A rollback record is automatically created

## Rollback

If the applied change causes issues:
1. Find the application in `GET /api/policy-tuning/applications`
2. Use the `rollback_id` from the application result
3. `POST /api/policy-tuning/applications/:rollback_id/rollback`
4. The before state is restored

## What Can Be Rolled Back

- Operator policy changes (policy overrides created by tuning)
- Escalation rule additions
- Other targets are logged but may require manual reversal

## Audit Trail

Every preview, application, and rollback is recorded with timestamps, approvers, and evidence links.
