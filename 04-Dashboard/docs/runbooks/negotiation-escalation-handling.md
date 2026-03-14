# Runbook: Negotiation Escalation Handling

## When Negotiation Escalates
Negotiation escalates when:
- Proposals are too close in confidence (gap < 20)
- Protocol has `escalation_on_deadlock: true`
- Consensus is `blocked`

## Escalation Paths
| Outcome | Action |
|---------|--------|
| escalate_board | Reopen Board of AI for fresh deliberation |
| escalate_operator | Surface in escalation inbox for human decision |
| unresolved | Record dissent, surface in governance views |

## Dissent Preservation
All disagreements are permanently recorded. They cannot be deleted.
Check `GET /api/dissent-records/:sessionId` for full history.
