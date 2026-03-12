# Sprint 207 — Dashboard Auto-Refresh + Analytics Data Export

**Date:** 2026-03-09
**Story Points:** 5
**Status:** Complete

## Mission Alignment

Close two action items from Sprint 205 retro: dashboard auto-refresh (L1 finding) and data export before purge (L2 finding). The admin dashboard becomes a live monitoring tool, and data can be safely exported before retention cleanup.

## Team Discussion

**Marcus Chen (CTO):** "Live monitoring changes how we use the dashboard. Instead of refreshing manually every few minutes, it updates itself. For Wave 3 monitoring, this is essential — I want to watch the funnel update in real-time."

**Leo Hernandez (Frontend):** "60-second auto-refresh with a toggle. ON by default, but admins can disable it. Uses useRef for the interval to avoid stale closure issues. The cleanup clears the interval on unmount."

**Sarah Nakamura (Lead Eng):** "The export endpoint supports both JSON and CSV. CSV for spreadsheet analysis, JSON for programmatic access. Both fetch daily stats and event counts in parallel via Promise.all."

**Rachel Wei (CFO):** "CSV export means I can pull analytics into our financial models directly. Date/event count pairs — exactly what I need for the launch revenue projection."

**Jordan Blake (Compliance):** "Data export before purge closes the compliance gap. Admin can download the full dataset before running the retention cleanup. Audit trail maintained."

**Nadia Kaur (Security):** "Export endpoint is admin-only. Max 365 days to prevent excessive data extraction. Content-Disposition header forces download rather than inline rendering."

## Deliverables

### Dashboard Auto-Refresh (`app/admin/dashboard.tsx`)
- `AUTO_REFRESH_INTERVAL_MS` constant (60s)
- `autoRefresh` state with toggle button
- `setInterval`/`clearInterval` with useRef
- "(auto)" label in subtitle when enabled
- Accessibility labels for toggle

### Analytics Data Export (`server/routes-admin.ts`)
- `GET /api/admin/analytics/export` — JSON or CSV
- Configurable days parameter (1-365, default 90)
- Parallel fetch: dailyStats + eventCounts
- CSV: `date,events` header + rows, Content-Disposition attachment
- JSON: dailyStats, eventCounts, exportedAt timestamp

## Tests

- 27 new tests in `tests/sprint207-autorefresh-export.test.ts`
- Full suite: **3,618+ tests across 137 files, all passing**
