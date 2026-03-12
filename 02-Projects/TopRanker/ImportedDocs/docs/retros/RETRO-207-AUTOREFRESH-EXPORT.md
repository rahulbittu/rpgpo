# Retrospective — Sprint 207: Dashboard Auto-Refresh + Analytics Data Export

**Date:** 2026-03-09
**Duration:** 1 session
**Story Points:** 5
**Facilitator:** Sarah Nakamura

## What Went Well

**Leo Hernandez:** "Auto-refresh was straightforward — useRef + setInterval pattern we've used before. Toggle gives admins control. Clean."

**Rachel Wei:** "CSV export directly into spreadsheets. No more copy-pasting SQL results. The 365-day max is a good guardrail."

**Jordan Blake:** "Export-before-purge closes the last data compliance gap. Admins can now archive before cleanup."

## What Could Improve

- **Auto-refresh doesn't re-fetch beta funnel or active users** — only the main dashboard hook refreshes
- **No export for beta funnel data specifically** — only general analytics events
- **CSV only has date/events** — could include per-event-type breakdown
- **No pagination for large exports** — 365 days could be large

## Action Items

| Item | Owner | Sprint |
|------|-------|--------|
| App store submission prep | Leo + Jasmine | 208 |
| Wire real metrics into getBudgetReport | Amir Patel | 208 |
| Launch checklist document | Marcus Chen | 208 |
| Extended CSV with event type breakdown | Sarah Nakamura | 209 |

## Team Morale

**8/10** — Quality-of-life improvements that make the admin dashboard genuinely useful for daily monitoring. "Small features, big impact." — Leo Hernandez
