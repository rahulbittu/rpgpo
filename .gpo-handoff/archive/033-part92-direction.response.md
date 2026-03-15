```
You are the GPO builder. Implement Part 92 in RPGPO.

Title: Part 92 — Prompt Optimization Engine (POE)

Objective:
Build a contract-driven Prompt Optimization Engine that:
- Analyzes which prompt patterns produce the best results per engine/provider combination, using historical success data from real tasks and deliverables.
- Automatically suggests prompt improvements for new tasks (and optionally auto-applies them under governance/budget) based on learned performance.
- Preserves all existing working functionality and governance guarantees.

Repository baseline:
- Parts 19-91 complete. 165+ TS modules, ~1050 API routes, ~795+ types, 91 commits.
- Raw Node.js HTTP server (no Express). CommonJS modules with TypeScript.
- Centralized governance, deep redaction, route/mutation guards, runtime pipeline hooks (onTaskStart/onSubtaskComplete/onTaskComplete), deliverables lifecycle with approval and evidence links.
- Privacy-first; JSON state in 04-Dashboard/state/.

Non-negotiables:
- Do not break existing APIs, guards, or behavior.
- No new heavy deps; use built-ins and existing project utilities only.
- All new code must be typed, modular, and follow existing module conventions (CommonJS, .ts compiled).
- Wire into existing middleware truth and guards; 100% of new routes guarded.
- Redact secrets and PII; store only hashed/canonicalized prompts.
- Deterministic IDs using existing hashing utilities (or add a simple SHA-256 if absent).
- Integrate and respect autonomy budgets, governance policies, and approval gates.

High-level design:
- Learning loop: capture prompt+response metadata at runtime → normalize + hash prompt patterns → attribute outcomes to pattern/provider/engine → compute fitness scores → suggest improved patterns for future tasks in same context → optional A/B experiments → record outcomes and continuously update scores.
- Suggestions as structured diffs against the composed prompt envelope (system, user, tool instructions, params).
- Fitness is multi-metric: contract adherence, approval, rework/overrides, guard violations, SLA, cost, latency, structure quality. Deterministic aggregation.

Scope:
- Core POE library (types, registry, analyzer, suggester, experiments, persistence, normalization/redaction).
- Provider/engine call instrumentation to register prompt usage and record outcomes.
- New API surface for POE (stats, register, record outcome, suggest, experiments, apply).
- UI panel to visualize patterns and suggestions, with opt-in apply/experiment controls.
- Docs: ADR, runbook, API docs, data model.
- Acceptance scenarios and hardening.

Files to add (04-Dashboard/app/lib/prompt-optimization/):
1) types.ts
   - Export typed contracts for:
     - PromptPatternId (string), PromptPattern (normalized features), PromptInstance (single composed call meta)
     - OutcomeMetrics, FitnessScore, ProviderEngineKey, TaskContext (tags, deliverable schema id/signature hash, workflow id)
     - Suggestion, SuggestionChange, SuggestionSet, SuggestionConfidence, RiskBand
     - Experiment, Arm, Assignment, StopRule, ExperimentOutcome
     - RegistryRecord, StatsSnapshot, PatternPerformance
     - API payload/response types (as exported interfaces) for all routes below
   - Ensure union literal types for op ("replace"|"append"|"prepend"|"set"), target ("system"|"user"|"tools"|"params")
   - Provide JSDoc on fields and stability guarantees.

2) normalize.ts
   - Functions:
     - canonicalizePromptEnvelope(env: {system: string; user: string; tools?: string; params?: object}): CanonicalEnvelope
       - Strip volatile data, trim whitespace, normalize bullets/whitespace, redact secrets via existing deep-redaction
     - extractFeatures(env: CanonicalEnvelope, ctx: TaskContext): FeatureVector (typed)
       - Booleans like has_json_schema, has_examples, enumerations, instruction_length_buckets, includes_step_by_step, includes_contract_fields, etc.
     - computePatternId(env: CanonicalEnvelope, ctx: TaskContext): PromptPatternId
       - stable SHA-256 over canonical JSON + provider+engine+ctx.signature (use existing hash util if available; else implement with crypto)
   - Do not store raw prompt content outside canonicalized+redacted derived data.

3) registry.ts
   - Keeps a deduplicated registry of observed patterns with metadata (firstSeen, lastSeen, provider, engine, ctx, feature vector).
   - API:
     - registerPattern(instance: PromptInstance): { patternId, created: boolean }
     - getPattern(patternId): PromptPattern | undefined
     - listTopPatterns(key: ProviderEngineKey, limit?: number): PatternPerformance[]
   - Persist into state/prompt-optimization/registry.json with append-safe writes; idempotent.

4) persist.ts
   - Append-only JSONL logs: state/prompt-optimization/instances.jsonl, outcomes.jsonl, suggestions.jsonl
   - JSON snapshots: patterns.json, stats.json, experiments.json, assignments.json
   - Load/save utilities with file locks, atomic write via tmp + rename, and rotation guard (size threshold).
   - Provide migration/init if files missing.

5) analyzer.ts
   - Compute fitness scores per pattern and per provider/engine slices.
   - Inputs: instances, outcomes, deliverable metrics (contract pass/fail, approvals), runtime metrics (cost, latency, guard violations), SLA.
   - Fitness function (normalized to [0,1], provide default weights as constants, configurable via governance):
     - w1 contract_pass_rate (0.25)
     - w2 approval_rate (0.2)
     - w3 (1 - rework_rate) (0.15)
     - w4 (1 - guard_violation_rate) (0.1)
     - w5 SLA_met_rate (0.1)
     - w6 structure_score (presence of schema adherence, JSON validity) (0.1)
     - w7 cost_efficiency (inverted cost per token / provider baseline) (0.05)
     - w8 latency_efficiency (inverted latency / provider baseline) (0.05)
   - Methods:
     - updateStats(key: ProviderEngineKey): StatsSnapshot
     - getPerformance(patternId): PatternPerformance
     - topKPatterns(key, k): PatternPerformance[]
   - Store latest snapshot in stats.json, with timestamp and evidence hash.

6) suggester.ts
   - Given current task context (provider, engine, ctx), current composed envelope, and deliverable contract:
     - Pull topK historical patterns for same key and similar ctx (Jaccard similarity over tags, deliverable signature hash proximity).
     - Build SuggestionSet with SuggestionChange[] diffs to move envelope toward higher-performing feature patterns:
       - E.g., add explicit JSON schema instruction; include "produce valid JSON only"; include field-by-field mapping; set temperature/top_p; add "no external calls"; standardize section headers; include "think step-by-step then provide final JSON only" per provider best.
     - Calculate expected uplift and confidence using:
       - Empirical uplift: delta fitness between target pattern and baseline; compute Wilson score/confidence; fallback to UCB if sparse.
       - Risk band from novelty (untested features), provider policy sensitivity, and similarity distance.
     - Output:
       - Suggestion with: reason, changes[], expectedUplift: number ([-1,1]), confidence: { kind: "wilson"|"ucb"; value: [0,1] }, risk: "low"|"medium"|"high", guardrails summary, and a preview of resulting envelope (redacted).
     - Respect autonomy budget and governance flags to mark autoApply: boolean recommendation, not execution.
   - Provide function:
     - suggestImprovements(input: { provider, engine, env, ctx, budget, governance }): SuggestionSet

7) experiments.ts
   - Thompson Sampling / UCB bandit over arms = patterns/suggestion variants.
   - API:
     - createExperiment(params: { key: ProviderEngineKey; name; arms: Arm[]; stop: StopRule }): Experiment
     - assign(taskId, userId?, ctx): { armId, patternId, assignmentId }
     - recordOutcome(assignmentId, outcome: OutcomeMetrics): ExperimentOutcome
     - checkStop(experimentId): { shouldStop: boolean; winnerArmId?: string; confidence?: number }
   - Persist in experiments.json and assignments.json; include stop rules: minSamples, minUplift, maxRisk, maxDuration.

8) runtime-hooks.ts
   - Wire POE into existing runtime pipeline:
     - onTaskStart: query suggester; store suggestion; if governance allows “auto-apply low-risk”, return modified envelope to builder path; else attach suggestion to task context for UI review.
     - onSubtaskPlan / onSubtaskStart (if available): reevaluate suggestions at subtask scope with narrower ctx tags (e.g., "write-tests", "summarize").
     - onTaskComplete: record outcomes by merging deliverable validation results, approvals, costs, latencies, and violations.
   - Exports functions for chief-of-staff.ts to invoke; do not import chief-of-staff.ts (avoid cycles).

9) api.ts
   - Pure functions to back HTTP routes, validating inputs via existing validators.
   - Handlers:
     - getStats(query)
     - registerInstance(body)
     - recordOutcome(body)
     - suggest(body)
     - createExperiment(body)
     - getExperiment(params)
     - assignExperiment(body)
     - applySuggestion(body) — writes an approved suggestion to task template/config under governance approval, not directly mutating live code.
   - Use deep redaction for any envelope preview in responses.

10) feature-flags.ts
   - Flags:
     - promptOptimization.enabled (default true)
     - promptOptimization.autoApplyLowRisk (default false)
     - promptOptimization.maxAutoApplyRisk = "low"
     - promptOptimization.holdoutRate (default 0.05)
     - promptOptimization.minSamplesForConfidence (default 20)
   - Wire to config/state with sensible defaults.

Server wiring (04-Dashboard/app/server.js):
- Add the following guarded routes (use existing router and http-response-guard.ts; keep nomenclature consistent with other modules):
  - GET  /api/prompt-optimization/stats?provider=&engine=&project=&since=
    - Returns StatsSnapshot + top patterns
  - POST /api/prompt-optimization/register
    - Body: { provider, engine, env, ctx, taskId, subtaskId?, correlationId, cost?, latency? }
  - POST /api/prompt-optimization/record-outcome
    - Body: { taskId, subtaskId?, patternId, outcome: OutcomeMetrics }
  - POST /api/prompt-optimization/suggest
    - Body: { provider, engine, env, ctx, budget?, governance? }
    - Returns SuggestionSet
  - POST /api/prompt-optimization/experiments
    - Create experiment
  - GET  /api/prompt-optimization/experiments/:id
    - Fetch experiment status
  - POST /api/prompt-optimization/assign
    - Assign a task to an experiment arm
  - POST /api/prompt-optimization/apply
    - Apply a reviewed suggestion to a task template/config (requires governance write permission)
- Guards:
  - Read routes: require authenticated operator; respect tenant/project isolation.
  - Mutations: require governance:write or prompts:admin capability; all bodies validated; idempotent keys on register/record.
  - Ensure redaction for any envelope previews; never return full raw prompts.

Provider/engine instrumentation:
- Identify central point where composed prompt envelope is sent to providers (system-prompt + user + any tool instructions + params).
- Before sending:
  - Build PromptInstance: { env (canonicalized), provider, engine, ctx, taskId, correlationId, params, timestamp }
  - Call registry.registerPattern() and persist instance to instances.jsonl via api.registerInstance logic (or direct library call if API is not needed internally).
- After receiving result and upon task/subtask completion:
  - Aggregate outcome metrics:
    - contract_pass (boolean), contract_violations (count)
    - approval_status (approved/rejected/pending), approval_rounds (int)
    - rework_count, override_count, guard_violations (count)
    - sla_met (boolean)
    - cost_tokens_prompt, cost_tokens_completion, usd_cost if available
    - latency_ms
    - structure_score (JSON parseable; schema adherence)
  - Record via analyzer/update + persist outcomes.jsonl.
- Ensure this piggybacks on existing onTaskStart/onSubtaskComplete/onTaskComplete hooks per Part 65.

State persistence (04-Dashboard/state/prompt-optimization/):
- Create directory and files:
  - registry.json                // pattern registry with metadata
  - patterns.json                // snapshot of known patterns and aggregate features
  - stats.json                   // per provider/engine slice stats and top patterns
  - instances.jsonl              // append-only prompt instances
  - outcomes.jsonl               // append-only outcomes
  - suggestions.jsonl            // append-only suggestions served
  - experiments.json             // active experiments
  - assignments.json             // task-to-arm mappings
- Implement lightweight rotation (e.g., 10MB threshold) with suffix .1, .2 and cap at 3.
- Migration/init: at server start, ensure files exist; write empty typed skeletons.

UI (04-Dashboard/app/):
- Add a new "Prompts" panel under Operator UI (or “Governance > Prompts”):
  - Heatmap of provider x engine fitness over last 7/30 days
  - Top patterns list with feature chips (has_schema, examples, step_by_step, json_only, temp/top_p)
  - Suggestions feed for recent tasks (with confidence, uplift, risk); action buttons:
    - View diff (render SuggestionChange[] as human-readable preview)
    - Apply (POST /api/prompt-optimization/apply) → gated by governance
    - Start experiment (POST /api/prompt-optimization/experiments)
  - Experiments tab with assignments and stop rule status
- Minimal changes to index.html/operator.js/operator.css to surface this panel; no breaking of existing UX.
- Display only redacted previews; never raw secrets.

Types integration (04-Dashboard/app/lib/types.ts):
- Add exported types for POE (re-export from lib/prompt-optimization/types.ts).
- Add new enums/constants if needed (ApprovalStatus, RiskBand, etc.).
- Ensure backward compatibility; do not rename existing types.

Governance integration:
- Feature flags under state/config or existing governance module (use feature-flags.ts).
- Autonomy gates: autoApply only if risk <= maxAutoApplyRisk and budget available; else require operator approval.
- Record all applications of suggestions as governance artifacts in artifact registry/evidence chain (link to suggestion id, pattern id, operator id, timestamp).
- Add policy doc (00-Governance/policies/prompt-optimization.md) describing data handling and opt-outs.

Docs (04-Dashboard/docs/):
- ADR: 04-Dashboard/docs/adr/ADR-0092-prompt-optimization-engine.md
  - Problem, decision, alternatives, data handling, risk, acceptance.
- API: 04-Dashboard/docs/api/prompt-optimization.md with request/response schemas and examples.
- Runbook: 04-Dashboard/docs/runbooks/prompt-optimization.md
  - How to enable, review suggestions, run experiments, interpret metrics.
- Data model: 04-Dashboard/docs/models/prompt-optimization.md covering files and schemas.

Acceptance criteria:
1) Pattern registration
   - When a task sends a composed prompt, registry.json gains/updates a pattern with deterministic id; instances.jsonl logs the instance.
   - Sensitive data redacted; normalized envelope canonicalized identically across runs.

2) Outcome recording
   - After task completes with a deliverable validated and approved, outcomes.jsonl captures metrics; analyzer updates stats.json.
   - Fitness scores computed and non-zero when data exists; top patterns reflect higher contract_pass_rate.

3) Suggestion quality
   - For a new task with provider/engine previously observed, POST /api/prompt-optimization/suggest returns:
     - at least 1 Suggestion with changes including explicitly adding JSON schema adherence if target deliverable has a schema.
     - confidence between 0 and 1, risk band computed, and expectedUplift positive when historical best > baseline.
   - Suggestion preview redacted.

4) Governance and application
   - Applying a suggestion via /apply writes governance artifact; no immediate code mutation except approved templates/config surfaces per project conventions.
   - Auto-apply only triggers if feature flag enabled and risk low and budget ok; otherwise suggestion is recorded as pending.

5) Experiments
   - Creating experiment with 2 arms assigns subsequent tasks according to holdout/assignment.
   - Record outcomes; stop rule fires when winner confidence >= configured threshold; winner recorded.

6) Route protection
   - All new routes have guards and input validation; mutation routes require governance:write.
   - Unauthorized access denied with existing standardized error envelope.

7) Observability
   - Counters exposed via existing metrics: prompt_optim_instances_total, prompt_optim_outcomes_total, prompt_optim_suggestions_total, prompt_optim_experiments_active.
   - Logs include evidence hash chain IDs.

8) Privacy
   - No raw full prompts stored; only canonicalized, redacted envelopes and derived features.
   - Tests show secrets are masked in persisted files.

9) Performance
   - Suggestion generation under 50ms for K<=10 patterns and typical state size.
   - Analyzer incremental updates O(1) per outcome; snapshot refresh under 200ms for 10k records.

10) Backward compatibility
   - Existing workflows unaffected when feature flag disabled; zero behavioral drift with POE off.
   - All unit/integration tests pass.

Hardening notes:
- Deterministic hashing with versioned salt (store salt id; do not store raw salt in repo; if not available, derive from existing config secret).
- Idempotent APIs: registerInstance/recordOutcome deduplicate via correlationId/assignmentId+patternId.
- File I/O is atomic and race-safe (use fs.writeFile to tmp + rename pattern; lock where necessary).
- Validate and cap envelope preview length; mask any {api_key, token, secret, cookie} via deep-redaction before storage/return.
- Handle provider/engine unknown gracefully; never throw uncaught.
- Ensure no PII or tenant-cross contamination; scope files per tenant/project if multi-tenant is in use.

Implementation steps:
1) Create lib/prompt-optimization/* modules with full types and unit tests for normalization, hashing, and fitness.
2) Add persist/init on server boot to create state files if missing.
3) Instrument provider call composition point to call registry.registerPattern before sending, and record outcomes on completion via runtime-hooks.ts.
4) Add api.ts functions and wire raw HTTP routes in server.js with guards, validation, and redaction.
5) Update lib/types.ts to export new POE types.
6) Add feature-flags and read them in runtime-hooks and api handlers.
7) Add UI panel surfaces and minimal JS for fetching stats, listing suggestions, and applying/creating experiments.
8) Write ADR, API docs, runbook, data model docs.
9) Add acceptance tests for criteria 1-10 (seed state with small fixtures where needed).
10) Run full test/acceptance suite; ensure no regressions.

Testing strategy:
- Unit tests: normalize.ts, analyzer.ts, suggester.ts, experiments.ts.
- Integration: end-to-end through runtime hooks using a stubbed provider/engine with deterministic responses and seeded outcomes.
- Security: ensure redaction in persisted files and API responses.
- Performance: benchmark suggestion generation with synthetic registry of 1k patterns.

Deliverables:
- Code in 04-Dashboard/app/lib/prompt-optimization/* with types, docs, and tests.
- Routes wired in server.js with guards.
- UI additions to operator panel.
- New state files created with migrations.
- ADR, API docs, runbook, and data model docs.

Commit:
- Single PR/commit: "Part 92: Prompt Optimization Engine — contract-aware learning/suggestions + API/UI/experiments"
- Include summary, risks, and migration notes.

Now implement Part 92 as specified. Produce:
- Diffs for all added/modified files.
- Any new schemas and sample JSON snippets.
- Test outputs or instructions to run acceptance scenarios.
- Screenshots or textual description of new UI panel interactions (if screenshot not possible).
```
