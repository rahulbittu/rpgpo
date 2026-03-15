Generate the next GPO/RPGPO architecture implementation prompt.

Important:
- Return a prompt only, not a design answer.
- Output exactly one paste-ready prompt.

Current baseline:
- Parts 19-74 complete. 117+ TS modules, ~863 API routes, ~545+ types, 297 tests.
- Parts 67-74 delivered: structured output pipeline, board/worker integration, observability+metrics+cost+learning, parallel execution DAG engine, workflow orchestrator+autopilot, TopRanker engine, Mission Control dashboard, integration test suite with provider simulator and acceptance harness.
- Full lifecycle operational: intake → deliberate → schedule → execute → merge → validate → approve → release.

Gap:
The system handles tasks/workflows well but has no memory of what worked across sessions. There's no persistent learning that carries forward — which providers performed best for which engines, which prompt patterns produced the best structured output, which approval gates are usually auto-approved. The EWMA provider learning from Part 69 is in-memory only and resets on restart. There's no cross-session knowledge base that accumulates domain expertise. The operator's preferences and patterns aren't captured to improve future autonomous operation.

Requested part:
Part 75: Persistent Learning + Cross-Session Knowledge Base + Operator Pattern Recognition — Build a durable learning store that persists provider performance, prompt effectiveness, and operator decision patterns across sessions. Add a knowledge base that accumulates domain expertise from completed workflows. Implement pattern recognition that identifies operator preferences for auto-tuning autopilot policies.

Output format:
Return exactly one code block containing the full prompt. No intro, no explanation, no notes.
