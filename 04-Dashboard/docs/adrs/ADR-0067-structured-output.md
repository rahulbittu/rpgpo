# ADR-0067: Contract-Aware Prompt Augmentation + Structured Output Extraction

**Status:** Accepted
**Date:** 2026-03-14
**Part:** 67

## Context

Parts 59–66 built a full deliverable lifecycle: scaffold → merge → validate → store → approve → release. However, AI providers receive unstructured prompts and return free-form text. The merge step performs heuristic text-append instead of field-level population, meaning deliverables are never truly structured at the source.

## Problem

1. AI providers don't know what fields the deliverable contract requires.
2. Responses contain prose, markdown, and code fences mixed with data.
3. The merge layer can only append text blobs — it cannot populate `rankedItems[].headline` directly.
4. No evidence trail links schema → prompt → parse → field mapping.

## Decision

Inject the engine's output contract as a JSON Schema into every AI prompt (both board deliberation and subtask execution), enable provider-native JSON modes where available, parse/validate structured output, and map parsed fields to deliverables using existing merge policies.

### Architecture

```
┌─────────────┐     ┌─────────────────┐     ┌──────────────────┐
│ Engine       │────▶│ Schema Encoder  │────▶│ Prompt Builder   │
│ Contract     │     │ (JSON Schema)   │     │ (system+user+    │
│              │     │                 │     │  schema inject)  │
└─────────────┘     └─────────────────┘     └────────┬─────────┘
                                                      │
                                                      ▼
                                            ┌──────────────────┐
                                            │ Provider Call     │
                                            │ (mode-specific:   │
                                            │  native-json,     │
                                            │  mime-json,       │
                                            │  prompt-sentinel) │
                                            └────────┬─────────┘
                                                      │
                                                      ▼
                                            ┌──────────────────┐
                                            │ Structured Parser │
                                            │ (JSON.parse →     │
                                            │  sentinel →       │
                                            │  fenced → braces) │
                                            └────────┬─────────┘
                                                      │
                                                      ▼
                                            ┌──────────────────┐
                                            │ Field Populator   │
                                            │ (merge policy     │
                                            │  aware mapping)   │
                                            └────────┬─────────┘
                                                      │
                                                      ▼
                                            ┌──────────────────┐
                                            │ Evidence Recorder │
                                            │ (schema + prompt  │
                                            │  + parse + diffs) │
                                            └──────────────────┘
```

### Provider JSON Mode Matrix

| Provider    | Mode              | Mechanism                                           |
|-------------|-------------------|-----------------------------------------------------|
| OpenAI      | `native-json`     | Strong prompt injection (response_format planned)   |
| Anthropic   | `native-json`     | Strong prompt injection                             |
| Gemini      | `mime-json`       | generationConfig.response_mime_type                 |
| Perplexity  | `prompt-sentinel` | `<gpo_json>...</gpo_json>` sentinel markers         |
| Unknown     | `prompt-sentinel` | Fallback to sentinel mode                           |

### Parse Pipeline (4 stages)

1. **Direct JSON.parse** — for native-json/mime-json modes
2. **Sentinel extraction** — for prompt-sentinel mode, extract between markers
3. **Fenced code block** — fallback: extract from ` ```json ... ``` `
4. **Balanced braces** — fallback: find first `{...}` with balanced depth

### Schema Hashing

- Contracts are canonicalized (sorted keys, deterministic JSON)
- SHA-256 hash truncated to 16 chars (base64url)
- Used for evidence linking and idempotency

## Alternatives Considered

1. **Tool/function calling** — More reliable but not all providers support it; adds complexity. Kept as future `tool-call` mode in the type system.
2. **Post-hoc extraction with another AI call** — Doubles cost and latency. Rejected.
3. **Regex-based field extraction** — Brittle, doesn't scale to nested objects. Rejected.

## Consequences

### Positive
- AI produces deliverable-shaped JSON that maps directly to contract fields
- Field-level merge instead of text-append
- Full evidence trail: schema hash → prompt ID → parse result → field diffs
- Feature-flagged: disable returns to prior heuristic path
- Provider-agnostic: works with any provider via sentinel fallback

### Negative
- Prompt size increases (~500–2000 tokens for schema injection)
- Parse failures require retry (capped at maxParseAttempts=2)
- Schema encoding is approximated from contract metadata, not hand-authored

### Risks
- Prompt injection: schema is placed in system/instructions, never in user message; no secrets echoed
- Response size: capped at maxResponseBytes (400KB); truncation triggers parse failure with evidence
- Provider behavior changes: fallback chain provides resilience

## Configuration

File: `state/config/ai-io.json`

```json
{
  "enabled": true,
  "acceptNonStrict": true,
  "maxParseAttempts": 2,
  "maxResponseBytes": 400000,
  "providerModes": {
    "openai": "native-json",
    "anthropic": "native-json",
    "perplexity": "prompt-sentinel",
    "gemini": "mime-json"
  },
  "sentinel": { "start": "<gpo_json>", "end": "</gpo_json>" }
}
```

## New Modules

| Module | Path | Purpose |
|--------|------|---------|
| Config Loader | `lib/config/ai-io.ts` | Load + validate + cache config |
| Schema Encoder | `lib/contracts/schema-encoder.ts` | Contract → JSON Schema envelope |
| Prompt Builder | `lib/prompt/contract-aware.ts` | Build contract-injected prompts |
| Provider Wiring | `lib/ai/providers.ts` | Mode-specific provider calls |
| Structured Parser | `lib/ai/structured-output.ts` | Multi-mode JSON extraction |
| Field Populator | `lib/merge/field-populator.ts` | Policy-aware field mapping |
| Evidence Recorder | `lib/evidence/structured.ts` | Redacted evidence files |
| Evidence Reader | `lib/evidence/reader.ts` | Query evidence by deliverable/task |

## API Routes

- `GET /api/deliverables/:id/structured` — Latest structured extraction + mapping summary
- `GET /api/deliverables/:id/structured/:taskId` — Task-specific evidence entries

## Types Added

- `GPO_StructuredMode` — `'native-json' | 'tool-call' | 'mime-json' | 'prompt-sentinel'`
- `GPO_SchemaEnvelope` — Contract ID, version, hash, JSON Schema, summary
- `GPO_PromptEnvelope` — Prompt ID, mode, system/user/instructions, sentinels
- `GPO_StructuredExtraction<T>` — Parse result with ok/value/errors/raw/timing
- `GPO_FieldMappingResult` — Updated/skipped/rejected fields with diffs
- `GPO_ContractAwareConfig` — Feature flag, modes, limits, sentinels
