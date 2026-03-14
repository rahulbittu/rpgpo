# Runbook: Escalation Inbox Handling

## Triage Process
1. Check `GET /api/escalation-inbox/new` for new items
2. Triage: assess severity and assign owner
3. In-review: investigate root cause
4. Resolve or dismiss with notes

## Resolution Actions
- approve_and_continue — clear the escalation, resume work
- reject_and_stop — stop the execution path
- request_more_evidence — block until evidence provided
- reopen_board — send back to Board of AI
- delegate — route to delegated approver

## Thread History
Each escalation item maintains a thread of all actions taken, visible via `GET /api/escalation-threads/:id`.
