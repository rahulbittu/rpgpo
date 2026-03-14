# Escalation Inbox

## Item Sources
runtime pauses, exceptions, blocked promotions, policy conflicts, provider instability, isolation violations

## Lifecycle
new → triaged → in_review → delegated → resolved / dismissed

## Threads
Each item has a thread of actions with actor, action, notes, timestamp.

## API
- `GET /api/escalation-inbox` — All items
- `POST /api/escalation-inbox/:id/triage` — Triage
- `POST /api/escalation-inbox/:id/resolve` — Resolve
- `POST /api/escalation-inbox/:id/delegate` — Delegate
- `GET /api/escalation-threads/:id` — Thread history
