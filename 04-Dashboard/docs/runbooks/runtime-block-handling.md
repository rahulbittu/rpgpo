# Runbook: Runtime Block Handling

## When a Runtime Block Occurs

A runtime block means a state transition was prevented by enforcement checks. The execution graph or node could not proceed.

## Identifying Blocks

1. Check `GET /api/runtime-blocks` for active blocks
2. Each block shows: transition, reason, enforcement level, lane, domain
3. Blocks are visible in the Governance tab runtime panel

## Resolving Blocks

| Enforcement Level | Resolution |
|-------------------|-----------|
| hard_block | Fix the underlying issue (missing docs, failed reviews) |
| soft_block | Request and get an override approved |
| require_override | Request override via `POST /api/overrides/request` |
| pause_for_escalation | Resolve the escalation event |

## After Resolution

Once the underlying issue is fixed or an override is approved, retry the transition. The runtime check will re-evaluate and should return `proceed`.

## Monitoring

- Governance tab shows runtime summary with active block count
- Governance ops cards include runtime block counts
- Memory viewer exposes active blocks as artifacts
