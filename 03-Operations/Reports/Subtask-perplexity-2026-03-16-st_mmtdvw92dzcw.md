# Subtask Output — Research WebSocket Best Practices
## Model: sonar
## Stage: audit
## Date: 2026-03-16

I'll search for current best practices on WebSocket implementation with your specific focus areas.

## Finding 1: WebSocket Connection Lifecycle Management

**Key Details:**
WebSocket connections follow a **five-stage lifecycle**: Connecting (HTTP upgrade request with authentication), Open (101 Switching Protocols response), Active (bidirectional message exchange with flow control), Closing (graceful shutdown via close frame), and Closed (TCP termination and resource cleanup)[1]. State management is identified as "one of the hardest parts of WebSocket systems" because each connection carries user-specific state, subscriptions, and in-flight messages that must be replicated, externalized, or partitioned when scaling horizontally[1].

**Critical Implementation Detail:**
TCP keep-alives are essential for idle WebSocket connections that may silently die due to NAT timeouts or network issues. Without keep-alives, servers fail to detect dead connections for extended periods, wasting file descriptors and memory[1].

Source: https://piehost.com/websocket/performance-and-scalability

---

## Finding 2: Timeout Configuration and Idle Connection Handling

**Key Details:**
The biggest source of WebSocket problems in production systems is **timeout misconfiguration**[2]. Route timeouts should be set to `0s` (disabled) in VirtualService configurations to prevent premature connection termination[2]. Stream idle timeouts should also be set to `0s` to keep connections alive indefinitely, but this requires your application to handle its own connection cleanup—abandoned connections will never be cleaned up by the proxy otherwise[2].

**Load Balancing Consideration:**
WebSocket connections are stateful; once established, all messages must route to the same backend pod. Istio's default round-robin load balancing works correctly because each WebSocket connection is a single TCP connection bound to one upstream pod[2]. However, during rolling updates, connection draining requires WebSocket clients to reconnect to new pods[2].

Source: https://oneuptime.com/blog/post/2026-02-24-how-to-configure-istio-for-websocket-protocol/view (Published: February 24, 2026)

---

## Finding 3: Authentication and Connection Revocation

**Key Details:**
In API gateway implementations (Apigee), all policies execute until the HTTP 101 response is returned; after the handshake completes, no policies execute, but previously validated OAuth tokens remain honored[3]. WebSocket connections are closed when:
- The proxy receives a request without an API key or OAuth token
- The proxy receives a request with an expired or invalid token
- The WebSocket connection times out[3]

This means **token validation must occur before the handshake completes** to prevent unauthorized connections from establishing.

Source: https://docs.cloud.google.com/apigee/docs/api-platform/develop/websocket-config

---

## Finding 4: High-Availability Signaling and NAT Traversal

**Key Details:**
For real-time communication systems, maintaining **high-availability WebSocket connections** for signaling servers is critical for managing user presence at scale[6]. TURN servers are essential for NAT traversal—without a TURN server, approximately **20-30% of calls fail** due to firewalls or Symmetric NATs[6].

**Resource Lifecycle Management:**
Android lifecycle management is a common source of bugs in real-time communication apps. When users disconnect, hardware resources (camera, microphone) must be released immediately; failure to do so blocks other applications from functioning[6].

Source: https://androidengineers.substack.com/p/engineering-high-performance-real

---

## Gaps in Search Results

The search results do not contain specific information on:
- **Heartbeat/ping-pong protocols** with concrete timing recommendations (e.g., interval frequencies)
- **Reconnection with exponential backoff** implementation details or recommended backoff multipliers
- **Message ordering guarantees** and how to implement them
- **Redis pub/sub integration** for horizontal scaling with specific configuration examples or performance metrics

**Recommendation:** To get actionable data on these three areas, I would need to conduct additional targeted searches. Would you like me to search specifically for:
1. WebSocket heartbeat/ping-pong timing best practices?
2. Exponential backoff reconnection strategies with code examples?
3. Redis pub/sub patterns for WebSocket horizontal scaling?

This would allow me to provide the specific numbers, implementation patterns, and source URLs you need for these critical aspects.
