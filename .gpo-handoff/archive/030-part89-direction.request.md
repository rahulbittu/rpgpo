Generate the next GPO/RPGPO architecture implementation prompt.

Important:
- Return a prompt only, not a design answer.
- Output exactly one paste-ready prompt.

Current baseline:
- Parts 19-88 complete. 157+ TS modules, ~1020 API routes, ~750+ types, 88 commits this session.
- 22 architecture parts: structured pipeline, parallel execution, workflow orchestrator, TopRanker, Mission Control, persistent learning, conversations, chaining, templates, scheduler, compound workflows, backup, webhooks, analytics, health checks, RBAC, API docs, caching, CSS polish, error tracking, context enrichment.

Requested part:
Part 89: Task Quality Scoring + Feedback Loop — Add quality scoring for completed tasks based on output completeness, citation density, actionability, and operator satisfaction. Feed scores back into provider learning and template ranking.

Output format:
Return exactly one code block containing the full prompt. No intro, no explanation, no notes.
