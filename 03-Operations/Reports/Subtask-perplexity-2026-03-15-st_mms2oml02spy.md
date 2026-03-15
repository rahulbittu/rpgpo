# Subtask Output — Research Sliding Window Pattern
## Model: sonar
## Stage: research
## Date: 2026-03-15

## Sliding Window Rate Limiting Pattern

The **sliding window rate limiting** pattern enforces limits over a rolling time window by tracking requests relative to the current time, avoiding fixed-window boundary bursts where 2x traffic can occur at transitions.[1][2][4]

It includes two main variants: **sliding window log** (exact, memory-intensive) and **sliding window counter** (efficient hybrid using weighted fixed windows).[1][2][4]

### Pseudocode Examples

#### Sliding Window Counter (Redis-based, Python)
Blends counts from current and previous fixed windows with a weighted average for near-exact accuracy; uses 2 Redis keys per client.[1][2]
```
import time
import redis

r = redis.Redis(host="localhost", port=6379, db=0)

def is_allowed_sliding_counter(client_id: str, max_requests: int, window_seconds: int) -> bool:
    now = time.time()
    current_window = int(now // window_seconds)
    previous_window = current_window - 1
    elapsed_ratio = (now % window_seconds) / window_seconds
    current_key = f"rate_limit:sw:{client_id}:{current_window}"
    previous_key = f"rate_limit:sw:{client_id}:{previous_window}"
    current_count = int(r.get(current_key) or 0)
    previous_count = int(r.get(previous_key) or 0)
    weighted_count = current_count + previous_count * (1 - elapsed_ratio)
    if weighted_count >= max_requests:
        return False
    pipe = r.pipeline()
    pipe.incr(current_key)
    pipe.expire(current_key, window_seconds * 2)
    pipe.execute()
    return True
```
Source: https://oneuptime.com/blog/post/2026-02-20-api-rate-limiting-strategies/view[1]

#### Sliding Window Log (Redis Sorted Set, conceptual)
Logs exact timestamps in a sorted set, prunes old entries atomically via Lua, counts remaining for exact enforcement; O(n) memory per client where n=requests in window.[2]
- Steps: 1) ZREMRANGEBYSCORE to remove timestamps < now - window; 2) ZCARD to count; 3) ZADD new timestamp if under limit.
Source: https://redis.io/tutorials/howtos/ratelimiting/[2]

### Use Cases
- **High-value APIs**: Sliding window log for audit trails and exact limits (e.g., 5 req/min per user, checking last 60s).[2][4]
- **General API throttling**: Sliding window counter for smoothed boundaries in distributed systems (e.g., 200 req/min, weighted overlap).[1][2][5]
- **Bursty traffic**: Handles spikes without 2x bursts at clock edges, unlike fixed windows; used in login throttling or OpenAI-style TPM limits.[2][7]
- **Real-world**: Protects APIs from $47k bills by precise counter weighting.[5]

| Variant | Memory/Client | Accuracy | Best Use |
|---------|---------------|----------|----------|
| Log | O(n) entries | Exact | Audit-heavy APIs[2] |
| Counter | 2 keys | Near-exact | Scalable general limiting[1][2] |

Source: https://redis.io/tutorials/howtos/ratelimiting/[2]

### Advantages
- **No boundary bursts**: Weighted current/previous windows smooth transitions (e.g., elapsed_ratio 0.8 uses 20% of prior count).[1][4][5]
- **Precision + efficiency**: Counter uses fixed-window memory (2 keys) with sliding accuracy; log is exact but trims via atomic ops.[2]
- **Flexibility**: Window starts on first request (e.g., 9:00:24 to 10:01:24 for 200/min), solves fixed-window starvation.[3]
- **Redis-native**: Lua scripts ensure atomicity; better than token bucket for non-bursty exactness.[2]

Source: https://redis.io/tutorials/howtos/ratelimiting/[2]; https://oneuptime.com/blog/post/2026-02-20-api-rate-limiting-strategies/view[1]

**Next steps**: Implement sliding window counter in your data pipeline (e.g., Redis on AWS ElastiCache); test with 100 req/min limit using Locust.io for burst simulation. Benchmark vs. token bucket from prior results.
