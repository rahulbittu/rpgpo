# ECC → GPO Integration Plan

## Principle

ECC is a pattern library, not a product identity. GPO borrows infrastructure discipline while preserving its identity as a governed, privacy-first, operator-centered AI operating system.

## What GPO Borrows

### 1. Session Lifecycle Persistence (Batch 3)

**ECC pattern:** `session-start.js` loads context at startup, `pre-compact.js` saves state before compaction, `session-end.js` cleans up.

**GPO-native implementation:**
- On server startup: load cached behavior signals, operator profile, and routing stats from `session-cache.json`
- On server shutdown (SIGTERM/SIGINT): save current signals, routing stats, and session metrics
- On worker restart: restore active task context

**Why this matters:** GPO currently recalculates everything from scratch on restart. Session persistence reduces startup cost and preserves learned state.

### 2. Running Verification Metrics (Batch 3)

**ECC pattern:** pass@k metrics track reliability over time. Graders score output quality.

**GPO-native implementation:**
- Track `first_pass_clean_rate` — % of tasks that complete successfully on first execution
- Lightweight output quality scoring on task completion: length adequacy, structural sections present, source citations
- Store as verification signal in behavior system
- Do NOT build a full eval harness — GPO's 360-case harness is sufficient for formal testing

**Why this matters:** GPO claims 100% clean rate on recent batches but has no automated quality scoring beyond "did it complete."

### 3. Workflow Pattern Extraction (Batch 4)

**ECC pattern:** `evaluate-session.js` analyzes transcripts for reusable patterns.

**GPO-native implementation:**
- GPO has structured events, not transcripts — use event patterns instead
- After every 50 completed tasks, analyze: engine distribution shifts, recurring task types, output format preferences
- Update `workflow-patterns.json` with confidence-rated patterns
- Do NOT parse chat transcripts — use structured behavior events

### 4. Pre-Execution Safety Checks (Batch 4)

**ECC pattern:** InsAIts monitors for credential exposure, prompt injection, anomalies.

**GPO-native implementation:**
- Before each API call, validate: no API key patterns in prompt text, prompt length < threshold, estimated cost < threshold
- Log warnings only (do not block) — operator visibility without false-positive disruption
- No Python dependency — pure Node.js regex checks

## What GPO Does NOT Borrow

| ECC Feature | Why Not |
|---|---|
| 52+ slash commands | GPO uses natural language tasks, not commands |
| 22 subagents | GPO's single governed pipeline is simpler and more reliable |
| MCP server configs | GPO has its own provider chain |
| Language-specific rules | GPO is a task platform, not a coding IDE |
| Multi-agent PM2 orchestration | Reliability beats autonomy theater |

## Implementation Order

| Batch | What | Risk | ECC Pattern |
|---|---|---|---|
| 3 | Session persistence + verification metrics | Low | session hooks + eval harness |
| 4 | Pattern extraction + safety checks + signal reinforcement | Low | evaluate-session + insaits + instincts |
| 5 | Docs + regression validation | Low | — |
| 6+ | Only if proven valuable | — | — |

## Implementation Status

| Pattern | Batch | Status | Result |
|---|---|---|---|
| Session lifecycle persistence | 3 | **Done** | Saves/restores on SIGTERM/SIGINT + periodic 5-min save |
| Verification metrics (pass@1) | 3 | **Done** | first_pass_clean_rate signal: 47/47 = 100% (live_observed) |
| Pre-execution safety | 4 | **Done** | API key + length validation before every provider call |
| Signal reinforcement | 4 | **Done** | reinforced_count field added to BehaviorSignal |
| Workflow pattern extraction | — | Deferred | Planned for next phase |

## Success Criteria

GPO became stronger in:
- Session continuity — context survives restarts (session-cache.json)
- Quality measurement — first_pass_clean_rate signal with quality metadata
- Safety — prompt validation catches API keys and excessive length
- Signal maturity — reinforcement tracking for instinct-like confidence evolution

GPO did NOT become:
- A developer harness toolkit
- A command-line IDE extension
- A multi-agent orchestration platform
- A plugin marketplace
