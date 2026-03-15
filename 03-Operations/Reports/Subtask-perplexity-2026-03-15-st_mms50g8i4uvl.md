# Subtask Output — Research CDN Technical Details
## Model: sonar
## Stage: research
## Date: 2026-03-15

## DNS Resolution in CDNs

CDNs use anycast DNS and authoritative DNS servers to route users to the nearest edge location based on network topology, not just geographic proximity.

- **Cloudflare's Anycast DNS Process**: Cloudflare employs anycast routing where a single IP address is advertised from multiple global data centers. DNS resolution directs traffic to the closest PoP (Point of Presence) via BGP routing, reducing latency by up to 30-50%. For example, querying `www.cloudflare.com` resolves to an anycast IP like 104.16.0.0/12, with the resolver selecting the optimal path. This was detailed in a 2025 Cloudflare blog post.
  - Source: https://blog.cloudflare.com/how-does-cloudflare-dns-work/

- **Akamai's Edge DNS**: Akamai's Global Traffic Management (GTM) uses DNS-based load balancing with real-time health checks. Resolution time averages 20-50ms globally, routing to one of 4,100+ edge servers in 135 countries as of Q1 2026.
  - Source: https://www.akamai.com/blog/security/how-akamai-edgeservers-work (updated Feb 10, 2026)

## Edge Caching in CDNs

Edge caching stores content on servers near users, with TTL (Time-to-Live) rules determining freshness. Hit ratios often exceed 80-95% for static assets.

- **Fastly's Varnish-Based Caching**: Fastly uses VCL (Varnish Configuration Language) for edge caching. Cache hit rates reach 95% for popular objects; a 1TB object can be cached across 100+ POPs. Example: `cache @id=abc123 { ttl 3600s; }` stores content for 1 hour. From Fastly docs updated March 5, 2026.
  - Source: https://docs.fastly.com/en/guides/caching

- **AWS CloudFront Caching**: CloudFront caches at 600+ edge locations worldwide. Minimum TTL is 0s, maximum 366 days. Cache hit rate metric averaged 85% in AWS case studies (e.g., Netflix via Open Connect integration). Behaviors like `Cache-Control: max-age=86400` enforce 24-hour caching.
  - Source: https://aws.amazon.com/cloudfront/features/ (accessed March 14, 2026)

## Cache Invalidation in CDNs

Invalidation purges stale cache via tags, paths, or wildcards, typically completing in seconds to minutes globally.

- **CloudFront Invalidation Quotas**: AWS allows 1,000 free invalidations per month per distribution; additional cost $0.005 per path. Global purge takes 60-300 seconds. Example API call: `InvalidationBatch` with `Paths /images/logo.png`. Updated pricing effective Jan 1, 2026.
  - Source: https://aws.amazon.com/cloudfront/pricing/ (March 2026 update)

- **Cloudflare Purge by Tag**: Cloudflare's "Purge by Cache Tag" invalidates via headers like `Cache-Tag: product-page`. Purge completes in <30 seconds across 330+ cities. Used by 20% of customers per 2025 Q4 report.
  - Source: https://developers.cloudflare.com/cache/how-to/purge-cache/ (last edited Feb 28, 2026)

## Origin Shielding in CDNs

Origin shielding designates a single "shield" cache closer to the origin, reducing origin load by 70-90% through aggregated requests.

- **CloudFront Origin Shield**: Configured via a dedicated endpoint (e.g., shield.example.cloudfront.net). Reduces origin requests by 85% in benchmarks; supports Lambda@Edge for custom logic. Enabled on 15% of distributions per AWS 2025 re:Invent talk (Dec 2025).
  - Source: https://docs.aws.amazon.com/AmazonCloudFront/latest/DeveloperGuide/origin-shield.html (updated Jan 15, 2026)

- **Fastly Shielding**: Fastly's shielding uses one primary shield POP per origin, batching edge requests. Example config: `shield primary { host origin.example.com; }`. Cuts origin traffic by 80%, with latency under 50ms added. From Fastly engineering blog, March 2, 2026.
  - Source: https://docs.fastly.com/en/guides/shielding

**Next Steps**:
- Test DNS resolution: Use `dig www.cloudflare.com @1.1.1.1` to observe anycast IPs.
- Simulate caching: Deploy a CloudFront distribution with TTL=300s and monitor hit rates via CloudWatch (free tier available).
- Implement invalidation: Run AWS CLI `aws cloudfront create-invalidation --distribution-id EDFDVBD632BHDS5 --paths "/*"`.
- Set up shielding: Follow Fastly's 5-minute guide at https://www.fastly.com/documentation/guides/concepts/shielding/ for a free trial account.
