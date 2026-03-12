# Sprint 802 — SSE Connection Tracking in Health Endpoint

**Date:** 2026-03-12
**Theme:** Wire SSE client count into /api/health for connection monitoring
**Story Points:** 1 (observability)

---

## Mission Alignment

- **Observability:** SSE connections are a resource that can leak or spike unexpectedly
- **Incident response:** Knowing active SSE clients helps diagnose "too many connections" issues

---

## Problem

The SSE module (`server/sse.ts`) already exported `getClientCount()` for counting active connections, but it wasn't surfaced in the health endpoint. Operators had no way to see how many real-time connections were active without reading internal state.

## Fix

1. Added `getClientCount` to the import from `./sse` in routes.ts
2. Added `sseClients: getClientCount()` to `/api/health` response

One line of code, one line of JSON output. The health endpoint now covers memory, push, logs, and SSE.

---

## Team Discussion

**Amir Patel (Architecture):** "The health endpoint is now a complete server dashboard in a single GET request. Memory, push tokens, error counts, and now SSE connections."

**Sarah Nakamura (Lead Eng):** "routes.ts is at 413/420 LOC. One more addition and we'll need to extract the health routes. For now, we're fine."

**Derek Okonkwo (Mobile):** "SSE is the mechanism for real-time ranking updates on the client. Knowing the active count helps us understand how many users are actively viewing rankings."

**Nadia Kaur (Cybersecurity):** "We cap SSE at 5 connections per IP (Sprint 776). The sseClients count in health helps us verify the cap is working — if it spikes above expected levels, something is wrong."

---

## Changes

| File | Change |
|------|--------|
| `server/routes.ts` | Added `sseClients: getClientCount()` to /api/health |
| `__tests__/sprint802-sse-health.test.ts` | 7 tests |

---

## Tests

- **New:** 7 tests in `__tests__/sprint802-sse-health.test.ts`
- **Total:** 13,452 tests across 603 files — all passing
- **Build:** 669.2kb (max 750kb)
