# Subtask Output — Research Token Bucket Pattern
## Model: sonar
## Stage: research
## Date: 2026-03-15

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
- **Burst Handling**: Allows traffic spikes up to bucket size (e.g., Databricks burst buffer) unlike fixed windows[2][3][4][6].
- **Flexibility**: Steady average rate with smoothing; easy counter implementation[1][2].
- **Implementation Simplicity**: Thread-safe in Python; Redis for distributed scaling[1][4].
- **Efficiency**: Credits unused tokens (e.g., Databricks refunds 500-350=150 output tokens immediately)[3].

**Next Steps**: Implement via Redis (e.g., FastAPI middleware from [4]) for production; test with 100 capacity/10/sec on localhost Redis at 10.0.0.3:6379; monitor via X-RateLimit headers[4].
