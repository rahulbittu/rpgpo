# Storage Reality (2026-03-15)

## Current System: File-Based JSON
- All state in `04-Dashboard/state/*.json`
- Append-style with rolling caps (e.g., last 500 evidence records)
- Works reliably for single-user local operation
- ~20 state files, ~1MB total

## Key State Files
| File | Purpose | Records |
|------|---------|---------|
| intake-tasks.json | Task submissions | ~10 |
| subtasks.json | Execution records | ~1,967 |
| tasks.json | Queue entries | ~1,267 |
| costs.json | Provider cost tracking | ~800 |
| context/ | Mission-level context | Per-domain |
| workflows.json | Workflow orchestrator | Dynamic |
| notifications.json | In-app notifications | Rolling 2000 |

## Decision: Keep File-Based for Now
- Stable and working
- No migration risk
- Suitable for single-user operation
- Future DB migration can be planned when multi-user is needed

## Future Path (not now)
- PostgreSQL for structured queries
- SQLite as intermediate step
- Migration contracts defined but not executed
