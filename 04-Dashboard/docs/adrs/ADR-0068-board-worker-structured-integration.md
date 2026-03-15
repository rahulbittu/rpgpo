# ADR-0068: Board + Worker Structured Integration + Retry + Provider-Aware Routing

**Status:** Accepted
**Date:** 2026-03-14
**Part:** 68

## Context

Part 67 delivered the structured output pipeline (schema → prompt → parse → merge → evidence) for subtask execution. However, the Board's 7-phase lifecycle, worker execution, and provider selection didn't use it. Parse retry wasn't wired despite maxParseAttempts being configured.

## Decision

1. **Provider Capability Registry** — Hardcode known provider capabilities (native-json, mime-json, prompt-sentinel) and route structured calls to the most capable provider.

2. **Capability-Preferred Routing** — When selecting a provider for structured output, prefer the requested provider if it supports structured output; otherwise fall back to the best capable provider (default: OpenAI native-json).

3. **Exponential Backoff with Jitter** — Parse retries use `baseMs * multiplier^(attempt-1) * (1 ± jitter)` with configurable parameters. Non-blocking via setTimeout.

4. **executeWithParseRetry** — Unified retry loop that handles prompt building, provider calls, parsing, and evidence recording per attempt. Used by both board and worker paths.

5. **Board Structured Phases** — Each board phase (interpret, research, critique, synthesize, decide, review, report) has a JSON Schema defining expected output. When boardStructuredEnabled=true, phases route through the structured pipeline with retry.

6. **Chief of Staff Surfacing** — Structured IO status is exposed via `getStructuredIOStatus(taskId)` and `getStructuredIOBriefSnippet(taskId)` for operator visibility.

7. **Feature Flags** — `boardStructuredEnabled`, `workerStructuredEnabled`, `providerRouting`, `allowManualRetry` provide fine-grained control. All default ON except manual retry.

## Provider Capability Matrix

| Provider | Native JSON | MIME JSON | Sentinel | Structured |
|----------|-------------|-----------|----------|------------|
| OpenAI | Yes | No | Yes | Yes |
| Anthropic | Yes | No | Yes | Yes |
| Gemini | No | Yes | Yes | Yes |
| Perplexity | No | No | Yes | No (sentinel only) |

## Routing Modes

| Mode | Behavior |
|------|----------|
| `capability-preferred` | Prefer requested provider if capable; fallback to best |
| `force-config` | Use config providerModes without capability check |
| `legacy` | Disable structured path entirely |

## Backoff Formula

```
delay = baseMs × multiplier^(attempt-1) × (1 ± random×jitter)
```

Defaults: base=250ms, multiplier=1.7, jitter=0.2
- Attempt 1: ~250ms
- Attempt 2: ~425ms
- Attempt 3: ~722ms

## New Modules

| Module | Purpose |
|--------|---------|
| `ai/provider-capabilities.ts` | Provider capability registry + routing decisions |
| `ai/backoff.ts` | Exponential backoff computation |
| `contracts/board-phase.ts` | JSON Schema per board lifecycle phase |

## New API Routes

| Route | Method | Purpose |
|-------|--------|---------|
| `/api/ai-io/status/:taskId` | GET | Structured IO status per task |
| `/api/ai-io/retry/:taskId` | POST | Manual retry (guarded by allowManualRetry) |
| `/api/providers/capabilities` | GET | Provider capabilities + routing config |

## New Types

- `GPO_ProviderCapability` — Provider structured output capabilities
- `GPO_ProviderRoutingDecision` — Routing decision with mode and retry plan
- `GPO_StructuredIOAttempt` — Per-attempt result with timing and errors
- `GPO_StructuredIOStatus` — Aggregate status across attempts
- `GPO_BoardPhaseOutput` — Structured output per board phase
- `GPO_ProviderMode` — `'native-json' | 'mime-json' | 'prompt-sentinel'`

## Consequences

### Positive
- Board deliberation produces structured JSON per phase
- Parse failures are retried with backoff before falling back
- Provider selection considers structured capability
- Operator can see structured IO status in briefs and UI

### Negative
- Retry adds latency on parse failures (bounded by maxAttempts × backoff)
- Board phases now make 2 calls per phase in worst case (structured + fallback)

### Rollback
- Set `boardStructuredEnabled: false` and `workerStructuredEnabled: false` in config
- Or set `providerRouting: "legacy"` to disable all structured routing
