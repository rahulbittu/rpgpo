# Structured Output Runbook

**Part:** 67 — Contract-Aware Prompt Augmentation + Structured Output Extraction
**Last Updated:** 2026-03-14

## Overview

This runbook covers operating the structured output pipeline that injects JSON Schema into AI prompts and extracts structured fields from responses.

## Enable / Disable

### Full Disable (revert to heuristic merge)

Edit `04-Dashboard/state/config/ai-io.json`:

```json
{
  "enabled": false
}
```

No code changes needed. The `executeStructuredSubtask()` function in deliberation.ts checks this flag and falls back to plain AI calls when disabled.

### Restart after config change

The config is cached in-process. Restart the dashboard server for changes to take effect, or call the config cache clear if exposed.

## Provider Mode Configuration

### Supported Modes

| Mode | Description | Providers |
|------|-------------|-----------|
| `native-json` | Strong prompt instruction for JSON-only output | OpenAI, Anthropic |
| `mime-json` | generationConfig.response_mime_type | Gemini/Google |
| `prompt-sentinel` | Wrap JSON in `<gpo_json>...</gpo_json>` markers | Perplexity, unknown providers |
| `tool-call` | Reserved for future function-calling mode | Not yet wired |

### Change a provider's mode

Edit `state/config/ai-io.json` → `providerModes`:

```json
{
  "providerModes": {
    "openai": "native-json",
    "perplexity": "prompt-sentinel",
    "gemini": "mime-json"
  }
}
```

### Add a new provider

Add its key to `providerModes`. If the provider doesn't support native JSON modes, use `"prompt-sentinel"`.

## Troubleshooting Parse Errors

### Symptoms
- Evidence files show `extraction.ok: false`
- Deliverable fields remain empty after subtask completion
- API returns `{ error: "No structured evidence found" }`

### Diagnosis Steps

1. **Check evidence files** at `state/evidence/{deliverableId}/{taskId}/structured-*.json`
2. Look at `extraction.errors` array for the specific failure
3. Common errors:
   - `"Direct JSON parse failed"` — Provider returned prose instead of JSON
   - `"Sentinel markers not found"` — Provider ignored sentinel instructions
   - `"Missing required field: X"` — JSON valid but missing contract fields
   - `"Response exceeds maxResponseBytes"` — Response too large

### Remediation

| Error | Fix |
|-------|-----|
| Provider returns prose | Switch provider to `prompt-sentinel` mode; add stronger instructions |
| Sentinel not found | Verify sentinel strings match config; check provider doesn't strip XML-like tags |
| Missing fields | Check schema encoding covers the field; verify contract has it in required_fields |
| Size exceeded | Increase `maxResponseBytes` in config or reduce prompt context size |
| All parse modes fail | Set `acceptNonStrict: true` to enable fenced/braces fallbacks |

### Fallback Behavior

When parse fails:
1. If `maxParseAttempts > 1`, the system may retry (future enhancement)
2. Falls back to heuristic text-append merge (existing Part 62–66 path)
3. Evidence is still recorded with `ok: false` for audit

## Evidence File Structure

```
state/evidence/
  └── {deliverableId}/
      └── {taskId}/
          └── structured-{timestamp}.json
```

Each evidence file contains:
- `recorded_at` — ISO timestamp
- `schema` — Contract ID, version, hash (no full schema for size)
- `prompt` — Prompt ID, mode, lengths (no full text for privacy)
- `extraction` — ok, mode, attempts, errors, value keys, raw length, tokens, duration
- `mapping` — Updated/skipped/rejected fields, diff count

### Query Evidence via API

```bash
# Latest for a deliverable
curl http://localhost:3000/api/deliverables/{id}/structured

# All entries for a specific task
curl http://localhost:3000/api/deliverables/{id}/structured/{taskId}
```

## Schema Encoding

The schema encoder (`lib/contracts/schema-encoder.ts`) automatically maps engine contracts to JSON Schema:

1. Reads field definitions from `structured-deliverables.ts` (KIND_FIELDS)
2. Reads required fields from `output-contracts.ts` (getContract)
3. Merges both into a JSON Schema draft-07 object
4. Computes stable hash for evidence linking

### Known field schemas

The encoder has built-in schemas for ~40 common fields (rankedItems, sections, steps, diffs, etc.). Unknown fields default to `{ type: "string" }`.

### Verify encoding for an engine

```bash
node -e "
  const se = require('./lib/contracts/schema-encoder');
  const schema = se.encodeContractToSchema('newsroom');
  console.log(JSON.stringify(schema, null, 2));
"
```

## Monitoring Checklist

- [ ] Evidence files being created in `state/evidence/` after subtask completions
- [ ] `extraction.ok: true` rate above 80% (check evidence files)
- [ ] No PII/secrets in evidence files (deep-redaction applied to prompt contents)
- [ ] API routes return correct data with guards applied
- [ ] UI "Structured" badges appear on deliverables with successful extractions
- [ ] Feature flag toggle works without restart issues

## Config Reference

| Field | Type | Default | Description |
|-------|------|---------|-------------|
| `enabled` | boolean | `true` | Master kill switch |
| `acceptNonStrict` | boolean | `true` | Allow fenced/braces fallback parsing |
| `maxParseAttempts` | number | `2` | Max parse retries per call |
| `maxResponseBytes` | number | `400000` | Response size cap before truncation |
| `providerModes` | object | see above | Provider → mode mapping |
| `sentinel.start` | string | `<gpo_json>` | Sentinel start marker |
| `sentinel.end` | string | `</gpo_json>` | Sentinel end marker |
