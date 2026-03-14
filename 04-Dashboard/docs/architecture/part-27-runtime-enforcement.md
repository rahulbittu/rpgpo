# Part 27: Runtime Enforcement Wiring + Worker Governance Hooks

## Overview

Part 27 connects the enforcement engine to real execution transitions, making governance checks active rather than advisory. Execution graphs and node state transitions now invoke runtime enforcement before proceeding.

## Architecture

```
Execution Graph State Transition
  │
  ├── Execution Hooks (attached per graph)
  │     └── 7 hookable transitions
  │
  ├── Runtime Enforcement (per transition)
  │     ├── Consumes: enforcement engine, autonomy budgets, escalation state
  │     ├── Returns: proceed / proceed_with_warning / block / require_override / pause_for_escalation
  │     └── Records: hook results, block records, governance events
  │
  └── Worker Governance (per worker action)
        ├── Evaluates: runtime enforcement + budget limits + retry rules
        ├── Returns: worker decision with retry allowance
        └── Records: worker decisions
```

## Wired Transitions

| Transition | Where Checked | Effect of Block |
|------------|--------------|-----------------|
| graph_create | createGraph() | Graph not created |
| node_queue | updateGraphStatus(executing) | Graph stays in ready |
| node_start | updateNodeStatus(running) | Node stays in ready |
| node_complete | After completion | Warning only |
| review_complete | After review | Warning only |
| dossier_generate | Before dossier | Warning only |
| promotion_attempt | Before promotion | Blocks promotion |

## Key Design Decisions

1. **Hard blocks prevent state transition** — if `shouldProceed` returns false, the status update returns null
2. **Warnings don't block** — `proceed_with_warning` allows the transition but records the warning
3. **All checks are logged** — every runtime check produces a governance event for audit
4. **Block records persist** — active blocks are surfaced in the governance console
