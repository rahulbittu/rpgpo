Generate the next GPO/RPGPO architecture implementation prompt.

Important:
- Return a prompt only, not a design answer.
- Output exactly one paste-ready prompt.

Current baseline:
- Parts 19-72 complete. 112+ TS modules, ~853 API routes, ~510+ types, 270 tests passing.
- Part 67-68: Structured output pipeline + board/worker integration
- Part 69: Observability, metrics, cost tracking, provider learning, alerting
- Part 70: Parallel execution engine with DAG runner, work queue, capacity, backpressure
- Part 71: Workflow orchestrator with 14-stage state machine, autopilot, approval gates, release trigger
- Part 72: TopRanker engine with 4 contracts, 3 templates, repo adapter, dry-run build

Gap:
The system is architecturally complete but there's no unified operator experience for monitoring and controlling everything. The dashboard has individual panels scattered across tabs but no single "Mission Control" view that shows the operator the overall system health: active workflows, provider status, scheduler state, alerts, recent deliverables, and pending approvals — all in one place. The operator has to click through multiple tabs to understand what's happening. There's also no notification system that proactively informs the operator when something needs attention (approval needed, alert fired, workflow stuck, circuit breaker opened).

Requested part:
Part 73: Mission Control Dashboard + Operator Notifications — Build a unified Mission Control view that aggregates all critical system state (workflows, providers, scheduler, alerts, deliverables, approvals) into a single operator-facing panel with real-time polling, and add an in-app notification system with badge counts and toast notifications for actionable events.

Output format:
Return exactly one code block containing the full prompt. No intro, no explanation, no notes.
