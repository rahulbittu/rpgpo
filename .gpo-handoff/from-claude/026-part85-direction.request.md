Generate the next GPO/RPGPO architecture implementation prompt.

Important:
- Return a prompt only, not a design answer.
- Output exactly one paste-ready prompt.

Current baseline:
- Parts 19-84 being implemented. 148+ TS modules, ~985 API routes, ~695+ types, 80+ commits this session.
- Enterprise features: structured pipeline, parallel execution, workflow orchestrator, TopRanker, Mission Control, persistent learning, conversations, chaining, templates, scheduler, compound workflows, backup, webhooks, analytics, health checks, RBAC, API docs.

Gap:
GPO needs performance optimization and caching to handle the growing number of modules and API routes efficiently. Currently every API call reads from disk. The system needs an in-memory cache layer, lazy module loading, and response caching for frequently accessed endpoints.

Requested part:
Part 85: Performance Optimization + Caching Layer — Add in-memory caching for state files, lazy module loading, response caching with TTL for read-heavy endpoints, and request batching for the home page data assembly.

Output format:
Return exactly one code block containing the full prompt. No intro, no explanation, no notes.
