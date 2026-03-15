# ADR-0070: Parallel Execution Engine + Resource-Aware Scheduling + Backpressure

**Status:** Accepted
**Date:** 2026-03-14
**Part:** 70

## Context

The worker executed subtasks serially despite execution graphs containing dependency information (depends_on). No parallel execution of independent subtasks. No resource management, queueing, or backpressure.

## Decision

Build an in-process parallel execution engine with:

1. **DAG Runner** — Converts execution graphs to queue items with dependency tracking. Nodes become ready when all deps complete.
2. **Priority Work Queue** — JSON-persisted queue with priority ordering (critical > high > normal > low), lease management, and dead letter queue.
3. **Provider Capacity** — Per-provider, per-tenant, per-project concurrency semaphores with dynamic limits from backpressure signals.
4. **Backpressure** — Integrates circuit breaker state and error rates to reduce dynamic concurrency limits.
5. **Recovery** — Lease expiration sweep, crash recovery via persisted state, graceful drain on shutdown.
6. **Feature-flagged** — Default `enabled: false` and `globalMaxConcurrent: 1` preserves serial behavior.

## Architecture

```
Execution Graph → DAG Runner → Work Queue → Scheduler Loop → Provider Capacity → Executor
                                                ↑                    ↑
                                          Backpressure ←── Provider Learning (Part 69)
```

## New Modules (9)

| Module | Purpose |
|--------|---------|
| `scheduler/scheduler.ts` | Orchestrator loop (250ms tick) |
| `scheduler/work-queue.ts` | Priority queue with persistence |
| `scheduler/provider-capacity.ts` | Concurrency semaphores |
| `scheduler/backpressure.ts` | Dynamic throttling |
| `scheduler/dag-runner.ts` | Graph → queue items + ready set |
| `scheduler/recovery.ts` | Lease recovery + drain |
| `scheduler/ids.ts` | Deterministic queue item IDs |
| `state/scheduler-store.ts` | Config + state persistence |

## API Routes (10)

| Route | Method | Purpose |
|-------|--------|---------|
| `/runtime/scheduler` | GET | Scheduler state snapshot |
| `/runtime/scheduler/pause` | POST | Pause dequeue |
| `/runtime/scheduler/resume` | POST | Resume dequeue |
| `/runtime/scheduler/config` | POST | Update config |
| `/runtime/queue` | GET | Queue stats + optional snapshot |
| `/runtime/queue/reprioritize` | POST | Change item priority |
| `/runtime/queue/:itemId` | DELETE | Cancel item |
| `/runtime/providers/:provider/limits` | POST | Set provider concurrency |
| `/runtime/runs/:runId/progress` | GET | Run progress |
| `/runtime/runs/:runId/cancel` | POST | Cancel run |

## Consequences

### Positive
- Independent subtasks execute in parallel
- Provider capacity managed with dynamic backpressure
- Queue persistence enables crash recovery
- Feature flag preserves serial behavior by default

### Negative
- Complexity: 9 new modules with interacting state
- In-process scheduler; no external broker (by design)
- JSON file persistence has I/O overhead at high throughput
