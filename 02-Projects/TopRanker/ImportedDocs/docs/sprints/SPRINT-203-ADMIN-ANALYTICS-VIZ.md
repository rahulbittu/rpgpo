# Sprint 203 — Admin Analytics Visualization + Data Retention

**Date:** 2026-03-09
**Story Points:** 8
**Status:** Complete

## Mission Alignment

Close the admin visibility gap. Sprints 199-201 built the analytics pipeline (server events → persistence → time-series queries). Sprint 202 added client-side tracking. Sprint 203 brings it all to the admin dashboard — beta funnel visualization, active user monitoring, and a data retention policy to keep the database lean.

## Team Discussion

**Marcus Chen (CTO):** "We've been flying blind on beta conversions. The funnel chart gives us the first real picture — invite to join page to signup to first rating. Four steps, four potential drop-off points, all visible now."

**Rachel Wei (CFO):** "I need to know our invite-to-activation rate before we greenlight Wave 2. This dashboard answers: how many of our 25 invites actually became active raters? That's our unit economics baseline."

**Leo Hernandez (Frontend):** "The beta funnel section reuses the conversion funnel pattern we built in Sprint 123 — bar chart with conversion rates between stages. Consistent visual language. Active users gets the same stat card grid treatment."

**Sarah Nakamura (Lead Eng):** "Two new hooks — useBetaFunnel and useActiveUsers — each with its own API call. Clean separation. Data retention was the missing piece — 90-day policy for analytics events means we won't accumulate unbounded data."

**Amir Patel (Architecture):** "The purge function uses a simple DELETE WHERE created_at < cutoff. Clean, indexable, no table scans. Retention policy is code-defined, not magic numbers — DATA_RETENTION_POLICY constant makes it auditable."

**Nadia Kaur (Security):** "Purge endpoint is admin-only with a 30-day minimum floor. Can't accidentally wipe recent data. The retention policy endpoint is read-only for transparency."

**Jordan Blake (Compliance):** "Data retention policies are a GDPR requirement. 90 days for analytics events, 365 days for beta invites — both documented and enforceable. This closes the compliance gap from SLT-200."

**Jasmine Taylor (Marketing):** "The overall invite-to-rating conversion rate is the single number I need for Wave 2 planning. Having it in the dashboard instead of SQL queries saves hours per week."

## Deliverables

### Admin Dashboard — Beta Funnel Visualization (`app/admin/dashboard.tsx`)
- `BetaFunnelData` interface with full funnel stages + conversion rates
- `useBetaFunnel()` hook fetching from `/api/admin/analytics/beta-funnel`
- Bar chart visualization: Invites Sent → Join Page Views → Signups → First Ratings → Referrals Shared
- Conversion rate labels between stages
- Invite tracking summary (joined/total)

### Admin Dashboard — Active Users (`app/admin/dashboard.tsx`)
- `ActiveUserData` interface with 1h/24h/7d/30d windows
- `useActiveUsers()` hook fetching from `/api/admin/analytics/active-users`
- Stat card grid with time-window labels

### Data Retention Policy (`server/storage/analytics.ts`)
- `purgeOldAnalyticsEvents(retentionDays=90)` — DELETE WHERE < cutoff
- `DATA_RETENTION_POLICY` constant — auditable retention definitions
- Analytics events: 90-day retention
- Beta invites: 365-day retention

### Admin Retention Endpoints (`server/routes-admin.ts`)
- `POST /api/admin/analytics/purge` — trigger purge with configurable retention (min 30 days)
- `GET /api/admin/analytics/retention-policy` — read current policy

## Tests

- 38 new tests in `tests/sprint203-admin-analytics-viz.test.ts`
- Full suite: **3,486+ tests across 133 files, all passing**
