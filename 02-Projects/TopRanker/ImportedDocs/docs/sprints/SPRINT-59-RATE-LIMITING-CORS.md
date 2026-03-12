# Sprint 59 — Rate Limiting + CORS Hardening

## Mission Alignment
A ranking platform without rate limiting is an invitation for scraping, manipulation, and abuse. If someone can hit `/api/leaderboard` 10,000 times per minute, they can scrape our entire database or overwhelm the server. Rate limiting is the minimum security perimeter for a public API.

## Backlog Refinement (Pre-Sprint)
**Attendees**: Rahul (CEO), Marcus (CTO), Nadia (Security), Alex (DevOps), Carlos (QA)

**Selected from Audit MEDIUM Findings**:
- M3: Rate limiting on public endpoints (3 pts)
- M4: CORS configuration hardening (2 pts)
- Rate limiter test suite (2 pts)

**Total**: 7 story points

## Team Discussion

### Rahul Pitta (CEO)
"We already had rate limiting on auth endpoints — 10 per minute per IP. But the leaderboard, search, and business endpoints were wide open. One bot could make 100,000 requests and either scrape every business or DoS us. Nadia, get this locked down."

### Nadia Kaur (VP Security)
"I refactored the existing auth rate limiter into a reusable `createRateLimiter` factory. Now we have two tiers: auth (10 req/min) and API (100 req/min). The API limiter is applied as middleware to all public data endpoints: leaderboard, businesses, dishes, challengers, trending, members, ratings, photos. The health endpoint is exempt — it needs to be always-available for monitoring."

### Alex Volkov (DevOps Lead)
"For CORS, I added the production domains (`topranker.com`, `www.topranker.com`) to the explicit origin whitelist alongside the Replit domains and localhost. This means when we deploy to production, the CORS headers are already correct. No last-minute config changes needed."

### Marcus Chen (CTO)
"The rate limiter factory is clean — one function creates a named limiter with configurable max and window. The cleanup interval handles all buckets in a single pass. In-memory rate limiting is fine for a single-server deployment. When we scale to multiple instances, we'll need Redis-backed rate limiting, but that's a post-launch concern."

### Carlos Ruiz (QA Lead)
"7 new rate limiter tests verify: auth limit (10/min blocks on 11th), API limit (100/min blocks on 101st), IP isolation (one blocked IP doesn't affect others), window expiry (counter resets after window), and count tracking. 85 tests total now, all passing in 154ms."

### Sage (Backend Engineer #2)
"The `createRateLimiter` pattern means adding a third tier is one line. If we need a stricter rate limit for the rating submission endpoint, we just call `createRateLimiter('rating', 5, 60000)` — 5 ratings per minute per IP."

## Changes

### Modified Files
- `server/routes.ts`:
  - Refactored single-purpose `authRateLimit` into reusable `createRateLimiter(name, maxRequests, windowMs)` factory
  - Created two tiers: `authRateLimit` (10/min) and `apiRateLimit` (100/min)
  - Applied `apiRateLimit` middleware to 8 public endpoint prefixes
  - Cleanup interval handles all limiter buckets in one pass
- `server/index.ts`:
  - Added production domains (`topranker.com`, `www.topranker.com`) to CORS origin whitelist
  - Maintained Replit and localhost origin support

### New Files
- `tests/rate-limiter.test.ts` (7 tests) — Rate limiter behavior verification

### Rate Limit Configuration
| Tier | Endpoints | Max Requests | Window |
|------|-----------|-------------|--------|
| Auth | `/api/auth/*` | 10 | 1 minute |
| API | `/api/leaderboard`, `/api/businesses`, `/api/dishes`, `/api/challengers`, `/api/trending`, `/api/members`, `/api/ratings`, `/api/photos` | 100 | 1 minute |
| None | `/api/health` | Unlimited | — |

## Audit Findings Resolved
| Finding | Severity | Status |
|---------|----------|--------|
| M3: Rate limiting on public endpoints | MEDIUM | RESOLVED |
| M4: CORS configuration | MEDIUM | RESOLVED |

## Test Results
```
85 tests | 7 test files | 154ms
TypeScript: 0 errors
```

## Employee Performance

| Employee | Role | Contribution | Rating |
|----------|------|-------------|--------|
| Nadia Kaur | VP Security | Rate limiter factory, endpoint coverage | A+ |
| Alex Volkov | DevOps Lead | CORS production domains, origin whitelist | A |
| Carlos Ruiz | QA Lead | Rate limiter test suite, boundary verification | A |
| Sage | Backend Engineer #2 | Architecture review of factory pattern | A- |
| Marcus Chen | CTO | Scalability review (single-server vs Redis) | A |

## Sprint Velocity
- **Story Points Completed**: 7
- **Files Created**: 1 (test)
- **Files Modified**: 2 (routes.ts, index.ts)
- **Tests Added**: 7 (78 -> 85 total)
- **Endpoints Rate-Limited**: 8 public prefixes
- **CORS Origins Added**: 2 production domains
