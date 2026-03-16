# Privacy and Learning Boundaries

## What GPO Learns

GPO captures operator behavior events to derive preferences and improve execution over time. All learning is:
- **Local** — no data leaves the operator's machine
- **Inspectable** — all signals viewable via `/api/behavior/signals`
- **Deletable** — operator can suppress or remove any signal
- **Traceable** — every signal links to its source events
- **Conservative** — weak signals remain advisory, not active

## What GPO Does NOT Learn

- Private personal data unrelated to task execution
- Sensitive health/financial details beyond what's in task requests
- Browsing history or non-GPO activity
- Keyboard/mouse behavior patterns
- Emotional state inference
- Social relationship mapping

## Data Retention

| Data Type | Retention | Deletable |
|---|---|---|
| Behavior events (JSONL) | Indefinite (append-only) | Yes, operator can clear |
| Derived signals (JSON) | Re-derived on demand | Yes, operator can suppress |
| Operator profile | Until operator updates | Yes, operator controls |
| Task history | Until store limit | Managed by intake store |
| Cost logs | Indefinite | Yes |

## Operator Controls

- View all learned signals: `/api/behavior/signals`
- View event log: `/api/behavior/events`
- Trigger re-derivation: `POST /api/behavior/derive`
- Delete event log: Delete `artifacts/behavior/operator-events.jsonl`
- Reset signals: Delete `artifacts/behavior/operator-signals.json`

## Design Principle

Memory should reduce friction, not create false certainty. If the system isn't sure about a preference, it asks rather than guesses wrong.
