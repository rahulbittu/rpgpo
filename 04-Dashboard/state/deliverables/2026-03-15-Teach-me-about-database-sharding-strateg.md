# Teach me about database sharding strategies. Cover horizontal vs vertical partit

**Domain:** learning | **Date:** 2026-03-15 | **Subtasks:** 2



## Research Database Sharding Strategies
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

## Synthesize Sharding Strategies Report
## Key Findings

1. **Horizontal vs Vertical Partitioning**: Horizontal partitioning (sharding) is ideal for scaling applications with large row counts by distributing data across multiple servers, enhancing parallel query execution. Vertical partitioning is better for optimizing wide tables by splitting columns, which can improve query speed for specific subsets of data.

2. **Shard Key Selection**: The key to effective sharding is choosing a shard key with high cardinality and even distribution to prevent hotspots. Hash-based sharding is recommended for its balance and low risk of uneven load, while range-based and geo-based sharding can be useful for specific query patterns or latency reductions.

3. **Cross-Shard Queries**: These can be complex and require careful design to maintain performance. PostgreSQL supports cross-shard queries through extensions like Citus, which can distribute queries across nodes but may require rewriting queries for optimization.

## Detailed Analysis

### Horizontal vs Vertical Partitioning

- **Horizontal Partitioning**: This strategy involves distributing rows of a table across multiple databases or servers. It is particularly effective for applications with large datasets, such as user data, where each shard can handle a subset of the total data. This method allows for parallel processing, significantly improving query throughput. For instance, e-commerce applications have reported a 3-5x increase in query throughput with horizontal partitioning.

- **Vertical Partitioning**: This approach involves splitting the columns of a table into different tables or databases. It is useful for wide tables where certain columns are accessed infrequently. By separating these less-used columns, the system can optimize queries on the more frequently accessed data, reducing row size and improving speed.

### Shard Key Selection

- **Hash-based Sharding**: This method applies a hash function to the shard key, ensuring an even distribution of data across shards. It minimizes the risk of hotspots and is suitable for applications where balanced load distribution is critical.

- **Range-based Sharding**: This involves dividing data into ranges based on the shard key. While efficient for range queries, it can lead to uneven load distribution if data access patterns are skewed.

- **Geo-based Sharding**: By partitioning data based on geographic location, this strategy can significantly reduce latency for regional queries, improving user experience by 20-50ms.

### Cross-Shard Queries

- **PostgreSQL and Extensions**: PostgreSQL can handle cross-shard queries using extensions like Citus, which distribute queries across multiple nodes. However, this requires careful query design and might involve rewriting queries to optimize performance.

## Recommended Actions

1. **Implement Horizontal Partitioning for Large Datasets**: 
   - **Why**: To scale applications effectively by distributing data and query loads.
   - **Expected Outcome**: Improved query throughput and application performance.
   - **First Step**: Identify tables with large row counts and evaluate them for horizontal partitioning.

2. **Select an Appropriate Shard Key**:
   - **Why**: To ensure even data distribution and prevent performance bottlenecks.
   - **Expected Outcome**: Balanced load across shards, minimizing hotspots.
   - **First Step**: Analyze your data to select a shard key with high cardinality, such as a hashed user ID.

3. **Optimize Cross-Shard Queries**:
   - **Why**: To maintain performance when querying across multiple shards.
   - **Expected Outcome**: Efficient query execution across distributed data.
   - **First Step**: Use PostgreSQL extensions like Citus to manage cross-shard queries and consider query optimization techniques specific to your application needs.

4. **Monitor and Adjust Shard Distribution**:
   - **Why**: To ensure ongoing performance and scalability as data grows.
   - **Expected Outcome**: Sustained application performance and scalability.
   - **First Step**: Set up monitoring tools to track shard distribution and adjust as needed based on usage patterns.