# Rollback Control

## Triggers
failed_verification, post_release_block, provider_incident, policy_violation, manual_request

## Lifecycle
ready → executing → completed / failed

## Audit
Rollback execution appends traceability ledger entry and marks release as rolled_back.

## API
- `POST /api/rollback-control/plan` — Create plan
- `POST /api/rollback-control/:id/execute` — Execute rollback
