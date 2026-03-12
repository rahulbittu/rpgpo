# Sprint 803 — Rate Limiter Stats in Health Endpoint

**Date:** 2026-03-12
**Theme:** Expose rate limiter active window count and store type in /api/health
**Story Points:** 1 (observability)

---

## Mission Alignment

- **Observability:** Rate limiting is invisible without stats — spikes in activeWindows indicate a DDoS or bot attack
- **Operations:** Knowing whether memory or Redis store is active is critical for debugging

---

## Problem

The rate limiter ran silently. Operators couldn't see:
- How many IPs had active rate limit windows
- Whether the store was memory (default) or Redis (production)
- Whether rate limiting was actually functioning

## Fix

1. Changed MemoryStore's `windows` Map from `private` to `readonly` for stats access
2. Added `getRateLimitStats()` returning `{ activeWindows, storeType }`
3. Wired into `/api/health` as `rateLimit` field
4. Fixed Sprint 733 test that matched exact import string (brittle)

---

## Team Discussion

**Amir Patel (Architecture):** "The health endpoint now covers 6 observability domains: memory, push, logs, SSE, rate limiting, and DB latency. One GET request tells you everything."

**Nadia Kaur (Cybersecurity):** "activeWindows is the most operationally useful metric. During normal traffic it should be low (10-50). During a bot attack it could spike to thousands. That's a clear signal."

**Sarah Nakamura (Lead Eng):** "routes.ts is at 414/420 LOC. We're close to the threshold but the health endpoint additions are high-value-per-line. If we need more, we'll extract routes-health.ts."

**Marcus Chen (CTO):** "The storeType field is a simple but important diagnostic. If Redis fails and we fall back to memory, that's visible in the health check."

**Rachel Wei (CFO):** "This completes the observability arc (Sprints 798-803). Five health signals added with minimal code growth. Good engineering efficiency."

---

## Changes

| File | Change |
|------|--------|
| `server/rate-limiter.ts` | Added `getRateLimitStats()`, changed MemoryStore windows to `readonly` |
| `server/routes.ts` | Added `rateLimit: getRateLimitStats()` to /api/health |
| `__tests__/sprint803-rate-limit-health.test.ts` | 12 tests |
| `__tests__/sprint733-rate-limiting-hardening.test.ts` | Fixed brittle import assertion |

---

## Tests

- **New:** 12 tests in `__tests__/sprint803-rate-limit-health.test.ts`
- **Total:** 13,464 tests across 604 files — all passing
- **Build:** 669.5kb (max 750kb)
