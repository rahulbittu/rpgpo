Generate the next GPO/RPGPO architecture implementation prompt.

Important:
- Return a prompt only, not a design answer.
- Output exactly one paste-ready prompt.

Current baseline:
- Parts 19-69 complete. 92 TS modules, ~829 API routes, ~470+ types, 199 tests passing.
- Part 67: Structured output pipeline (schema → prompt → parse → merge → evidence)
- Part 68: Board/worker structured integration, provider capabilities, retry with backoff
- Part 69: Observability — in-memory metrics with percentiles, cost tracking with provider pricing, EWMA provider learning with circuit breaker, evidence TTL/cleanup, parse/error spike alerting, 11 new API routes, Structured I/O Health dashboard panel

Gap:
The system has comprehensive structured output infrastructure but the actual AI execution is still largely serial. The worker executes subtasks one at a time. There's no parallel execution of independent subtasks from the execution graph. The execution graph (created in deliberation) has dependency info (depends_on) but the runtime doesn't use it for parallelism. There's no resource-aware scheduling — no limit on concurrent AI calls, no queueing when at capacity. The existing autonomy budgets track decisions but don't control concurrency. There's no backpressure when providers are overwhelmed.

Requested part:
Part 70: Parallel Execution Engine + Resource-Aware Scheduling + Backpressure — Build a concurrent subtask executor that respects the DAG dependencies from execution graphs, adds resource-aware scheduling with provider concurrency limits, and implements backpressure when providers are at capacity.

Output format:
Return exactly one code block containing the full prompt. No intro, no explanation, no notes.
