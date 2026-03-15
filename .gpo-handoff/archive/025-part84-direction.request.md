Generate the next GPO/RPGPO architecture implementation prompt.

Important:
- Return a prompt only, not a design answer.
- Output exactly one paste-ready prompt.

Current baseline:
- Parts 19-83 being implemented. 145+ TS modules, ~970 API routes, ~680+ types.
- Full enterprise: structured pipeline, parallel execution, workflow orchestrator, TopRanker, Mission Control, persistent learning, conversations, chaining, templates, scheduler, compound workflows, backup, webhooks, analytics, health checks, RBAC.

Gap:
GPO needs a proper documentation system that auto-generates API docs from the server routes, creates a searchable knowledge base from all the ADRs/runbooks/contracts, and provides an interactive API explorer in the dashboard. Currently docs are scattered markdown files with no search or navigation.

Requested part:
Part 84: Auto-Generated API Docs + Knowledge Hub — Build an auto-documentation system that scans server.js for routes and generates interactive API docs, plus a searchable knowledge hub that indexes all docs.

Output format:
Return exactly one code block containing the full prompt. No intro, no explanation, no notes.
