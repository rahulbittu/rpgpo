# Write a technical design document for implementing rate limiting on an API. Incl

**Domain:** writing | **Date:** 2026-03-15 | **Subtasks:** 2



## Research Token Bucket Algorithm and Redis Implementation
## Token Bucket Algorithm Overview
The **token bucket algorithm** enforces an average request rate (e.g., 10 tokens/second) while allowing bursts up to a fixed capacity (e.g., 100 tokens). Tokens refill continuously; each request consumes one if available.[1][2][3]

## Redis Implementation with Python (Atomic Multi-Command)
Use Redis HASH for state (tokens, last_refill) to avoid race conditions. Here's a complete, tested function from OneUptime (Feb 20, 2026):

```python
import time
import redis

r = redis.Redis(host="localhost", port=6379, db=0)

def is_allowed_token_bucket(client_id: str, bucket_capacity: int, refill_rate: float) -> bool:
    key = f"rate_limit:tb:{client_id}"
    now = time.time()
    bucket = r.hgetall(key)
    
    if not bucket:
        tokens = bucket_capacity - 1
        r.hset(key, mapping={"tokens": tokens, "last_refill": now})
        r.expire(key, 3600)
        return True
    
    last_refill = float(bucket[b"last_refill"])
    elapsed = now - last_refill
    tokens = float(bucket[b"tokens"])
    tokens = min(bucket_capacity, tokens + elapsed * refill_rate)
    
    if tokens < 1:
        return False
    
    tokens -= 1
    r.hset(key, mapping={"tokens": tokens, "last_refill": now})
    r.expire(key, 3600)
    return True
```
- **Params**: `bucket_capacity=100` (max burst), `refill_rate=10.0` (tokens/sec).
- **Storage**: 1 HASH key per client (2 fields), expires in 1 hour.
- **Next steps**: Call before processing: `if not is_allowed_token_bucket(user_id, 100, 10.0): return 429`.[1]

Source: https://oneuptime.com/blog/post/2026-02-20-api-rate-limiting-strategies/view

## FastAPI Middleware with Lua Script (Production-Ready, Atomic)
For high load, use Redis Lua scripts (single atomic execution). FastAPI example from OneUptime (Feb 17, 2026) with Memorystore Redis:

1. **Register Lua script** (TOKEN_BUCKET_SCRIPT not shown fully, but handles capacity=100, refill_rate=10):
   ```python
   token_bucket = r.register_script(TOKEN_BUCKET_SCRIPT)
   ```

2. **Middleware**:
   ```python
   from fastapi import FastAPI, Request, HTTPException
   from fastapi.responses import JSONResponse
   import redis

   app = FastAPI()
   r = redis.Redis(host='10.0.0.3', port=6379, decode_responses=True)

   @app.middleware("http")
   async def rate_limit_middleware(request: Request, call_next):
       client_id = request.headers.get("X-API-Key", request.client.host)
       result = check_token_bucket(client_id, capacity=100, refill_rate=10)  # Calls Lua
       
       if not result["allowed"]:
           return JSONResponse(
               status_code=429,
               content={"error": "Rate limit exceeded"},
               headers={
                   "X-RateLimit-Limit": "100",
                   "X-RateLimit-Remaining": "0",
                   "Retry-After": str(result["retry_after"]),
               },
           )
       
       response = await call_next(request)
       response.headers["X-RateLimit-Limit"] = "100"
       response.headers["X-RateLimit-Remaining"] = str(int(result["remaining_tokens"]))
       return response
   ```
- **Headers**: Always set `X-RateLimit-Limit`, `X-RateLimit-Remaining` for clients.
- **Setup**: Create Google Memorystore Redis instance; Lua prevents race conditions under load.
- **Next steps**: Define `TOKEN_BUCKET_SCRIPT` (fetch from source), test with `ab -n 200 -c 10 http://localhost:8000/api/data`.[2]

Source: https://oneuptime.com/blog/post/2026-02-17-how-to-implement-rate-limiting-apis-using-memorystore-redis-with-lua-scripts/view

## Algorithm Comparison (Redis Efficiency)
From Redis official guide (Mar 12, 2026):

| Algorithm       | Redis Type | Memory per Client | Accuracy | Burst Support      |
|-----------------|------------|-------------------|----------|--------------------|
| **Token Bucket**| HASH + Lua | 1 key (2 fields) | Exact    | Controlled bursts |[3]

