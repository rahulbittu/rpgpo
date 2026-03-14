# Autonomy Budgets

## Purpose

Autonomy budgets define what GPO can do without operator intervention, scoped by lane and domain/project.

## Lane Defaults

### Dev Lane
- Auto-execute green subtasks
- Auto-learn from evidence
- 3 retries, $10/day limit
- Blocked: red execution, prod promotion

### Beta Lane
- Auto-execute green only
- No auto-promotion
- 2 retries, $5/day limit
- Blocked: red, yellow without approval

### Prod Lane
- Nothing auto-executes
- 1 retry, $2/day limit
- Everything requires approval

## Controls

| Control | Dev | Beta | Prod |
|---------|-----|------|------|
| `auto_execute_green` | true | true | false |
| `auto_execute_yellow` | false | false | false |
| `auto_promote_experimental` | false | false | false |
| `auto_learn_from_evidence` | true | true | false |
| `max_retries` | 3 | 2 | 1 |

## API

- `GET /api/autonomy-budgets` — All budgets
- `POST /api/autonomy-budgets` — Create budget
- `isActionAllowed(action, lane, domain?, projectId?)` — Check permission
