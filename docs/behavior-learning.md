# GPO Behavior Learning System

## What It Does

GPO learns how the operator works by observing actions and deriving behavioral signals that guide future execution. This is not a black box — every learned preference is traceable to specific events and has a confidence score.

## Architecture

```
Operator Actions → Event Capture (JSONL) → Signal Derivation → Execution Guidance
```

### Event Capture

Every meaningful operator action is recorded as a structured event in `artifacts/behavior/operator-events.jsonl`. Events are append-only for auditability.

**Captured Events:**

| Event Type | When Recorded | What It Captures |
|---|---|---|
| `task_created` | Task submitted via UI or API | Title, source (quick_run/submit), engine |
| `task_routed` | Engine assigned to task | Engine, whether auto-routed or manually selected |
| `engine_overridden` | Operator changes auto-assigned engine | Original engine, new engine |
| `approval_granted` | Subtask approved | Subtask title, approval type, engine |
| `approval_denied` | Subtask rejected | Subtask title, reason, engine |
| `rewrite_requested` | Operator asks for revision | Subtask, instructions |
| `deliverable_downloaded` | Export/download triggered | Task, format |
| `output_accepted` | Result marked as satisfactory | Task, engine |
| `output_abandoned` | Result dismissed/ignored | Task, engine |
| `export_generated` | Export file created | Task, format |

### Signal Derivation

Signals are derived from events using conservative thresholds. A signal requires at least 5 events before it's considered valid, and at least 60% confidence before it becomes active (influences execution).

**Derived Signals:**

| Signal | What It Measures | Activation Threshold |
|---|---|---|
| `approval_strictness` | How often operator approves vs denies | 10+ decisions |
| `engine_approval_rate` | Per-engine approval rate | 5+ decisions per engine |
| `preferred_provider` | Most-used provider per engine | 5+ routing events |
| `routing_override_tendency` | How often auto-routing is overridden | 5+ overrides |
| `output_satisfaction` | Accept vs abandon ratio | 10+ output decisions |
| `rewrite_frequency` | How often rewrites are requested | 5+ rewrites |
| `followup_intensity` | How often follow-ups are asked | 5+ follow-ups |

### Execution Guidance

Active signals produce guidance that can influence:
- **Auto-approve recommendations** — if approval rate is consistently high
- **Provider preferences** — suggest preferred provider for an engine
- **Depth hints** — adjust output depth based on satisfaction signals

Guidance is always advisory. The system never silently changes behavior — all guidance is explainable.

## Signal Provenance

Every signal is tagged with its source:

| Provenance | Meaning | Trust Level |
|---|---|---|
| `explicit_profile` | Operator explicitly stated in profile | High — use confidently |
| `seeded_historical` | Bootstrapped from task history | Provisional — best guess, not proven |
| `live_observed` | Captured from real-time operator actions | Strong — genuine behavior |

Current state: 3 explicit_profile, 23 seeded_historical, 0 live_observed.

## How Signals Influence Execution (Phase B)

Learned signals are injected as **additive context** into:
- Board of AI deliberation prompts (shapes subtask planning)
- OpenAI synthesis prompts (shapes output style)

Signals do **NOT** influence: auto-approve logic, provider selection, risk levels, or approval gates.

See [Phase B details](phase-b-conservative-influence.md) for full constraints.

## Safety Rules

1. **Minimum event threshold** — No signal activates below 5 events
2. **Confidence gating** — Signals below 60% confidence are advisory only
3. **Provenance tracking** — Every signal marked as explicit_profile, seeded_historical, or live_observed
4. **Traceability** — Every signal links to its source event count
5. **No hidden drift** — All active signals are visible via `/api/behavior/signals`
6. **Conservative defaults** — If unsure, the system does nothing
7. **Seeded signals are provisional** — Not treated as strong operator truth

## API Endpoints

| Endpoint | Method | Description |
|---|---|---|
| `/api/behavior/stats` | GET | Event counts and signal summary |
| `/api/behavior/signals` | GET | All derived behavioral signals |
| `/api/behavior/guidance` | GET | Current execution guidance |
| `/api/behavior/events` | GET | Recent 50 events |
| `/api/behavior/derive` | POST | Trigger signal re-derivation |
| `/api/behavior/context?engine=X` | GET | Scoped context summary for an engine |

## File Locations

| File | Purpose |
|---|---|
| `04-Dashboard/app/lib/behavior.ts` | Core behavior learning module |
| `artifacts/behavior/operator-events.jsonl` | Append-only event log |
| `artifacts/behavior/operator-signals.json` | Derived signals |
| `artifacts/behavior/engine-preferences.json` | Engine-specific preferences |
| `artifacts/behavior/behavior-learning-log.md` | Signal derivation log |
