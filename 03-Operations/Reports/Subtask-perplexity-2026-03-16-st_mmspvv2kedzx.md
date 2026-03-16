# Subtask Output — Research Rate Limiting Patterns
## Model: sonar
## Stage: report
## Date: 2026-03-16

## Distributed Rate Limiting with Redis: Core Patterns

Distributed rate limiting at scale uses Redis as a centralized store for atomic operations via Lua scripts, ensuring consistency across multiple API instances. Sliding window counters provide near-exact accuracy with low memory (2 keys per client), while token buckets enable controlled bursts using 1 HASH key with 2 fields[1][2].

## Algorithm Comparison and Trade-offs

| Algorithm | Redis Data Structure | Memory per Client | Accuracy | Burst Behavior | Best Use Case |
|-----------|----------------------|-------------------|----------|----------------|---------------|
| Fixed Window | STRING + Lua | 1 key | Approximate | 2x burst at boundaries | Simple API limits, login throttling[2] |
| Sliding Window Counter | STRING x2 + Lua | 2 keys | Near-exact | Smoothed boundaries | General-purpose API rate limiting[2] |
| Sliding Window Log | SORTED SET + Lua | O(n) entries | Exact | No bursts | High-value APIs, audit trails[2] |
| Token Bucket | HASH + Lua | 1 key (2 fields) | Exact | Controlled bursts | Bursty traffic with average rate caps[2] |

Fixed windows divide time into discrete intervals (e.g., 10-second blocks), incrementing a counter atomically; vulnerable to boundary bursts where clients send limits at window edges (e.g., 10 requests at second 9 and 10 at second 11 for a 10-per-10s limit)[2].

## Technical Implementation: Sliding Window Counters

Use Lua scripts for atomicity in Redis to avoid race conditions. Example Python code for sliding window (removes expired entries via ZREMRANGEBYSCORE, checks ZCARD, adds timestamped entry if under limit):

```
SLIDING_WINDOW_SCRIPT = """
local key = KEYS[1]
local max_requests = tonumber(ARGV[1])
local window = tonumber(ARGV[2])
local now = tonumber(ARGV[3])
redis.call('ZREMRANGEBYSCORE', key, 0, now - window)
local count = redis.call('ZCARD', key)
if count < max_requests then
    redis.call('ZADD', key, now, now .. '-' .. math.random(1000000))
    redis.call('EXPIRE', key, window)
    return 1
else
    return 0
end
"""
```
Register once with `r.script_load()`, call via `r.evalsha(script_sha, 1, key, max_requests, window_seconds, time.time())`. Key format: `rate_limit:dist:{client_id}`[1].

## Technical Implementation: Token Bucket

Tracks tokens in a HASH (fields: tokens, last_refill). Lua script refills based on time elapsed at rate (e.g., capacity=100, refill_rate=10/sec). FastAPI middleware example identifies client by API key/IP, checks `check_token_bucket(client_id, 100, 10)`, returns 429 with headers if exceeded:

```
Headers: X-RateLimit-Limit: "100", X-RateLimit-Remaining: "0", Retry-After: seconds
```
Apply to all routes via middleware[3].

## Real-World Examples at Scale

- **Uber Global Rate Limiter (GRL)**: Replaces per-service Redis token buckets with infrastructure-level probabilistic shedding (drops e.g., 10% traffic as soft limit). Scales to 80M requests/sec across 1,100 services, absorbs 15x surges, mitigates DDoS; reduced tail latency by eliminating Redis deps. Three-tier: clients enforce locally, zone aggregators collect metrics, regional controllers compute limits[6].
- **OpenAI**: Shifted from static limits to adaptive platform, similar to Uber's for operational efficiency[6].

## Best Practices

- Always return rate limit headers (X-RateLimit-Limit, Remaining, Retry-After) for client self-regulation[1][3].
- Use client_id from API key or IP; apply exponential backoff on 429 responses[3][4].
- Multi-granularity windows (e.g., 2,000/hour + 33/minute) smooth spikiness[5].
- Monitor 429 rates with tools like OneUptime for limit tuning or abuse detection[1].
- For Java/Spring: Use Jedis/RedisGears for reactive fixed-window (quota e.g., 20/min)[5].

**Next Steps**: Deploy sliding window Lua script in your FastAPI app (test with 100 reqs/min limit on localhost Redis); benchmark vs. token bucket under burst load using Apache Bench; integrate Uber-style metrics if scaling to 10+ instances. Source for Uber: https://www.infoq.com/news/2026/02/uber-openai-rate-limiting/[6]. Source for Redis tutorial: https://redis.io/tutorials/howtos/ratelimiting/[2].
