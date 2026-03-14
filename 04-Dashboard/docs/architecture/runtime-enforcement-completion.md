# Runtime Enforcement Completion

## 14 Enforcement Paths
| State | Count | Examples |
|-------|-------|---------|
| Fully enforced | 6 | graph_create, node_start, graph_executing, approval, gate, CoS |
| Partially enforced | 5 | override, escalation, release, rollback, promotion |
| Advisory only | 3 | worker pre-check, entitlement gating, secret rotation |

## API
- `GET /api/runtime-completion` — Full report
