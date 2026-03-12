# Sprint 764 — Route Count Fix

**Date:** 2026-03-12
**Theme:** Fix misleading "0 routes registered" startup log
**Story Points:** 1 (hardening)

---

## Mission Alignment

- **Operational visibility (Constitution #15):** Production logs showed "0 routes registered" on every startup, creating false alarm during Railway debugging. The counter only checked `layer.route` (direct handlers) and missed all Router instances.

---

## Root Cause

Express apps register routes via Router objects (`app.use("/api", router)`), not direct `app.get()` calls. The old counter filtered for `layer.route` which only matches direct handlers — all 30+ router modules were invisible.

Additionally, the counter ran BEFORE `configureExpoAndLanding()` added health check and static routes.

**The fix:**
1. Count both `layer.route` (direct) and `layer.name === "router"` (router instances)
2. Moved count AFTER `configureExpoAndLanding()` so all routes are captured
3. Log format: `"42 route handlers registered (8 direct, 34 routers)"`

---

## Team Discussion

**Sarah Nakamura (Lead Eng):** "This was actively misleading during the Sprint 761-762 Railway debugging. '0 routes registered' made us question whether routes loaded at all."

**Amir Patel (Architecture):** "Express Router instances are opaque from the outside — you can't easily count sub-routes within them. But counting routers gives a sanity check that all modules loaded."

**Marcus Chen (CTO):** "Small fix, big impact for operational confidence. Next time we're debugging Railway, the startup log will be accurate."

**Dev Okafor (QA):** "Updated the Sprint 121 tests that expected the old pattern. Test maintenance is part of the job."

---

## Changes

| File | Change |
|------|--------|
| `server/index.ts` | Replaced route counter to include Router instances, moved after configureExpoAndLanding |
| `tests/sprint121-sentry-dashboard.test.ts` | Updated assertions for new route count pattern |

---

## Tests

- **New:** 6 tests in `__tests__/sprint764-route-count-fix.test.ts`
- **Updated:** 2 tests in `tests/sprint121-sentry-dashboard.test.ts`
- **Total:** 13,150 tests across 571 files — all passing

---

## Health Metrics

| Metric | Value |
|--------|-------|
| Build size | 665.3kb / 750kb (88.7%) |
| Tests | 13,150 / 571 files |
| topranker.io | LIVE |
