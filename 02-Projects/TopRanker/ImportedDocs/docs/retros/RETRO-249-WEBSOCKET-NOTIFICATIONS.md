# Retrospective — Sprint 249

**Date**: 2026-03-09
**Duration**: 1 session
**Story Points**: 11
**Facilitator**: Sarah Nakamura

---

## What Went Well

**Sarah Nakamura**: "The dual-index map pattern made the API surface clean and fast. Every
function is O(1) or O(n) where n is the member's connection count, not the total connection
count. The test suite exercises every export with edge cases — 36 tests, zero flakiness risk
because there are no timers or async dependencies in the manager itself."

**Amir Patel**: "Keeping the message log in-memory with a hard cap was the right call. We
avoided scope creep into persistent queues or Redis. The WSMessage type union matches our
existing SSE events, so when we wire up actual WebSocket upgrade handlers, the protocol
layer is already defined."

**Marcus Chen**: "Good separation — the manager is pure logic with no Express dependency,
and the admin routes are a thin HTTP layer on top. This means we can unit test the manager
without spinning up a server, and the routes are trivial to audit."

---

## What Could Improve

- **No auth middleware on admin WS routes** — currently unprotected, must add requireAuth
  + admin role check before production deployment
- **No actual WebSocket upgrade handler yet** — this sprint is the data layer only; the
  HTTP upgrade and client handshake are Sprint 250+ work
- **Message log has no filtering** — getRecentMessages only supports limit, not type
  filtering; admins may want to filter by notification vs system messages

---

## Action Items

| Action | Owner | Sprint |
|--------|-------|--------|
| Add requireAuth + admin role to WS admin routes | Nadia Kaur | 250 |
| WebSocket upgrade handler on HTTP server | Amir Patel | 250 |
| Client-side useWebSocket hook (React Native) | Sarah Nakamura | 251 |
| Message type filtering for getRecentMessages | Cole Anderson | 251 |

---

## Team Morale: 8/10

Clean infrastructure sprint with no blockers. The team is energized about having a real-time
foundation in place. The main concern is ensuring auth gating happens before any production
traffic hits these endpoints — Nadia has it flagged as P0 for Sprint 250.
