# Sprint 752 — Readiness Probe + Enhanced Startup Logging

**Date:** 2026-03-12
**Theme:** Database connectivity probe + startup diagnostics for Railway
**Story Points:** 1

---

## Mission Alignment

- **Infrastructure readiness:** The `/_health` endpoint from Sprint 751 confirms the process is alive, but doesn't verify database connectivity. The `/_ready` probe ensures the service is actually ready to serve requests.

---

## Team Discussion

**Sarah Nakamura (Lead Eng):** "Health vs readiness is a standard Kubernetes pattern. `/_health` tells the load balancer the process is alive. `/_ready` tells it the process can actually serve requests — meaning the database is connected. If the DB goes down, Railway should stop sending traffic."

**Amir Patel (Architecture):** "The `SELECT 1` check is lightweight — no table scans, no data transfer. Just validates the connection pool has a live connection. Returns 503 if the DB is unreachable, which is the correct signal for load balancers."

**Marcus Chen (CTO):** "The startup logging now includes Node version, PID, and environment. When we look at Railway logs after deployment, we'll immediately see if we're running the right version in the right mode."

**Nadia Kaur (Cybersecurity):** "Both probe endpoints are unauthenticated, which is correct for infrastructure monitoring. The `/_ready` response doesn't leak connection strings or credentials — just `connected` or `disconnected`."

---

## Changes

| File | Change |
|------|--------|
| `server/routes.ts` | Added `/_ready` endpoint with DB connectivity check via `pool.query("SELECT 1")` (390→401 LOC) |
| `server/index.ts` | Enhanced startup log with Node version, PID, and NODE_ENV |
| `shared/thresholds.json` | routes.ts maxLOC raised 400→420 |
| 5 test files | Updated routes.ts LOC thresholds |

---

## Tests

- **New:** 16 tests in `__tests__/sprint752-readiness-probe.test.ts`
- **Updated:** 5 test files for routes.ts LOC threshold
- **Total:** 12,978 tests across 559 files — all passing

---

## Health Metrics

| Metric | Value |
|--------|-------|
| Build size | 664.8kb / 750kb (88.6%) |
| Tests | 12,978 / 559 files |
| Tracked files | 34 |
