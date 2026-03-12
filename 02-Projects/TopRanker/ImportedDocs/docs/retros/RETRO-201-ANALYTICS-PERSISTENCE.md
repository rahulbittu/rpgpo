# Retrospective — Sprint 201: Analytics Persistence + DB Backup

**Date:** 2026-03-09
**Duration:** 1 session
**Story Points:** 8
**Facilitator:** Sarah Nakamura

## What Went Well

**Marcus Chen:** "Two operational gaps closed. Analytics survives restarts, backups run daily. We're ready for real users."

**Amir Patel:** "Discovered the analyticsEvents table already existed in schema — avoided duplicate definitions. Always check existing infrastructure before building."

**Rachel Wei:** "Backup automation at zero cost via GitHub Actions. 30-day retention gives us a full month of safety net."

**Jordan Blake:** "GDPR data resilience requirement satisfied. This was overdue."

## What Could Improve

- **No admin endpoint to query persisted events** — only in-memory stats in current endpoints
- **Backup hasn't been tested** against a real Railway database yet
- **Active user map still in-memory** — not persisted to DB
- **No data retention policy** for analytics_events table (will grow indefinitely)

## Action Items

| Item | Owner | Sprint |
|------|-------|--------|
| Send wave 1 beta invites (25 users) | Marcus + Jasmine | 202 |
| Add persisted events to admin dashboard | Leo Hernandez | 202 |
| Test backup workflow against Railway DB | Amir Patel | 202 |
| Add data retention policy (90-day window) | Amir Patel | 203 |
| Client-side beta event tracking | Sarah Nakamura | 202 |

## Team Morale

**9/10** — Operational hygiene sprint. Not glamorous, but essential. "The difference between a toy project and a real product is operational discipline." — Amir Patel
