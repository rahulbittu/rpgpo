# GPO Behavior Learning Baseline

Captured: 2026-03-16

## Purpose

This document establishes the honest starting point for GPO's behavior learning system. All future improvement claims must be measured against this baseline.

## Current State

| Metric | Value | Notes |
|---|---|---|
| Total tasks | 1,230 | |
| Done tasks | 1,178 (95.8%) | |
| Failed tasks | 51 (4.1%) | |
| Total behavior events | 3,432 | |
| Event types captured | 4 | task_created, task_routed, output_accepted, output_abandoned |
| Derived signals | 1 | output_satisfaction = high (global) |
| Active signals | 1 | |
| Approval events logged | 0 | Instrumentation exists but auto-approve bypasses it |
| Rewrite events logged | 0 | Instrumentation exists but no manual rewrites triggered |
| Engine override events | 0 | All tasks auto-routed |
| Provider override events | 0 | |
| Deliverable download events | 0 | |
| Output acceptance rate | 94.8% | 923 accepted / 974 total decisions |

## Gaps

1. **Signal derivation is severely underutilized** — 1 signal from 3,432 events. The system captures events but barely learns from them.
2. **Zero deliberation signals** — No approval/denial events despite instrumentation. All tasks run via auto-approve, so the approval instrumentation never fires.
3. **Zero quality feedback signals** — No rewrites, no format preferences, no depth adjustments captured.
4. **No engine-level signals** — Despite 1,229 tasks across 15 engines, no engine-specific preferences are derived.
5. **No provider preference signals** — OpenAI vs Perplexity vs Gemini usage patterns not analyzed.
6. **No cost-efficiency signals** — 26k+ cost entries exist but aren't linked to behavior learning.
7. **Operator profile disconnected** — Rich profile exists but doesn't feed into signal derivation or execution guidance.
8. **No scoped memory** — No engine-specific, project-specific, or workflow-specific memory layers.
9. **No freshness tracking** — Signals don't degrade when stale.
10. **No retrieval system** — No local indexing, no context reuse optimization.

## What Can Be Bootstrapped

From existing data (no new event capture needed):
- **Output satisfaction by engine** — group accepted/abandoned by engine field
- **Task volume by engine** — indicates operator priorities
- **Provider affinity by engine** — which providers handle which engines

From operator profile (already exists):
- **Communication style** — terse (stated preference)
- **Output preferences** — specific, actionable, cited, no generic frameworks
- **Risk tolerance** — yellow (moderate)
- **Approval threshold** — normal

## Honest Limitations

- "Repeated question frequency" cannot be measured — the system auto-approves everything, so there's no human-in-the-loop questioning to measure.
- "API cost per task" can be approximated from costs.json but isn't cleanly segmented by task yet.
- "Provider preference" is confounded because routing is automatic, not operator-chosen.
- Historical events are all seeded (marked `source: historical_seed`), not from live operator interaction.

## Artifact

Machine-readable baseline: `artifacts/behavior/behavior-baseline.json`
