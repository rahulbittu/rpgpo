Generate the next GPO/RPGPO architecture implementation prompt.

Important:
- Return a prompt only, not a design answer.
- Output exactly one paste-ready prompt.

Current baseline:
- Parts 19-77 being implemented. 125+ TS modules, ~890 API routes, ~590+ types, 218+ tests.
- Part 75: Persistent learning store (provider perf EWMA, knowledge base)
- Part 76: Conversational task refinement + task chaining
- Part 77 (in progress): Smart templates + recurring task scheduler

Gap:
GPO needs multi-engine orchestration — the ability to run a complex task that involves multiple engines working together. For example, "Research passive income ideas, then analyze the top 3 with market data, then create an action plan" should orchestrate the Research, Finance, and Planning engines in sequence. Currently each task uses one engine. There's also no way to create compound workflows that combine different engine capabilities.

Requested part:
Part 78: Multi-Engine Orchestration + Compound Workflows — Build the ability to define compound workflows that chain multiple engines together, with each engine handling its specialized part of the task. Add workflow templates for common multi-engine patterns.

Output format:
Return exactly one code block containing the full prompt. No intro, no explanation, no notes.
