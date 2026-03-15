# AI I/O Operations Runbook

**Part:** 68
**Last Updated:** 2026-03-14

## Overview

This runbook covers operating the structured AI I/O pipeline including provider routing, parse retry, board/worker integration, and status monitoring.

## Feature Flags

Edit `state/config/ai-io.json`:

| Flag | Default | Effect |
|------|---------|--------|
| `enabled` | `true` | Master kill switch for all structured output |
| `boardStructuredEnabled` | `true` | Board 7-phase structured path |
| `workerStructuredEnabled` | `true` | Worker/subtask structured path |
| `providerRouting` | `"capability-preferred"` | Routing mode |
| `allowManualRetry` | `false` | Allow POST /api/ai-io/retry |
| `exposeStatusToOperator` | `true` | Show structured IO in briefs |

## Provider Routing

### Modes

- **`capability-preferred`** (default): Select best structured-capable provider. Prefers requested provider if capable.
- **`force-config`**: Use providerModes from config without capability check.
- **`legacy`**: Disable structured path entirely; use plain text.

### Override provider for a context

The routing decision respects the preferred provider from the engine/task config. To force a specific provider, set `providerRouting: "force-config"` and configure `providerModes`.

## Retry Policy

### Configuration

```json
{
  "maxParseAttempts": 3,
  "backoffMs": 250,
  "backoffMultiplier": 1.7,
  "backoffJitter": 0.2
}
```

### Behavior

1. First attempt: immediate
2. On failure: wait `250ms × 1.7^(attempt-1) × (1 ± 0.2)`
3. Retry up to `maxParseAttempts` times
4. If all fail: fall back to legacy plain-text path, status = `fallback`

### Timing

| Attempt | Approx Delay |
|---------|-------------|
| 1 → 2 | ~250ms |
| 2 → 3 | ~425ms |
| 3 → 4 | ~722ms |

## Monitoring

### API Endpoints

```bash
# Structured IO status for a task
curl http://localhost:3000/api/ai-io/status/{taskId}

# Provider capabilities
curl http://localhost:3000/api/providers/capabilities

# Manual retry (if enabled)
curl -X POST http://localhost:3000/api/ai-io/retry/{taskId}
```

### Status Values

| Status | Meaning |
|--------|---------|
| `idle` | Not started |
| `in-progress` | Currently executing |
| `complete` | All fields parsed successfully |
| `partial` | Parsed but some fields missing |
| `failed` | All retries exhausted |
| `fallback` | Fell back to legacy path |
| `disabled` | Feature flag off |

### Interpreting Statuses

In Chief of Staff briefs:
```
Structured extraction via openai native-json; attempt 1/3 complete; 12 fields
```

## Troubleshooting

### Board phases failing structured parse

1. Check `/api/ai-io/status/{taskId}` for per-phase status
2. Look at `lastErrorCode` and `lastErrorMessage`
3. Common causes:
   - Provider returned non-JSON (try increasing prompt emphasis)
   - Schema too large for context window
   - Provider rate limited (check error code)

### Retry not working

1. Verify `maxParseAttempts > 1` in config
2. Check evidence files for attempt records
3. Verify backoff isn't being short-circuited by provider errors

### Manual retry blocked

Manual retry requires `allowManualRetry: true` in config. This is off by default for safety.

## Board Phase Schemas

Each board phase has a minimal JSON Schema:
- `interpret`: summary, decisions, risks
- `research`: summary, risks (unknowns)
- `critique`: summary, decisions, risks
- `synthesize`: summary, decisions, risks, subtasks, requiredFieldsCovered, missingFields
- `decide`: summary, decisions, risks
- `review`: summary, risks, contractHints
- `report`: summary

Schemas are defined in `lib/contracts/board-phase.ts`.
