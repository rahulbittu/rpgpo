# GPO Operator vs Admin/Debug Boundary

## Operator Surfaces (Primary Nav)

Everything an operator needs to use GPO daily:

| Surface | Why Operator-Facing |
|---|---|
| Home | Attention, completions, next actions |
| Work | Submit tasks, review results, provide feedback |
| Approvals | Human decisions on pending work |
| Engines | Understand GPO's capabilities |
| Activity | See what happened, when, and why |
| Settings | Configure preferences and providers |

## Admin/Debug Surfaces (Hidden or Secondary)

Internal system mechanics that don't belong in primary operator flow:

| Surface | Why Not Operator-Facing | Where It Goes |
|---|---|---|
| Operations (Board run, loops) | System orchestration, not daily use | Admin section in Settings |
| Worker queue raw view | Internal process state | Dev tools / hidden |
| Builder diagnostics | Code execution internals | Dev tools / hidden |
| Provider raw health | API connection details | Engines (simplified) |
| Memory viewer (raw) | Internal behavior data | Settings (simplified) |
| Cost ledger raw dump | Individual API call records | Settings > Budget |

## Rule

If a surface requires understanding GPO's internal architecture to use it, it is not an operator surface.

Operator surfaces answer: "What should I do?" or "What happened?"
Admin surfaces answer: "How does the system work internally?"
