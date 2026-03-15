Generate the next GPO/RPGPO architecture implementation prompt.

Important:
- Return a prompt only, not a design answer.
- Output exactly one paste-ready prompt.

Current baseline:
- Parts 19-75 being implemented. 120+ TS modules, ~870 API routes, ~560+ types, 211+ tests.
- Part 75 (in progress): Persistent learning store, provider perf learning, prompt pattern learning, operator decision patterns, knowledge base, cross-session persistence.
- Full pipeline working: submit → auto-deliberate → auto-approve → execute → report with context injection and subtask output chaining.
- Dashboard with operator.js/css, COS brief, 12 templates, inline reports, proactive suggestions.

Gap:
GPO needs a real-time collaboration layer where the operator can have a conversation with the AI about a task while it's executing. Currently tasks are fire-and-forget — submit and wait. There's no way to refine a task mid-execution, ask follow-up questions about results, or have the AI explain its reasoning. The system also lacks a way to chain tasks — where the output of one task feeds into the next automatically.

Requested part:
Part 76: Conversational Task Refinement + Task Chaining — Add a real-time conversation interface where the operator can discuss, refine, and redirect tasks during execution. Add task chaining where completed task outputs automatically feed into follow-up tasks.

Output format:
Return exactly one code block containing the full prompt. No intro, no explanation, no notes.
