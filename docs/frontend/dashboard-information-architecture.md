# GPO Dashboard Information Architecture

## Purpose

The dashboard answers five questions:
1. **What needs attention?** — Pending approvals, blockers, actionable items
2. **What completed recently?** — Deliverables from finished tasks
3. **What is running?** — Current active task
4. **What does today look like?** — Today's task summary + AI spend
5. **What happened?** — Recent activity feed

Everything else belongs on dedicated screens, not the dashboard.

## Current Layout (after cleanup)

```
┌─────────────────────────────────────────┐
│ GPO                          [New Task] │  Header
│ ● System ready      1,340 tasks done    │  Status (minimal)
├─────────────────────────────────────────┤
│ Needs Attention                         │  Actions + Blockers
│ (only when something needs action)      │  (hidden when empty)
├─────────────────────────────────────────┤
│ [Current Running Task]                  │  Active task focus
├──────────────────┬──────────────────────┤
│ Today            │ AI Spend             │  Daily context
│ X done, Y running│ $0.12 today          │
├──────────────────┴──────────────────────┤
│ Recent Deliverables              [All]  │  Primary output
│ task1.md  ·  task2.md  ·  task3.md      │
├─────────────────────────────────────────┤
│ Recent Activity                  [All]  │  Event feed
│ Completed: task X  ·  3m ago            │
└─────────────────────────────────────────┘
```

## What Was Removed

| Surface | Why Removed |
|---|---|
| Server/Worker/Queue telemetry strip | Internal process monitoring, not operator value |
| Mission Health grid | Raw states ("drifting", "no statement") are not product-grade |
| By Engine section | Duplicates the Engines screen |
| Proactive Suggestions | Legacy copy with user-specific prompts; Quick Start templates serve this purpose |
| Completed column | Redundant with Recent Deliverables |

## What Was Rewritten

| Surface | Before | After |
|---|---|---|
| System status | 6-item telemetry strip | Minimal: dot + status + task count |
| Chief of Staff | 5-section panel with raw states | "Needs Attention" — actions + blockers only |
| Activity | Half-width column | Full-width with scroll and "View All" |

## Principle

The dashboard should feel like opening a trusted brief, not like monitoring a server.
