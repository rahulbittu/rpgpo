# Subtask Output — Research Redis Cluster Caching Strategies
## Model: sonar
## Stage: audit
## Date: 2026-03-16

## Redis Cluster Overview
Redis Cluster provides horizontal scaling by sharding data across multiple nodes, typically using 3 master nodes with 1 replica each (6 nodes total) for high availability and increased throughput.[2]

## Cache Invalidation Patterns
- **Cache-Aside Pattern**: Application checks cache first; on miss, loads from database and stores in Redis with TTL (e.g., 300 seconds default to prevent stale data). On update, invalidate cache by deleting the key (e.g., `self.cache.delete(f"user:{user_id}")`).[3]
- **Pub/Sub Invalidation**: Redis Pub/Sub broadcasts low-latency invalidation signals across instances for real-time updates.[1]
- **Pre-warming**: Background jobs seed cache proactively (e.g., run aggregations at 7:45 AM for 8:00 AM peak, achieving 99% hit ratio).[1]

## Write-Through vs Write-Behind Strategies
Search results do not explicitly detail write-through (write to cache and DB synchronously) vs write-behind (write to cache asynchronously, batch to DB) for Redis Cluster. Closest pattern is cache-aside, where writes update DB first then invalidate cache, acting like write-through for consistency.[3]

## Hot Key Mitigation Techniques
- **Distributed Locking (Mutex)**: On cache miss, acquire Redis lock so only one worker fetches from DB; others wait or use stale data to prevent stampedes.[1]
- **Connection Reduction**: Use protocol pipelining and sharding to scale horizontally, reducing backend connections for hot keys.[7]
No specific 2026 metrics found; general anti-pattern avoidance includes monitoring large keys and blocking commands.[7]

## Memory Management with Eviction Policies
- **Configuration Recommendation**: Set `maxmemory-policy=noeviction` on all cluster nodes to prevent queue job eviction in production.[2]
- **Cluster Sizing**: Use `REDIS_CLUSTER_NODES` (e.g., `redis-node1:6379,redis-node2:6379,...redis-node6:6379`) with `REDIS_CLUSTER_SLOTS_REFRESH_TIMEOUT=5000ms` for topology updates.[2]
- **Scaling Factors**: Memory grows with application count, managed resources, and manifests (e.g., ArgoCD cluster state cache); monitor and use Redis HA with 3 replicas + 3 Sentinels for production.[4]
- **Queue Sharding**: Set `LANGFUSE_INGESTION_QUEUE_SHARD_COUNT` to 2-3x Redis shards; same for trace upsert queue.[2]

## Key Sources
- **Finding 1: Advanced Caching Strategies: Redis, CDNs, and Cache Invalidation at Scale** (2026, covers stampede prevention, Pub/Sub, pre-warming). Source: https://www.averagedevs.com/blog/caching-strategies-redis-cdn[1]
- **Finding 2: Cache (Redis/Valkey) Configuration (Self-Hosted) - Langfuse** (2026, Redis Cluster config, noeviction policy, 6-node setup). Source: https://langfuse.com/self-hosting/deployment/infrastructure/cache[2]
- **Finding 3: How to Implement Distributed Caching Patterns - OneUptime** (2026-02-20, cache-aside code with TTL=300s). Source: https://oneuptime.com/blog/post/2026-02-20-distributed-caching-patterns/view[3]
- **Finding 4: Understanding ArgoCD's Redis Cache Layer - OneUptime** (2026-02-26, HA with 3 replicas, memory scaling). Source: https://oneuptime.com/blog/post/2026-02-26-argocd-redis-cache-explained/view[4]
- **Finding 7: Redis Anti-Patterns: Common Mistakes Every Developer Should Avoid** (Redis.io, hot keys, sharding). Source: https://redis.io/tutorials/redis-anti-patterns-every-developer-should-avoid/[7]

**Next Steps**: Deploy Langfuse-style 6-node Redis Cluster[2]; implement cache-aside in Python with redis-py[3]; test hot keys using Redis Insight for monitoring[5]; monitor memory via `INFO memory` command.
