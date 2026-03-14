# Targeted Refresh

## 8 Area Refresh Plans
| Area | Trigger Actions | Refresh Endpoints | Panel Selectors |
|------|----------------|-------------------|-----------------|
| approvals | approve, reject | /api/approval-workspace | #auditHubPanel |
| escalation | triage, resolve | /api/escalation-inbox | #auditHubPanel |
| overrides | approve, reject, consume | /api/override-ops | #overrideOpsSlot |
| releases | approve, execute, verify | /api/release-orchestration | #releaseWorkspacePanel |
| rollback | create, execute | /api/rollback-control | #releaseWorkspacePanel |
| governance | gate, tuning, block | /api/governance-ops | #govHealthPanel |
| admin | tenant, deploy | /api/tenant-admin | #adminPanel |
| productization | bind, install, review | /api/skill-packs, etc. | #securityPanel |

## Implementation
`gpoAction(btn, url, method, refreshTab)` uses `switchTab()` to re-trigger tab load after success.
