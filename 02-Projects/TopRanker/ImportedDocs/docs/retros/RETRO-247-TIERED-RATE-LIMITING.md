# Retrospective — Sprint 247

**Date**: 2026-03-09
**Duration**: 1 session
**Story Points**: 8
**Facilitator**: Sarah Nakamura

---

## What Went Well

**Marcus Chen**: "The tiered rate limiter follows our established module pattern perfectly — pure
computation with no DB coupling, thin HTTP routes, clean registration in routes.ts. The four-tier
model (free/pro/enterprise/admin) maps directly to our revenue tiers, which means the engineering
and business models are aligned from day one. No impedance mismatch when Rachel's team starts
pricing API access."

**Sarah Nakamura**: "34 tests in a single pass. The static/runtime/admin/integration test structure
is now a proven pattern — this is the third consecutive sprint using it (244, 246, 247). The
beforeEach + clearUsage pattern ensures complete test isolation. Every public function has at
least one test, and the critical path (minute limit enforcement) has explicit boundary testing
at exactly 31 requests."

**Nadia Kaur**: "Having rate limiting as a first-class module rather than middleware bolted on
after the fact is the right architecture. The separation of limit checking from HTTP enforcement
means we can reuse checkRateLimit in WebSocket handlers, background jobs, and SSE connections —
not just REST endpoints. The MAX_TRACKED cap prevents memory exhaustion from a flood of unique
API keys."

---

## What Could Improve

- **Burst limit not enforced** — The burstLimit field is defined in TierLimits but checkRateLimit
  does not enforce it. This is a gap between the data model and runtime behavior.
- **No rate limit HTTP headers** — Standard practice is to include X-RateLimit-Limit,
  X-RateLimit-Remaining, and X-RateLimit-Reset on every API response. Clients cannot self-throttle
  without these headers.
- **Admin routes still unauthenticated** — Fifth consecutive sprint with unprotected admin
  endpoints. The usage stats endpoint reveals API consumer patterns that should be admin-only.
- **Fixed-window approximation** — The current implementation uses fixed windows, not true sliding
  windows. Users can burst at window boundaries. Acceptable for now but should be documented as
  a known limitation.
- **No tier detection middleware** — checkRateLimit requires the caller to pass the tier. There's
  no middleware that reads the user's subscription tier from session/JWT and applies rate limiting
  automatically.

---

## Action Items

| Action | Owner | Sprint |
|--------|-------|--------|
| Enforce burstLimit in checkRateLimit | Sarah Nakamura | 248 |
| Add X-RateLimit-* response headers middleware | Cole Anderson | 248 |
| Tier detection middleware (session -> API tier) | Amir Patel | 248 |
| Systematic admin route authentication | Sarah Nakamura | 248 |
| Document fixed-window limitation in API docs | Jordan Blake | 248 |

---

## Team Morale

**8/10** — Clean, well-scoped sprint that delivers a foundational module for the Premium API
revenue stream. The team appreciates that the rate limiter was designed for testability and
extensibility rather than just "make it work." The recurring admin auth gap is becoming a
recurring retro item — the team wants it prioritized as a horizontal concern rather than
patched per-route.
