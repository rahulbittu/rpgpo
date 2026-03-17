# Navigation Model V3 — Command Center

## Design Principle
Every top-level route must be dense with real backend data.
No empty pages. No decorative routes.
Merge weak standalone pages into richer composite surfaces.

## Routes (6 total)

### 1. Command (was: Home)
The mission control screen. Operator opens GPO and immediately sees:
- **Attention bar** — pending approvals, blocked tasks, urgent items
- **Chief of Staff brief** — AI-generated operational summary
- **Running work** — live tasks with progress
- **Recommended actions** — from /api/chief-of-staff/actions
- **Metrics strip** — today's tasks, cost, calls, done count
- **System health** — provider status, subsystem health dots
- **Recent results** — last 5 completed with quick access
- **Recent activity** — last 8 events

Backend APIs: status, costs, intake/tasks, intake/pending-approvals, chief-of-staff/brief, chief-of-staff/actions, service-health, behavior/events

### 2. Ask
Work submission with rich context.
- Textarea + engine select + urgency
- Live progress panel during execution
- Inline result rendering with sources, download, feedback
- Recent submissions
- Engine suggestion based on text (future)

Backend APIs: intake/run, intake/task/:id, intake/task/:id/feedback, intake/task/:id/export, engines

### 3. Work (replaces: Results + Evidence)
All tasks in one unified view. Replaces two weak pages with one strong one.
- **Filters**: status (running/done/failed/all), engine, search
- **Task list**: dense cards with status, engine, time, preview
- **Detail panel**: click opens inline detail with:
  - Full rendered output with markdown
  - Sources extracted
  - Board deliberation summary
  - Execution chain (subtask steps)
  - Download (MD/JSON), Run Again, Refine
  - Feedback widget
  - Subtask output toggle
- Running tasks shown with live progress

Backend APIs: intake/tasks, intake/task/:id, intake/task/:id/export, intake/task/:id/feedback

### 4. Activity
Full audit trail — serious, timestamped, searchable.
- Event list with proper timestamps, icons, types
- Search + type filters
- Pagination (load more)
- Event detail on click (future)

Backend APIs: behavior/events

### 5. Operations
System operations center. Dense multi-section page:
- **Providers**: registry with health, latency, cost tier, strengths
- **System Health**: subsystem status, governance health
- **Observability**: throughput, success rate, failure rate
- **Memory & Signals**: what GPO has learned (operator profile, signals, guidance)
- **Approvals**: pending approvals (if any)
- **Cost Breakdown**: by provider, cost history

Backend APIs: provider-registry, provider-reliability, provider-latency, provider-cost, service-health, governance-health, observability, memory-viewer, behavior/signals, behavior/guidance, intake/pending-approvals, costs, costs/history

### 6. Settings
Real configuration surface:
- **Appearance**: theme toggle (dark/light)
- **Engines**: full engine list with descriptions
- **Cost Settings**: Gemini model, budget limits, warning thresholds
- **API Keys**: status display (prefix + configured/missing)
- **System Info**: version, uptime, task counts, event counts, signal counts

Backend APIs: engines, costs/settings, diag/keys, status, behavior/stats

## Mobile Nav (bottom bar)
Command | Ask | Work | Ops | Settings
(Activity accessible from Command > Activity section)

## Sidebar (desktop)
Full labels: Command, Ask, Work, Activity, Operations, Settings
With icons and badges (approvals count)
