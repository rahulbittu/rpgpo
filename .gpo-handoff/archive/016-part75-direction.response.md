```markdown
You are implementing GPO/RPGPO Part 75.

Title: Persistent Learning + Cross-Session Knowledge Base + Operator Pattern Recognition

Context
- Repo: /Users/rpgpo/Projects/RPGPO
- App: 04-Dashboard/app/
- Server: raw Node.js HTTP (server.js)
- Modules: 117+ TS modules (CommonJS), ~863 routes, ~545+ types, 297 tests
- State: file-based JSON under state/
- Hooks: onTaskStart/onSubtaskComplete/onTaskComplete (Part 65)
- Existing: structured output pipeline, provider simulator, acceptance harness, workflow orchestrator, Mission Control dashboard
- Current EWMA provider learning (Part 69) is in-memory only and resets on restart

Goal
Build a durable learning layer that persists across restarts and sessions:
1) Provider performance learning: persist decayed stats by engine/model/context to inform provider selection
2) Prompt pattern learning: persist which prompt scaffolds/templates yield schema-compliant outputs
3) Operator decision patterns: learn operator preferences from approvals/overrides to suggest and auto-tune autopilot policies (with explicit operator opt-in)
4) Knowledge base: accumulate domain expertise from completed/approved deliverables, searchable and reusable in future deliberation
5) Wire the learning into deliberation and provider governance without breaking current functionality
6) Full privacy/tenant isolation, redaction, export/reset runbooks, and robust tests

Non-goals
- No external databases; remain JSON file-backed
- No vector DB; use structured fields + tags + lite inverted index
- Do not auto-apply policies without operator acceptance unless explicit config is enabled

High-level Deliverables
- Typed, versioned, append-only learning store with compaction
- Learning APIs (guarded), UI surfaces in Mission Control
- Integration into provider selection and deliberation prompts
- Knowledge extraction from deliverables and approvals
- Pattern recognition to propose operator policies
- Tests verifying persistence across restart and improved outcomes

Constraints
- Preserve all working routes, hooks, and workflows
- Use existing route guards, deep redaction, isolation boundaries
- Maintain existing acceptance suite green; add new cases
- Enterprise-grade types and contracts

Implementation Plan (phases)
A) Types + State Layout + Core Store
B) Learning capture wiring (hooks and pipeline)
C) Provider governance + deliberation consult learning
D) Knowledge base indexing/search and auto-ingest from releases
E) Operator pattern recognition + suggestions + policy application
F) APIs + UI panels
G) Observability + Config + Docs
H) Tests + Migrations + Hardening

Required New/Updated Files (app/lib unless noted)
1) lib/types.ts (augment)
- Add below interfaces and enums:

export type LearningVersion = 'v1';

export interface LearningKey {
  tenantId: string; // enforced by isolation
  projectId: string; // cross-project isolation
}

export interface ProviderContextKey {
  engineId: string;             // e.g., 'top-ranker'
  taskKind: string;             // e.g., 'DELIVERABLE_SCAFFOLD', 'SUBTASK', 'FINALIZE'
  contractName: string;         // deliverable schema name
  contentShape: 'short' | 'medium' | 'long'; // input size buckets
  domainTags: string[];         // normalized tags from task
}

export interface ProviderPerfSample {
  timestamp: number;
  providerId: string;           // 'openai:gpt-4o-mini', 'anthropic:sonnet', 'gemini:1.5'
  latencyMs: number;
  inputTokens: number;
  outputTokens: number;
  totalCostUsd: number;
  success: boolean;             // schema-compliant output?
  qualityScore: number;         // 0-1 based on validation/approvals
  errorCode?: string;
}

export interface EwmaStats {
  n: number;
  lastTimestamp: number;
  latencyMsEwma: number;
  successRateEwma: number;
  qualityEwma: number;
  costPerTokenEwma: number;
}

export interface ProviderPerfRecord {
  key: ProviderContextKey;
  providerId: string;
  ewma: EwmaStats;
  lastSamples: ProviderPerfSample[]; // ring buffer capped (e.g., 30)
}

export interface PromptPatternKey {
  engineId: string;
  contractName: string;
  strategy: string; // e.g., 'SCHEMA_DRIVEN', 'CRITIC_REFINE'
}

export interface PromptPatternOutcome {
  timestamp: number;
  patternId: string;
  success: boolean;
  schemaCompliance: number; // 0-1 coverage of required fields
  redactionIncidents: number;
  approvalLatencyMs?: number;
}

export interface PromptPatternRecord {
  key: PromptPatternKey;
  patternId: string;  // stable hash of template text after redaction
  ewma: EwmaStats;    // reuse fields: successRate/latency
  lastOutcomes: PromptPatternOutcome[];
  exampleTemplateRedacted: string;
}

export interface OperatorDecisionEvent {
  timestamp: number;
  operatorHash: string; // salted hash, never store raw id
  projectId: string;
  contractName: string;
  engineId: string;
  action: 'APPROVE' | 'REJECT' | 'REQUEST_CHANGES' | 'OVERRIDE';
  context: {
    severity?: 'LOW'|'MEDIUM'|'HIGH';
    riskTags: string[];
    autoApprovedCandidate: boolean;
  };
  turnaroundMs: number;
}

export interface OperatorPreferenceSignal {
  id: string;
  pattern: {
    contractName?: string;
    engineId?: string;
    riskTags?: string[];
    timeOfDay?: string; // 'morning/afternoon/evening/night'
    weekday?: number;   // 0-6
  };
  confidence: number;  // 0-1
  suggestedPolicy: AutopilotPolicySpec;
  evidenceCount: number;
  lastSeen: number;
}

export interface AutopilotPolicySpec {
  id: string;
  name: string;
  description: string;
  enabled: boolean;
  conditions: {
    contractName?: string;
    engineId?: string;
    riskTagNotPresent?: string[];
    maxCostUsd?: number;
    minQualityScore?: number;
    allowAutoApprove?: boolean;
  };
  createdAt: number;
  createdBy: 'SYSTEM' | 'OPERATOR';
}

export interface KnowledgeEntry {
  id: string;
  tenantId: string;
  projectId: string;
  contractName: string;
  engineId: string;
  domainTags: string[];
  title: string;
  insights: string[];              // brief bullets extracted
  promptTips: string[];            // redacted prompts hints
  providerRanking: string[];       // providerIds best→worst snapshot
  source: {
    deliverableId: string;
    releaseId?: string;
    approvalNoteIds?: string[];
  };
  createdAt: number;
}

export interface KnowledgeIndex {
  terms: Record<string, string[]>; // term → [knowledgeId,...]
  tagToIds: Record<string, string[]>;
  lastBuiltAt: number;
}

export interface LearningStoreMeta {
  version: LearningVersion;
  createdAt: number;
  updatedAt: number;
  recordCounts: {
    providerPerf: number;
    promptPatterns: number;
    operatorDecisions: number;
    knowledgeEntries: number;
    policies: number;
  };
}

export interface LearningSnapshot {
  meta: LearningStoreMeta;
  providerPerf: ProviderPerfRecord[];
  promptPatterns: PromptPatternRecord[];
  operatorDecisions: OperatorDecisionEvent[];
  operatorSignals: OperatorPreferenceSignal[];
  autopilotPolicies: AutopilotPolicySpec[];
  knowledge: KnowledgeEntry[];
  knowledgeIndex: KnowledgeIndex;
}

export interface ProviderSelectionHint {
  providerId: string;
  score: number; // higher is better
  rationale: string[];
}

2) New: lib/learning/learning-store.ts
- Append-only JSON log with periodic compaction to a canonical snapshot
- File layout:
  state/learning/meta.json
  state/learning/provider-perf.log.jsonl
  state/learning/prompt-patterns.log.jsonl
  state/learning/operator-decisions.log.jsonl
  state/learning/policies.json
  state/learning/knowledge.log.jsonl
  state/learning/snapshot.json
  state/learning/index.json
- API:

export function initLearningStore(tenantId: string, projectId: string): Promise<void>;
export function appendProviderPerf(lk: LearningKey, sample: ProviderPerfSample, ctx: ProviderContextKey): Promise<void>;
export function appendPromptOutcome(lk: LearningKey, outcome: PromptPatternOutcome, key: PromptPatternKey, templateRedacted: string): Promise<void>;
export function appendOperatorDecision(lk: LearningKey, event: OperatorDecisionEvent): Promise<void>;
export function upsertPolicy(lk: LearningKey, policy: AutopilotPolicySpec): Promise<void>;
export function deletePolicy(lk: LearningKey, policyId: string): Promise<void>;
export function listPolicies(lk: LearningKey): Promise<AutopilotPolicySpec[]>;
export function addKnowledge(lk: LearningKey, entry: KnowledgeEntry): Promise<void>;
export function loadSnapshot(lk: LearningKey): Promise<LearningSnapshot>;
export function compact(lk: LearningKey): Promise<void>;

- Behavior:
  - Uses atomic writes via writeFileSync to temp + rename
  - Bounds ring buffers (e.g., last 30 samples) during compaction
  - Enforces redaction on templates/prompts
  - Salts operator hashes using a per-tenant salt (derive from secret governance)

3) New: lib/learning/provider-learning.ts
- Maintains in-memory cache hydrated from store; provides ranking hints for provider governance
- API:

export function getProviderHints(lk: LearningKey, ctx: ProviderContextKey): Promise<ProviderSelectionHint[]>;
export function recordProviderOutcome(lk: LearningKey, ctx: ProviderContextKey, sample: ProviderPerfSample): Promise<void>;
export function ewmaUpdate(old: EwmaStats|undefined, sample: ProviderPerfSample): EwmaStats;

- Scoring: combine normalized ewma success, quality, latency, cost (configurable weights)
- Fallback if no data: current governance default ordering

4) New: lib/learning/prompt-patterns.ts
- Track prompt template effectiveness keyed by engine+contract+strategy
- Redact templates using deep-redaction.ts
- API:

export function recordPromptOutcome(lk: LearningKey, key: PromptPatternKey, template: string, outcome: Omit<PromptPatternOutcome,'patternId'|'timestamp'> & { schemaCompliance: number; }): Promise<void>;
export function bestPatterns(lk: LearningKey, key: PromptPatternKey, topK?: number): Promise<{ patternId: string; score: number; example: string; }[]>;

5) New: lib/learning/operator-patterns.ts
- Generate OperatorPreferenceSignals + derive policy suggestions
- API:

export function ingestDecision(lk: LearningKey, event: OperatorDecisionEvent): Promise<void>;
export function suggestPolicies(lk: LearningKey): Promise<OperatorPreferenceSignal[]>;
export function materializePolicyFromSignal(sig: OperatorPreferenceSignal): AutopilotPolicySpec;

- Logic:
  - Mine frequent approvals for low-risk tags per contractName/engineId with high confidence and low turnaroundMs
  - Time-of-day/weekday bucketing
  - Confidence via Wilson score; thresholds configurable

6) New: lib/learning/knowledge-base.ts
- Build and query knowledge entries + indexer
- API:

export function ingestFromDeliverable(lk: LearningKey, args: { deliverableId: string; releaseId?: string; engineId: string; contractName: string; domainTags: string[]; insights: string[]; promptTips: string[]; providerRanking: string[]; }): Promise<KnowledgeEntry>;
export function queryKnowledge(lk: LearningKey, q: { text?: string; tags?: string[]; contractName?: string; engineId?: string; limit?: number; }): Promise<KnowledgeEntry[]>;
export function rebuildIndex(lk: LearningKey): Promise<void>;

- Indexer: lowercase tokenization, stopword removal, term→ids map, tag→ids

7) Update: lib/governance/provider-selection.ts (or the existing provider governance module)
- Integrate getProviderHints to reorder candidates per context
- Respect budgets, SLAs; do not choose providers outside policy
- Expose rationale thread in decision trace/evidence

8) Update: lib/deliberation.ts (or board deliberation module)
- Augment prompt with bestPatterns for engine/contract
- Include knowledge snippets (top 3 insights/promptTips) as advisory
- Ensure redaction; do not leak raw artifacts
- Record prompt outcome after validation

9) Update: lib/chief-of-staff.ts (hooks wiring)
- On onTaskStart: initLearningStore
- On onSubtaskComplete: recordProviderOutcome + recordPromptOutcome
- On onTaskComplete: ingest knowledge if approved and schema-compliant
- On approval/override events (wherever captured): appendOperatorDecision

10) New: lib/learning/config.ts
export interface LearningConfig {
  enabled: boolean;
  ewmaAlpha: number; // smoothing factor
  maxSamplesPerKey: number;
  policySuggestionMinEvidence: number;
  policySuggestionMinConfidence: number;
  knowledgeMaxInsights: number;
}
export const defaultLearningConfig: LearningConfig = { enabled: true, ewmaAlpha: 0.25, maxSamplesPerKey: 30, policySuggestionMinEvidence: 5, policySuggestionMinConfidence: 0.8, knowledgeMaxInsights: 8 };

Wire into existing config module; honor tenant/project overrides.

Server Routes (server.js)
Add guarded routes; follow existing routing style and http-response-guard.ts. All mutations require operator auth and CSRF/middleware truth.

- Learning Provider Perf
  - GET /api/learning/provider?h.engineId=&contractName=&taskKind=&contentShape=&tags=a,b
    -> handler: loads hints and returns [{providerId, score, rationale}]
  - POST /api/learning/provider/report
    body: { engineId, contractName, taskKind, contentShape, domainTags, providerId, latencyMs, inputTokens, outputTokens, totalCostUsd, success, qualityScore, errorCode? }
    -> handler: append sample

- Prompt Patterns
  - GET /api/learning/prompt-patterns?engineId=&contractName=&strategy=&topK=3
  - POST /api/learning/prompt-feedback
    body: { engineId, contractName, strategy, template, schemaCompliance, success, redactionIncidents, approvalLatencyMs? }

- Knowledge Base
  - GET /api/knowledge/query?q=&tags=&contractName=&engineId=&limit=
  - POST /api/knowledge/reindex (admin-only)

- Operator Policies
  - GET /api/operator/suggestions
  - POST /api/operator/policies
  - DELETE /api/operator/policies/:id
  - GET /api/operator/policies

All responses pass through http-response-guard.ts; redact sensitive fields; enforce tenant/project context.

UI (04-Dashboard/app/)
- Mission Control: add "Learning" tab with 3 panels
  1) Provider Learning
     - Table: engine/contract/context → provider ranking with scores
     - Filters: engine, contract, tags
  2) Prompt Patterns
     - List best patterns; show redacted example; schema compliance trend
  3) Operator Suggestions
     - Cards with suggested policies, confidence, evidence count
     - Actions: Accept (POST /policies), Dismiss (dismiss local only or add muted flag if supported)
- Knowledge Hub (new tab or integrate into Releases)
  - Search bar + tag filters
  - Results list with title, insights, promptTips, providerRanking snapshot, source links
- Files to update:
  - operator.js: add fetch/render for new endpoints; bind actions
  - operator.css: styles
  - app.js/index.html: tab registration, routing, panels

Wiring/Hook Details
- onTaskStart(task): initLearningStore(tenant, project)
- onSubtaskComplete(event):
  - Build ProviderContextKey from engineId, taskKind, contractName, contentShape, domainTags (derive tags from task metadata/contract type; if absent, empty)
  - Record provider outcome with latency, tokens, cost, success (schema compliance from validation step), qualityScore (start with 1 for success, 0 for fail; adjust with approvals later)
  - Record prompt outcome with schemaCompliance metric from validator; strategy name from deliberation planner
- onTaskComplete(task):
  - If approved + released and contractName known: extract insights via structured fields (use existing deliverable contract mappers); clamp to config.knowledgeMaxInsights; collect current provider ranking hints; persist knowledge entry
- Approval/Override:
  - When operator acts in approval workspace, emit OperatorDecisionEvent; hash operator id using secret salt; store

Deliberation Augmentation
- For each subtask:
  - Fetch top 2 prompt patterns; include "Prompt Hints" section (redacted)
  - Fetch top 3 knowledge entries by tags/contractName; include "Domain Insights" bullets
  - Provider selection: before call, getProviderHints and pass preferred provider list to provider governance; store the considered list into evidence
- After response validation:
  - compute schema compliance ratio (required fields present / total); call recordPromptOutcome

Governance Integration
- Modify provider selection to accept optional hints and re-rank within allowed providers; never violate budgets/policies; include reason artifact: 'provider-learning-rationale.json'

Privacy & Redaction
- Never store raw prompts; always store redacted templates via deep-redaction.ts
- Pseudonymize operator ids; derive salt from existing secrets module; rotate-able
- Knowledge entries store only insights/prompt tips free of PII; run through redaction

Observability
- Counters:
  - learning.provider.samples_total, learning.prompt.outcomes_total, learning.operator.decisions_total, learning.knowledge.entries_total
- Gauges:
  - learning.policies.enabled_count
- Timers:
  - learning.compaction_ms
- Emit traces with tags: tenant/project/engine/contract/provider

Compaction
- Add scheduled compaction at startup + every 6 hours (configurable)
- Trim ring buffers; recompute EWMAs; rebuild knowledge index

Config
- config.learning.enabled (default true)
- config.learning.ewmaAlpha, maxSamplesPerKey, policy thresholds, compaction interval
- config.autopilot.allowAutoApplyPolicies (default false)

Acceptance Tests (add under 04-Dashboard/app/__tests__/learning/*.test.ts)
- provider-learning-persists-across-restart.test.ts
  - Run 3 tasks with provider simulator: provider A faster/cheaper; persist
  - Restart server; ensure hints favor provider A with rationale
- prompt-pattern-success-improves-selection.test.ts
  - Two prompt templates; one yields higher schema compliance
  - Verify bestPatterns returns that template; deliberation includes it
- operator-suggestions-generated.test.ts
  - Simulate 10 approvals for low-risk deliverables; expect suggestion with confidence >= threshold
- policy-application-optin.test.ts
  - Accept a suggestion; ensure autopilot applies condition for next matching task
- knowledge-ingest-and-query.test.ts
  - After approved deliverable, knowledge entry created; search returns entry by tag and term
- privacy-redaction-enforced.test.ts
  - Ensure stored templates are redacted; operator id never raw; knowledge free of PII markers
- route-guards-learning.test.ts
  - All POST routes require auth; GET routes are guarded and redacted
- budget-respect-with-learning.test.ts
  - Provider hints cannot select providers outside allowed set or exceed budget

Integration with Provider Simulator
- Extend simulator to emit latency/cost according to providerId
- Ensure deterministic behavior for tests

Docs (04-Dashboard/docs/)
- ADR: 0XX-persistent-learning-and-knowledge-base.md
  - Rationale, design, data model, redaction, EWMA math, isolation guarantees
- Runbook: learning-store-operations.md
  - Reset, export, compaction, policy management
- Operator Guide: mission-control-learning-and-knowledge.md
  - How to use Learning tab, suggestions, Knowledge Hub
- API: learning-and-knowledge.openapi.md
  - Document endpoints, request/response types

Security/Hardening
- Route guards on all endpoints; audit logs for policy changes
- Append-only logs with checksum per line (optional): add "hash":"sha256(base64(lineWithoutHash)+salt)"
- Error handling and backoff for compaction
- Lock files to avoid concurrent writes (fs.open with exclusive flag)
- Input validation against types; reject oversized payloads
- Tenant/project scoping enforced in every store operation

Migrations
- On initLearningStore, if no meta.json exists, create with version v1
- If legacy in-memory structures referenced anywhere, remove/replace but preserve APIs

Edge Cases
- Cold start with no data → behave as before
- Corrupt log line → skip with warning; do not crash
- Oversized knowledge log → trigger compaction earlier

Explicit Code Touch Points
- server.js: add route handlers with existing pattern; ensure they pass through http-response-guard.ts
- lib/chief-of-staff.ts: add calls at hook sites as described
- lib/deliberation.ts: add augmentation and outcome recording
- lib/governance/provider-selection.ts: integrate hints
- lib/deep-redaction.ts: expose utility to redact prompt templates (use existing)
- operator.js/operator.css/index.html/app.js: UI panels and actions

API Schemas (response shapes)
- GET /api/learning/provider → { hints: ProviderSelectionHint[], context: ProviderContextKey }
- GET /api/learning/prompt-patterns → { patterns: { patternId, score, example }[] }
- GET /api/knowledge/query → { results: KnowledgeEntry[] }
- GET /api/operator/suggestions → { suggestions: OperatorPreferenceSignal[] }
- GET /api/operator/policies → { policies: AutopilotPolicySpec[] }

Test Data Contracts
- Use seeded tasks and deliverables contracts already present
- Provider simulator: configure A better than B for engineId 'top-ranker' and contract 'RankedList'

Definition of Done
- New learning store persists across restarts; verified by tests
- Provider selection consults learning without violating governance; rationale captured
- Deliberation includes prompt tips and domain insights; schema compliance rate improves over baseline tests
- Operator suggestions surface in UI; can be accepted to create policies; policies affect autopilot decisions under guard
- Knowledge base searchable in UI; entries linked to sources; index rebuild works
- All new endpoints guarded and redacted; no PII leakage
- Observability metrics emitted; compaction scheduled
- Docs added and linked in Mission Control docs panel
- No regressions in existing tests; new tests added and green

Deliverable Artifacts to Commit
- New/updated modules under lib/learning/*
- server.js route handlers
- UI panels and styles
- Tests under __tests__/learning/*
- Docs files as listed
- Config defaults and wiring

Begin implementation now. Keep patches small and incremental with clear commit messages:
- part-75-init-learning-store
- part-75-provider-learning-wiring
- part-75-prompt-patterns
- part-75-knowledge-base
- part-75-operator-patterns
- part-75-apis
- part-75-ui
- part-75-tests
- part-75-docs
- part-75-hardening
```
