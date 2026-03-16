# Subtask Output — Research HTTP/3 and QUIC vs HTTP/2 over TCP
## Model: sonar
## Stage: research
## Date: 2026-03-16

# HTTP/3 with QUIC vs HTTP/2 over TCP: Technical Comparison

HTTP/3 fundamentally replaces TCP with **QUIC** (Quick UDP Internet Connections), a UDP-based transport protocol standardized by the IETF in June 2022 as RFC 9114[1], addressing critical performance limitations in HTTP/2's TCP-based architecture.

## Connection Establishment

**HTTP/2 (TCP + TLS 1.2):** Requires **3 round trips (RTTs)** before data flows—one for TCP handshake, two for TLS key exchange, and one for the HTTP request[1][4].

**HTTP/3 (QUIC):** Reduces this to **1 RTT** on first connections by combining the transport and encryption handshakes into a single round trip[2]. On resumed connections, QUIC supports **0-RTT resumption**, enabling application data to be sent in the very first packet, making subsequent connections "essentially instant"[2].

**Real-world impact:** A user in India accessing a US server with 200ms RTT saves **400ms** of latency by switching from TCP + TLS 1.2 (600ms total wait) to QUIC (200ms total wait)[4]—the difference between a "laggy" and "snappy" application.

## Stream Multiplexing Without Head-of-Line Blocking

**HTTP/2 limitation:** Multiplexes streams over a single TCP connection, but TCP guarantees in-order byte delivery. A single lost packet stalls all streams regardless of which stream the lost data belonged to[1].

**QUIC solution:** Implements **stream awareness at the transport layer**. Each stream is an independent, ordered byte sequence with its own offset tracking[1][4]. A lost packet affects only the streams containing that data; all other streams continue processing without delay[1][4].

**Practical difference:** In HTTP/2, if Stream A loses a packet, Stream B waits. In HTTP/3, Stream B delivers to the application even while Stream A waits for retransmission[4].

## Connection Migration

**TCP limitation:** Connections are tied to a specific IP address and port combination. Switching networks (Wi-Fi to mobile data, or moving between access points) changes the IP, forcing TCP connections to drop and restart from scratch[2].

**QUIC solution:** Identifies connections using a **connection ID** rather than IP address and port[2][3]. When the network changes, the connection migrates seamlessly—downloads continue, pages keep loading, and users experience no interruption[2]. This is particularly critical on mobile devices where network transitions happen constantly[2].

## Built-in Encryption

**TCP approach:** TLS was added as a separate layer decades after TCP's design, requiring additional handshake round trips and creating an unencrypted HTTP mode[2].

**QUIC approach:** Has **TLS 1.3 built directly into the protocol** with no unencrypted mode[2]. Every QUIC connection is encrypted by default, eliminating an entire class of downgrade attacks and simplifying the protocol stack[2].

## Performance Gains

HTTP/3 can be **more than three times faster than HTTP/1.1** in certain cases[3]. The largest performance gains occur on worst-case connections: mobile networks, satellite links, and congested networks where packet loss is common[1]. HTTP/3 "raises the performance floor" for these scenarios while maintaining unchanged HTTP semantics (methods, status codes, headers remain identical to HTTP/2 and HTTP/1.1)[1].

---

**Sources:**
- [1] https://http.dev/3
- [2] https://www.hostney.com/blog/learning-center/the-difference-between-http-protocols
- [3] https://www.coherentsolutions.com/insights/new-features-in-http-3-and-their-support-in-asp-net-core
- [4] https://www.youtube.com/watch?v=C8WaXjjcMk0
