# Runbook: Release Orchestration Operations

## Release Flow
1. Create plan: `POST /api/release-orchestration/plan`
2. Review checkpoints
3. Approve: `POST /api/release-orchestration/:id/approve`
4. Execute: `POST /api/release-orchestration/:id/execute`
5. Verify: `POST /api/release-orchestration/:id/verify`
6. If failed: create rollback plan and execute

## Environment Pipeline
Before creating a release plan, evaluate the promotion pipeline:
`POST /api/environment-pipeline/evaluate/:dossierId/:targetLane`
This checks readiness, docs, exceptions, and required approvals.
