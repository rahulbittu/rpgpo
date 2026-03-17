# GPO Frontend V2 — Navigation Model

## Primary Navigation (Always Visible)

| Item | Route | Icon | Badge |
|---|---|---|---|
| Home | / | grid | — |
| Ask | /ask | message-circle | — |
| Results | /results | file-text | count |
| Evidence | /evidence | search | — |
| Approvals | /approvals | shield-check | count |
| Activity | /activity | clock | — |
| Settings | /settings | settings | — |

## Navigation Behavior

### Desktop (>1024px)
Left sidebar, always visible, 200px wide. Labels + icons.

### Tablet (768-1024px)
Left sidebar collapsed to 56px. Icons only. Hover to expand.

### Phone (<768px)
Bottom tab bar, 5 items: Home, Ask, Results, Approvals, More.
"More" opens a drawer with: Evidence, Activity, Settings.

## Route → Backend API Mapping

| Route | Primary API | Secondary APIs |
|---|---|---|
| / (Home) | GET /api/intake/current | /api/intake/pending-approvals, /api/costs, /api/status |
| /ask | POST /api/intake/run | GET /api/intake/task/:id (poll) |
| /results | GET /api/intake/tasks | GET /api/task-outputs |
| /evidence | GET /api/intake/task/:id | subtask detail |
| /approvals | GET /api/intake/pending-approvals | POST /api/subtask/:id/approve |
| /activity | GET /api/data (logs) | — |
| /settings | GET /api/costs/settings | GET /api/diag/keys, GET /api/engines |

## URL Structure

Since GPO is a single-page app served by Node.js, routes are hash-based:
- `#home`, `#ask`, `#results`, `#results/:taskId`, `#evidence/:taskId`
- `#approvals`, `#activity`, `#settings`
