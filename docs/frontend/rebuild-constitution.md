# GPO Frontend Rebuild Constitution

## Product Identity

GPO is a private AI command center. The frontend must feel like operating a real system, not browsing a dashboard.

## Navigation Model v2

| Nav Item | Purpose | Maps To |
|---|---|---|
| **Home** | What needs attention, what completed, what's next | Dashboard |
| **Work** | Create requests, review results, track execution | Intake + Task detail + Deliverables |
| **Board** | Deliberation view, routing rationale, strategy | Board detail (inside task flow) |
| **Evidence** | Artifacts, exports, traceability, source review | Deliverables + exports |
| **Approvals** | Pending decisions, risk gates, human action needed | Approvals |
| **Engines** | 15 engines, provider status, capabilities | Missions + Providers |
| **Activity** | Timestamped events, completed runs, audit history | Logs |
| **Settings** | Preferences, provider config, theme, workspace | Settings |

Removed from primary nav:
- Ask AI (merged into Work — direct AI interaction is part of work flow)
- Memory (merged into Settings or Engines)
- Costs (merged into Settings or shown in Home summary)
- Operations (admin/debug — not primary operator surface)
- Queue (merged into Work as secondary view)

## Surface Classification

### KEEP (operator-facing)
- Home dashboard (simplified)
- Task submission + detail + result review
- Deliverables list
- Approvals
- Engine overview
- Activity log
- Settings

### MOVE TO ADMIN/DEBUG
- Operations (Board run button, loops, Claude launch)
- Raw queue view (worker internal state)
- Provider raw status
- Builder diagnostics

### REMOVE
- renderTopRanker() — dead legacy function
- renderNeedsRahul alias — dead backward compat
- Mission Health grid — raw internal states
- Proactive Suggestions — already removed
- 6 non-functional enterprise screens — already removed

## Theme System

Both themes must be first-class:
- **Dark** (default): Deep navy/charcoal base, blue accent, restrained
- **Light**: Clean white/gray base, same accent colors, readable in daylight

Theme toggle in Settings. Stored in localStorage.

## Responsive Strategy

| Breakpoint | Layout |
|---|---|
| >1200px | Full sidebar + content |
| 768-1200px | Collapsed sidebar icons + content |
| <768px | Bottom tab bar + full content |

## Legacy Cleanup Required

| Item | Location | Action |
|---|---|---|
| topranker in ENGINE_LABELS | app.js:24 | Keep for backward compat (reading old tasks) |
| renderTopRanker() | app.js:1152 | Delete entirely |
| TopRanker mission check | app.js:794 | Simplify to canonical check |
| renderNeedsRahul alias | operator.js:1538 | Delete |
| Legacy engine IDs in config | operator.js:396-405 | Migrate to canonical |