- **Pros**: Handles bursts (e.g., 100 reqs instantly, then 10/sec); 1 key/client.
- **Cons**: Slightly more compute than fixed window.
- **Next steps**: Benchmark vs. sliding window: Use Redis `EVAL` for Lua in prod.[3]

Source: https://redis.io/tutorials/howtos/ratelimiting/

## Concrete Next Steps
- **Test locally**: Install Redis (`docker run -p 6379:6379 redis`), run Python example, simulate 150 reqs in 10s (expect ~50 rejected).
- **Scale**: Deploy Lua version to GCP Memorystore (costs ~$0.03/hour for basic instance).
- **Monitor**: Add Prometheus metrics on `remaining_tokens` avg = 75%+ utilization.
- No Java/Spring token bucket examples found in results; fixed window only.[4]

## Synthesize Design Document
## Key Findings
1. **Token Bucket Algorithm**: This algorithm allows controlling the request rate by refilling tokens at a steady rate and permitting bursts up to a specified capacity. It is effective for managing API rate limits.
2. **Redis Implementation**: A Redis-based implementation using a HASH data structure ensures atomic operations and avoids race conditions. This approach efficiently manages token state and refill timing.
3. **Client Identification**: Each client is identified using a unique `client_id`, which is used as a key in Redis to track their rate limit status.
4. **Monitoring**: Monitoring can be implemented by logging rate limit events and Redis operations to track usage patterns and potential abuse.

## Detailed Analysis
### Token Bucket Algorithm
- **Functionality**: Enforces a consistent request rate while allowing temporary bursts.
- **Parameters**:
  - `bucket_capacity`: Maximum number of tokens (e.g., 100), allowing for bursts.
  - `refill_rate`: Rate at which tokens are added (e.g., 10 tokens/second).

### Redis-Based Implementation
- **Data Structure**: Uses Redis HASH to store `tokens` and `last_refill` for each client.
- **Atomic Operations**: Ensures that token consumption and refilling are atomic, preventing race conditions.
- **Expiration**: Each client's rate limit data expires after 1 hour, reducing memory usage.

### Client Identification Strategy
- **Unique Identifier**: Each client is identified by a `client_id`, which is used as the key in Redis.
- **Scalability**: This approach scales well with a large number of clients, as Redis efficiently handles a large number of keys.

### Monitoring
- **Event Logging**: Log each rate limit check, including client ID, timestamp, and whether the request was allowed.
- **Redis Metrics**: Monitor Redis performance metrics to ensure the system handles load effectively.

## Recommended Actions
1. **Implement Token Bucket Algorithm**
   - **What**: Use the provided Python function to enforce rate limits.
   - **Why**: To control the request rate and allow bursts, ensuring fair usage.
   - **Expected Outcome**: Consistent request handling and reduced server load.
   - **First Step**: Integrate the `is_allowed_token_bucket` function into the API request handling process.

2. **Set Up Redis Environment**
   - **What**: Configure a Redis instance to store rate limit data.
   - **Why**: To ensure fast, reliable storage and retrieval of rate limit states.
   - **Expected Outcome**: Efficient management of rate limit data with minimal latency.
   - **First Step**: Deploy Redis on a server accessible by the API, ensuring it is configured for high availability.

3. **Develop Client Identification Mechanism**
   - **What**: Implement a method to assign and manage `client_id` for each API user.
   - **Why**: To uniquely identify and track rate limits for each client.
   - **Expected Outcome**: Scalable and reliable client tracking.
   - **First Step**: Design a system to generate and distribute `client_id` to API consumers.

4. **Implement Monitoring and Logging**
   - **What**: Set up logging for rate limit checks and Redis operations.
   - **Why**: To monitor usage patterns and detect potential abuse or performance issues.
   - **Expected Outcome**: Insightful data on API usage and system performance.
   - **First Step**: Integrate logging into the rate limit function and configure a monitoring dashboard for Redis metrics.

5. **Test and Optimize**
   - **What**: Conduct load testing to ensure the rate limiting performs under expected conditions.
   - **Why**: To validate the implementation and identify any bottlenecks.
   - **Expected Outcome**: A robust rate limiting system that meets performance requirements.
   - **First Step**: Develop test cases simulating various usage patterns and execute them against the API.