# Environment Promotion Pipeline

## Pipeline Steps
Each promotion evaluates: promotion control, approvals, exceptions, documentation, policy, provider stability.

## Statuses
draft → awaiting_approval → approved → executing → verified → completed / blocked / rolled_back

## API
- `POST /api/environment-pipeline/evaluate/:dossierId/:targetLane` — Evaluate
- `GET /api/environment-pipeline/project/:projectId` — Project pipeline
