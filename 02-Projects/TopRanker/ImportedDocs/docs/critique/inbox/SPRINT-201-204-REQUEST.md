# External Critique Request — Sprints 201-204

**Date:** 2026-03-09
**Requested by:** Claude (Engineering AI)

## Sprint Summaries

### Sprint 201: Analytics Persistence + DB Backup
- Wired flush handler to persist analytics events from in-memory buffer to PostgreSQL
- Discovered existing analyticsEvents table (avoided creating duplicate)
- DB backup automation via GitHub Actions (daily cron, pg_dump, 30-day retention)
- 29 tests added

### Sprint 202: Client-Side Beta Tracking
- 4 new beta event types in client analytics (join page view, CTA tap, signup with referral, referral share)
- 4 convenience functions on Analytics object
- Join page, signup page, referral page instrumented
- 20 tests added

### Sprint 203: Admin Analytics Visualization + Data Retention
- Beta conversion funnel chart in admin dashboard
- Active users section (1h/24h/7d/30d)
- Data retention policy: 90 days analytics, 365 days invites
- Purge endpoint with 30-day minimum floor
- 41 tests added

### Sprint 204: Wave 3 Expansion + Performance Validation
- Batch invite capacity 25→100
- Performance validation endpoint (avg <200ms, max <2s, slow <5%)
- User activity persistence to DB (upsert pattern)
- 29 tests added

## Metrics
- Tests: 3,536 across 134 files, all passing in ~2s
- Arch Audit #23: A- (0 critical, 0 high, 4 medium, 2 low)
- `as any` casts: 46 non-test (stable)
- Clean sprint streak: 30

## Known Issues
- Middleware still uses in-memory active user tracking (not DB version)
- Two performance budget definitions (lib vs server)
- routes-admin.ts at 592 LOC approaching split threshold
- Dashboard doesn't auto-refresh
- No data export before purge

## Changed Files (201-204)
- server/storage/analytics.ts (NEW + modified)
- server/storage/user-activity.ts (NEW)
- server/storage/index.ts (modified)
- server/analytics.ts (modified)
- server/routes-admin.ts (modified)
- server/perf-monitor.ts (modified)
- server/index.ts (modified)
- server/middleware.ts (modified)
- shared/schema.ts (modified)
- app/admin/dashboard.tsx (modified)
- app/join.tsx (modified)
- app/auth/signup.tsx (modified)
- app/referral.tsx (modified)
- lib/analytics.ts (modified)
- .github/workflows/db-backup.yml (NEW)

## Questions for External Critique
1. Is the analytics pipeline architecture sound (in-memory buffer → periodic flush → PostgreSQL)?
2. Are we missing any critical beta metrics for the launch decision?
3. Should the data retention policy be more granular (per-event-type retention)?
4. Is the performance validation endpoint checking the right budgets for public launch readiness?
5. Any concerns about the dual active-user tracking (in-memory + DB)?

## Proposed Sprint 206
- Wire DB activity tracking in middleware
- Consolidate performance budgets
- CI perf validation integration
- Document analytics buffer limitation

Please provide external critique.
