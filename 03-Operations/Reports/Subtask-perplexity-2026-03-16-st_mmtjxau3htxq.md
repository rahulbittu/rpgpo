# Subtask Output — Research QUIC Protocol
## Model: sonar
## Stage: research
## Date: 2026-03-16

# QUIC Protocol: Connection Establishment, Features, and Performance

**QUIC is a modern transport layer protocol that runs over UDP and combines connection setup with encryption in a single round trip, reducing latency compared to traditional TCP/TLS connections.**[1][6]

## Connection Establishment

QUIC dramatically reduces connection setup overhead through two mechanisms:

**Standard Connection (1-RTT):** The browser and server exchange messages for both connection setup and encryption in a single round trip, after which encrypted data can flow.[1] This contrasts with TCP, which requires a separate handshake followed by a TLS encryption setup—two distinct exchanges that add noticeable delay on slower or long-distance networks.[1]

**Zero Round-Trip Time (0-RTT):** If the browser has previously connected to the server and retains valid session information, QUIC can send encrypted data in its very first message, skipping the handshake entirely.[1] However, 0-RTT has a security tradeoff: because data is sent before the connection is fully confirmed, an attacker who records the message could attempt to resend it. For this reason, 0-RTT is typically limited to safe-to-repeat requests, such as loading a previously visited page.[1]

**Performance Comparison:** Across HTTP versions, QUIC's setup phase uses a single QUIC handshake (1-RTT or 0-RTT), while HTTP/1.1 requires a TCP handshake once per connection, and HTTP/2 requires both TCP and TLS handshakes once.[5] This reduction in round trips significantly decreases initial latency, especially on high-latency or mobile networks.[6]

## Stream Multiplexing

QUIC supports multiplexed streams, allowing multiple data streams to be sent simultaneously over a single connection.[5] This capability enables efficient use of bandwidth and reduces head-of-line blocking issues present in earlier HTTP versions.

## Network Migration (Connection Migration)

**Key Distinction:** TCP connections are identified by IP addresses and port numbers; if either changes, the connection breaks.[1] This is particularly problematic on mobile devices, where switching from Wi-Fi to cellular or moving between networks can change a device's IP address, causing active connections to drop and restart.[1]

**QUIC Solution:** QUIC identifies connections using a unique **connection ID** rather than relying on IP addresses and port numbers.[1] When a network changes, the browser continues the same connection using that ID, and the server resumes where it left off.[1] This connection migration is handled transparently—when a client's IP address changes (e.g., switching from Wi-Fi to cellular), the QUIC connection survives because it is identified by a connection ID rather than the IP/port tuple.[7]

## Multipath Extension

QUIC includes a multipath extension that enables simultaneous usage of multiple paths for a single connection.[3][4] To open a new path, an endpoint must use a new connection ID associated with an unused path ID.[4] Path validation occurs through PATH_CHALLENGE and PATH_RESPONSE frames, with the client validating the peer's address before sending data on a new path.[4]

## Protocol Implementation

QUIC uses the same port number as HTTPS (port 443) but operates over UDP instead of TCP.[7] Servers handle both HTTPS (TCP) and HTTP/3 (QUIC) traffic on the same gateway resource, with protocol negotiation determined through ALPN (Application-Layer Protocol Negotiation).[7]

Source: [1] https://www.expressvpn.com/blog/what-is-quic-protocol/
Source: [3] https://quicwg.org/multipath/draft-ietf-quic-multipath.html
Source: [4] https://datatracker.ietf.org/doc/draft-ietf-quic-multipath/
Source: [5] https://http.dev/http-connection
Source: [6] https://www.ninjaone.com/blog/what-the-quic-protocol-does-in-modern-network-traffic/
Source: [7] https://oneuptime.com/blog/post/2026-02-24-how-to-configure-istio-for-http-3-quic-traffic/view

**Note:** The provided search results do not contain specific details on QUIC's loss recovery and congestion control mechanisms. These are critical QUIC features, but detailed technical specifications on these topics were not included in the available sources.
