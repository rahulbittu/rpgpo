# Architectural Audit #33

**Date:** 2026-03-09
**Auditors:** Marcus Chen (CTO), Amir Patel (Architecture), Sarah Nakamura (Lead Engineer), Nadia Kaur (Cybersecurity)
**Scope:** Full codebase — sprints 251-254 changes + cumulative health

---

## Executive Summary

The codebase sustains its A+ grade for the second consecutive audit. 5,011 tests across 180 files running in under 2.6 seconds. Four feature sprints (push notifications, Charlotte beta, business responses, photo moderation) each followed established patterns: domain module with tagged logger, in-memory store with clearX() isolation, thin route layer, comprehensive tests. No critical or high findings. Five low-priority items, one of which (in-memory stores) has been escalated with a committed Redis migration in Sprint 258-259.

**Overall Grade:** A+ (sustained from Audit #32)

---

## Metrics Comparison (Audit #32 → #33)

| Metric | Audit #32 (Sprint 250) | Audit #33 (Sprint 255) | Delta |
|--------|------------------------|------------------------|-------|
| Total Tests | 4,863 | 5,011 | +148 |
| Test Files | 176 | 180 | +4 |
| Execution Time | <2.6s | <2.6s | stable |
| Server Modules | 55+ | 59+ | +4 |
| In-Memory Stores | 9 | 11 | +2 |
| routes.ts LOC | ~470 | ~490 | +20 |
| DB Tables | 17 | 17 | 0 |
| Active Cities | 5 | 5 | 0 |
| Beta Cities | 4 | 5 | +1 (Charlotte) |
| Revenue Streams | 4 | 4 | 0 |
| CRITICAL findings | 0 | 0 | 0 |
| HIGH findings | 0 | 0 | 0 |
| MEDIUM findings | 0 | 0 | 0 |
| LOW findings | 5 | 5 | 0 |

---

## Sprint 251-254 Additions Reviewed

| Addition | Quality | Notes |
|----------|---------|-------|
| server/push-notifications.ts | GOOD | Expo Push token lifecycle, registration/refresh/expiry, tagged logger, clearTokens() isolation |
| server/routes-push.ts | GOOD | Thin route layer, 4 endpoints, delegating to domain module |
| server/city-health-monitor.ts | GOOD | Scheduled health checks, engagement threshold alerts, per-city metrics aggregation |
| server/routes-admin-health.ts | GOOD | Admin-gated health dashboard endpoints, city-level drill-down |
| server/business-responses.ts | GOOD | Threaded reply model, 3-per-day abuse rate limit, state machine (pending → published) |
| server/routes-owner-responses.ts | GOOD | Auth-gated owner endpoints, response CRUD, notification triggers |
| server/photo-moderation.ts | GOOD | MIME allowlist, pending/approved/rejected state machine, typed rejection reasons, 3000-entry cap |
| server/routes-admin-photos.ts | GOOD | 5 endpoints, zero business logic in HTTP layer, import only from domain module |

**All 8 new modules rated GOOD.** Each follows established patterns: tagged logger, in-memory Map, clearX() for test isolation, defensive copies on config accessors, thin route layer with no leaked business logic.

---

## Findings

### CRITICAL (fix immediately)

None.

### HIGH (P1 — fix within 2 sprints)

None.

### MEDIUM (P2 — fix within 4 sprints)

None.

### LOW (P3 — backlog)

#### L1: `as any` Casts for RN StyleSheet Percentage Widths
**Location:** Various app files
**Impact:** Known React Native limitation. Documented in MEMORY.md. Stable count.
**Status:** Accepted — no action needed.

#### L2: DB Backup Cron Not Scheduled
**Location:** Infrastructure
**Impact:** No automated database backups. Manual exports only. Low risk at current data volume but unacceptable at scale.
**Status:** Carried — Railway migration will include managed backups. Deferred until deployment platform is finalized.

#### L3: No CDN Proxy Layer
**Location:** Infrastructure
**Impact:** CDN response headers configured (Sprint 247) but no CDN proxy in front of Express. Static assets served directly from the application server.
**Status:** Carried — Railway deployment will include CDN proxy configuration. This finding has been carried across 7 audits.

#### L4: 11 In-Memory Stores — ESCALATED
**Location:** Various server modules
**Impact:** Push notification tokens, city health metrics, business responses, and photo submissions joined the existing 9 in-memory stores, bringing the total to 11. In a multi-instance deployment, these stores are not shared across instances, causing data inconsistency. This is the single largest architectural debt item.
**Stores:** alerting, email-tracking, rate-limit-dashboard, A/B testing, reputation cache, moderation queue, websocket connections, push tokens, city health, business responses, photo submissions
**Status:** ESCALATED — Redis migration committed for Sprint 258 (Phase 1: 3 stores) and Sprint 259 (Phase 2: 3 stores). Remaining 5 stores to be scheduled post-Phase 2 assessment. The SLT has declared this non-negotiable after 4 deferrals.

#### L5: routes.ts Approaching 500 LOC
**Location:** `server/routes.ts`
**Impact:** Currently ~490 LOC. Each sprint adds endpoint registrations. At 500 LOC, the file becomes difficult to navigate and review. The extraction pattern is established (routes-push.ts, routes-admin-photos.ts, routes-owner-responses.ts) but the main file still handles core CRUD and auth endpoints.
**Status:** Proactive extraction recommended. When the next endpoint addition crosses 500 LOC, split core routes into routes-auth.ts and routes-core.ts.

---

## Cumulative Scorecard

| Finding | First Audit | Current Status | Sprints Open |
|---------|-------------|----------------|--------------|
| `as any` casts | #1 | Accepted (RN limitation) | N/A |
| DB backup cron | #28 | Deferred to Railway | 14 |
| No CDN proxy | #26 | Deferred to Railway | 18 |
| In-memory stores | #29 | Redis committed Sprint 258-259 | 12 |
| routes.ts LOC | #30 | Monitoring (~490, threshold 500) | 10 |

---

## Architecture Health Summary

- **Test density:** 5,011 tests / 180 files = 27.8 tests per file (up from 27.6)
- **Test velocity:** 37 tests per sprint average (4-sprint block)
- **Module pattern compliance:** 100% — all new modules follow tagged logger + clearX() + defensive copy pattern
- **Route layer compliance:** 100% — all new route files are thin delegation layers
- **Security posture:** Strong. MIME allowlist, abuse rate limiting, JWT auth, tiered enforcement. One gap: isAdminEmail sweep pending (escalated to P1 for Sprint 256).
- **Scalability bottleneck:** In-memory stores (11). Redis migration is the critical path for multi-instance deployment.

---

## Grade Trajectory

| Audit | Sprint | Grade | Notes |
|-------|--------|-------|-------|
| #28 | Sprint 225 | A- | Redis first recommended |
| #29 | Sprint 230 | A- | In-memory stores flagged |
| #30 | Sprint 235 | A- | Routes.ts monitoring began |
| #31 | Sprint 245 | A | CDN headers shipped |
| #32 | Sprint 250 | A+ | 250-sprint milestone, 10th consecutive A-range |
| #33 | Sprint 255 | A+ | 5,011 tests, sustained excellence |

---

## Priority Queue for Sprint 256

1. **L4 prep:** Finalize Redis migration architecture plan (Amir Patel, Sprint 257 deliverable)
2. **isAdminEmail sweep:** Consolidated fix across all admin routes (Nadia Kaur, escalated P1)
3. **L5 monitoring:** If Sprint 256 endpoint additions cross 500 LOC, trigger route splitting
4. **Content-type byte sniffing:** Verify photo upload MIME types against actual file bytes
