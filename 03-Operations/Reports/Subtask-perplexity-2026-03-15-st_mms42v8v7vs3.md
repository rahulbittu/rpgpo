# Subtask Output — Research Database Sharding Strategies
## Model: sonar
## Stage: research
## Date: 2026-03-15

## Horizontal vs Vertical Partitioning

**Horizontal partitioning (sharding)** divides a table's rows across multiple databases or servers based on a shard key, distributing storage and query load for scalability. Vertical partitioning splits table columns across separate tables or databases, typically keeping related columns together to reduce row size and improve query speed on specific subsets.[1][2]

- Horizontal suits growing row counts (e.g., user data split by ID ranges), enabling parallel queries on shards.
- Vertical fits wide tables (e.g., separating infrequently accessed columns like user metadata from core profile data).
- No direct 2026 data found comparing performance metrics; older benchmarks show horizontal scaling 3-5x query throughput for high-volume apps like e-commerce.[1]

## Shard Key Selection

Select shard keys with high cardinality and even distribution to avoid hotspots: use unique identifiers like customer ID or email hashed for balance.[1][2][3]

- **Hash-based**: Apply hash function (e.g., consistent hashing) to key; even distribution, low hotspot risk (e.g., user ID % shard_count).[1][2]
- **Range-based**: Split by key value ranges (e.g., user IDs 1-1M to shard 1, 1M-2M to shard 2); efficient for range queries but risks uneven loads if access skews (e.g., recent IDs hotter).[1][2]
- **Geo-based**: Shard by location (e.g., US-East shard for East Coast users); reduces latency by 20-50ms for regional queries.[2]
- Best practices: Monitor distribution, rebalance quarterly; automate with ML for query patterns (e.g., Tencent Cloud auto-shards by region if queries filter there).[3]
- Example: E-commerce shards transactions by month (partition) + customer region (shard).[3]

| Strategy | Data Distribution | Hotspot Risk | Range Queries | Rebalancing |
|----------|-------------------|--------------|---------------|-------------|
| Hash-based | Even | Low | Scatter-gather | Difficult[2] |
| Range-based | Can be uneven | High | Efficient | Add ranges[2] |
| Geo-based | Varies by region | Medium | Regional only | Add regions[2] |

## Cross-Shard Queries

Cross-shard queries span multiple shards, using **scatter-gather pattern**: route query to relevant shards, aggregate results centrally (e.g., application layer or proxy).[2]

- Challenges: 2-10x slower than single-shard due to network hops; minimize by denormalizing data or choosing access-pattern-aligned keys.[1][2]
- Mitigation: Geo-sharding limits to regional routers (e.g., US-East/West shards); intelligent DBs like Tencent Cloud predict and reduce via auto-rebalancing (latency drops 30-40% on hot partitions).[3]
- Example code snippet for shard routing (user ID-based): `def get_shard(user_id): return user_id % num_shards` then query specific shard.[4]

**Next Steps**:
- Test hash vs range on 1M-row dataset using PostgreSQL Citus (open-source sharding); benchmark query latency.
- Review OneUptime's Feb 20, 2026 guide for patterns: https://oneuptime.com/blog/post/2026-02-20-database-sharding-patterns/view[2]
- Prototype geo-sharding in AWS Aurora or Tencent Cloud (auto-ML sharding since Mar 6, 2026): https://www.tencentcloud.com/techpedia/142174[3]
