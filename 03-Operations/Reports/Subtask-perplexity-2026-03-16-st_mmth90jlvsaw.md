# Subtask Output — Research TLS 1.3 and TLS 1.2 Handshakes
## Model: sonar
## Stage: research
## Date: 2026-03-16

# TLS 1.3 vs TLS 1.2: Handshake Architecture, Key Exchange, and Security

## Handshake Round Trips: The Fundamental Difference

**TLS 1.3 reduces handshake latency by 50% through a single round trip (1-RTT), compared to TLS 1.2's two round trips (2-RTT).**[1][2] In TLS 1.2, the client sends ClientHello, waits for ServerHello + certificate + key exchange parameters, then sends its key exchange material and Finished message, requiring two full network round trips before application data flows.[1] TLS 1.3 eliminates this delay by having the client **speculatively include key shares in the initial ClientHello message**, guessing which key exchange groups the server will accept and sending key material upfront.[1] This architectural change removes the negotiation phase entirely.

## ECDHE Key Exchange and Certificate Algorithm Performance

**ECDSA P-256 handshakes are approximately 10x faster than RSA 4096 handshakes.**[3] This performance difference becomes critical in large-scale deployments. For example, in Kubernetes clusters with >500 nodes, the cumulative cost of TLS handshakes during mass reconnection events can cause CPU throttling if RSA certificates are used.[3] Organizations migrating from RSA to ECDSA must regenerate all certificates, as the algorithm choice cannot be rotated without full certificate regeneration.[3]

Both TLS 1.2 and TLS 1.3 support ECDHE (Elliptic Curve Diffie-Hellman Ephemeral), but TLS 1.3 makes ephemeral key exchange **mandatory** rather than optional.[1] In TLS 1.3, every connection mandates ephemeral key exchange and forward secrecy as structural requirements, whereas TLS 1.2 allowed static Diffie-Hellman and RSA key exchange as alternatives.[1]

## Cipher Suite Reduction and Simplification

TLS 1.3 represents a ground-up redesign that drastically reduced cipher suite complexity.[1][9] The cipher suite list shrank from **over 300 options in TLS 1.2 to exactly five in TLS 1.3.**[1][9] This reduction eliminated entire categories of weak algorithms: RSA key exchange was eliminated entirely, CBC mode was eliminated entirely, and static Diffie-Hellman was eliminated entirely.[1] The five TLS 1.3 cipher suites are:

- TLS_AES_128_GCM_SHA256
- TLS_AES_256_GCM_SHA384
- TLS_CHACHA20_POLY1305_SHA256
- TLS_AES_128_CCM_SHA256
- TLS_AES_128_CCM_8_SHA256

This constraint forces secure defaults: organizations cannot accidentally select weak ciphers because weak options no longer exist in the protocol specification.

## Certificate Verification and Handshake Transcript

In TLS 1.3, the server responds with its **selected cipher suite, selected key share (ephemeral public key), Encrypted Extensions, Certificate chain, CertificateVerify (signature over handshake transcript), and Finished (HMAC over entire handshake transcript).**[1] The CertificateVerify message is cryptographically bound to the entire handshake transcript, preventing tampering with any prior messages. This differs from TLS 1.2, where certificate verification was less tightly integrated with the handshake state.

TLS 1.3 also encrypts most of the handshake itself, improving privacy by hiding the certificate and extensions from passive observers.[5] In TLS 1.2, the certificate and many handshake parameters were sent in cleartext.

## 0-RTT Resumption and Session Resumption

The search results provided do not contain specific technical details about 0-RTT (zero round trip time) resumption mechanisms, pre-shared keys (PSK), or session ticket handling. However, the results confirm that TLS 1.3 supports pre-shared key negotiation as an alternative to full handshakes.[2] The search results indicate that "if the client and server are not using pre-shared keys," the client sends an encrypted message to compute the shared secret key, implying that PSK-based resumption is available but not detailed in these sources.

## Common Misconfiguration Vulnerabilities

**Modern security standards mandate exclusive use of TLS 1.2 or TLS 1.3; organizations should disable insecure protocols including SSL, TLS 1.0, and TLS 1.1.**[5] The recommended baseline is TLS 1.3 because it removes legacy vulnerabilities and provides perfect forward secrecy.[5]

One critical misconfiguration involves cipher suite preference negotiation. The "prefer server cipher" bit in the ServerHello message determines whether the negotiated cipher suite is preferred from the server's list or the client's list.[2] Misconfiguring this preference can allow clients to force weaker cipher selections if the server's preference is not enforced.

Another vulnerability class involves TLS fingerprinting and bot detection. Modern browsers support at least TLS 1.2 and TLS 1.3, but "very old versions or unusual patterns can indicate legacy stacks or customized TLS implementations (bots, scrapers)."[6] Browsers like Chrome use GREASE (Generate Random Extensions And Sustain Extensibility) to advertise "garbage" values in certain TLS fields, ensuring servers handle unknown values correctly.[6] If a client presents GREASE patterns that don't match its claimed browser engine, that is a red flag for bot activity or man-in-the-middle attacks.

## Current Adoption and Market Position

As of early 2026, **TLS 1.3 handles approximately 95% of encrypted web traffic according to Cloudflare's radar data, up from 50% at its standardization in August 2018.**[1] This near-universal adoption reflects the protocol's maturity and the industry's migration away from TLS 1.2.

**TLS 1.3 is considered the most efficient and secure handshake protocol for most software and hardware communications globally.**[4] The protocol's streamlined design, mandatory forward secrecy, and elimination of legacy attack vectors make it the current security standard for new deployments.
