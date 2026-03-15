Generate the next GPO/RPGPO architecture implementation prompt.

Important:
- Return a prompt only, not a design answer.
- Output exactly one paste-ready prompt.

Current baseline:
- Parts 19-71 complete. 109+ TS modules, ~849 API routes, ~500+ types, 249 tests passing.
- Part 67: Structured output pipeline (schema → prompt → parse → merge → evidence)
- Part 68: Board/worker structured integration, provider capabilities, retry with backoff
- Part 69: Observability — metrics, cost tracking, EWMA provider learning, circuit breaker, evidence TTL, alerting
- Part 70: Parallel execution engine — DAG runner, priority work queue, provider capacity semaphores, backpressure, recovery
- Part 71: End-to-end workflow orchestration — 14-stage state machine (intake → released), autopilot controller with daily caps and gate policies, scheduler bridge, approval gate adapter, release trigger, evidence trail per transition

Gap:
The system is feature-complete for core operations but the TopRanker engine (the flagship RPGPO mission) hasn't been tested end-to-end through the new pipeline. The structured output contracts for TopRanker-specific deliverables (ranked leaderboard entries, business scores, review aggregations) aren't defined. The TopRanker source repo (02-Projects/TopRanker/source-repo) has its own build/deploy pipeline that isn't connected to the GPO workflow orchestrator. There's no TopRanker-specific engine template with its unique domain knowledge (Expo/React Native + Express + PostgreSQL stack, community ranking algorithms, business verification flow).

Requested part:
Part 72: TopRanker Engine Deep Integration — Define TopRanker-specific structured output contracts, create a TopRanker engine template with domain-specific prompts and deliverable schemas, connect the TopRanker source repo build pipeline to the workflow orchestrator, and run an end-to-end test of the full pipeline (intake → deliverable → release) for a TopRanker task.

Output format:
Return exactly one code block containing the full prompt. No intro, no explanation, no notes.
