# Sprint 786 — Trust Proxy for Railway

**Date:** 2026-03-12
**Theme:** Enable Express trust proxy for correct client IP and protocol behind Railway's reverse proxy
**Story Points:** 1 (hardening)

---

## Mission Alignment

- **Production correctness:** Rate limiting, session cookies, and logging all depend on accurate client IP/protocol
- **Security:** Without trust proxy, all users share one proxy IP — rate limiting is ineffective

---

## Problem

Railway runs a reverse proxy in front of our Express server. Without `trust proxy`:

1. **Rate limiting broken:** `req.ip` returns Railway's internal proxy IP, not the client IP. All users appear as one IP → rate limiter either blocks everyone or no one.
2. **Secure cookies unreliable:** `req.protocol` returns `http` even for HTTPS connections. `secure: true` cookies may not be set correctly.
3. **Logging inaccurate:** Analytics and request logs record the proxy IP instead of the actual client IP.

Express-session already had `proxy: config.isProduction` set, but the Express app itself wasn't configured to trust the proxy headers.

## Fix

Added `app.set("trust proxy", 1)` in production, before all middleware. This tells Express to trust the first `X-Forwarded-*` headers from Railway's proxy.

---

## Team Discussion

**Nadia Kaur (Cybersecurity):** "This is a critical production fix. Rate limiting is only effective when it can identify individual clients. With everyone sharing one proxy IP, our authRateLimiter (10 req/min) would throttle all concurrent users together."

**Amir Patel (Architecture):** "Setting trust proxy to `1` (not `true`) is the correct approach — it trusts only the first proxy hop. Using `true` would trust any number of proxies, which could be spoofed."

**Derek Okonkwo (Mobile):** "This also fixes the session secure cookie issue. On Railway, without trust proxy, Express thinks the connection is HTTP, so `secure: true` cookies might not be set in the response."

**Sarah Nakamura (Lead Eng):** "Good that auth.ts already had `proxy: config.isProduction` — that's express-session's counterpart. Now the Express app and session config are consistent."

---

## Changes

| File | Change |
|------|--------|
| `server/index.ts` | Added `app.set("trust proxy", 1)` in production + imported config |
| `__tests__/sprint786-trust-proxy.test.ts` | 7 tests |

---

## Tests

- **New:** 7 tests in `__tests__/sprint786-trust-proxy.test.ts`
- **Total:** 13,323 tests across 591 files — all passing
- **Build:** 666.3kb (max 750kb)
