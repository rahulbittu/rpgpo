# Delegation Manager

## Purpose
Optional routing of approvals/escalations to delegated approvers.

## Rules
- Scoped by approval_type + scope_level + scope_id + lane
- Expiry support
- Fallback to operator

## API
- `GET /api/delegation-rules` — All rules
- `POST /api/delegation-rules` — Create rule
- `POST /api/delegation-rules/:id/toggle` — Enable/disable
