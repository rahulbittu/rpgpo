Generate the next GPO/RPGPO architecture implementation prompt.

Important:
- Return a prompt only, not a design answer.
- Output exactly one paste-ready prompt.

Current baseline:
- Parts 19-80 being implemented. 135+ TS modules, ~930 API routes, ~640+ types, 218+ tests.
- Parts 75-79: Persistent learning, conversations, task chaining, smart templates, recurring scheduler, compound workflows, state backup
- Part 80 (in progress): Integration gateway + webhooks

Gap:
GPO needs a proper analytics and insights dashboard that shows the operator how GPO is performing over time. What tasks produced the most value? Which engines are used most? What's the cost trend? How much time is GPO saving? There's no analytics layer that turns raw task/cost/provider data into actionable insights about GPO's effectiveness.

Requested part:
Part 81: Analytics & Insights Dashboard — Build an analytics layer that computes productivity metrics, cost efficiency, engine usage patterns, and value-delivered insights from historical task and cost data.

Output format:
Return exactly one code block containing the full prompt. No intro, no explanation, no notes.
