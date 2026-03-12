# Sprint 812 — Health Endpoint Lockdown

**Date:** 2026-03-12
**Theme:** Split public liveness from admin-gated diagnostics per external critique
**Story Points:** 1 (security)

---

## Mission Alignment

- **Security:** Internal diagnostics (memory, push stats, log counts, rate limiter) no longer exposed publicly
- **External critique response:** Addresses 800-804 critique item "Lock down /api/health exposure"
- **Compliance:** Admin auth gate prevents information leakage

---

## Problem

`/api/health` was a public endpoint exposing:
- Memory usage (heap, RSS)
- Node version and environment
- Push notification stats (token counts, message counts)
- Log error/warn counts
- SSE client count
- Rate limiter active windows

This is sensitive operational data that should not be publicly accessible.

## Fix

Split into two endpoints:

| Endpoint | Access | Fields |
|----------|--------|--------|
| `/api/health` | **Public** | status, version, uptime, timestamp |
| `/api/health/diagnostics` | **Admin-gated** (403 for non-admin) | All original fields: memory, push, logs, SSE, rate limiter, nodeVersion, environment |

---

## Team Discussion

**Nadia Kaur (Cybersecurity):** "The external critique was right — exposing memory stats, error counts, and rate limiter windows on a public endpoint is an information leak. Attackers can use this to profile the server for resource exhaustion attacks."

**Amir Patel (Architecture):** "Clean separation. Load balancers and uptime monitors only need status + uptime. The detailed diagnostics are admin-only now."

**Sarah Nakamura (Lead Eng):** "One test file needed updating — sprint119 checked for memoryUsage on the health endpoint. Updated to verify diagnostics instead."

**Marcus Chen (CTO):** "This closes the second unaddressed item from the 800-804 critique. Config consolidation was #1, health lockdown is #2."

---

## Changes

| File | Change |
|------|--------|
| `server/routes-health.ts` | Split /api/health → public liveness + /api/health/diagnostics (admin-gated) |
| `__tests__/sprint812-health-lockdown.test.ts` | 10 new tests |
| `tests/sprint119-pool-offline.test.ts` | Updated for new endpoint structure |

---

## Tests

- **New:** 10 tests in `__tests__/sprint812-health-lockdown.test.ts`
- **Total:** 13,569 tests across 611 files — all passing
- **Build:** 689.4kb (max 750kb)
