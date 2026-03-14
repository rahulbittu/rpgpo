# Mutation Refresh

## Purpose
After operator actions, the relevant UI panels must visibly refresh.

## Refresh Plans
| Area | APIs Refreshed |
|------|---------------|
| approvals | /api/approval-workspace |
| overrides | /api/override-ops, /api/overrides/pending |
| escalation | /api/escalation-inbox |
| releases | /api/release-workspace-summary, /api/release-orchestration |
| governance | /api/governance-ops, /api/runtime-enforcement, /api/governance-health |

## Implementation
Actions use `location.reload()` for full page refresh. Future: targeted panel re-fetch.
