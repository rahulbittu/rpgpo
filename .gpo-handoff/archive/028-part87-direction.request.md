Generate the next GPO/RPGPO architecture implementation prompt.

Important:
- Return a prompt only, not a design answer.
- Output exactly one paste-ready prompt.

Current baseline:
- Parts 19-86 complete. 152+ TS modules, ~1000+ API routes, ~720+ types, 84+ commits.
- Full enterprise GPO with 20 architecture parts: structured pipeline, parallel execution, workflow orchestrator, 17 engines, Mission Control, persistent learning, conversations, chaining, templates, scheduler, compound workflows, backup, webhooks, analytics, health checks, RBAC, API docs, caching, premium CSS.

Gap:
GPO needs a proper error tracking and recovery system. When things go wrong (provider timeouts, malformed responses, quota exceeded), the errors are logged but not tracked systematically. There's no error rate dashboard, no automatic retry for transient failures, and no way to see the most common errors across all tasks. The system needs centralized error tracking with categorization, trending, and automated recovery suggestions.

Requested part:
Part 87: Error Tracking + Recovery System — Build centralized error tracking with categorization, trending, automated retry for transient failures, and recovery suggestions.

Output format:
Return exactly one code block containing the full prompt. No intro, no explanation, no notes.
