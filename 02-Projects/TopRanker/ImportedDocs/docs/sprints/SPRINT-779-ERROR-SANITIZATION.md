# Sprint 779 — Production Error Sanitization

**Date:** 2026-03-12
**Theme:** Prevent leaking internal error details to API clients
**Story Points:** 1 (security hardening)

---

## Mission Alignment

- **Security:** OWASP Top 10 — information disclosure through error messages
- **TestFlight readiness:** Production errors should not expose stack traces or internal messages

---

## Problem

Both `wrapAsync` (route handler wrapper) and the global Express error handler returned `err.message` directly to clients. In production, this could leak:
- Database column names ("column xyz does not exist")
- File paths ("/Users/rahulpitta/topranker/server/...")
- Internal service names ("Redis connection failed to turntable.proxy.rlwy.net")

## Fix

Both handlers now check `NODE_ENV === "production"`:
- 5xx errors → generic "Internal Server Error" (full error still logged server-side)
- 4xx errors → keep original message (users need to know what went wrong: "Not Found", "Unauthorized", etc.)

---

## Team Discussion

**Nadia Kaur (Cybersecurity):** "This is a basic but critical fix. Error messages are one of the easiest information disclosure vectors. An attacker can map your database schema just by triggering errors."

**Sarah Nakamura (Lead Eng):** "Good that we kept 4xx messages visible — 'Unauthorized' and 'Business not found' are useful for client-side error handling."

**Amir Patel (Architecture):** "The server-side logging is still full-fidelity. We just stopped broadcasting it to the client."

**Marcus Chen (CTO):** "Every OWASP item we close before launch is one less thing for a security audit to flag."

---

## Changes

| File | Change |
|------|--------|
| `server/wrap-async.ts` | Production: generic 500 message, dev: full error |
| `server/index.ts` | Global handler: sanitize 5xx, pass 4xx |
| `__tests__/sprint779-error-sanitization.test.ts` | 8 tests |

---

## Tests

- **New:** 8 tests in `__tests__/sprint779-error-sanitization.test.ts`
- **Total:** 13,272 tests across 585 files — all passing
- **Build:** 666.0kb (max 750kb)
