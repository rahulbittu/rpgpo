# Subtask Output — Research Fixed Window Pattern
## Model: sonar
## Stage: research
## Date: 2026-03-15

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
Permits bursts at window edges: e.g., 90 requests at 59s + 90 at 61s = 180 in ~2s, exceeding 100/min intent (visualized in OneUptime graph).[1]
Source: https://oneuptime.com/blog/post/2026-02-20-api-rate-limiting-strategies/view[1]
