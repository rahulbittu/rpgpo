# Release Orchestration

## Lifecycle
draft → approved → executing → verifying → completed / halted / rolled_back

## Checkpoints
Each plan has required checkpoints: readiness, reviews, documentation, promotion approval.

## API
- `POST /api/release-orchestration/plan` — Create plan
- `POST /api/release-orchestration/:id/approve` — Approve
- `POST /api/release-orchestration/:id/execute` — Execute
- `POST /api/release-orchestration/:id/verify` — Verify
