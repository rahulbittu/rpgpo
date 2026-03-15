# Teach me about API rate limiting patterns. Cover token bucket, sliding window, a

## Phase 1: User Context

- **Task ID**: `t_mms2o0gtjlr3`
- **Engine**: general
- **Urgency**: normal
- **Created**: 2026-03-15T18:12:34

### Operator Context (auto-injected)
- Rahul, Senior Data Engineer / Entrepreneur, Austin TX
- Output style: Specific, actionable, cited. No generic frameworks.

### Request
> Teach me about API rate limiting patterns. Cover token bucket, sliding window, and fixed window approaches. Include pseudocode examples and when to use each.

## Phase 2: Board of AI Deliberation

**Chief of Staff**: "Provide an educational overview of API rate limiting patterns with pseudocode examples."

**Strategy**: Research each rate limiting pattern to gather detailed explanations and pseudocode examples. Compile these into a cohesive report that explains each pattern, provides pseudocode, and suggests when to use each approach.

**Risk**: green | **Code Task**: No

**Execution Plan**:

| Step | Task | Model | Stage |
|------|------|-------|-------|
| 1 | Research Token Bucket Pattern | perplexity | research |
| 2 | Research Sliding Window Pattern | perplexity | research |
| 3 | Research Fixed Window Pattern | perplexity | research |
| 4 | Compile Rate Limiting Patterns Report | openai | report |

## Phase 3: Execution

### Step 1: Research Token Bucket Pattern [perplexity]

**Status**: done | **Stage**: research

## Token Bucket Rate Limiting Pattern

The **token bucket** is a rate limiting algorithm that maintains a "bucket" of tokens added at a constant rate; requests consume tokens if available, allowing bursts up to bucket capacity while enforcing average rate limits over time[1][2][4][6].

### Pseudocode Examples
- **Python TokenBucketRateLimiter** (for Azure OpenAI TPM limits, e.g., 80,000 tokens/minute): Initializes with tokens_per_minute, refills tokens proportionally to elapsed time (rate = tokens_per_minute / 60), caps at max_tokens, and blocks via `acquire(tokens_needed)` until sufficient tokens exist[1].
```
class TokenBucketRateLimiter:
    def __init__(self, tokens_per_minute):
        self.rate = tokens_per_minute / 60.0
        self.max_tokens = tokens_per_minute
        self.available_tokens = tokens_per_minute
        self.last_refill = time.time()
        self.lock = threading.Lock()

    def _refill(self):
        now = time.time()
        elapsed = now - self.last_refill
        self.available_tokens = min(self.max_tokens, self.available_tokens + elapsed * self.rate)
        self.last_refill = now

    def acquire(self, tokens_needed):
        while True:
            with self.lock:
                self._refill()
                if self.available_tokens >= tokens_needed:
                    self.available_tokens -= tokens_needed
                    return True
            time.sleep(0.1)
```
- **Simple TokenBucket** (counter-based): Refills tokens = min(capacity, tokens + (now - last_refill) * rate); allows request if tokens >=1, then decrements[2].
```
class TokenBucket:
    def __init__(self, rate, capacity):
        self.rate = rate
        self.capacity = capacity
        self.tokens = capacity
        self.last_refill = time.time()

    def allow_request(self):
        now = time.time()
        self.tokens += (now - self.last_refill) * self.rate
        self.tokens = min(self.tokens, self.capacity)
        self.last_refill = now
        if self.tokens >= 1:
            self.tokens -= 1
            return True
        return False
```
- **Redis Lua Script Integration** (FastAPI middleware): Uses capacity=100, refill_rate=10; checks via `check_token_bucket(client_id)` and adds headers like X-RateLimit-Remaining[4].

### Use Cases
- **API Throttling in Cloud Services**: Smooths bursts in Azure OpenAI (e.g., acquire estimated_tokens before chat.completions.create) and Databricks Foundation Model APIs (TPM limits with burst buffer and sliding window)[1][3].
- **High-Traffic APIs**: Handles bursts in Redis-backed systems (e.g., Memorystore for FastAPI endpoints like /api/data) without immediate rejection[4].
- **Burst Traffic Prevention**: Ideal for e-commerce/search APIs or preventing $47,000 OpenAI bills by consuming tokens per request[6].
- **Scalable Security**: Protects against DoS in dynamic environments with per-key/endpoint limits[5].

