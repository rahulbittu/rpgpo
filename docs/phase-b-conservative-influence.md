# Phase B: Conservative Execution Influence

## What Changed

Phase B integrates learned operator preferences into GPO's execution pipeline. This integration is **conservative and additive only** — it adds context to prompts but does not override, bypass, or relax any existing behavior.

## What Is Injected

The behavior learning system provides a human-readable summary of operator preferences that is injected into:

1. **Board of AI deliberation prompts** — helps the Board shape subtask plans to match operator style
2. **OpenAI synthesis prompts** — helps synthesis outputs match operator format preferences

Example injected context:
```
Operator communication style: terse.
Output style: Specific, actionable, and cited. No generic frameworks.
Avoid: Vague advice, generic templates, filler content.
Risk tolerance: yellow.
Engine wealthresearch satisfaction: high. Engine wealthresearch usage: 113 tasks (9%).
```

## What Is NOT Changed

- **Auto-approve logic** — unchanged, no signals influence approval decisions
- **Provider selection** — unchanged, no preference-based routing
- **Risk levels** — unchanged, no relaxation based on satisfaction signals
- **Approval gates** — unchanged, still governed by risk_level and is_code_task

## Signal Provenance

Every signal is marked with its source:

| Provenance | Meaning | Trust Level |
|---|---|---|
| `explicit_profile` | Operator explicitly stated in profile | High — use confidently |
| `seeded_historical` | Bootstrapped from task history | Provisional — treat as best guess |
| `live_observed` | Captured from real-time operator actions | Strong — genuine behavior |

Current state: 3 explicit_profile, 23 seeded_historical, 0 live_observed.

## Known Limitations

- All event-based signals are `seeded_historical` (bootstrapped, not live)
- "general" engine catches 53% of tasks — signals from it may be noisy
- No approval/rewrite/override events exist yet (auto-approve bypasses capture)
- Deleting artifact files is a developer control, not true operator UI control

## Follow-Up Plan for Better Signals

To make behavior learning trustworthy, these event types need to start flowing:
1. **approval_granted / approval_denied** — requires tasks to go through manual approval
2. **rewrite_requested** — requires operator to use the revise endpoint
3. **engine_overridden** — requires operator to manually select engines
4. **provider_overridden** — requires operator to prefer specific providers
5. **followup_requested** — requires follow-up task submission patterns
6. **deliverable_downloaded** — requires operator to export deliverables

Until these events accumulate from live interaction, all behavior signals remain provisional bootstraps.
