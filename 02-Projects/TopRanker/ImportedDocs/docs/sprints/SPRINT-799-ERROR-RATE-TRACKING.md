# Sprint 799 — Error Rate Tracking in Structured Logger

**Date:** 2026-03-12
**Theme:** Production observability — track error/warn counts in logger, expose via health endpoint
**Story Points:** 1 (observability)

---

## Mission Alignment

- **Observability:** Error rate is the #1 signal for production health
- **Incident response:** lastErrorAt/lastWarnAt give instant visibility into when problems started

---

## Problem

The structured logger (server/logger.ts) output messages to console but didn't track aggregate metrics. In production, operators need to know:
- How many errors/warnings have occurred since server start
- When the last error/warning happened
- Whether error rate is trending up

Without this, the only way to detect rising error rates is to parse log files or use an external APM.

## Fix

1. Added `errorCount`, `warnCount`, `lastErrorAt`, `lastWarnAt` counters to logger.ts
2. Every `warn()` and `error()` call (both base and tagged loggers) increments counters
3. `getLogStats()` returns the current counters
4. `resetLogStats()` resets for testing
5. Wired `getLogStats()` into `/api/health` response as `logs` field

---

## Team Discussion

**Amir Patel (Architecture):** "This is the missing piece for our health endpoint. Memory, push stats, and now error rates — all three production signals in one endpoint."

**Sarah Nakamura (Lead Eng):** "The counter increment happens regardless of MIN_LEVEL, which is correct. We want to count errors even if they're suppressed in output. An error is still an error."

**Marcus Chen (CTO):** "Once we have TestFlight users, we can set up a simple cron that GETs /api/health and alerts if errorCount increases faster than expected."

**Nadia Kaur (Cybersecurity):** "The log stats don't expose message content — just counts and timestamps. No risk of leaking sensitive error details through the health endpoint."

**Rachel Wei (CFO):** "Zero additional dependencies. Zero additional API calls. Just in-memory counters. This is the kind of observability that costs nothing to run."

**Derek Okonkwo (Mobile):** "The functional tests are thorough — they verify counter increment, tagged logger increment, accumulation, and reset. Good coverage."

---

## Changes

| File | Change |
|------|--------|
| `server/logger.ts` | Added error/warn counters, `getLogStats()`, `resetLogStats()` |
| `server/routes.ts` | Added `logs: getLogStats()` to /api/health response |
| `__tests__/sprint799-error-rate-tracking.test.ts` | 17 tests (source + functional) |

---

## Tests

- **New:** 17 tests in `__tests__/sprint799-error-rate-tracking.test.ts`
- **Total:** 13,437 tests across 601 files — all passing
- **Build:** 669.1kb (max 750kb)
