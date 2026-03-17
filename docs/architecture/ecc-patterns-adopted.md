# ECC Patterns Adopted into GPO

## Pattern 1: Session Lifecycle Persistence

### Files Changed
- `04-Dashboard/app/server.js` — added `saveSessionState()`, `loadSessionState()`, `gracefulShutdown()`, SIGTERM/SIGINT handlers, 5-minute periodic save

### Exact Behavior Added
- On server startup: reads `artifacts/behavior/session-cache.json` and logs prior session summary (signal count, task count, save timestamp)
- On SIGTERM or SIGINT: saves current behavior stats, routing stats, signal counts, and task metrics to `session-cache.json` before exit
- Every 5 minutes: saves session state as a safety net against crashes

### Why It Fits GPO
GPO previously lost all runtime state on restart. The server had no graceful shutdown — a kill meant losing in-memory routing stats and signal cache. Session persistence means GPO can report continuity across restarts.

### Limitations
- Only persists aggregate metrics (signal count, task count, routing stats) — does not persist in-memory caches like the operator profile or loaded signal objects
- The 5-minute save writes the full state file every time — could be optimized to diff-based saves
- `loadSessionState()` currently only logs — it does not pre-warm any caches

### How to Validate
- Kill server with SIGTERM, check that `session-cache.json` was written with current timestamp
- Restart server, check logs for "Restored session" message with accurate prior stats
- Verify `session-cache.json` updates every 5 minutes during normal operation

### Affects
- **Behavior learning:** No direct effect — signals are persisted separately in `operator-signals.json`
- **Continuity:** YES — server restarts now preserve session context summary
- **Safety:** No effect
- **Evaluation:** No effect
- **Operator trust:** Moderate — operator can see that GPO remembers its prior session state

---

## Pattern 2: Verification Eval Metrics (pass@1 equivalent)

### Files Changed
- `04-Dashboard/app/lib/workflow.ts` — added output quality scoring on task completion (length, structure, sources, subtask count)
- `04-Dashboard/app/lib/behavior.ts` — added `first_pass_clean_rate` signal derivation from live workflow completion events

### Exact Behavior Added
- When a task completes in workflow.ts, the `output_accepted` or `output_abandoned` event now includes a `quality` metadata object:
  ```json
  {
    "output_length": 7664,
    "has_structure": true,
    "has_sources": true,
    "subtask_count": 2,
    "length_adequate": true
  }
  ```
- In behavior.ts, `deriveSignals()` now computes a `first_pass_clean_rate` signal from live workflow events:
  - Counts accepted vs abandoned tasks from real completions (not seeded history)
  - Averages output length and structural quality across recent completions
  - Requires 5+ live events to activate, 10+ for full active status

### Why It Fits GPO
GPO claimed "100% clean rate" across many batches but had no automated quality measurement beyond "task status = done." This pattern adds real quality scoring — length adequacy, structural sections present, source citations — so "clean" has verifiable meaning.

### Limitations
- Quality scoring is lightweight — it checks for `##` headings and URL patterns, not semantic quality
- "length_adequate" threshold is hardcoded at 500 chars — may need tuning per engine
- The metric conflates "task completed" with "output is good" — a task can complete with mediocre output
- Current data: 52/52 = 100% is likely to remain near-perfect because auto-executed tasks rarely fail outright. The metric needs human feedback (rewrites, rejections) to become meaningful quality signal rather than just completion signal

### How to Validate
- Submit a task, wait for completion, check that `output_accepted` event in `operator-events.jsonl` includes `quality` metadata
- Run `behavior.deriveSignals()` and verify `first_pass_clean_rate` signal exists with `provenance: live_observed`
- Check that avg output length and structured percentage are populated (not 0)

### Affects
- **Behavior learning:** YES — quality metadata enriches behavior events; enables future quality-per-engine signals
- **Continuity:** No direct effect
- **Safety:** No effect
- **Evaluation:** YES — first automated quality measurement beyond binary pass/fail
- **Operator trust:** Low currently — metric is real but shallow; needs human feedback loop to become trustworthy quality indicator

---

## Pattern 3: Pre-Execution Safety Checks

### Files Changed
- `04-Dashboard/app/worker.js` — added `validatePromptSafety()` function and call site before every provider API call

### Exact Behavior Added
- Before each API call (OpenAI, Perplexity, Gemini), the combined system+user prompt is checked:
  - Regex scan for API key patterns: `sk-*`, `pplx-*`, `AIza*`, `ghp_*`
  - Length check: warns if prompt exceeds 50,000 characters
- Warnings are logged to console (visible in worker logs)
- Does NOT block execution — warn-only mode to avoid false-positive disruption
- Tracks `_safetyWarnings` counter for monitoring

### Why It Fits GPO
GPO constructs prompts by concatenating task requests, prior subtask outputs, file contexts, and behavior preferences. If any of these accidentally contain API keys (e.g., from reading .env files), the key would be sent to an AI provider. This check prevents credential leakage.

### Limitations
- Regex patterns are limited — would not catch base64-encoded keys or unusual credential formats
- Warn-only mode means a detected key would still be sent — blocking would require operator approval workflow
- The 50,000 char threshold is arbitrary and not per-provider
- No tracking of warnings over time (counter resets on worker restart)

### How to Validate
- Inject a fake API key pattern into a task request and check worker logs for `[SAFETY]` warning
- Monitor worker logs during normal operation — should see zero warnings for legitimate tasks
- Verify prompt length stays well under 50,000 for typical tasks

### Affects
- **Behavior learning:** No effect
- **Continuity:** No effect
- **Safety:** YES — first line of defense against credential leakage in prompts
- **Evaluation:** No effect
- **Operator trust:** Moderate — operator can trust that GPO checks for credential exposure before API calls

---

## Pattern 4: Signal Reinforcement Tracking

### Files Changed
- `04-Dashboard/app/lib/behavior.ts` — added `reinforced_count` optional field to `BehaviorSignal` interface

### Exact Behavior Added
- The `BehaviorSignal` interface now supports a `reinforced_count` field that tracks how many times a signal has been re-derived with a consistent value
- This field is defined but not yet populated by `deriveSignals()` — it is scaffolding for future instinct-like confidence evolution

### Why It Fits GPO
ECC's "instinct" system tracks confidence through repeated observation. GPO's signals currently have `confidence` based on event count but no concept of "this signal has been stable across N derivation cycles." Reinforcement tracking would distinguish strong persistent signals from volatile ones.

### Limitations
- **This is scaffolding only** — the field exists in the interface but `deriveSignals()` does not yet set it
- No logic to detect value changes between derivation cycles
- No degradation logic based on reinforcement history

### How to Validate
- Cannot be validated yet — field is defined but not populated
- Validation requires: implement reinforcement counting in `deriveSignals()`, run multiple derivation cycles, verify counter increments

### Affects
- **Behavior learning:** Future — will strengthen signal confidence model when implemented
- **Continuity:** No effect
- **Safety:** No effect
- **Evaluation:** No effect
- **Operator trust:** No effect yet — scaffolding only
