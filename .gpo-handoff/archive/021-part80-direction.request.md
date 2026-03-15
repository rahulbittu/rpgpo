Generate the next GPO/RPGPO architecture implementation prompt.

Important:
- Return a prompt only, not a design answer.
- Output exactly one paste-ready prompt.

Current baseline:
- Parts 19-79 being implemented. 133+ TS modules, ~920 API routes, ~625+ types, 218+ tests.
- Full pipeline: submit → auto-deliberate → auto-approve → execute → report
- Persistent learning, conversational refinement, task chaining, smart templates, recurring scheduler, multi-engine compound workflows, state backup/export
- Dashboard with operator.js/css, COS brief, 12 templates, inline reports, proactive suggestions

Gap:
GPO needs an API gateway and webhook system so it can integrate with external services. Currently everything is self-contained. There's no way to trigger GPO tasks from external events (Slack message, email, GitHub PR, calendar event) or send results to external destinations (Slack channel, email, webhook). The system needs a plugin-style integration framework.

Requested part:
Part 80: Integration Gateway + Webhooks — Build an inbound/outbound webhook system with event routing, external trigger support, and result delivery to external channels.

Output format:
Return exactly one code block containing the full prompt. No intro, no explanation, no notes.
