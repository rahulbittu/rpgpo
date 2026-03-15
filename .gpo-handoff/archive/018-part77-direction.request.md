Generate the next GPO/RPGPO architecture implementation prompt.

Important:
- Return a prompt only, not a design answer.
- Output exactly one paste-ready prompt.

Current baseline:
- Parts 19-76 being implemented. 122+ TS modules, ~880 API routes, ~575+ types, 218+ tests.
- Part 75: Persistent learning store with provider perf EWMA, knowledge base with search.
- Part 76 (in progress): Conversational task refinement + task chaining with SSE streaming.
- Full zero-click research pipeline working with real output from Perplexity/OpenAI/Gemini.

Gap:
GPO needs a smart template system that goes beyond static task templates. Currently the 12 templates are hardcoded in operator.js. There's no way to create custom templates, share templates across sessions, or have the system learn which templates produce the best results. The system also needs recurring task scheduling — "run this news digest every morning" or "check job market every Monday."

Requested part:
Part 77: Smart Templates + Recurring Task Scheduler — Build a dynamic template system with user-created templates, template performance tracking, and a recurring task scheduler that can run tasks on cron-like schedules with automatic execution.

Output format:
Return exactly one code block containing the full prompt. No intro, no explanation, no notes.
