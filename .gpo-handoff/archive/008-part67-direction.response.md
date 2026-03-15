```
GPO Implementation Prompt — Part 67

Title
Part 67 — Contract-Aware Prompt Augmentation + Structured Output Extraction

Objective
Make AI providers produce deliverable-shaped, contract-compliant JSON so the merge step performs field-level population instead of heuristic text-append. Inject engine/deliverable contracts into both board deliberation and subtask prompts, enable provider-native JSON modes where available, enforce no-prose outputs, parse/validate/extract structured JSON, and map to deliverable fields with existing merge policies.

Scope
- Server: 04-Dashboard/app/server.js
- TS Lib: 04-Dashboard/app/lib/*
- Types: 04-Dashboard/app/lib/types.ts
- Chief/Worker: 04-Dashboard/app/lib/chief-of-staff.ts, 04-Dashboard/app/lib/worker.ts
- Deliberation: 04-Dashboard/app/lib/deliberation.ts
- Engines: 04-Dashboard/app/lib/engines/*
- Merge: 04-Dashboard/app/lib/merge/*
- Evidence/Artifact: 04-Dashboard/app/lib/evidence*.ts, 04-Dashboard/app/state/*
- UI: 04-Dashboard/app/index.html, app.js, operator.js, style.css, operator.css
- Docs: 04-Dashboard/docs/*

Design Constraints
- Preserve existing working lifecycle: scaffold → merge → validate → store → approve → release
- No breaking changes to public routes or output contracts
- CommonJS + TS; Typed, deterministic, and contract-driven
- Privacy-first: redaction invariants hold; no contract leakage of secrets
- Feature-flagged; default ON; revertible without code reverts

Deliverables
1) Contract-aware prompt builder
2) Provider JSON-mode enablement and prompt injection
3) Structured output parser with fallbacks
4) Field-level deliverable mapping integration with existing merge strategies
5) Evidence logging of schema, prompt, parse, and mapping
6) API + UI surfacing of parsed vs raw output
7) Tests, docs, and acceptance cases

Implementation Plan

A) Types
File: 04-Dashboard/app/lib/types.ts
- Add new types (namespaced under GPO to avoid collisions):

export type GPO_StructuredMode = 'native-json' | 'tool-call' | 'mime-json' | 'prompt-sentinel';

export interface GPO_SchemaEnvelope {
  contractId: string;            // stable id of the deliverable/engine contract
  version: string;               // semver of contract
  schemaHash: string;            // stable canonical JSON hash (sha256/base64)
  jsonSchema: any;               // JSON Schema draft-07 compatible object
  schemaSummary: string;         // compact human-readable summary
}

export interface GPO_PromptEnvelope {
  promptId: string;              // stable hash of inputs
  mode: GPO_StructuredMode;
  system: string;
  user: string;
  instructions: string;          // appended instruction block
  sentinelStart?: string;        // used when prompt-sentinel
  sentinelEnd?: string;          // used when prompt-sentinel
  providerHints?: Record<string, any>; // provider-specific options
}

export interface GPO_StructuredExtraction<T = any> {
  ok: boolean;
  value?: T;
  errors?: string[];
  raw: string;                   // raw provider text
  usedMode: GPO_StructuredMode;
  schema: GPO_SchemaEnvelope;
  promptId: string;
  tokensIn?: number;
  tokensOut?: number;
  durationMs?: number;
  attempts: number;
}

export interface GPO_FieldMappingResult {
  updatedFields: string[];       // dotted paths filled
  skippedFields: string[];       // not permitted by policy
  rejectedFields: string[];      // invalid per validation
  diffs: Record<string, { before: any; after: any }>;
}

export interface GPO_ContractAwareConfig {
  enabled: boolean;
  acceptNonStrict: boolean;      // allow fallback to sentinel parsing
  maxParseAttempts: number;      // e.g., 2
  maxResponseBytes: number;      // safety cap
  providerModes: Partial<Record<string, GPO_StructuredMode>>; // by provider key
  sentinel: { start: string; end: string }; // e.g., <gpo_json> ... </gpo_json>
}

B) Config
File: 04-Dashboard/app/state/config/ai-io.json (new)
{
  "enabled": true,
  "acceptNonStrict": true,
  "maxParseAttempts": 2,
  "maxResponseBytes": 400000,
  "providerModes": {
    "openai": "native-json",
    "anthropic": "native-json",
    "perplexity": "prompt-sentinel",
    "google": "mime-json"
  },
  "sentinel": { "start": "<gpo_json>", "end": "</gpo_json>" }
}

Add loader/validator:
File: 04-Dashboard/app/lib/config/ai-io.ts (new)
- export function loadContractAwareConfig(): GPO_ContractAwareConfig
- Validate and default fields; deep-freeze result.

C) Contract → JSON Schema
File: 04-Dashboard/app/lib/contracts/schema-encoder.ts (new)
- export function encodeContractToSchema(contract: any): GPO_SchemaEnvelope
  - Accept existing deliverable/engine contract objects used in Parts 59-66
  - Produce:
    - jsonSchema: JSON Schema draft-07 object (type: object, properties, required)
    - schemaSummary: concise textual field list (name: type - description)
    - schemaHash: stable canonical JSON hash via existing util (see lib/util/hash.ts or add)
    - version and contractId from contract metadata (fallbacks allowed)
- Ensure deterministic key ordering for hashing (canonicalize).

D) Prompt Builder
File: 04-Dashboard/app/lib/prompt/contract-aware.ts (new)
- export function buildContractAwarePrompt(args: {
    provider: string;
    locale?: string;
    taskKind: 'board-deliberation' | 'subtask-execution';
    taskDescription: string;
    deliverableContract: any;
    priorContext?: string;             // excerpts or merged summaries
    fieldPolicies?: any;               // from Part 61 per-variant field policies
  }): { envelope: GPO_PromptEnvelope; schema: GPO_SchemaEnvelope }
Behavior:
- Load config
- Encode schema with encodeContractToSchema
- Build instructions block:
  - "You MUST return a single JSON object that validates against the following JSON Schema. Do not include any prose, markdown, or code fences."
  - Include jsonSchema pretty-printed (2 spaces)
  - Include compact examples if contract contains examples (optional)
  - Reinforce: "If unsure, return empty values conforming to schema (e.g., [], '', null where allowed)."
  - Add "Constraints from field policies:"; list any field-level constraints succinctly
- Build system and user prompts based on taskKind:
  - Board: system = governance/system prompt + role + compliance reminders
  - Subtask: system tailored to the engine/subtask role
- Compute mode by provider with config fallback
- For 'prompt-sentinel' mode, append sentinelStart/sentinelEnd guidance:
  - "Wrap ONLY the JSON object between <gpo_json> and </gpo_json>."
- Compute promptId = stableHash(provider + system + user + instructions + schemaHash + mode)
- Return envelope

E) Provider Wiring
File: 04-Dashboard/app/lib/ai/providers.ts (new or extend existing provider module)
- Add a helper to map modes to provider call options:
  - OpenAI (native-json): messages + response_format: { type: 'json_object' }
  - Anthropic (native-json): messages + response_format: { type: 'json' }
  - Google Gemini (mime-json): generationConfig.response_mime_type = 'application/json'
  - Perplexity/others (prompt-sentinel): plain text; rely on sentinel
- export async function callProviderStructured(args: {
    provider: string;
    model: string;
    envelope: GPO_PromptEnvelope;
    schema: GPO_SchemaEnvelope;
    abortSignal?: AbortSignal;
    tracing?: any;
  }): Promise<{ rawText: string; tokensIn?: number; tokensOut?: number; durationMs: number; usedMode: GPO_StructuredMode }>

Note: Reuse existing provider clients; do not duplicate auth or logging; only add mode options. Ensure redaction via existing deep-redaction.ts before logging prompts.

F) Structured Output Parser
File: 04-Dashboard/app/lib/ai/structured-output.ts (new)
- export function parseStructured<T = any>(raw: string, mode: GPO_StructuredMode, schema: GPO_SchemaEnvelope, cfg: GPO_ContractAwareConfig): GPO_StructuredExtraction<T>
  - Pipeline:
    1) If mode is native-json or mime-json, attempt JSON.parse(raw) directly
    2) If prompt-sentinel, extract between cfg.sentinel.start/end; trim; JSON.parse
    3) Fallbacks (if acceptNonStrict):
       - Try to find first ```json ... ``` fenced block
       - Try to find first {...} balanced braces (size-capped)
    4) Validate against jsonSchema (use existing validator if present; else bundle ajv-lite locally in repo scope; no external network)
    5) Return { ok, value, errors, raw, usedMode, schema, promptId: '' } (promptId filled by caller)
- export function canonicalize<T>(obj: T): T for deterministic diffing
- Keep within maxResponseBytes; truncate and mark error on overflow

G) Merge Integration
File: 04-Dashboard/app/lib/merge/field-populator.ts (new)
- export function populateDeliverableFromStructured(args: {
    deliverable: any;                    // scaffold or in-progress deliverable
    parsed: GPO_StructuredExtraction<any>;
    mergePolicy: any;                    // existing per-variant field policies (Part 61)
  }): GPO_FieldMappingResult
Behavior:
- For each top-level field in parsed.value, apply merge strategy from policy
- Respect protection/immutability rules from runtime governance
- Build diffs map
- Do not mutate inputs; return new object when used by caller
- Throw typed errors on invalid mapping

H) Evidence & Logging
File: 04-Dashboard/app/lib/evidence/structured.ts (new)
- export function recordStructuredEvidence(args: {
    deliverableId: string;
    taskId: string;
    schema: GPO_SchemaEnvelope;
    envelope: GPO_PromptEnvelope;
    extraction: GPO_StructuredExtraction<any>;
    mapping?: GPO_FieldMappingResult;
  }): void
Behavior:
- Write JSON evidence to state/evidence/{deliverableId}/{taskId}/structured-{timestamp}.json
- Include hashes, timings, provider, mode, sizes
- Use deep-redaction.ts to strip secrets and PII (apply existing data classifications)

I) Deliberation Wiring
File: 04-Dashboard/app/lib/deliberation.ts
- Locate the AI call sites for:
  - Board-level deliberation producing deliverable changes
  - Subtask execution calls
Changes:
- Before calling provider, call buildContractAwarePrompt(...) with the deliverable contract relevant to the engine/subtask
- Invoke callProviderStructured(...) with returned envelope
- Parse with parseStructured(...)
- If extraction.ok:
  - Use populateDeliverableFromStructured(...) to produce field-level changes
  - Then invoke existing merge pipeline with a new strategy “structured-field-populate” that prefers parsed fields
- Else:
  - Fallback to existing heuristic merge (maintain compatibility)
- Record evidence via recordStructuredEvidence(...)
- Ensure runtime hooks (onTaskStart/onSubtaskComplete/onTaskComplete) receive both raw and parsed forms in the event payloads (non-breaking: add optional fields)

J) Worker/Chief Integration
Files:
- 04-Dashboard/app/lib/worker.ts
- 04-Dashboard/app/lib/chief-of-staff.ts
Changes:
- Thread through deliverableContract and fieldPolicies into deliberation calls
- Respect config flags; if disabled, skip structured path entirely
- Ensure budgets/governance counters include retries for parse attempts

K) API Surface
File: 04-Dashboard/app/server.js
- Add route: GET /api/deliverables/:id/structured
  - Returns latest structured extraction and mapping summary
  - Guard with existing inline route guard + project/tenant isolation checks
  - Redact via deep-redaction.ts
- Add route: GET /api/deliverables/:id/structured/:taskId to fetch specific evidence file
- Wire to evidence reader function in a new module:
  - 04-Dashboard/app/lib/evidence/reader.ts with typed responses

Types for API responses should reference:
- GPO_StructuredExtraction
- GPO_FieldMappingResult

L) UI
Files:
- 04-Dashboard/app/index.html: In Deliverables panel, add “Structured” badge if latest extraction.ok
- 04-Dashboard/app/app.js and operator.js:
  - In task/deliverable detail drawer, add a toggle "View: Raw | Parsed"
  - When Parsed is selected, fetch /api/deliverables/:id/structured
  - Render parsed JSON pretty with syntax highlight (reuse existing highlighter if present)
  - Show mapping diffs (field → before/after) as a compact list
  - If parsing failed, show last error message and fallback raw

M) Docs
Add:
- 04-Dashboard/docs/ADR/ADR-00XX-structured-output.md
  - Problem, decision, JSON modes, schema hashing, prompt sentinel, validation, fallbacks, risks
- 04-Dashboard/docs/runbooks/structured-output-runbook.md
  - How to enable/disable, troubleshooting parse errors, provider mode matrix, evidence paths
- 04-Dashboard/docs/contracts/schema-encoding.md
  - How Type/Contract maps to JSON Schema; conventions and examples

N) Tests
- Unit:
  - schema-encoder.ts: encode contracts with nested arrays, enums, optional fields → stable hash
  - structured-output.ts: parse modes (native-json, mime-json, prompt-sentinel), fallbacks, size caps, invalid JSON
  - field-populator.ts: mapping and policy enforcement; diffs correctness
- Integration:
  - deliberation.ts: mock providers returning valid/invalid JSON; ensure field population on success, fallback on failure
  - providers.ts: correct options by provider
  - evidence: file creation with redaction
- API:
  - /api/deliverables/:id/structured guarded, redacted, correct shapes
- UI:
  - Toggle Raw/Parsed; renders parsed and diffs; error state visible

O) Acceptance Criteria
- AC1: For a representative engine (e.g., TopRanker), AI returns JSON matching contract with fields ranked_items[].headline, summary, source; merge populates these fields with structured-field-populate strategy (no heuristic append)
- AC2: Board-level deliberation and subtask execution both use contract-aware prompts
- AC3: Provider-native JSON modes are engaged for OpenAI, Anthropic, Gemini; others use sentinel mode
- AC4: Evidence files include schemaHash, promptId, usedMode, parse status, and mapping diffs
- AC5: UI shows “Structured” badge and allows Raw/Parsed toggle; parsed view matches evidence value
- AC6: If JSON invalid, system retries once (maxParseAttempts), then falls back without breaking the task
- AC7: Contracts with optional fields and enums validate correctly; invalid fields are rejected and reported
- AC8: No PII/secrets leakage in evidence or API responses (deep-redaction enforced)
- AC9: Existing acceptance suite still passes; add 12 new scenarios covering structured path
- AC10: Feature flag off fully restores prior heuristic behavior

P) Hardening
- Injection resilience: place schema in system/instructions, not in user message; never echo secrets
- Response size cap: truncate and fail parse with clear evidence record
- Deterministic hashing and canonicalization for idempotent evidence linking
- Strict JSON only; prohibit markdown; sentinel guard provides deterministic extraction
- Provider timeouts and retry backoff consistent with existing governance budgets
- Streaming: if provider streaming is used elsewhere, buffer to string before parse (no partial parses)
- Logging: redact before storage; mask example values that look like secrets per classifier
- Rate limits: do not increase parallelism; reuse existing budgets

Q) Pseudocode Snippets

contract-aware.ts
export function buildContractAwarePrompt(args) {
  const cfg = loadContractAwareConfig();
  const schema = encodeContractToSchema(args.deliverableContract);
  const mode = cfg.providerModes[args.provider] || 'prompt-sentinel';
  const instructions = [
    'You are producing a JSON object that MUST validate against the following JSON Schema.',
    'Return ONLY the JSON object. No commentary, no markdown, no code fences.',
    mode === 'prompt-sentinel' ? `Wrap ONLY between ${cfg.sentinel.start} and ${cfg.sentinel.end}.` : '',
    'If uncertain about a field, use empty values allowed by the schema.',
    'JSON Schema:',
    JSON.stringify(schema.jsonSchema, null, 2),
    args.fieldPolicies ? `Field policy constraints: ${summarizePolicies(args.fieldPolicies)}` : ''
  ].filter(Boolean).join('\n');
  const system = buildSystemForTaskKind(args.taskKind, args.locale);
  const user = args.taskDescription + (args.priorContext ? '\nContext:\n' + args.priorContext : '');
  const promptId = stableHash([args.provider, system, user, instructions, schema.schemaHash, mode].join('||'));
  return {
    envelope: { promptId, mode, system, user, instructions, providerHints: {} , sentinelStart: cfg.sentinel.start, sentinelEnd: cfg.sentinel.end },
    schema
  };
}

deliberation.ts (call site)
const { envelope, schema } = buildContractAwarePrompt({ provider, taskKind, taskDescription, deliverableContract, priorContext, fieldPolicies });
const res = await callProviderStructured({ provider, model, envelope, schema, abortSignal });
const parsed = parseStructured(res.rawText, res.usedMode, schema, loadContractAwareConfig());
parsed.tokensIn = res.tokensIn; parsed.tokensOut = res.tokensOut; parsed.durationMs = res.durationMs; parsed.promptId = envelope.promptId;
let mapping;
if (parsed.ok) {
  mapping = populateDeliverableFromStructured({ deliverable, parsed, mergePolicy: fieldPolicies });
  // integrate with existing merge pipeline by emitting a structured-field-populate change set
} else {
  // existing heuristic merge path
}
recordStructuredEvidence({ deliverableId, taskId, schema, envelope, extraction: parsed, mapping });

R) Provider Mode Matrix (hard rules)
- OpenAI: use response_format: { type: 'json_object' }
- Anthropic: use response_format: { type: 'json' }
- Google Gemini: generationConfig.response_mime_type = 'application/json'
- Perplexity/Unknown: prompt-sentinel mode with <gpo_json> ... </gpo_json>

S) Migration/Backcompat
- Config defaults enable structured mode
- If contract missing or schema encoding fails, log evidence and fall back
- No state migrations required

T) Route Guards
- All new routes must invoke http-response-guard.ts and existing tenant/project isolation checks
- Attach deep-redaction pipeline before sending payloads

U) Commit Plan
- Commit 1: Types + Config loader + schema encoder
- Commit 2: Prompt builder + provider wiring
- Commit 3: Structured parser + field populator
- Commit 4: Deliberation/Worker/Chief integration + evidence
- Commit 5: API routes + evidence reader
- Commit 6: UI toggle + badge
- Commit 7: Tests (unit + integration + API + UI)
- Commit 8: Docs (ADR + runbook + schema encoding)

V) Review Checklist
- [ ] Contract-aware config loaded and validated
- [ ] Prompt includes schema, policies, and strict no-prose instruction
- [ ] Provider modes correctly selected per provider
- [ ] Parser handles all 4 modes + fallbacks deterministically
- [ ] Field-level mapping respects policies and governance
- [ ] Evidence contains schemaHash + promptId + diffs; redacted
- [ ] API routes guarded and return typed payloads
- [ ] UI reflects parsed vs raw with diffs
- [ ] All acceptance criteria met; prior suites still pass

Deliver exactly this part. Do not modify unrelated modules. Preserve existing working functionality and contracts.
```
