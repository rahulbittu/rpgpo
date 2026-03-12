# Sprint 194 — Load Testing + CDN Configuration

**Date:** 2026-03-09
**Story Points:** 8
**Status:** Complete

## Mission Alignment

Before beta launch, we need confidence in production performance. Load testing validates our Redis caching and DB query efficiency under concurrent load. HTTP Cache-Control headers enable CDN edge caching, reducing origin server load and global latency.

## Team Discussion

**Amir Patel (Architecture):** "The load test script uses weighted endpoint selection — leaderboard and autocomplete get 55% of traffic (matching real usage patterns). Pass/fail criteria: 10+ RPS, <500ms avg latency, <5% error rate. These are conservative targets for beta."

**Sarah Nakamura (Lead Engineer):** "Cache-Control headers match our Redis TTLs: leaderboard at 5 min, categories at 2 hr, autocomplete at 30s. The stale-while-revalidate directive lets CDN edges serve stale data while fetching fresh data in the background — zero-latency cache refreshes."

**Nadia Kaur (Cybersecurity):** "Auth-dependent endpoints (profile, referrals/me, admin) default to `private, no-cache` — they can never be cached at the CDN edge. POST/PUT/DELETE requests get `no-store`. Only public, read-only data is cacheable."

**Marcus Chen (CTO):** "The load test script is a lightweight alternative to k6 or Artillery — no extra dependency needed. `npx tsx scripts/load-test.ts` is all it takes. Per-endpoint breakdown shows exactly which endpoints are the bottleneck."

**Rachel Wei (CFO):** "Cloudflare Free tier would give us global CDN for $0. With Cache-Control headers in place, static assets and cached API responses are served from edge nodes. This effectively doubles our capacity without scaling the origin."

## Changes

### Load Test Script (`scripts/load-test.ts` — NEW)
- Configurable: base URL, concurrency (default 50), duration (default 30s)
- 7 weighted endpoints matching real traffic patterns
- Metrics: RPS, avg/p50/p95/p99/max latency, error rate
- Per-endpoint breakdown with individual stats
- Pass/fail criteria: 10+ RPS, <500ms avg, <5% errors

### Cache Headers Middleware (`server/cache-headers.ts` — NEW)
- `cacheHeaders()` — Express middleware for Cache-Control headers
- Rules for 9 endpoints with appropriate TTLs
- `staticCacheHeaders(days)` — immutable cache for hashed static assets
- GET-only caching, non-GET → `no-store`
- Unconfigured API routes → `private, no-cache`

### Cache Rules

| Endpoint | Visibility | max-age | stale-while-revalidate |
|----------|-----------|---------|----------------------|
| `/api/leaderboard` | public | 5 min | 60s |
| `/api/trending` | public | 10 min | 120s |
| `/api/leaderboard/categories` | public | 2 hr | — |
| `/api/businesses/popular-categories` | public | 1 hr | — |
| `/api/businesses/autocomplete` | public | 30s | — |
| `/api/businesses/search` | public | 30s | — |
| `/api/featured` | public | 5 min | — |
| `/api/health` | public | 10s | — |
| `/api/referrals/validate` | public | 60s | — |

### Server Integration (`server/index.ts`)
- `cacheHeaders` middleware added after rate limiter, before perf monitor

## Tests
- `tests/sprint194-load-testing-cdn.test.ts` — 32 tests
- Full suite: **3,256 tests across 126 files, all passing**
