Generate the next GPO/RPGPO architecture implementation prompt.

Important:
- Return a prompt only, not a design answer.
- Output exactly one paste-ready prompt.

Current baseline:
- Parts 19-82 complete. 142+ TS modules, ~960 API routes, ~670+ types.
- Full enterprise features: structured output pipeline, parallel execution, workflow orchestrator, TopRanker engine, Mission Control, persistent learning, conversations, task chaining, smart templates, recurring scheduler, compound workflows, state backup, integration gateway, analytics dashboard, self-healing health checks, onboarding wizard.

Gap:
GPO needs a proper permissions and role-based access control (RBAC) system for when it eventually supports multiple users. Currently everything runs as a single operator. The system needs user roles (admin, operator, viewer), API key scoping, audit trail for who did what, and a way to restrict access to certain engines or data. This is foundational for enterprise readiness.

Requested part:
Part 83: Role-Based Access Control + API Key Management — Add user roles, API key scoping with permissions, action audit trail, and engine-level access control for enterprise multi-user readiness.

Output format:
Return exactly one code block containing the full prompt. No intro, no explanation, no notes.
