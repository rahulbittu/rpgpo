# GPO Operator Guide

## Getting Started

1. Open the dashboard at `http://localhost:3200`
2. The **Home** tab shows your current state: blockers, active tasks, live feed
3. Toggle **Operator Mode** in the sidebar for a calm, focused view

## Daily Workflow

### Submit a Task
- Go to **Intake** tab
- Use a **mission template** or type a freeform task
- Click **Submit** → task enters `intake` status

### Deliberate
- Click **Send to Board** → the Board of AI deliberates
- Board produces: interpretation, strategy, risk level, subtask plan
- Review the **Board Discussion** panel

### Execute
- Click **Approve & Execute Plan** → subtasks begin executing
- Green stages auto-continue. Yellow/red stages stop for your approval
- Code changes stop for review with diff summary

### Review & Approve
- **Needs Your Action** shows every blocker with one-click resolution
- **Approve Changes** → accepts code, continues workflow
- **Reject** → reverts changes
- **Revise** → re-runs with your notes

### Monitor
- **Live Feed** shows real-time events with actor, action, result
- **Mission Snapshot** shows health of all missions
- **System Map** (Settings tab) shows the full architecture

## Key Surfaces

| Surface | Where | What it shows |
|---------|-------|---------------|
| Needs Your Action | Home | All blockers, one-click actions |
| Current Task | Home | Active task, stage, progress |
| Live Feed | Home | SSE-driven event stream |
| Mission Snapshot | Home | All mission health at a glance |
| Board Discussion | Task Detail | 4-agent deliberation voices |
| System Map | Settings | Full architecture overview |
| Agent Surface | Settings | Registered agents and handoffs |

## Ship Readiness (Part 50)

### Go-Live Closure
- **Releases tab** → scroll to **Go-Live Closure** section
- Shows all blockers aggregated from ship blockers, middleware, workflows, acceptance
- Each blocker shows closed/partial/blocked status with evidence
- Recommendation: go / conditional_go / no_go

### Provider Release Gate
- **Releases tab** → **Provider Release Gate** section
- Checks provider health, cost, latency, and active incidents before release
- Outcome: clear / warning / blocked

### Readiness Reconciliation
- **Releases tab** → **Ship Readiness Reconciliation** section
- Weighted score: workflows (25%), middleware (20%), blockers (25%), acceptance (30%)
- Score >= 95% = go, >= 80% = conditional_go, below = no_go

### APIs
- `GET /api/go-live-closure` — closure report
- `GET /api/release-provider-gating` — provider gate check
- `GET /api/readiness-reconciliation` — reconciled score

## Keyboard Shortcuts

- `1`-`9` — Switch tabs
- `Esc` — Close modal