### Advantages
- **Burst Handling**: Allows traffic spikes up to bucket size (e.g., Databrick

*... truncated (3533 chars total)*

### Step 2: Research Sliding Window Pattern [perplexity]

**Status**: done | **Stage**: research

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
- **Precision + efficiency**: Cou

*... truncated (3693 chars total)*

### Step 3: Research Fixed Window Pattern [perplexity]

**Status**: done | **Stage**: research

## Fixed Window Rate Limiting Pattern

The **fixed window rate limiting** pattern divides time into discrete, non-overlapping intervals (e.g., 60-second windows) and counts requests per window per client; requests are allowed if the count is below a limit (e.g., 100/minute), with the counter resetting at window boundaries.[1][3][4]

### Pseudocode Examples
- **Redis-based Python implementation** (from OneUptime, Feb 20, 2026): Uses Redis for shared state, computes current window as `int(time.time() // window_seconds)`, increments counter atomically, sets expiration on first request, allows if `current_count <= max_requests`.[1]
```
import time
import redis

r = redis.Redis(host="localhost", port=6379, db=0)

def is_allowed_fixed_window(client_id: str, max_requests: int, window_seconds: int) -> bool:
    current_window = int(time.time() // window_seconds)
    key = f"rate_limit:{client_id}:{current_window}"
    current_count = r.incr(key)
    if current_count == 1:
        r.expire(key, window_seconds)
    return current_count <= max_requests
```
Source: https://oneuptime.com/blog/post/2026-02-20-api-rate-limiting-strategies/view[1]

- **In-memory Python class** (from GeeksforGeeks): Tracks `requests` and `window_start`; on each call, checks if window elapsed to reset, then allows/increments if under limit.[4]
```
class FixedWindow:
    def __init__(self, window_size, max_requests):
        self.window_size = window_size
        self.max_requests = max_requests
        self.requests = 0
        self.window_start = time.time()

    def allow_request(self):
        now = time.time()
        if now - self.window_start >= self.window_size:
            self.requests = 0
            self.window_start = now
        if self.requests < self.max_requests:
            self.requests += 1
            return True
        else:
            return False
```
Source: https://www.geeksforgeeks.org/system-design/rate-limiting-algorithms-system-design/[4]

### Use Cases
- Simple API rate limiting, e.g., 100 requests per minute per client.[3]
- Login attempt throttling to prevent brute-force attacks.[3]
- Stable traffic flows where boundary bursts are acceptable, such as Gainsight CS limiting to 100 requests/minute per server.[8]
Source: https://redis.io/tutorials/howtos/ratelimiting/[3]; https://support.gainsight.com/gainsight_nxt/Administration_and_Permissions/General_Administration/Gainsight_CS_System_Limits[8]

### Advantages
- **Simple to implement** with minimal logic and low CPU/memory use (one Redis key per window per client).[1][3][4]
- **Fast execution** via single atomic operation (e.g., Redis INCR + EXPIRE).[3]
- Memory-efficient for low-traffic scenarios, auto-deletes keys post-expiration.[3]
Source: https://oneuptime.com/blog/post/2026-02-20-api-rate-limiting-strategies/view[1]; https://redis.io/tutorials/howtos/ratelimiting/[3]; https://www.geeksforgeeks.org/system-design/rate-limiting-algorithms-system-design/[4]

### Key Limitation (for Context)
Permit

*... truncated (3225 chars total)*

### Step 4: Compile Rate Limiting Patterns Report [openai]

**Status**: done | **Stage**: report

## Key Findings

1. **Token Bucket Pattern**: 
   - Allows for burst handling by maintaining a bucket of tokens that refill at a constant rate. This pattern is effective for scenarios where occasional bursts of requests are acceptable, as long as the average rate over time is maintained.
   - Pseudocode demonstrates a Python implementation using threading to manage token refills and request handling.

2. **Sliding Window Pattern**:
   - Offers a more precise rate limiting by tracking requests over a rolling time window, mitigating the burst issues seen in fixed window patterns.
   - Two variants exist: sliding window log (more precise but memory-intensive) and sliding window counter (less precise but more efficient), with Redis-based examples provided.

3. **Fixed Window Pattern**:
   - Simplifies rate limiting by dividing time into discrete intervals, counting requests per interval. This can lead to burst issues at window boundaries.
   - Pseudocode examples include both Redis-based and in-memory implementations, useful for different scalability needs.

## Detailed Analysis

### Token Bucket Rate Limiting Pattern
- **Concept**: Maintains a bucket of tokens that refill at a constant rate. Requests consume tokens, allowing for bursts up to the bucket's capacity while maintaining an average rate over time.
- **Use Case**: Ideal for applications that need to handle occasional bursts of traffic without exceeding a defined average rate.
- **Pseudocode Example**: 
  - Uses threading to manage token availability and refill based on elapsed time.
  - Allows for blocking until sufficient tokens are available, ensuring rate limits are respected.

### Sliding Window Rate Limiting Pattern
- **Concept**: Tracks requests over a rolling time window, providing a more accurate rate limit by avoiding fixed window boundary issues.
- **Variants**:
  - **Sliding Window Log**: Tracks each request timestamp, providing exact limits but is memory-intensive.
  - **Sliding Window Counter**: Uses weighted averages of requests in current and previous windows, offering a balance between precision and efficiency.
- **Use Case**: Suitable for systems requiring precise control over request rates without the burst issues of fixed windows.
- **Pseudocode Example**: 
  - Redis-based implementation using two keys per client to calculate a weighted request count.

### Fixed Window Rate Limiting Pattern
- **Concept**: Divides time into fixed intervals, counting requests in each interval. Counters reset at the end of each window.
- **Use Case**: Best for simple rate limiting needs where the burst issue at window boundaries is acceptable.
- **Pseudocode Example**:
  - Redis-based implementation for shared state across distributed systems.
  - In-memory implementation for simpler, single-instance applications.

## Recommended Actions

1. **Implement Token Bucket for Burst Handling**:
   - **What to Do**: Use the token bucket pattern if your application can benefit from handling bursts of

*... truncated (4375 chars total)*

## Phase 4: Deliverable

- **Status**: done
- **Subtasks**: 4/4 completed
- **Download MD**: /api/intake/task/t_mms2o0gtjlr3/export?fmt=md
- **Download JSON**: /api/intake/task/t_mms2o0gtjlr3/export?fmt=json
