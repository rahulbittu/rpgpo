# Subtask Output — Research API Rate Limiting Algorithms
## Model: sonar
## Stage: report
## Date: 2026-03-15

# Token Bucket vs. Sliding Window: API Rate Limiting Algorithms

## Token Bucket Algorithm

**How it works:** A bucket with fixed capacity accumulates tokens at a constant rate. Each incoming request consumes one token; if sufficient tokens exist, the request proceeds; otherwise, it's denied.[1][3] The bucket refills at a predetermined rate (e.g., 30 tokens per second) and stops accumulating once full.[3]

**Key characteristics:**
- **Burst handling:** Allows controlled traffic spikes up to bucket capacity while enforcing a steady average rate[1][7]
- **Memory efficiency:** Requires storage of only a predetermined number of tokens[2]
- **Implementation:** Can be implemented with a simple counter or Redis hash structure[1][6]

**Example:** A web server restricts requests from a single IP address to 50 per minute by replenishing the bucket with 10 tokens per minute; each request consumes one token.[2]

**Advantages:**[6]
- Easy to understand and implement
- Handles burst traffic effectively
- Flexible rate limiting approach

**Challenges:**[6]
- Requires precise coordination of token generation rates
- May need adjustments in low-traffic environments
- Vulnerable to race conditions when multiple threads access the same resource simultaneously[2]

**Real implementation:** Centra's Integration API uses six independent token buckets managing different rate limit types (REQUEST_COUNT, QUERY_COMPLEXITY, MUTATION_COUNT) with intervals ranging from 10 seconds to 1 hour.[3]

Source: https://centra.dev/integration-api/api-rate-limits

## Sliding Window Algorithm

**Key advantage:** According to Redis's March 12, 2026 analysis, the **sliding window counter offers the best balance of accuracy, simplicity, and low memory usage for most APIs**.[7]

**When to use each:**
- **Token Bucket:** Choose when you need to allow controlled bursts without immediate rejection[7]
- **Sliding Window:** Choose for simple API rate limiting (e.g., 100 requests per minute) where boundary precision and simplicity matter[7]

**Best practice approach:** Combine token bucket for burst control with sliding window for fairness and responsiveness, adjusting dynamically to traffic variations.[4]

Source: https://redis.io/tutorials/howtos/ratelimiting/

## Implementation Considerations

**Race condition risk:** Both algorithms face time-of-check-time-of-use (TOCTOU) race conditions when concurrent requests read the same state, decide they're allowed, and both write back—bypassing the limit. This matters most under high-concurrency conditions where rate limiting is critical.[7]

**IETF standard headers:** Implement rate limiting with standardized response headers (RateLimit-Limit, RateLimit-Remaining) for client transparency.[5]

Source: https://dev.to/apilover/how-should-you-implement-api-rate-limiting-339m
