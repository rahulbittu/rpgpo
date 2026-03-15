Generate the next GPO/RPGPO architecture implementation prompt.

Important:
- Return a prompt only, not a design answer.
- Output exactly one paste-ready prompt.

Current baseline:
- Parts 19-68 complete. 87 TS modules, ~818 API routes, ~458+ types.
- Part 67 delivered structured output pipeline: schema encoder → prompt builder → provider call → 4-stage parse → field-level merge → evidence recording.
- Part 68 delivered board + worker structured integration: provider capability registry with 5 providers, capability-preferred routing, exponential backoff retry (3 attempts), board phase schemas for all 7 phases, executeWithParseRetry unified loop, chief-of-staff structured IO status surfacing, 3 new API routes, 174 tests all passing.
- Full pipeline: contract → schema → prompt → provider (native-json/mime-json/sentinel) → parse → retry → field merge → evidence → operator visibility.

Gap:
The structured output pipeline works end-to-end but has no observability beyond evidence files. There are no metrics (success rate, latency histograms, provider error rates), no alerting on parse failure spikes, and no dashboard view showing structured I/O health across all tasks. The operator can see per-task status but has no aggregate view. There's no cost tracking integration for structured calls. The evidence files accumulate without TTL or cleanup. Provider capability data is hardcoded with no runtime learning from success/failure rates.

Requested part:
Part 69: Structured I/O Observability + Metrics + Provider Learning + Evidence Lifecycle — Add aggregate metrics, provider success tracking with dynamic capability scoring, evidence TTL/cleanup, cost integration for structured calls, and an operator-facing structured I/O health dashboard panel.

Output format:
Return exactly one code block containing the full prompt. No intro, no explanation, no notes.
