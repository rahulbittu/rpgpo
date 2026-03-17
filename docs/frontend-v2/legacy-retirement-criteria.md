# Legacy Frontend Retirement Criteria

## Current State

- V2 (`v2.html`) is the default page at `/`
- Legacy (`index.html`) is available at `/legacy`
- V2 has zero dependency on old CSS/JS files
- All primary workflows verified working in V2

## Criteria for Removing Legacy

The legacy frontend can be removed when ALL of these are met:

1. **V2 stability confirmed** — no workflow-breaking bugs found in 7+ days of primary use
2. **All primary workflows verified:**
   - [x] Ask → Submit → Progress → Result
   - [x] Results → Search → Filter → View
   - [x] Evidence → Deep-link → Output toggle → Download
   - [x] Feedback → Rating → Event captured
   - [x] Approvals → Review → Approve/Reject
   - [x] Activity → Search → Filter → Pagination
   - [x] Settings → Theme → Providers → System info
   - [x] Keyboard shortcuts → Cmd+K, /, Escape
   - [ ] Mobile device verified (CSS done, not device-tested)

3. **No operator-reported regression** from V2 vs legacy
4. **No backend API relied upon exclusively by legacy** that isn't also used by V2

## What to Remove

When criteria are met, remove:
- `04-Dashboard/app/index.html`
- `04-Dashboard/app/style.css`
- `04-Dashboard/app/operator.css`
- `04-Dashboard/app/gpo.css` (superseded by v2.css)
- `04-Dashboard/app/operator.js` (superseded by v2.js)
- `04-Dashboard/app/app.js` (superseded by v2.js)
- `04-Dashboard/app/conversation-ui.js` (unused)
- `/legacy` route in server.js

## What to Keep

- `04-Dashboard/app/v2.html` → rename to `index.html`
- `04-Dashboard/app/v2.css` → rename to `style.css`
- `04-Dashboard/app/v2.js` → rename to `app.js`
- All backend files unchanged

## Current Recommendation

**Do NOT remove legacy yet.** V2 needs 7+ days of primary operator use to confirm stability. Keep `/legacy` as a safety net.
