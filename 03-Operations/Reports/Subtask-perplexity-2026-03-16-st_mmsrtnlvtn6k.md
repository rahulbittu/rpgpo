# Subtask Output — Research Rate Limiting Algorithms
## Model: sonar
## Stage: research
## Date: 2026-03-16

## Token Bucket Algorithm

Token bucket allows controlled bursts up to a fixed **bucket capacity** while enforcing an average rate via tokens refilled at a constant rate (e.g., 30 tokens/second).[1][2][4] Each API request consumes 1+ tokens; if insufficient, it's denied.[2]

### Pros and Cons
| Aspect | Pros | Cons |
|--------|------|------|
| Burst Handling | Supports bursts up to capacity (e.g., full bucket at start).[1][4][5] | Requires precise refill coordination; may need adjustments in low-traffic scenarios.[3] |
| Implementation | Simple with Redis HASH (2 fields: tokens, last_refill); exact accuracy.[1][4] | Higher coordination for token generation rate.[3] |
| Memory | Low: 1 key per client.[4] | N/A |

### Real Examples and Use Cases
- **Centra Integration API**: Uses 6 independent buckets (e.g., sustained mutations/hour, query complexity/hour); each with quota (max tokens), intervalSeconds (10s or 1hr), remainingQuota. A query consumes 1 request + 5 complexity tokens; denies if any bucket lacks tokens.[2]
- **Redis Implementation**: OneUptime's Python code initializes full bucket (capacity-1 tokens), refills via elapsed time * refill_rate, caps at capacity, consumes 1 per request.[1]
- **Use Cases**: Bursty traffic with average caps (e.g., APIs handling variable loads); general APIs needing bursts without 2x boundary spikes.[4][5]

**Next Steps**: Implement via Redis Lua script for atomicity; test with capacity=100, refill_rate=10/sec on localhost:6379.[1][4]

## Sliding Window Algorithm

Sliding window tracks requests in a moving time window for near-exact or exact limiting, smoothing fixed-window boundary issues (e.g., no 2x bursts at edges).[4]

### Variants, Pros, and Cons
| Variant | Data Structure | Memory per Client | Accuracy | Burst Behavior | Pros/Cons |
|---------|----------------|-------------------|----------|----------------|-----------|
| Sliding Window Counter | STRING x2 + Lua | 2 keys | Near-exact | Smoothed boundaries | Best balance for most APIs; simple, low memory. No major cons noted.[4] |
| Sliding Window Log | SORTED SET + Lua | O(n) entries | Exact | No bursts | Precise timestamps for audits; higher memory limits scale.[4] |

### Real Examples and Use Cases
- **Redis Comparison (March 12, 2026)**: Sliding window counter uses 2 STRING keys per window for general API limits (e.g., 100 req/min); log variant for high-value APIs like payments needing exact timestamps.[4]
- **GeeksforGeeks Context**: Contrasts with token bucket for bursty vs. smoothed flows; no code but notes flexibility.[3]
- **Use Cases**: General-purpose API rate limiting (e.g., fair usage, abuse prevention); high-value APIs (payments, auth) or audits needing precision over bursts.[4]

**Next Steps**: Deploy sliding window counter on Redis for APIs; benchmark vs. token bucket using Lua INCR/EXPIRE for 1-min windows.[4]

## Comparison and Recommendations
| Algorithm | Best For | Key Metric Example |
|-----------|----------|-------------------|
| Token Bucket | Bursty traffic | 100 req burst, 10/sec avg[1][4] |
| Sliding Window Counter | General APIs | 100 req/min, near-exact[4] |
| Sliding Window Log | Audits/payments | Exact timestamps, O(n) memory[4] |

Token bucket suits burst-heavy SaaS APIs; sliding window counter for steady, fair limiting in data engineering tools.[4][5] No 2026-specific updates beyond Redis guide (March 12).[4]
