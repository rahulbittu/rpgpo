# Sprint 657: Claim Verification Rate Limiting

**Date:** 2026-03-11
**Points:** 3
**Focus:** Add IP-based rate limiting to the claim verification endpoint — resolving Audit #105/#110 M1 finding

## Mission

The claim verification endpoint (`POST /api/businesses/claims/:claimId/verify`) had a 5-attempt lockout but no IP-based rate limiting. With 6 digits and 5 attempts, the lockout is effective per-claim, but without IP throttling, an attacker could attempt codes across multiple claims. This sprint adds express-rate-limit middleware (5 req/min per IP) as defense in depth.

## Team Discussion

**Nadia Kaur (Cybersecurity):** "This has been carried forward for two audit cycles. The defense-in-depth approach: (1) 6-digit code = 1M combinations, (2) server-side 5-attempt lockout per claim, (3) now IP-based rate limiting at 5 req/min. Three layers of protection."

**Marcus Chen (CTO):** "Simple change, high security impact. One new rate limiter constant, one middleware addition. The existing rate-limiter infrastructure handles everything."

**Amir Patel (Architecture):** "We use the same pluggable-store pattern as the payment and auth rate limiters. In-memory by default, Redis-ready via REDIS_URL."

**Sarah Nakamura (Lead Eng):** "The rate limiter sits before auth middleware in the chain: rate-limit → auth → handler. This means unauthenticated requests are rate-limited too, which prevents auth-bypass attacks."

**Jordan Blake (Compliance):** "The 429 response includes a `retryAfter` field. Clear error messaging for legitimate users who hit the limit."

## Changes

### `server/rate-limiter.ts` (155 → 158 LOC)
- Added `claimVerifyRateLimiter` — 5 requests per minute per IP, prefix `claim-verify`

### `server/routes-businesses.ts` (347 → 348 LOC)
- Imported `claimVerifyRateLimiter` from rate-limiter
- Applied to `POST /api/businesses/claims/:claimId/verify` before `requireAuth`

## Security Layers (Defense in Depth)

| Layer | Protection | Enforcement |
|-------|-----------|-------------|
| 6-digit code | 1M combinations | Mathematical |
| 5-attempt lockout | Per-claim, server-enforced | Database |
| IP rate limiting | 5 req/min per IP | Middleware |
| Auth requirement | Only claiming member | Cookie session |
| 48-hour expiry | Code expires | Database |

## Health
- **Tests:** 11,696 pass (501 files)
- **Build:** 647.0kb (was 646.8kb — +0.2kb for import)
- **routes-businesses.ts:** 348 LOC (ceiling 360) — 97%
