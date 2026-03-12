# WebSocket vs SSE Evaluation — Sprint 114

**Date**: 2026-03-08
**Author**: Amir Patel (Architecture)
**Status**: DEFERRED — SSE sufficient at current scale

---

## Current State

TopRanker uses Server-Sent Events (SSE) for real-time updates:
- **File**: server/sse.ts
- **Events**: ranking_updated, rating_submitted, challenger_updated, business_updated, featured_updated
- **Limits**: 5 connections/IP, 30-minute auto-timeout
- **Client**: useRealtimeEvents() hook in app/_layout.tsx

## SSE Advantages (Current)
- Simpler implementation — HTTP/1.1 compatible, no upgrade handshake
- Automatic reconnection built into EventSource API
- Works through most proxies and CDNs without configuration
- Unidirectional (server→client) matches our use case
- No additional dependencies required

## WebSocket Advantages (Future)
- Bidirectional — enables real-time chat, live voting, typing indicators
- Lower per-message overhead (no HTTP headers per event)
- Better for high-frequency updates (>1 event/second)
- Connection multiplexing for multiple event streams

## Decision Matrix

| Factor | SSE | WebSocket | Winner |
|--------|-----|-----------|--------|
| Implementation complexity | Low | Medium | SSE |
| Server resource usage | Low | Medium | SSE |
| Proxy/CDN compatibility | High | Medium | SSE |
| Bidirectional support | No | Yes | WebSocket |
| High-frequency events | Adequate | Better | WebSocket |
| Browser support | Universal | Universal | Tie |
| Current scale fit | Yes | Overkill | SSE |

## Recommendation

**Keep SSE until one of these triggers:**
1. Active concurrent connections exceed 10,000
2. Product requires bidirectional features (chat, live voting feedback)
3. Event frequency exceeds 1 event/second sustained

**Migration path when needed:**
1. Install ws package
2. Create WebSocket server alongside Express
3. Migrate broadcast() to ws.send()
4. Update client to use WebSocket API instead of EventSource
5. Estimated effort: 2-3 story points

## Next Review
Sprint 120 or when trigger conditions are met.
