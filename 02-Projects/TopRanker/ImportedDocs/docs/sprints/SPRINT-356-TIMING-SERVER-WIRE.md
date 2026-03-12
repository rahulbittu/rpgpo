# Sprint 356: Wire Client Timing to Server POST Endpoint

**Date:** March 9, 2026
**Story Points:** 2
**Focus:** Connect client-side dimension timing to the server POST endpoint created in Sprint 354

## Mission
Sprint 343 added client-side dimension timing via Analytics.track(). Sprint 354 created the server endpoint. Sprint 356 connects them — when a user submits a rating, the per-dimension timing data is now sent to both Analytics (for event tracking) and the server (for admin aggregation).

## Team Discussion

**Sarah Nakamura (Lead Eng):** "One line of real change: `apiRequest('POST', '/api/analytics/dimension-timing', timingPayload).catch(() => {})`. The catch silently swallows failures because timing is non-critical — a failed timing report should never break the rating submission."

**Amir Patel (Architecture):** "By extracting the timing payload into a const, we share the same object between Analytics.track and apiRequest. DRY and guaranteed identical data in both channels."

**Nadia Kaur (Cybersecurity):** "The server endpoint requires authentication, and the timing data is already validated server-side with Math.max(0, Math.round()). The fire-and-forget pattern (.catch(() => {})) is correct for non-critical telemetry."

**Marcus Chen (CTO):** "This closes the timing data loop: Sprint 343 collected it, Sprint 354 stored it, Sprint 356 wires them together. Admin dashboard now receives real timing data."

## Changes

### `lib/hooks/useRatingSubmit.ts`
- Extracted timing fields into `timingPayload` const (shared between Analytics + server)
- Added `apiRequest("POST", "/api/analytics/dimension-timing", timingPayload).catch(() => {})` after Analytics.track
- Fire-and-forget pattern: non-blocking, silently catches errors

### `tests/sprint356-timing-server-wire.test.ts` (NEW — 14 tests)
- Client wiring (9 tests)
- Server endpoint exists (4 tests)
- Import dependencies (2 tests)

## Test Results
- **269 test files, 6,550 tests, all passing** (~3.5s)
- **Server build:** 596.3kb (unchanged — client-only change)
