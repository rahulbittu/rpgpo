# Sprint 201 — Analytics Persistence + DB Backup Automation

**Date:** 2026-03-09
**Story Points:** 8
**Status:** Complete

## Mission Alignment

Close the two biggest operational gaps before sending wave 1 invites: analytics persistence (L1 from Audit #22) and automated DB backups (L2 carried since Audit #21). Both are prerequisites for responsible beta management.

## Team Discussion

**Marcus Chen (CTO):** "We can't send invites and then lose all conversion data on a server restart. Analytics persistence is the single most important operational fix before wave 1."

**Amir Patel (Architecture):** "The flush handler pattern was already built in Sprint 110 — we just needed to connect it. The existing analyticsEvents table uses jsonb for metadata, which is more flexible than my initial text-column approach. Good that we checked first."

**Sarah Nakamura (Lead Eng):** "Batch inserts in chunks of 100 prevent query size blowups. The flush runs every 30 seconds — frequent enough for real-time dashboards, infrequent enough to not hammer the DB."

**Rachel Wei (CFO):** "Automated daily backups close a carried LOW finding. 30-day retention on GitHub Actions artifacts gives us a month of rollback capability at zero cost."

**Nadia Kaur (Cybersecurity):** "The backup workflow uses GitHub Secrets for DATABASE_URL — credentials never in code. Integrity verification catches corrupt or empty backups."

**Jordan Blake (Compliance):** "Automated backups are a GDPR requirement for data resilience. This closes a compliance gap we've carried for 6 audits."

## Deliverables

### Analytics Persistence (`server/storage/analytics.ts`)
- `persistAnalyticsEvents(entries)` — Bulk insert with 100-record chunking
- `getPersistedEventCounts(since)` — Event type counts for time range
- `getPersistedDailyStats(days)` — Daily event counts
- `getPersistedEventTotal()` — Total event count
- Uses existing `analyticsEvents` table (jsonb metadata, indexed)

### Flush Handler Wiring (`server/index.ts`)
- Connects `persistAnalyticsEvents` as flush handler at startup
- 30-second flush interval
- Graceful fallback if DB unavailable (stays in-memory)

### DB Backup Automation (`.github/workflows/db-backup.yml`)
- Daily at 3:00 AM UTC via GitHub Actions cron
- Manual trigger supported (workflow_dispatch)
- pg_dump with gzip compression
- 30-day artifact retention
- Integrity verification (gunzip test + size check)
- Closes Audit L2 finding (carried since Sprint 195)

## Tests

- 29 new tests in `tests/sprint201-analytics-persistence.test.ts`
- Full suite: **3,446 tests across 131 files, all passing**
