# Part 22: Operator Governance Architecture

## Overview

Part 22 introduces four governance layers that control how GPO operates on behalf of the operator:

1. **Operator Preference Policies** — What style and strictness the operator prefers
2. **Autonomy Budgets** — What the system can do without asking
3. **Escalation Governance** — When and how to escalate to the operator
4. **Documentation Governance** — What docs are required and when they block

## Layer Diagram

```
Operator
  │
  ├── Preference Policies (execution_style, review_strictness, ...)
  │     └── Scoped: project > engine > operator > global defaults
  │
  ├── Autonomy Budgets (allowed_actions, max_retries, cost limits)
  │     └── Lane-aware: dev permissive, beta moderate, prod strict
  │
  ├── Escalation Rules (trigger → action)
  │     └── 9 triggers × 6 actions, threshold-based
  │
  └── Documentation Requirements (scope_type → required_artifacts)
        └── Lane-aware blocking: warn → soft_block → hard_block
```

## Integration Points

- **Chief of Staff** resolves policies, budgets, escalation, and docs before execution
- **Execution Graphs** carry governance context
- **Promotion Dossiers** include governance compliance
- **Memory Viewer** exposes all governance artifacts for inspection

## Precedence Rules

For policies and budgets, scope precedence is always: project > engine > operator > global defaults. This means a project-level policy overrides an engine-level policy for the same area.

## Lane Behavior

| Lane | Autonomy | Documentation | Escalation |
|------|----------|---------------|------------|
| dev  | Permissive — auto-execute green, auto-learn | Warn on missing | Standard triggers |
| beta | Moderate — green only, no auto-promote | Soft-block on missing | All triggers active |
| prod | Strict — nothing auto, everything approved | Hard-block on missing | All triggers + board recheck |
