# Sprint 191 — Beta Launch Hardening

**Date:** 2026-03-09
**Story Points:** 10
**Status:** Complete

## Mission Alignment

Beta launch requires reliability, not just features. This sprint hardens the infrastructure: email retry for delivery guarantees, error tracking for visibility into failures, and DB backup scripts for data safety. No new features — just making existing features more trustworthy.

## Team Discussion

**Sarah Nakamura (Lead Engineer):** "The email retry with exponential backoff (500ms, 1s, 2s) handles transient Resend API failures. Smart 4xx/5xx distinction — we don't retry client errors (bad payload) but do retry rate limits and server errors."

**Nadia Kaur (Cybersecurity):** "The error tracking module captures unhandled rejections and uncaught exceptions at the process level. The 100-error in-memory buffer gives admins immediate visibility without needing external log aggregation. When SENTRY_DSN is configured, errors are structured for Sentry ingestion."

**Amir Patel (Architecture):** "Error handler middleware captures route context, user ID, and query params with every error. The admin `/api/admin/errors` endpoint gives the team real-time error visibility. The perf dashboard now includes error stats alongside cache stats."

**Marcus Chen (CTO):** "DB backup script with 7-day rotation and gzip compression. Simple, Unix-philosophy approach. Can be run as a Railway cron job or manually. We should schedule daily backups before beta invite goes out."

**Rachel Wei (CFO):** "Zero additional monthly cost — error tracking uses console/structured logging. DB backups use existing pg_dump. When we scale, Sentry Pro ($26/month) and S3 backup storage ($1/month) are easy upgrades."

**Jordan Blake (Compliance):** "Automated backups close a GDPR requirement — we must be able to recover data if deletion requests fail. The 7-day rotation also limits backup data retention, which is good for data minimization."

## Changes

### Email Retry (`server/email.ts`)
- `sendWithRetry(payload, maxRetries=3)` — exponential backoff (500ms, 1s, 2s)
- Retries on 5xx and 429 (rate limit), not on other 4xx
- Logs attempt count and final failure
- `sendEmail()` now calls `sendWithRetry()`

### Error Tracking (`server/error-tracking.ts` — NEW)
- `initErrorTracking()` — registers process-level handlers (unhandledRejection, uncaughtException)
- `captureServerError(err, context, severity)` — buffers errors + logs structured JSON
- `errorHandlerMiddleware` — Express error middleware with route/user context
- `getRecentServerErrors(limit)` — admin API for error inspection
- `getErrorStats()` — severity counts + last 24h count
- Ready for Sentry SDK when `SENTRY_DSN` is configured

### Server Init (`server/index.ts`)
- `initErrorTracking()` called early (before routes/middleware)

### Admin Endpoints (`server/routes-admin.ts`)
- `GET /api/admin/errors` — recent server errors with limit param
- `GET /api/admin/perf` — now includes `errors` stats alongside `cache` stats

### DB Backup Script (`scripts/db-backup.sh` — NEW)
- pg_dump with gzip compression
- Timestamped files, 7-day rotation
- Reads DATABASE_URL, configurable output directory
- `set -euo pipefail` for safety

## Tests
- `tests/sprint191-beta-hardening.test.ts` — 39 tests
- Full suite: **3,163 tests across 123 files, all passing**
