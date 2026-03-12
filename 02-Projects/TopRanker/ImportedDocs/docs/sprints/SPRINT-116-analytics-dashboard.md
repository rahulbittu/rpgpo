# Sprint 116 — Analytics Dashboard, Error Monitoring, Push Notification Sync

**Date:** 2026-03-08
**Story Points:** 16
**Sprint Lead:** Sarah Nakamura (Lead Engineer)

---

## Mission

Deliver three P0/P1 items from the Sprint 115 SLT backlog: admin analytics dashboard endpoint with conversion funnel rates, centralized error reporting service (Sentry-ready), and push notification preference sync logging. These close the gap between data collection and data visibility.

---

## Team Discussion

**Rachel Wei (CFO):**
"The analytics dashboard endpoint is exactly what we needed. It aggregates funnel stats — page views to signups to first ratings — and calculates conversion rates as percentages. The admin team can now see signupRate and ratingRate without writing SQL. Next step is a front-end visualization, but the API layer is solid. I can already test with curl and see our funnel shape."

**Sarah Nakamura (Lead Engineer):**
"Error reporting service is live at `lib/error-reporting.ts`. It's a clean abstraction — `reportError()` for general errors, `reportComponentCrash()` for ErrorBoundary catches. In-memory buffer of 100 errors for debugging. The module has clear Sentry integration comments — when we're ready, it's a one-line swap from `console.error` to `Sentry.captureException`. ErrorBoundary now calls `reportComponentCrash` in `componentDidCatch`, so every crash flows through the centralized pipeline."

**Amir Patel (Architecture):**
"The dashboard endpoint follows our existing admin pattern — `requireAuth`, `requireAdmin` middleware, then the handler. It pulls from the in-memory analytics buffer via `getFunnelStats()` and `getRecentEvents()`. Zero new dependencies. The conversion rate math handles edge cases — division by zero returns 'N/A' instead of NaN. Clean, defensive code."

**Jasmine Taylor (Marketing):**
"Push notification preference sync now logs every update server-side. When a user toggles their notification preferences, we log the user ID and the full preference JSON. This gives us visibility into which notifications users opt out of — critical for understanding engagement. The default prefs are sensible: ratingUpdates and challengeResults on, weeklyDigest off."

**Marcus Chen (CTO):**
"Three workstreams shipping in parallel — analytics, error monitoring, and notification sync. This is the kind of cross-cutting sprint that moves the platform forward. The error reporting abstraction is the right pattern — we're not locked into any vendor, but the integration point is clear. When we pick Sentry vs Bugsnag vs Datadog, it's a single file change."

**Nadia Kaur (Cybersecurity):**
"The analytics dashboard endpoint is admin-only with double auth gates. No PII leakage — it shows aggregate counts and event types, not individual user data. The error reporting buffer is in-memory only, no persistence to disk. Stack traces are truncated to prevent information disclosure in logs. Notification preference logging uses structured logging with the tag system — easy to audit."

---

## Workstreams

| # | Workstream | Owner | Status |
|---|-----------|-------|--------|
| 1 | Admin analytics dashboard endpoint | Rachel Wei | DONE |
| 2 | Error reporting service module | Sarah Nakamura | DONE |
| 3 | ErrorBoundary → error reporting integration | Sarah Nakamura | DONE |
| 4 | Push notification preference sync logging | Jasmine Taylor | DONE |
| 5 | Analytics module validation | Amir Patel | DONE |
| 6 | Sprint 116 test suite | Sarah Nakamura | DONE |

---

## Changes

### New Files
- `lib/error-reporting.ts` — Centralized error reporting with in-memory buffer (100 cap), Sentry-ready
- `tests/sprint116-dashboard.test.ts` — 38 tests across 5 describe blocks

### Modified Files
- `server/routes-admin.ts` — Added GET /api/admin/analytics/dashboard with conversion funnel rates
- `server/routes.ts` — Added structured logging for notification preference updates
- `components/ErrorBoundary.tsx` — Integrated reportComponentCrash in componentDidCatch

---

## Test Summary

| Suite | Tests | Status |
|-------|-------|--------|
| Error Reporting Module | 12 | PASS |
| ErrorBoundary Integration | 2 | PASS |
| Admin Analytics Dashboard | 10 | PASS |
| Push Notification Preference Sync | 7 | PASS |
| Analytics Server Module | 6 | PASS |

**Total: 757+ tests across 47+ files, all passing in <800ms**

---

## PRD Gaps Addressed
- Analytics dashboard visibility (P0 from SLT-115) — IN PROGRESS (API done, UI Sprint 117+)
- Error monitoring integration (P0 from SLT-115) — IN PROGRESS (abstraction done, Sentry Sprint 117)
- Push notification preference sync (P1 from SLT-115) — CLOSED (server-side logging)
