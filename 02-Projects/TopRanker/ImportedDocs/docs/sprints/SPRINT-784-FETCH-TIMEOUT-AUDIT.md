# Sprint 784 — Complete Fetch Timeout Audit

**Date:** 2026-03-12
**Theme:** Add timeouts to remaining unprotected server fetch calls
**Story Points:** 1 (hardening)

---

## Mission Alignment

- **TestFlight readiness:** Any server fetch without a timeout is a potential connection-hanging vulnerability
- **Production resilience:** Completes the fetch timeout sweep started in Sprint 776 (client) and 783 (OAuth)

---

## Problem

After Sprint 783 added timeouts to OAuth fetches, 3 server fetch calls still had no timeout:

1. **`server/deploy.ts`** — ntfy.sh push notification (fire-and-forget, could hang a server thread)
2. **`server/email.ts`** — Resend API (retry loop, but each attempt could hang forever)
3. **`server/google-place-enrichment.ts`** — Legacy Places API search (enrichment pipeline, could stall)

## Fix

| File | Timeout | Rationale |
|------|---------|-----------|
| `server/deploy.ts` | 5s | Fire-and-forget notification — fast failure preferred |
| `server/email.ts` | 10s per attempt | Retry loop handles transient failures, each attempt bounded |
| `server/google-place-enrichment.ts` | 10s | Background enrichment, matches new Places API pattern |

Also added a `findUnprotectedFetch` test helper that scans server files for fetch calls missing `signal:`/`AbortSignal.timeout`, preventing regression.

---

## Team Discussion

**Nadia Kaur (Cybersecurity):** "This closes the last fetch timeout gaps. Every outbound HTTP call from our server now has a deadline. No more unbounded connections that could exhaust the connection pool."

**Derek Okonkwo (Mobile):** "The ntfy notification hanging wouldn't affect users directly, but it could block the deploy webhook response. 5s is generous for a push notification relay."

**Amir Patel (Architecture):** "The `findUnprotectedFetch` test helper is reusable — we should run it on every new server file. Good regression guard."

**Sarah Nakamura (Lead Eng):** "Complete fetch timeout coverage: Sprint 776 (client apiFetch), Sprint 783 (OAuth), Sprint 784 (deploy/email/enrichment). Done."

---

## Changes

| File | Change |
|------|--------|
| `server/deploy.ts` | Added `AbortSignal.timeout(5000)` to ntfy notification fetch |
| `server/email.ts` | Added `AbortSignal.timeout(10000)` to Resend API fetch |
| `server/google-place-enrichment.ts` | Added `AbortSignal.timeout(10000)` to legacy Places fetch |
| `__tests__/sprint784-fetch-timeout-audit.test.ts` | 12 tests + `findUnprotectedFetch` helper |

---

## Tests

- **New:** 12 tests in `__tests__/sprint784-fetch-timeout-audit.test.ts`
- **Total:** 13,309 tests across 589 files — all passing
- **Build:** 666.0kb (max 750kb)
