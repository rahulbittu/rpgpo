Generate the next GPO/RPGPO architecture implementation prompt.

Important:
- Return a prompt only, not a design answer.
- Output exactly one paste-ready prompt.

Current baseline:
- Parts 19-87 complete. 155+ TS modules, ~1010 API routes, ~735+ types, 85+ commits.
- 21 architecture parts this session alone. Full enterprise GPO.

Gap:
GPO needs a proper context enrichment pipeline that automatically extracts and indexes insights from completed tasks, improving future task quality over time. Currently completed task outputs sit in report files but don't feed back into the knowledge base automatically. The system should auto-extract key findings, recommendations, and data points from completed tasks and make them searchable for future deliberation context.

Requested part:
Part 88: Context Enrichment Pipeline — Auto-extract insights from completed tasks into the knowledge base, build a semantic index of findings, and inject relevant prior knowledge into new task deliberations.

Output format:
Return exactly one code block containing the full prompt. No intro, no explanation, no notes.
