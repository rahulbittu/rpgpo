# Sprint 766 — Redis Log Deduplication

**Date:** 2026-03-12
**Theme:** Suppress repeated "REDIS_URL not set" log spam in production
**Story Points:** 1 (hardening)

---

## Mission Alignment

- **Operational visibility (Constitution #15):** Production logs were flooded with identical "REDIS_URL not set" messages — 5-10 per API request. This drowned out real errors and warnings.

---

## Problem

`getRedisClient()` is called on every cache operation (`cacheGet`, `cacheSet`, `cacheAside`). Without Redis configured, it logged the same INFO message every time. A single leaderboard request triggered 5+ cache lookups, producing 5+ identical log lines.

## Fix

Added a `redisChecked` flag. After the first check confirms REDIS_URL is not set, subsequent calls return `null` immediately without logging. The message appears exactly once at startup.

---

## Team Discussion

**Sarah Nakamura (Lead Eng):** "This was the noisiest log pattern in production. Railway's log viewer was 80% Redis warnings. Now it'll be one line."

**Amir Patel (Architecture):** "Classic lazy-init bug — caching the positive result (Redis connected) but not the negative result (no Redis). The fix is minimal and correct."

**Marcus Chen (CTO):** "Clean logs = faster debugging. When the next production issue happens, we won't be filtering through noise."

---

## Changes

| File | Change |
|------|--------|
| `server/redis.ts` | Added `redisChecked` flag to prevent repeated "no Redis" logging |

---

## Tests

- **New:** 6 tests in `__tests__/sprint766-redis-log-dedup.test.ts`
- **Total:** 13,163 tests across 573 files — all passing

---

## Health Metrics

| Metric | Value |
|--------|-------|
| Build size | 665.4kb / 750kb (88.7%) |
| Tests | 13,163 / 573 files |
| topranker.io | LIVE |
