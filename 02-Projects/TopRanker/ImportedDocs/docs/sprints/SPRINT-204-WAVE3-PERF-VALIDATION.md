# Sprint 204 — Wave 3 Expansion + Performance Validation

**Date:** 2026-03-09
**Story Points:** 8
**Status:** Complete

## Mission Alignment

Scale the beta from 50 to 100 users and validate performance under load. Active user tracking moves from volatile in-memory to persistent DB, ensuring server restarts don't lose session data. Performance validation gives the SLT a green/red health check before public launch.

## Team Discussion

**Marcus Chen (CTO):** "Wave 3 means 100 beta users — that's our largest cohort yet. The batch invite endpoint needed to scale from 25 to 100. Before SLT-205, I want a single endpoint that tells me: 'Are we fast enough for public launch?' That's the perf validation endpoint."

**Rachel Wei (CFO):** "100 users gives us the statistical significance for conversion rate analysis. If invite→rating stays above 15%, we greenlight public launch at SLT-205."

**Amir Patel (Architecture):** "Three performance checks: avg response time < 200ms, max < 2s, slow request rate < 5%. Simple pass/fail. The user activity table uses upsert with conflict-on-update — one row per user, always current. No unbounded growth."

**Sarah Nakamura (Lead Eng):** "The in-memory activeUsers Map was the last volatile state we depended on for analytics. Now it's DB-backed with an indexed timestamp column. Four parallel queries give us the time-windowed counts efficiently."

**Leo Hernandez (Frontend):** "The dashboard's active users section can now pull from /active-users-db instead of the in-memory endpoint. Same data shape, persistent source."

**Nadia Kaur (Security):** "Batch invite scaling from 25→100 doesn't change the security model — same per-invite validation, duplicate checking, and rate limiting. The 30 req/min admin rate limiter still applies."

**Jasmine Taylor (Marketing):** "Wave 3 target list: 100 users across Dallas, Austin, Houston, and San Antonio. Mix of food influencers, restaurant owners, and tech early adopters. Invite→join conversion from Wave 1-2 was 68% — expecting similar."

**Jordan Blake (Compliance):** "User activity table stores userId + lastSeenAt only — no PII beyond the user ID reference. Data minimization principles maintained."

## Deliverables

### Batch Invite Capacity (`server/routes-admin.ts`)
- Expanded from 25 to 100 invites per batch request
- Same validation, duplicate checking, and rate limiting

### Performance Validation (`server/perf-monitor.ts`)
- `getPerformanceValidation()` — returns healthy boolean + individual check results
- Checks: avg response ≤ 200ms, max ≤ 2000ms, slow rate < 5%
- `GET /api/admin/perf/validate` admin endpoint

### User Activity Persistence (`shared/schema.ts`, `server/storage/user-activity.ts`)
- `userActivity` table: userId (PK, FK→members), lastSeenAt (indexed timestamp)
- `recordUserActivityDb(userId)` — upsert with conflict-on-update
- `getActiveUserStatsDb()` — parallel queries for 1h/24h/7d/30d windows
- `GET /api/admin/analytics/active-users-db` admin endpoint

## Tests

- 33 new tests in `tests/sprint204-wave3-perf-validation.test.ts`
- Full suite: **3,540+ tests across 134 files, all passing**
