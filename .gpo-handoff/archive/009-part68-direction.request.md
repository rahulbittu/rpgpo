Generate the next GPO/RPGPO architecture implementation prompt.

Important:
- Return a prompt only, not a design answer.
- Output exactly one paste-ready prompt.

Current baseline:
- Parts 19-67 complete. 84 TS modules, ~815 API routes, ~446+ types.
- Part 67 added contract-aware prompt augmentation + structured output extraction: 8 new modules (config/ai-io, contracts/schema-encoder, prompt/contract-aware, ai/providers, ai/structured-output, merge/field-populator, evidence/structured, evidence/reader), 6 new types, 2 new API routes, 72 tests all passing.
- The full structured pipeline works: engine contract → JSON Schema → prompt injection → provider call → 4-stage parse → field-level merge → evidence recording.
- Provider modes: native-json (OpenAI/Anthropic), mime-json (Gemini), prompt-sentinel (Perplexity/unknown).
- Feature-flagged via state/config/ai-io.json, revertible without code changes.

Gap:
The structured output pipeline exists but the board deliberation itself doesn't use it yet — only subtask execution has `executeStructuredSubtask()`. The board's 7-phase lifecycle (board.ts) still uses plain text AI calls with no contract awareness. The worker execution graph doesn't route through the structured path. The chief-of-staff doesn't surface structured extraction status in briefs or next-actions. There's no retry logic when structured parsing fails (maxParseAttempts is set but not wired). Provider selection doesn't factor in structured output capability.

Requested part:
Part 68: Board + Worker Structured Integration + Retry + Provider-Aware Routing — Wire the structured output pipeline into the board deliberation phases, worker execution, chief-of-staff briefing, add parse retry with backoff, and make provider selection consider structured output capability.

Output format:
Return exactly one code block containing the full prompt. No intro, no explanation, no notes.
