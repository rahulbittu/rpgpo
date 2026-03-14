# Runbook: Exception Remediation and Resolution

## Exception Case Lifecycle
1. **Opened** — Exception detected from enforcement, override, block, or escalation
2. **Triaged** — Severity and scope assessed
3. **Assigned** — Owner assigned (operator or team member)
4. **In Remediation** — Active work to resolve
5. **Resolved** — Fix applied
6. **Verified** — Operator confirms the fix works
7. **Closed** — Case archived

## Resolution Outcomes
- **fixed** — Root cause addressed
- **accepted** — Risk accepted, no change
- **deferred** — Postponed to later
- **wont_fix** — Decided not to address

## Block Resolution
For runtime blocks:
1. Identify the block via `GET /api/runtime-blocks`
2. Determine resolution path: fix underlying issue OR request override
3. Resolve via `POST /api/block-resolutions/:blockId/resolve`
4. If override: supply `override_id` — creates consumption record automatically

## Escalation Pause Resolution
For paused executions:
1. Check `GET /api/escalation-pauses` for active pauses
2. Resolve the escalation trigger
3. Resume via `POST /api/escalation-pauses/:id/resume`
