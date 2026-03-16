# Subtask Output — Research HTTP Caching
## Model: sonar
## Stage: research
## Date: 2026-03-16

# HTTP Caching: Current Best Practices and Strategies (2026)

## Cache-Control Headers and Directives

The **Cache-Control header** is the primary mechanism for controlling how browsers, CDNs, and proxies cache content[1]. Modern caching strategies hinge on understanding which directives work together:

- **max-age vs. s-maxage:** You can set different cache durations for browsers and CDNs. For example, `Cache-Control: max-age=60, s-maxage=600` tells browsers to cache for 60 seconds while CDNs cache for 10 minutes, reducing origin server load while keeping user content reasonably fresh[1].

- **public vs. private:** The `public` directive allows shared caches (CDNs, proxies) to store responses, while `private` restricts caching to the browser only. For authenticated pages, use `Cache-Control: private, no-store` to prevent CDN caching of user-specific data[3].

- **immutable:** This directive eliminates unnecessary conditional requests for assets guaranteed not to change. It's well-supported in modern browsers (Firefox first implemented it, followed by Chrome, Safari, and Edge), though the long `max-age` does most of the work[1].

- **stale-while-revalidate:** This newer technique allows serving stale content while revalidating in the background, balancing freshness with performance[3].

The fundamental principle: **Does the URL change when content changes?** If yes (hash-based filenames), cache aggressively with long `max-age` and `immutable`. If no (HTML, API responses), use shorter windows with revalidation[1].

## ETags and Conditional Requests

**ETags (entity tags)** are identifiers for specific resource versions[2]. When a browser requests a resource and it's stale, it sends the ETag via the `If-None-Match` header. If the resource hasn't changed, the server responds with `304 Not Modified`—typically just a few hundred bytes compared to potentially hundreds of kilobytes for a full response[1][3].

This creates significant bandwidth savings, especially for large resources like images or API responses, though the server still processes the request and computes the ETag[1]. To implement ETags effectively: include them in API responses and monitor whether clients are actually using them for conditional requests[2].

## CDN Edge Caching

**Content Delivery Networks** like Cloudflare and Akamai cache API responses at edge locations globally, serving content from locations physically closer to users and significantly reducing latency[2]. This approach works best for public, static, or slowly changing data.

Enterprise CDNs offer **API-based edge warming**—direct cache preloading at the edge—useful before product launches, seasonal campaigns, or sudden traffic events[4]. For example, you can preload critical pages (home, category, product, pricing, checkout) immediately after deployment to ensure low Time-to-First-Byte (TTFB) for high-value URLs[4].

## Cache Invalidation Strategies

Cache invalidation has evolved from blunt instruments to precision tools:

**Hash-Based Cache Busting:** When file content changes, the hash changes, producing a new URL. The old cached file doesn't get invalidated—it simply stops being referenced. This requires zero CDN purges and is the safest, most efficient approach[3].

**Cache Tags:** Google Cloud CDN and similar services support `Cache-Tag` headers, allowing selective purging of related content. For example, you can tag all product pages with `Cache-Tag: products, product-catalog` and invalidate only those tags when product data changes, rather than purging entire path prefixes[5].

**TTL-Based Invalidation:** Set appropriate Time-to-Live values—short TTLs for volatile data, longer ones for static content[2]. Monitor cache hit and miss rates; a low hit rate indicates ineffective strategy, TTL too short, or insufficient cache size[2].

**Event-Driven Invalidation:** Clear specific data from cache when events occur (e.g., clearing a user's cached data when they update their profile)[2]. Integrate invalidation into your CI/CD pipeline to refresh caches immediately after deployments[4].

## Cache Warming

**Cache warming preloads caches before traffic arrives**, reducing TTFB and ensuring consistent performance after deployments[4]. Effective strategies include:

- Prioritize high-value URLs (home, category, product, pricing, checkout pages) to avoid warming low-traffic pages that add server load without meaningful gains[4]
- Use **simulated user crawlers** (headless browsers) that click internal links, execute JavaScript, and load dynamic content, warming HTML, API, and edge caches simultaneously[4]
- Integrate warmup into CI/CD pipelines for automation after every deployment or purge[4]
- Throttle requests with rate limiting or batching to avoid overwhelming the origin server[4]
- Exclude personalized content (dashboards, carts, private APIs) from warming[4]

## In-Memory Caching

For application-level performance, **in-memory caching** tools like Redis or Memcached store frequently accessed data directly in server memory[2]. This is extremely fast and ideal for caching complex database query results or computations. Facebook, for instance, relies heavily on in-memory caching to power its social graph and deliver news feeds quickly[2].

## Monitoring and Optimization

Continuously track **cache hit and miss rates** to validate strategy effectiveness[2]. A complete 2026 caching approach combines Cache-Control directives, ETags for bandwidth savings, hash-based cache busting for aggressive caching safety, CDN edge strategies, and automated invalidation integrated into deployment workflows[1][3][5].

Source: https://www.benedikt-sperl.de/blog/2026-02-22-caching-with-cache-control-header
Source: https://in.springverify.com/blog/api-integration-best-practices/
Source: https://webperfclinic.com/article/http-caching-web-performance-complete-cache-control-guide
Source: https://store.outrightcrm.com/blog/warmup-cache-request/
Source: https://oneuptime.com/blog/post/2026-02-17-how-to-invalidate-cached-content-in-google-cloud-cdn-using-cache-tags/view
