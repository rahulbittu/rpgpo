# Subtask Output — Research DNS Resolution Process
## Model: sonar
## Stage: research
## Date: 2026-03-15

## DNS End-to-End Resolution Process

DNS resolution converts domain names like **api.example.com** to IP addresses like **203.0.113.10** through a hierarchical query chain starting from a stub resolver on the client device.[1]

- **Stub Resolver**: Application calls `getaddrinfo("api.example.com")`, stub checks `/etc/hosts` and OS DNS cache; if miss, forwards recursive query to recursive resolver for **api.example.com A** record.[1]
- **Recursive Resolver**: Performs full lookup if not cached. Queries **root name server** ("Who handles .com?"), receives referral to **.com TLD servers**; then queries TLD ("Who handles example.com?"), gets referral to **ns1.example.com**; finally queries **authoritative NS** for A record with **TTL 300** seconds, caches and returns **203.0.113.10** to stub.[1]
- Query types: **Recursive** (resolver handles all steps), **iterative** (partial referrals), **non-recursive** (cached hit).[4]

## Caching Mechanics

Caching reduces latency and upstream queries; records include **TTL** dictating cache lifetime (e.g., low TTL like 300s increases lookups, high TTL like days speeds repeats but delays updates).[1][4]

- OS/local cache checked first, then recursive resolver caches responses.[1]
- Proper caching yields faster load times for repeat visits and enables **DNS load balancing** across servers via multiple A records.[4]
- Primary/secondary DNS servers: Primary holds original records, secondary replicates for redundancy.[4]

## DNSSEC Validation

**DNSSEC** (DNS Security Extensions) cryptographically signs zones to prevent spoofing, cache poisoning, or hijacks by validating response integrity via chain of trust.[1][5][6]

- Validation commands: `dig +dnssec example.com` checks signatures; `dig +trace +dnssec example.com` traces chain.[1]
- Resolver verifies signatures; failure (e.g., domain hijack) blocks resolution to protect users.[5]
- **Negative Trust Anchors (NTAs)**: Temporary resolver exceptions for config issues (not attacks), e.g., Quad9 limits NTAs to reduce scope, aiming for elimination as DNSSEC adoption grows like HTTPS.[5]
- Related records: **CAA** restricts certificate authorities (`dig example.com CAA +short`); email auth via **SPF/DKIM/DMARC** TXT records.[1]

## Real-World Examples and Recent Data (2026)

- **IPv6 DNS Trends**: RFC 3901bis (nearing publication early 2026) mandates ≥2 dual-stack nameservers per zone for IPv6 reachability, shifting from 2004 RFC 3901's IPv4 focus.[2][3]
- **Glueless Delegation Test**: Resolver queries non-existent name in delegated zone (e.g., a.example.com), gets referral to ns1.some.other.zone without glue; resolves NS IPv6 (2001:db8::2) separately to test IPv6 capability.[2][3]
- **Microsoft DoH Preview**: February 2026 Windows Server DNS supports **DNS over HTTPS** for encrypted queries.[7]

## Finding 1: DNS Fundamentals Sequence (Feb 20, 2026)
Detailed Mermaid diagram of resolution from app to authoritative server, emphasizing cache checks and TTL.  
**Source**: https://oneuptime.com/blog/post/2026-02-20-dns-fundamentals-devops/view[1]

## Finding 2: DNS IPv6 Guidelines Update (Feb 2026)
Geoff Huston analyzes RFC 3901bis push for dual-stack NS, using glueless delegation for IPv6 measurement.  
**Source**: https://www.potaroo.net/ispcol/2026-02/v6dns.html[2]

## Finding 3: APNIC DNS IPv6 Measurement (Mar 2, 2026)
Explains referral/glue in iterative queries, glueless tests for IPv6.  
**Source**: https://blog.apnic.net/2026/03/02/measuring-the-use-of-dns-over-ipv6/[3]

## Finding 4: Quad9 DNSSEC Policy (Recent, no exact date)
Details NTAs as workarounds, policy to minimize for security.  
**Source**: https://quad9.net/news/blog/dnssec-ntas-no-good-compromises/[5]
