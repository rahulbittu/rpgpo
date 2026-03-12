# Sprint 733 — Rate Limiting + Abuse Prevention Hardening

**Date:** 2026-03-11
**Theme:** Beta Security — Write Endpoint Protection
**Story Points:** 2

---

## Mission Alignment

Before public beta, every write endpoint needs protection against abuse. The global `apiRateLimiter` (100 req/min) is too permissive for sensitive operations like rating submission, feedback, and photo uploads. This sprint adds dedicated per-endpoint rate limiters with appropriate thresholds.

---

## Team Discussion

**Nadia Kaur (Cybersecurity):** "Rate limiting is placed BEFORE authentication middleware. This means even unauthenticated requests hit the rate limit first — no wasting auth resources on spam. The order matters: rate limit → auth → handler."

**Sarah Nakamura (Lead Eng):** "Three new limiters: ratingRateLimiter (10/min), feedbackRateLimiter (5/min), uploadRateLimiter (10/min). These are generous for real users but strict enough to prevent automated abuse."

**Amir Patel (Architecture):** "The existing rate-limiter architecture made this easy — just create new instances with different configs. Each uses a unique keyPrefix so counters don't overlap. Redis-backed in production, in-memory for dev."

**Derek Liu (Mobile):** "The client already handles 429 responses gracefully through the retry logic in query-client.ts — shouldRetry returns false for 4xx errors, so rate-limited requests won't retry endlessly."

**Marcus Chen (CTO):** "With dedicated rate limits on ratings (10/min), payments (20/min), auth (10/min), claims (5/min), and now feedback (5/min) and uploads (10/min), every write path is protected. This is production-grade security for a beta app."

---

## Changes

| File | Change |
|------|--------|
| `server/rate-limiter.ts` | Added ratingRateLimiter (10/min), feedbackRateLimiter (5/min), uploadRateLimiter (10/min) |
| `server/routes-ratings.ts` | Wired ratingRateLimiter before requireAuth on POST /api/ratings |
| `server/routes.ts` | Wired feedbackRateLimiter before requireAuth on POST /api/feedback |
| `server/routes-rating-photos.ts` | Wired uploadRateLimiter before requireAuth on POST /api/ratings/:id/photo |
| `tests/sprint211-beta-feedback.test.ts` | Updated auth test to account for rate limiter middleware insertion |
| `__tests__/sprint733-rate-limiting-hardening.test.ts` | 22 tests: limiters (7), wiring (6), existing (4), headers (4), loader (1) |

---

## Health Metrics

| Metric | Value |
|--------|-------|
| Build size | 662.7kb / 750kb (88.4%) |
| Tests | 12,643 pass / 543 files |

---

## What's Next (Sprint 734)

Offline mode graceful degradation — cached data display when network is unavailable.
