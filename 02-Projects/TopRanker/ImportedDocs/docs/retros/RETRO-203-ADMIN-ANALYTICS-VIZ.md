# Retrospective — Sprint 203: Admin Analytics Visualization + Data Retention

**Date:** 2026-03-09
**Duration:** 1 session
**Story Points:** 8
**Facilitator:** Sarah Nakamura

## What Went Well

**Leo Hernandez:** "The funnel visualization was straightforward because we reused the bar chart pattern from Sprint 123. Consistent design language means faster shipping."

**Rachel Wei:** "I can finally see invite-to-rating conversion in the dashboard. Before this, it required SQL queries. Wave 2 planning is now data-driven."

**Amir Patel:** "Data retention policy is clean — code-defined constants, minimum 30-day floor, admin-only purge. No magic numbers, no accidental data loss."

**Jordan Blake:** "GDPR compliance for analytics data is now enforceable. 90-day retention for events, 365 for invites — both documented and code-backed."

## What Could Improve

- **No automated purge schedule** — purge requires manual admin trigger; should be cron/scheduled
- **Dashboard doesn't auto-refresh** — users must manually hit refresh for live data
- **No data export** before purge — admin should be able to export before deleting
- **Active users relies on in-memory Map** — lost on server restart; needs persistence

## Action Items

| Item | Owner | Sprint |
|------|-------|--------|
| Automated purge schedule (cron) | Amir Patel | 204 |
| Dashboard auto-refresh interval | Leo Hernandez | 205 |
| Active user persistence to DB | Sarah Nakamura | 204 |
| Data export before purge | Jordan Blake | 205 |
| Wave 2 expansion (50 users) | Marcus + Jasmine | 204 |

## Team Morale

**8/10** — Full analytics loop is now visible. Invite → view → signup → rating — every step has a number. Data retention closes a compliance gap. "If you can't see it, you can't improve it." — Rachel Wei
