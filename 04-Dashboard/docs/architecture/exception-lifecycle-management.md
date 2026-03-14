# Exception Lifecycle Management

## Purpose
Unifies lifecycle for overrides, runtime blocks, escalation pauses, and enforcement decisions into trackable exception cases.

## Lifecycle Stages
opened → triaged → assigned → approved → rejected → in_remediation → resolved → verified → expired → consumed → closed

## Exception Case Fields
- Source type/ID, title, severity, stage
- Owner, due date
- Linked override IDs, block IDs, escalation IDs
- Graph/node/dossier/domain/project context
- Remediation notes, resolution outcome

## API
- `GET /api/exception-cases` — All cases
- `POST /api/exception-cases` — Create case
- `POST /api/exception-cases/:id/assign` — Assign owner
- `POST /api/exception-cases/:id/update-status` — Update lifecycle stage
