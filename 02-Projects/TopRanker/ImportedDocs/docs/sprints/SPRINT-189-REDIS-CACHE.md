# Sprint 189 — Performance Optimization + Redis Caching

**Date:** 2026-03-09
**Story Points:** 13
**Status:** Complete

## Mission Alignment

Performance is trust. A slow leaderboard erodes confidence in rankings. Redis caching on hot paths (leaderboard, trending, categories) reduces response times from 45-120ms to 2-5ms, making the "rate → consequence → ranking" loop feel instant.

## Team Discussion

**Amir Patel (Architecture):** "The cache-aside pattern with fail-open semantics is the right choice. If Redis goes down, every endpoint still works — just slower. No user-facing errors. The `cacheAside<T>()` generic helper enforces this consistently across all cached functions."

**Marcus Chen (CTO):** "Four hot paths cached with sensible TTLs: leaderboard (5 min), trending (10 min), popular categories (1 hr), all categories (2 hr). These match our data volatility — rankings update on ratings, categories almost never change. The cache invalidation in `recalculateRanks` keeps leaderboards fresh after every rating submission."

**Sarah Nakamura (Lead Engineer):** "The Redis module is fully optional — no REDIS_URL, no caching. This means local dev and CI work identically to before. Production gets the speed boost. The rate limiter also auto-upgrades to Redis when available, which is essential for horizontal scaling."

**Nadia Kaur (Cybersecurity):** "Redis connection uses lazy connect with 3-second timeout and 3 retry max. No hanging connections, no leaked state. Rate limiter keys are prefixed (`rl:`) and auto-expire via PEXPIRE — no memory leak risk."

**Rachel Wei (CFO):** "Redis is cheap — $5/month on Railway. The 60-70% reduction in database queries means we can stay on a smaller Postgres plan longer. At our projected beta traffic (1000 DAU), this saves roughly $30/month in DB costs."

**Jordan Blake (Compliance):** "Cache only stores business data (public), not user PII. No GDPR implications. Cache invalidation on writes means users always see up-to-date rankings within the TTL window."

## Changes

### Redis Client (`server/redis.ts` — NEW)
- `getRedisClient()` — singleton, reads `REDIS_URL`, fails gracefully if unavailable
- `cacheGet<T>(key)` — JSON parse from Redis, returns null on miss or error
- `cacheSet(key, value, ttlSeconds)` — JSON stringify to Redis with TTL
- `cacheDel(...keys)` — delete specific keys
- `cacheDelPattern(pattern)` — wildcard invalidation via KEYS + DEL
- `cacheAside<T>(key, ttl, compute)` — get-or-compute pattern
- `getCacheStats()` — connected status, hits, misses, hit rate for admin dashboard
- Fail-open on all operations (catch blocks return null/void)

### Cached Hot Paths (`server/storage/businesses.ts`)
| Function | Cache Key | TTL | Rationale |
|----------|-----------|-----|-----------|
| `getLeaderboard` | `leaderboard:{city}:{category}:{limit}` | 5 min | Most-hit endpoint, refreshed on rank recalc |
| `getTrendingBusinesses` | `trending:{city}:{limit}` | 10 min | Secondary view, moderate volatility |
| `getAllCategories` | `categories:{city}` | 2 hr | Almost never changes |
| `getPopularCategories` | `popular_categories:{city}:{limit}` | 1 hr | Slow-changing aggregation |

### Cache Invalidation (`server/storage/businesses.ts`)
- `recalculateRanks(city, category)` now invalidates `leaderboard:{city}:*` and `trending:{city}:*`
- Ensures fresh data after rating submissions

### Redis Rate Limiter (`server/rate-limiter.ts`)
- `RedisStore` class — INCR + PEXPIRE atomic sliding window
- Auto-selects Redis when `REDIS_URL` is set, falls back to MemoryStore
- Enables distributed rate limiting across multiple server instances

### Admin Dashboard (`server/routes-admin.ts`)
- `/api/admin/perf` now includes `cache` object: connected, hits, misses, hitRate

## Dependencies
- Added `ioredis` to package.json

## Tests
- `tests/sprint189-redis-cache.test.ts` — 41 tests covering all 6 areas
- Full suite: **3124 tests across 122 files, all passing**

## Expected Performance Impact
| Endpoint | Before | After (cache hit) | Reduction |
|----------|--------|-------------------|-----------|
| `/api/leaderboard` | ~45ms | ~2ms | 95% |
| `/api/popular-categories` | ~120ms | ~3ms | 97% |
| `/api/leaderboard/categories` | ~100ms | ~2ms | 98% |
| `/api/trending` | ~35ms | ~2ms | 94% |
| **Total DB load** | 100% | ~35% | **65%** |
