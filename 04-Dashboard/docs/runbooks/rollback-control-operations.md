# Runbook: Rollback Control Operations

## When to Rollback
- Verification fails after release execution
- Post-release governance block detected
- Provider incident during/after release
- Policy violation discovered
- Operator requests manual rollback

## Rollback Flow
1. Create plan: `POST /api/rollback-control/plan`
2. Execute: `POST /api/rollback-control/:id/execute`
3. System marks release execution as rolled_back
4. Traceability ledger entry appended
5. Verify rollback state
