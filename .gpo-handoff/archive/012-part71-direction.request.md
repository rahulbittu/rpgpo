Generate the next GPO/RPGPO architecture implementation prompt.

Important:
- Return a prompt only, not a design answer.
- Output exactly one paste-ready prompt.

Current baseline:
- Parts 19-70 complete. 100+ TS modules, ~839 API routes, ~485+ types, 224 tests passing.
- Part 67: Structured output pipeline (schema → prompt → parse → merge → evidence)
- Part 68: Board/worker structured integration, provider capabilities, retry with backoff
- Part 69: Observability — metrics, cost tracking, EWMA provider learning, circuit breaker, evidence TTL, alerting
- Part 70: Parallel execution engine — DAG runner, priority work queue, provider capacity semaphores, backpressure, recovery, feature-flagged (default serial)

Gap:
The system is architecturally complete for core GPO operations but lacks end-to-end workflow orchestration that ties everything together. The scheduler exists but isn't fully integrated with the intake → deliberation → board → execution → deliverable → release pipeline. There's no workflow state machine that transitions tasks through all stages automatically. The approval gates exist but aren't wired into the scheduler. The release pipeline (Parts 62-64) isn't triggered automatically on deliverable approval. There's no "autopilot" mode where the GPO can run semi-autonomously with governance guardrails.

Requested part:
Part 71: End-to-End Workflow Orchestration + Autopilot Mode — Wire all stages (intake → deliberate → plan → schedule → execute → merge → validate → approve → release) into a unified workflow orchestrator with an autopilot toggle, approval gate integration with the scheduler, and automatic release triggering.

Output format:
Return exactly one code block containing the full prompt. No intro, no explanation, no notes.
