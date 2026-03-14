# Operator Actions

## 22 Defined Actions
| Area | Actions | Visible |
|------|---------|---------|
| approvals | approve, reject, request evidence | 3/3 |
| overrides | approve, reject, consume | 2/3 |
| escalation | triage, resolve | 0/2 |
| releases | approve, execute, verify, rollback | 0/4 |
| governance | approve gate, resolve block, approve tuning | 2/3 |
| productization | bind pack, instantiate template, install, review | 0/4 |
| audit | build package, export | 0/2 |

## API
- `GET /api/operator-actions` — All actions with visibility status
