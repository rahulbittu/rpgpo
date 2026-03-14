# Runbook: Approval Workspace Operations

## Daily Review
1. Check `GET /api/approval-workspace/pending` for items needing attention
2. Check `GET /api/approval-workspace/overdue` for SLA violations
3. Review each item: what, why, evidence, blockers
4. Approve/reject/request evidence

## SLA Management
Default SLA is 24 hours. Overdue items are auto-flagged. Address overdue items first.

## Delegation
Create delegation rules for common approval types. Delegate does not remove operator visibility.
