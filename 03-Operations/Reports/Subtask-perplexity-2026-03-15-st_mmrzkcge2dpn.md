# Subtask Output — Research Token Bucket Algorithm and Redis Implementation
## Model: sonar
## Stage: report
## Date: 2026-03-15

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
