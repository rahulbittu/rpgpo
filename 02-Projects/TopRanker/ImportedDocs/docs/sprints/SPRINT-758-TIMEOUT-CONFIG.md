# Sprint 758 — Server Timeout Configuration

**Date:** 2026-03-12
**Theme:** Set keepAliveTimeout + headersTimeout for Railway deployment
**Story Points:** 1

---

## Mission Alignment

- **Infrastructure readiness:** Node.js defaults keepAliveTimeout to 5s. Railway's load balancer has a 60s idle timeout. If the server closes connections before the LB expects, Railway returns 502. Setting keepAliveTimeout to 65s prevents this.

---

## Team Discussion

**Amir Patel (Architecture):** "This is the #1 cause of sporadic 502 errors on Railway/Heroku/Render. Node.js closes idle connections at 5s by default, but the load balancer expects them to stay open for 60s. The fix is two lines."

**Sarah Nakamura (Lead Eng):** "headersTimeout must be greater than keepAliveTimeout per Node.js docs, otherwise you get race conditions. We set 65s and 66s respectively."

**Marcus Chen (CTO):** "Another silent deployment failure mode addressed. Without this, the first time a user makes a request after 5s of inactivity, they'd get a 502."

---

## Changes

| File | Change |
|------|--------|
| `server/index.ts` | Added `server.keepAliveTimeout = 65_000` and `server.headersTimeout = 66_000` |

---

## Tests

- **New:** 9 tests in `__tests__/sprint758-timeout-config.test.ts`
- **Total:** 13,095 tests across 565 files — all passing

---

## Health Metrics

| Metric | Value |
|--------|-------|
| Build size | 665.0kb / 750kb (88.7%) |
| Tests | 13,095 / 565 files |
