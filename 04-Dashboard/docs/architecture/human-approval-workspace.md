# Human Approval Workspace

## Queues
pending, approved, rejected, overdue, delegated, blocked

## Approval Sources
gate, promotion, override, tuning, exception, policy_change

## SLA
Default 24 hours. Auto-marks overdue when exceeded.

## API
- `GET /api/approval-workspace` — Full workspace with summary
- `POST /api/approval-workspace/:id/approve` — Approve
- `POST /api/approval-workspace/:id/reject` — Reject
- `POST /api/approval-workspace/:id/request-evidence` — Block for evidence
