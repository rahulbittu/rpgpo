# Block Resolution

## Purpose
Explicit resolution records for runtime blocks. Supports resolve, reopen, override-cleared, and escalation pause management.

## Resolution Outcomes
- `resolved` — Issue fixed, block cleared
- `unresolved` — Block persists, needs more work
- `override_cleared` — Soft block cleared by approved override (auto-creates consumption record)

## Escalation Pauses
When runtime governance returns `pause_for_escalation`, a pause record is created. Operator can resume via API/UI.

## API
- `POST /api/block-resolutions/:blockId/resolve` — Resolve a block
- `POST /api/block-resolutions/:blockId/reopen` — Reopen
- `POST /api/escalation-pauses/:id/resume` — Resume paused execution
