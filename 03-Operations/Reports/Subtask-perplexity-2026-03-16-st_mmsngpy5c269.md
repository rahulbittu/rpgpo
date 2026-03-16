# Subtask Output — Research Redis Distributed Caching
## Model: sonar
## Stage: report
## Date: 2026-03-16

## Cache Invalidation Strategies

**Cache-Aside pattern** is the most common for Redis: read from cache first, miss loads from DB and populates cache with TTL (e.g., 300 seconds), writes update DB then delete cache key to force refresh on next read.[1][2]  
- Code example: `r.setex(cache_key, 300, json.dumps(user))` for population; `r.delete(cache_key)` on update.[2]  
- Prevents staleness with **default TTL of 300 seconds (5 minutes)**; first read post-invalidation hits DB (trade-off: slow thundering herd).[1][2]  
Source: https://oneuptime.com/blog/post/2026-02-20-distributed-caching-patterns/view[1]; https://oneuptime.com/blog/post/2026-02-20-redis-caching-patterns/view[2]

**Distributed locking (Mutex)** prevents cache stampedes on misses: first request acquires Redis lock, queries DB, others wait or use stale data.[5]  
- Use Redis pub/sub for real-time invalidation across instances; pre-warm caches via cron (e.g., 7:45 AM for 8 AM peak, targeting 99% hit ratio).[5]  
Source: https://www.averagedevs.com/blog/caching-strategies-redis-cdn[5]

Avoid anti-patterns: always set TTLs to prevent infinite stale data; delete on writes.[8]  
Source: https://redis.io/tutorials/redis-anti-patterns-every-developer-should-avoid/[8]

## Redis Cluster Setup

**Enable cluster mode** for horizontal scaling: set `REDIS_CLUSTER_ENABLED=true` and `REDIS_CLUSTER_NODES=redis-node1:6379,redis-node2:6379,...` (6 nodes: 3 masters + 3 replicas recommended for HA).[4]  
- Production config: `maxmemory-policy=noeviction`; shard queues with `LANGFUSE_INGESTION_QUEUE_SHARD_COUNT=2-3x shards` (e.g., 6-9 for 3 shards).[4]  
- Azure example: `az redis create --name my-app-cache --sku Basic --vm-size c0` (upgrade to Standard/Premium); connect via `AddStackExchangeRedisCache(options.Configuration = "host:6379,password=...")`.[3]  
Source: https://langfuse.com/self-hosting/deployment/infrastructure/cache[4]; https://oneuptime.com/blog/post/2026-02-16-how-to-implement-distributed-caching-with-azure-cache-for-redis-in-aspnet-core/view[3]

**Encore.ts auto-provisions**: Declare `CacheCluster` in TS code; deploys ElastiCache (AWS) or Memorystore (GCP) with VPC/security groups per env.[6]  
Source: https://encore.dev/blog/type-safe-caching[6]

## Monitoring Dashboards

Search results lack specific dashboard tools/names (e.g., no Grafana/RedisInsight setups dated 2026); general Redis monitoring via `INFO` command or cluster health checks recommended.[4]  
- Track: cluster slots refresh (`REDIS_CLUSTER_SLOTS_REFRESH_TIMEOUT=5000ms`), node failures, hit ratios (target 99%).[4][5]  
- Next step: Query "Redis cluster Grafana dashboard 2026" for latest; integrate Redis pub/sub metrics into existing tools.[5]  
Source: https://langfuse.com/self-hosting/deployment/infrastructure/cache[4]; https://www.averagedevs.com/blog/caching-strategies-redis-cdn[5]

## Concrete Next Steps
- **Implement cache-aside**: Copy [2] Python code; test with `redis.Redis(host='localhost', port=6379)` locally (TTL=300s).[2]  
- **Setup cluster**: Deploy 6-node Redis (e.g., via Docker: `docker run -d --name redis1 redis:7 cluster`); env vars from [4].[4]  
- **Azure quickstart**: Run `az redis create` commands; add `Microsoft.Extensions.Caching.StackExchangeRedis` NuGet (ASP.NET).[3]  
- **Scale/test**: Load test with 10k req/s; monitor stampedes using mutex from [5]; invalidate via pub/sub.[5]
