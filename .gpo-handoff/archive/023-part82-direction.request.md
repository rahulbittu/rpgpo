Generate the next GPO/RPGPO architecture implementation prompt.

Important:
- Return a prompt only, not a design answer.
- Output exactly one paste-ready prompt.

Current baseline:
- Parts 19-81 complete. 140+ TS modules, ~950 API routes, ~660+ types.
- Parts 67-81 delivered: structured output pipeline, board/worker integration, observability, parallel execution, workflow orchestrator, TopRanker engine, Mission Control, acceptance harness, persistent learning, conversations, task chaining, smart templates, recurring scheduler, compound workflows, state backup, integration gateway, analytics dashboard.
- Full zero-click pipeline: submit → auto-deliberate → auto-approve → execute → report with context injection, subtask output chaining, and provider learning.

Gap:
GPO needs a proper onboarding experience for new users and a self-healing system that can detect and fix common issues automatically. Currently if something breaks (stuck tasks, stale data, provider outages), the operator has to manually investigate and fix it. There's no automated health check that runs on startup, no self-repair for common issues, and no guided setup wizard for new installations.

Requested part:
Part 82: Self-Healing System + Onboarding Wizard — Build automated health checks that run on startup and periodically, self-repair for common issues (stuck tasks, stale data, provider connectivity), and a first-run onboarding wizard that guides setup of API keys, mission statements, and initial templates.

Output format:
Return exactly one code block containing the full prompt. No intro, no explanation, no notes.
