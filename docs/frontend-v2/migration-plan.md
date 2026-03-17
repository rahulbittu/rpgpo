# GPO Frontend V2 — Migration Plan

## Strategy

Build V2 as a new file (`v2.html` + `v2.css` + `v2.js`) that consumes the same backend APIs. The old `index.html` remains available at `/legacy` during migration. Once V2 covers all workflows, remove old files.

## New File Structure

```
04-Dashboard/app/
├── v2.html            ← new frontend entry point
├── v2.css             ← new design system (replaces gpo.css/style.css/operator.css)
├── v2.js              ← new app logic (replaces app.js/operator.js)
├── index.html         ← old frontend (kept as /legacy fallback)
├── server.js          ← unchanged (serves v2.html as default)
├── worker.js          ← unchanged
└── lib/               ← unchanged
```

## Server Change Required

One small server.js change: serve `v2.html` as the default page instead of `index.html`. Add `/legacy` route for old UI.

## Backend APIs Used by V2

| V2 Screen | APIs |
|---|---|
| Home | /api/status, /api/intake/current, /api/intake/pending-approvals, /api/costs |
| Ask | POST /api/intake/run, GET /api/intake/task/:id (poll) |
| Results | GET /api/intake/tasks, GET /api/task-outputs, GET /api/intake/task/:id/export |
| Evidence | GET /api/intake/task/:id (subtask detail) |
| Approvals | GET /api/intake/pending-approvals, POST /api/subtask/:id/approve |
| Activity | GET /api/data (logs section) |
| Settings | GET /api/costs/settings, GET /api/engines, GET /api/diag/keys |

## Backend Support Additions (Small)

1. **GET /api/intake/task/:id** — already exists, may need: add `engine_display` field (already added in canonical migration)
2. **Error translation** — frontend-only (no backend change needed)
3. **SSE /api/events** — already exists, V2 will consume for live updates

No broad backend changes required.

## Migration Phases

| Phase | Batch | What |
|---|---|---|
| 1 | B1 | Architecture + docs (this batch) |
| 2 | B2 | v2.html shell + v2.css design system + theme |
| 3 | B3 | Ask/Create flow with live progress |
| 4 | B4 | Results with rich rendering |
| 5 | B5 | Work/Task detail/review |
| 6 | B6 | Evidence + Approvals + Activity |
| 7 | B7 | Settings + final migration |

## Success Criteria

V2 is complete when:
- All primary workflows operable from V2
- No internal error text visible
- Rich result rendering (not raw text)
- Working dark/light themes
- Responsive on laptop/tablet/phone
- Old frontend can be removed
