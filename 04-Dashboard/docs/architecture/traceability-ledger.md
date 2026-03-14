# Traceability Ledger

## Purpose
Append-only audit trail of all material system actions. Immutable record of what happened, when, and why.

## Entry Fields
- actor, action, target_type, target_id
- scope (lane, domain, project, isolation)
- detail, linked_artifact_ids
- created_at (immutable)

## Example Actions
- artifact_registered, promotion_decided, override_consumed
- tuning_applied, rollback_executed, pattern_approved
- provider_incident_recorded, block_resolved
- enforcement_evaluated, escalation_triggered

## API
- `GET /api/traceability-ledger` — All entries
- `GET /api/traceability-ledger/domain/:d` — By domain
- `GET /api/traceability-ledger/:entryId` — By entry
