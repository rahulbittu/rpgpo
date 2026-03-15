1) Assessment
- The development path is broadly correct: Level 1 is strong, and the fixes you’ve applied target the right bottlenecks for scaling to more domains without cost blowups. The zero Level 3 rate is primarily an output/UX capability gap rather than a modeling failure.
- One critical omission remains: contract-aware prompting and structured extraction (Part 67). Until the deliberation prompt produces schema-conformant artifacts and the UI exposes downloads, Level 3 will stay at 0% regardless of model quality.

2) Prioritization feedback
- Make Part 67 (contract-aware prompt + structured extraction + field mapping) the top priority before any further engine/domain expansion.
- Ship downloadable artifacts next using the existing deliverables store and route guard pattern: add export endpoints and UI buttons; no new subsystem needed.
- Introduce a minimal interactive loop using the existing human-approval workspace and pipeline hooks (onSubtaskComplete pause/resume). Target “clarify → resume” for tasks tagged as needs-info.
- Deepen context packing in deliberation by pulling from the existing artifact registry/evidence chain: include last N approved deliverables per project-domain with token-budgeted summaries.
- Keep the scored keyword router and continue lexical hardening: synonym tables, negative keywords, and precedence rules per engine; add light caching of corrected routes per project to reduce repeat errors.
- Defer adding new engines or broad test surface until Level 3 features are live; then re-run the 33 cases and expand to the remaining 3 engines.

3) Level 3 improvement suggestions
- Contract-aware prompting in deliberation.ts
  - Inject the active deliverable schema fields (names, types, required/optional, constraints) into the prompt.
  - Provider-specific response controls:
    - OpenAI: use response_format json_object; instruct “return a single JSON object exactly matching fields: …”
    - Claude: instruct “output MUST be a single JSON object and nothing else” and wrap the schema in the prompt; reject tool-use freeform.
    - Gemini: request application/json output; enforce “single top-level object with required keys.”
  - Add a strict “no prose” guard and include 2-3 positive/negative examples for common domains to reduce drift.
- Structured extraction and repair
  - First-pass: attempt direct JSON parse; if fail, extract the largest top-level JSON block via delimiter scan.
  - If still invalid, auto-repair minimally (quote keys, close braces); if still invalid, issue a single “repair to valid JSON given this schema” retry with the same provider.
  - Record “structured_ok: true/false” and “repair_attempts” in the evidence chain.
- Field-level mapping and validation
  - For each contract field, apply existing merge strategies (latest-wins, append, choose-best) based on per-field policy already implemented in Part 61.
  - Enforce required fields before approval; if missing, auto-generate a “needs-info” question for interactive mode (see below).
  - Compute and store contract_version, checksum, and provenance (engine, model, prompt hash) on the deliverable.
- Downloadable outputs (no new subsystem)
  - Server: add GET /api/deliverables/:id/export?fmt=json|md|zip using a small lib/deliverables-export.ts that reads the versioned store and renders:
    - json: the validated contract object
    - md: a readable Markdown rendering of the fields
    - zip: md + json + any linked artifacts
  - Headers: Content-Type and Content-Disposition: attachment; integrate http-response-guard and deep-redaction on export paths.
  - UI: in the Deliverables panel (Part 63), add a “Download” split-button with JSON/Markdown/ZIP options; enable after validation passes (pre-approval is fine if all required fields are present).
- Minimal interactive mode using existing approval workspace
  - Define a “questions” array in the contract (optional field already permitted if you use per-variant policies) or add a deliberation_result.meta.needs_info with a list of prompts.
  - When questions non-empty or required fields missing, set task.status = waiting_on_operator; surface a banner in the human approval workspace with auto-generated input fields keyed to missing/ambiguous contract fields.
  - On submit, append answers to the deliberation context (as “operator_clarifications”) and resume the worker; clear questions.
  - Limit to a single clarification round unless a required field is still failing, then fail with actionable error.
- Context deepening for Level 2 → Level 3 conversion
  - Context packer rule: include up to N (e.g., 3-5) most recent approved deliverables for the same project + domain; if token pressure, summarize with the same provider under strict budget.
  - Include related evidence links (citations, prior outputs) and the active acceptance-case hints for the current task type if available.
  - Apply domain-specific negative context filters to avoid leaking cross-project or stale versions; rely on existing isolation and redaction layers.
- Routing refinements within current approach
  - Expand the scored domain-router with:
    - Per-engine synonym lists and phrase windows (multi-word n-grams) to reduce collisions.
    - Negative keyword lists to suppress near-miss domains.
    - Precedence weights by project memory: if a user re-routed a task once, cache that mapping for subsequent similar prompts in this project (file-based, keyed by domain + normalized phrase).
  - Log route_score components to observability for quick post-mortem on misroutes.

4) Any concerns about current direction
- Risk of chasing new engines before landing contract-aware prompting and downloads; keep scope tight until Level 3 primitives are in place.
- Interactive mode can balloon; constrain to a single clarification round using the existing approval workspace and pipeline hooks to avoid a new chat subsystem.
- Ensure exports pass through deep-redaction and route guards to avoid leaking sensitive fields; add tests for Content-Disposition and redaction on all export formats.
- Monitor token budgets: adding schema + context can spike costs; enforce max tokens per provider and truncate context deterministically (most-recent, domain-matched).
- Validate that structured outputs don’t regress Level 1/2 by over-constraining prompts; keep 1-2 shot examples per domain to anchor the JSON format without heavy instruction bloat.
