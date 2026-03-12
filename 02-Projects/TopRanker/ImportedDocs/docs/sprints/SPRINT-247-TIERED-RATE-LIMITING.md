# Sprint 247 — API Rate Limiting Per Tier (Free/Pro/Enterprise)

**Date**: 2026-03-09
**Theme**: API Infrastructure — Tiered Rate Limiting
**Story Points**: 8
**Tests Added**: 34 (sprint247-tiered-rate-limiting.test.ts)

---

## Mission Alignment

TrustMe's credibility-weighted ranking system is only as reliable as the API serving it. As we
onboard business Pro subscribers ($49/mo), Challenger users ($99), and enterprise API partners,
undifferentiated rate limiting treats a $0 anonymous scraper the same as a paying enterprise
customer. Sprint 247 introduces per-tier rate limiting with four tiers — free, pro, enterprise,
and admin — each with configurable minute/hour/day windows and burst limits. This is foundational
infrastructure for the Premium API revenue stream and ensures paying customers get the throughput
they're paying for while protecting the platform from abuse.

---

## Team Discussion

**Marcus Chen (CTO)**: "Rate limiting is table stakes for any API product, but tiered rate limiting
is what separates a hobby project from a revenue-generating platform. Our Premium API is one of
four revenue streams Rachel has modeled. Enterprise customers need guaranteed throughput — 600
requests/minute vs. 30 for free tier is a 20x multiplier that directly maps to pricing. The
sliding-window approach with minute/hour/day granularity gives us three layers of protection:
burst control, sustained load management, and daily quota enforcement. The in-memory Map with
MAX_TRACKED=10000 is appropriate for our current scale. When we hit 10K concurrent API consumers,
we'll migrate to Redis-backed counters."

**Sarah Nakamura (Lead Engineer)**: "34 tests across four groups. The static analysis group verifies
every export, all four tier definitions, the MAX_TRACKED constant, and logger integration. The
runtime group covers the full lifecycle: initial request allowed, remaining count decremented,
minute limit enforcement (31 requests blocks on free tier), tier differentiation (pro allows more
than free, enterprise more than pro), usage tracking, stats aggregation, and cleanup. The admin
routes group validates all four endpoints. The integration group confirms routes.ts wiring. The
module follows our established pattern: pure computation in tiered-rate-limiter.ts, thin HTTP
layer in routes-admin-tier-limits.ts, registration in routes.ts."

**Rachel Wei (CFO)**: "This directly supports our Premium API pricing model. The tier limits map to
our planned pricing: free tier is the funnel (30 req/min is enough for evaluation), pro at $49/mo
gets 120 req/min which covers most small business integrations, and enterprise at custom pricing
gets 600 req/min for high-volume partners like food delivery aggregators. The admin tier at 1000
req/min ensures our internal tools are never rate-limited. I want the usage stats endpoint exposed
in the admin dashboard so I can track API consumption patterns and identify upsell opportunities —
free tier users consistently hitting their limits are prime conversion targets."

**Amir Patel (Architecture)**: "The sliding-window implementation is clean but has a known trade-off:
it's a fixed-window approximation, not a true sliding window. A user could theoretically make 30
requests at minute 0:59 and another 30 at minute 1:01 — 60 requests in 2 seconds. For our current
scale this is acceptable. The migration path to Redis is straightforward: replace the Map with
Redis INCR + EXPIRE commands, same key structure. The getOrCreate function handles eviction when
MAX_TRACKED is exceeded by deleting the oldest entry (FIFO). The clearUsage export enables test
isolation via beforeEach. The admin routes follow Express Router conventions with proper validation
on the tier parameter."

**Nadia Kaur (Cybersecurity)**: "Tiered rate limiting is a critical security control. The free tier
at 30 req/min prevents credential stuffing and scraping attacks from unauthenticated clients. The
burst limit field is defined but not yet enforced in the middleware — that should be Sprint 248
priority. I want to see rate limit headers (X-RateLimit-Remaining, X-RateLimit-Reset) on every
API response so clients can self-throttle. The usage stats endpoint is sensitive — it reveals API
consumer patterns. It must be behind admin authentication when we close the admin auth gap."

**Jordan Blake (Compliance)**: "Rate limiting is a compliance requirement for any API that processes
personal data under GDPR and CCPA. If a data subject exercises their right to access, we need to
ensure the extraction doesn't get rate-limited — admin tier handles this. The usage tracking stores
API keys and request counts, which is metadata we need to document in our data processing register.
The 24-hour day window with automatic reset aligns with our data minimization principle — we don't
retain historical usage beyond the current window."

---

## Changes

### New Files
- `server/tiered-rate-limiter.ts` — Core rate limiting module with 4-tier configuration, sliding
  window counters (minute/hour/day), usage tracking, stats aggregation, and cleanup
- `server/routes-admin-tier-limits.ts` — Admin API routes for tier limit inspection and usage
  monitoring (4 GET endpoints)
- `tests/sprint247-tiered-rate-limiting.test.ts` — 34 tests across static, runtime, admin routes,
  and integration groups

### Modified Files
- `server/routes.ts` — Import and register `registerAdminTierLimitRoutes`

---

## Test Summary

| Group | Tests | Coverage |
|-------|-------|----------|
| Tiered rate limiter — static analysis | 10 | Exports, tiers, MAX_TRACKED, logger |
| Tiered rate limiter — runtime | 14 | Allow/block, remaining, tiers, usage, stats, clear |
| Admin tier limit routes — static | 6 | File exists, export, 4 endpoints |
| Integration — wiring | 4 | Import, registration, cross-module imports |
| **Total** | **34** | |

---

## PRD Gap Assessment

- **Premium API rate limiting** — CLOSED. Four tiers defined with production-ready limits.
- **Admin usage visibility** — CLOSED. Stats and per-key usage endpoints available.
- **Burst limiting middleware** — OPEN. Burst limit field defined but not enforced in Express
  middleware. Target: Sprint 248.
- **Rate limit response headers** — OPEN. X-RateLimit-Remaining and X-RateLimit-Reset not yet
  added to HTTP responses. Target: Sprint 248.
