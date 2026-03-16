# Subtask Output — Research DNS Resolution and Security
## Model: sonar
## Stage: research
## Date: 2026-03-16

# DNS Resolution: Current State, Security, and Attack Vectors (March 2026)

## Finding 1: DNS Market Size and Resolver Performance Leaders

The global DNS services market reached **$5.97 billion in 2024** and is projected to grow at **16.35% annually through 2033**[2]. **Cloudflare DNS** dominates resolver performance, with its 1.1.1.1 resolver averaging **6.95 ms response time** across European endpoints in 2025, significantly faster than Google DNS (8.8.8.8) at **11.21 ms** and Quad9 (9.9.9.9) at **12.72 ms**[2]. Cloudflare processes **4.3 trillion DNS queries per day** and covers **20.4% of all websites globally**[2].

Source: https://commandlinux.com/statistics/dns-server-market-share-bind-usage-statistics-on-linux/

## Finding 2: IPv6 DNS Resolution Adoption and Measurement Challenges

**75% of users demonstrate capability to resolve DNS queries over IPv6**, according to measurements taken at authoritative servers[1]. However, initial web-based measurements showed only **50% to 65% of users** could resolve DNS names requiring IPv6, revealing a significant gap between measurement methodologies[1][3]. The discrepancy exists because in **4% of cases**, web measurements show IPv6 support while DNS does not, while in **26% of cases**, DNS measurements show support that web tests miss[1]. The DNS-only measurement proves more robust, though **3% of total users** experience blocking in networks lacking glue records (predominantly in North Africa)[1][3].

Source: https://blog.apnic.net/2026/03/02/measuring-the-use-of-dns-over-ipv6/
Source: https://www.potaroo.net/ispcol/2026-02/v6dns.html

## Finding 3: DNS Query Inefficiency and Repeat Rates

Measurements at authoritative servers reveal that **25% to 30% of individual DNS queries get repeated within the DNS resolution process**[1][3]. This over-querying occurs because DNS queries lack hop count metadata, forwarding history, or time-to-live mechanisms to detect and remove aged queries, causing the system to err toward excessive query generation[1].

Source: https://blog.apnic.net/2026/03/02/measuring-the-use-of-dns-over-ipv6/

## Finding 4: DDoS and Cache Poisoning Threats in DNS Infrastructure

**DDoS protection accounts for over 36% of managed DNS service revenue**, driven by **350 DNS-layer attacks in a single month** targeting financial institutions[2]. This indicates cache poisoning and DNS amplification attacks remain significant threats to DNS infrastructure. Cloud deployments held **59–61% of managed DNS revenue in 2024**, while hybrid setups are growing fastest at **19.83% CAGR**, reflecting increased investment in distributed DNS security[2].

Source: https://commandlinux.com/statistics/dns-server-market-share-bind-usage-statistics-on-linux/

## Finding 5: DNSSEC and Email Authentication Adoption Gaps

**70.9% of domains worldwide have no effective DMARC protection** as of March 2026, with only **10.7% having full protection with a reject policy at 100% enforcement**[4]. This represents a critical vulnerability to domain hijacking and email spoofing attacks. DMARC strict policy adoption increased by **+1.3% over 6 months**, indicating slow progress in email authentication security[4].

Source: https://dmarcdkim.com/dmarc-adoption

## Finding 6: AWS Route 53 Global Resolver IPv6 Support

**Amazon Route 53 Global Resolver became generally available on March 9, 2026**, deployed across **30 AWS Regions** with support for both **IPv4 and IPv6 DNS query traffic**[6]. This represents a major infrastructure advancement for authoritative nameserver capabilities, previously previewed at re:Invent 2025 in 11 regions[6].

Source: https://aws.amazon.com/about-aws/whats-new/2026/03/amazon-route-53-global-resolver/

## Finding 7: Nameserver Migration Activity and Cloudflare Dominance

Recent nameserver movements (March 14, 2026) show **Cloudflare** as a major destination for domain migrations, with **4,573 domains moving from Cloudflare to DNSOWL.COM** and **3,196 moving from Cloudflare to DYNA-NS.NET**[7]. **GoDaddy DNS** controls **32.84% market share** by company count, tracking over **3 million customers** as of 2026[2].

Source: https://dailychanges.domaintools.com/top-movements/

---

**Critical Gap in Search Results:** The provided search results do not contain specific information about DNS over HTTPS/TLS (DoH/DoT) adoption rates, DNSSEC validation statistics, or detailed technical analysis of cache poisoning and DNS amplification attack vectors. To provide complete coverage of these topics, additional targeted searches would be required.
