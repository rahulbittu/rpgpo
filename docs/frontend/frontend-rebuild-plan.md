# GPO Frontend Rebuild Plan

## Strategy

Controlled rebuild on top of the existing backend. The current `index.html` + `app.js` + `operator.js` + `style.css` + `operator.css` will be replaced with a new frontend system.

The backend API remains unchanged. All existing endpoints continue to work. The new frontend consumes the same APIs.

## New File Structure

```
04-Dashboard/app/
├── index.html          ← rebuilt (new shell, new nav, new screens)
├── gpo.css             ← new design system (replaces style.css + operator.css)
├── gpo.js              ← new app logic (replaces app.js + operator.js)
├── style.css           ← kept temporarily for backward compat during migration
├── app.js              ← kept temporarily, functions extracted into gpo.js
├── operator.js         ← kept temporarily, functions extracted into gpo.js
├── server.js           ← unchanged
├── worker.js           ← unchanged
└── lib/                ← unchanged
```

## Migration Approach

1. Create `gpo.css` with the full design system (tokens + primitives + themes)
2. Create `gpo.js` with the new app logic (clean, no legacy)
3. Rebuild `index.html` screen by screen
4. Old files remain as fallback during migration
5. Once all screens are migrated, remove old files

## Phase Schedule

| Phase | Scope | Batch |
|---|---|---|
| 1 | New shell + nav + Home | 2-3 |
| 2 | Work flow (submit + queue + detail + result) | 4 |
| 3 | Approvals + Engines | 5 |
| 4 | Activity + Settings | 6 |
| 5 | Mobile + light theme + polish | 7 |
| 6 | Final coherence + old file removal | 8 |

## Backend Support Needs

Minimal. Potential small additions:
- `/api/dashboard-summary` — aggregated data for Home (instead of 5 separate calls)
- Timestamps on activity events (if missing)
- Cost context (time window) on cost API responses

These will be documented before implementation.
