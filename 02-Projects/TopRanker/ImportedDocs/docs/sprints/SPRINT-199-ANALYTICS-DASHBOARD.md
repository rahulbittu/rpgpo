# Sprint 199 — Analytics Dashboard + Conversion Tracking

**Date:** 2026-03-09
**Story Points:** 8
**Status:** Complete

## Mission Alignment

You can't manage what you can't measure. With 25 beta users incoming, we need to track every step of the funnel: invite sent → join page viewed → signup completed → first rating → referral shared. This sprint adds time-series analytics, active user tracking, and a beta-specific conversion funnel.

## Team Discussion

**Marcus Chen (CTO):** "We're about to have real users for the first time. Without analytics, we're flying blind. The beta funnel gives us the one metric that matters: what percentage of invites turn into raters?"

**Rachel Wei (CFO):** "The conversion rates tell us everything. If invite-to-signup is under 50%, our email template needs work. If signup-to-rating is under 30%, our onboarding has friction. These numbers drive every decision in the next 5 sprints."

**Amir Patel (Architecture):** "Time-series analytics (hourly + daily) use the existing in-memory buffer — no new database tables. Active user tracking piggybacks on requireAuth middleware, so every authenticated request is a data point. Zero-cost observability."

**Sarah Nakamura (Lead Eng):** "The active user stats are auto-computed from middleware — no manual tracking needed. 1h/24h/7d/30d windows give us real-time and trailing indicators. We'll see engagement patterns immediately."

**Jasmine Taylor (Marketing):** "The beta funnel endpoint combines in-memory analytics with the beta_invites database. I can see invite → view → signup → rating progression plus the exact list of who joined and who's still pending."

**Nadia Kaur (Cybersecurity):** "All analytics endpoints are admin-only behind requireAuth + requireAdmin. No analytics data leaks to non-admin users."

**Jordan Blake (Compliance):** "Active user tracking stores only userId and timestamp — no PII. The data expires naturally as the 30-day window slides forward."

## Deliverables

### Beta Conversion Events (`server/analytics.ts`)
- 5 new event types: `beta_invite_sent`, `beta_join_page_view`, `beta_signup_completed`, `beta_first_rating`, `beta_referral_shared`
- Events tracked at key funnel touchpoints

### Time-Series Analytics (`server/analytics.ts`)
- `getHourlyStats(hours)` — Events bucketed by hour, with per-type breakdown
- `getDailyStats(days)` — Events bucketed by day, with unique user count per day
- Sorted chronologically, configurable lookback window

### Active User Tracking (`server/analytics.ts` + `server/middleware.ts`)
- `recordUserActivity(userId)` — Called on every authenticated request
- `getActiveUserStats()` — Returns 1h/24h/7d/30d active counts
- Integrated into `requireAuth` middleware — zero manual tracking

### Beta Conversion Funnel (`server/analytics.ts`)
- `getBetaConversionFunnel()` — Full invite-to-rating funnel
- Conversion rates: invite→view, view→signup, signup→rating, overall invite→rating
- N/A for zero-division safety

### Admin Analytics Endpoints (`server/routes-admin.ts`)
- `GET /api/admin/analytics/hourly` — Hourly event bucketing (max 168h)
- `GET /api/admin/analytics/daily` — Daily event bucketing (max 90d)
- `GET /api/admin/analytics/active-users` — Active user counts by window
- `GET /api/admin/analytics/beta-funnel` — Beta conversion funnel + invite tracking

### Beta Invite Analytics (`server/routes-admin.ts`)
- Beta invite sends now tracked as `beta_invite_sent` analytics event

## Tests

- 35 new tests in `tests/sprint199-analytics-dashboard.test.ts`
- Full suite: **3,417 tests across 130 files, all passing in ~2s**
