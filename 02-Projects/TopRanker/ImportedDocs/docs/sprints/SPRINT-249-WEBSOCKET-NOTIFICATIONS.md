# Sprint 249 — Real-Time WebSocket Notifications

**Date**: 2026-03-09
**Theme**: Real-Time Push Infrastructure
**Story Points**: 11
**Tests Added**: 36

---

## Mission Alignment

Real-time notifications are the backbone of a trust platform — when a rating is submitted,
a challenge is updated, or a system event occurs, users and admins need instant feedback.
This sprint builds the in-memory WebSocket connection manager and admin dashboard routes,
laying the foundation for push-based updates without polling.

---

## Team Discussion

**Marcus Chen (CTO)**: "WebSocket infrastructure is a multiplier for everything we build next.
Rating submissions, challenge outcomes, tier upgrades — all of these become instant with a
persistent connection layer. The in-memory manager is the right first step before we consider
Redis pub/sub for multi-instance scaling. We keep it simple and correct first."

**Sarah Nakamura (Lead Engineer)**: "The manager uses two maps — `connections` keyed by
connection ID, and `memberConnections` keyed by member ID pointing to a Set of connection
IDs. This dual-index pattern gives us O(1) lookup for both 'which connections does this
member have?' and 'which member owns this connection?' — critical for both broadcast and
cleanup. 36 tests cover static analysis, runtime behavior, admin routes, and integration wiring."

**Amir Patel (Architecture)**: "The message log is capped at 1000 entries with FIFO eviction.
This is intentionally simple — no persistence, no replay buffer. For v1 the log exists purely
for admin observability. If we need durable message queues, that's a Sprint 260+ concern
with proper storage backing. The `WSMessage` type union — notification, rating_update,
challenge_update, system — maps directly to our existing SSE event types, so migration
will be seamless."

**Nadia Kaur (Cybersecurity)**: "The admin broadcast endpoint validates message type strictly
and requires string input. No arbitrary payload injection — the system type is the only one
admins can broadcast. Member-targeted messages will require auth middleware in the next
iteration. The `clearConnections` function is admin-only and should be gated behind role
checks before production deployment. I've flagged this as a Sprint 250 action item."

**Cole Anderson (QA)**: "36 tests across four groups — static file analysis, runtime
behavior with beforeEach cleanup, admin route source verification, and integration wiring
checks. The runtime tests exercise every exported function including edge cases like
removing nonexistent connections, broadcasting to unknown members, and verifying message
ordering. Coverage is comprehensive for a foundation sprint."

---

## Changes

### WebSocket Connection Manager (`server/websocket-manager.ts`)
- In-memory connection registry with dual-index (connectionId + memberId)
- `registerConnection(memberId)` — creates connection with UUID, timestamps
- `removeConnection(connectionId)` — cleans up both maps, auto-removes empty member entries
- `getActiveConnections()` — returns all live connections
- `getMemberConnections(memberId)` — returns connections for a specific member
- `broadcastToMember(memberId, message)` — targeted push, returns connection count
- `broadcastToAll(message)` — system-wide push, returns total count
- `getConnectionStats()` — totalConnections, uniqueMembers, messagesSent
- `getRecentMessages(limit)` — FIFO message log, default 20
- `pingConnection(connectionId)` — heartbeat update
- `clearConnections()` — full reset for admin/testing
- MAX_MESSAGE_LOG capped at 1000 entries
- Structured logging via `log.tag("WebSocketManager")`

### Admin WebSocket Routes (`server/routes-admin-websocket.ts`)
- `GET /api/admin/websocket/connections` — list all active connections
- `GET /api/admin/websocket/stats` — connection/member/message counts
- `GET /api/admin/websocket/messages?limit=N` — recent message log
- `POST /api/admin/websocket/broadcast` — send system message to all connections

### Route Wiring (`server/routes.ts`)
- Imported and registered `registerAdminWebSocketRoutes`

### Tests (`tests/sprint249-websocket-notifications.test.ts`)
- 10 static analysis tests for websocket-manager.ts
- 16 runtime tests for all manager functions
- 6 static tests for admin route endpoints
- 4 integration tests for route wiring

---

## Files Changed

| File | Action |
|------|--------|
| `server/websocket-manager.ts` | Created |
| `server/routes-admin-websocket.ts` | Created |
| `server/routes.ts` | Modified (import + registration) |
| `tests/sprint249-websocket-notifications.test.ts` | Created |

---

## PRD Gap Impact

- Real-time notifications: Foundation layer complete (connection manager + admin routes)
- Next: WebSocket upgrade handler on HTTP server, client-side hook, auth gating
