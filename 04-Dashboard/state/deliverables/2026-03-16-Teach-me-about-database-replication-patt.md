# Teach me about database replication patterns. Compare single-leader, multi-leade

**Domain:** learning | **Date:** 2026-03-16 | **Subtasks:** 2



## Research Database Replication Patterns
## Single-Leader Replication
Single-leader replication designates one primary node to accept all writes, with replicas receiving asynchronous updates for reads. This provides strong consistency for writes but risks replication lag for reads, leading to eventual consistency.[3]

- **Consistency tradeoffs**: Writes are durable on the leader before replication; reads from replicas may return stale data during lag. Last-write-wins resolves conflicts if any.
- **Failure handling**: On leader failure, a replica is promoted via tools like Redis Sentinel, causing brief downtime (seconds to minutes).[3]
- **Real example**: Standard Redis replication uses one primary for writes/replicas for reads only, with async replication; failover promotes a replica.[3] Source: https://singhajit.com/redis-vs-dragonflydb-vs-keydb/

## Multi-Leader (Active-Active) Replication
Multi-leader replication allows multiple nodes to accept writes simultaneously, with bidirectional async replication between them. This scales write throughput but introduces conflict resolution challenges.[3]

- **Consistency tradeoffs**: Eventual consistency via last-write-wins (timestamp-based); no strong global ordering, risking overwrites on conflicts.
- **Failure handling**: No single point of failure; surviving leaders continue writes, with async sync to recover nodes. Conflicts auto-resolved without downtime.
- **Real example**: KeyDB active replication enables multiple masters (e.g., 3 nodes) for simultaneous writes/reads, bidirectional sync, over 1M ops/sec via per-key locking and MVCC.[3] Source: https://singhajit.com/redis-vs-dragonflydb-vs-keydb/

## Leaderless Replication
Leaderless replication (not directly detailed in results) typically uses quorum-based writes/reads across replicas without a leader, emphasizing availability over consistency (per CAP theorem). Results lack 2026-specific examples; closest is DynamoDB's multi-region setup with witnesses.

- **Consistency tradeoffs**: Tunable via read/write quorums (e.g., W+R > N for eventual consistency); prioritizes availability, with possible stale reads.
- **Failure handling**: Tolerates node/region failures if quorum met; uses witnesses for coordination without full data storage.
- **Real example**: DynamoDB Global Tables Multi-Region Strong Consistency (MRSC, launched 2025) uses two replicas + witness across 3 regions for zero-RPO; witness holds only change data for coordination.[1] Source: https://devnewsletter.com/p/state-of-databases-2026/

## Key Comparisons
| Pattern | Write Scalability | Consistency | Failure Tolerance | Example |
|---------|-------------------|-------------|-------------------|---------|
| Single-Leader | Low (1 node) | Strong writes, eventual reads | Downtime on leader fail | Redis[3] |
| Multi-Leader | High (multiple nodes) | Eventual (last-write-wins) | High, no promotion needed | KeyDB[3] |
| Leaderless | High (quorum) | Tunable/eventual | Highest (no leader) | DynamoDB MRSC[1] |

No recent (post-2025) sources cover leaderless in depth; results emphasize multi-region async replication over pure leaderless like Cassandra. For implementation, test KeyDB active replication: deploy 3-node cluster, enable active-rep, monitor conflicts via logs.[3]

## Synthesize Replication Patterns Report
## Explanation

### Single-Leader Replication
- **Design**: A primary node handles all write operations, and replicas asynchronously receive updates for read operations.
- **Consistency Tradeoffs**: 
  - **Strong Consistency for Writes**: Ensures that once a write is acknowledged, it is durable on the leader.
  - **Eventual Consistency for Reads**: Due to asynchronous updates, replicas may serve stale data until they catch up with the leader.
- **Failure Handling**: 
  - **Leader Failure**: In the event of a leader failure, a replica is promoted to leader status using tools like Redis Sentinel. This process involves brief downtime (seconds to minutes) as the system reconfigures.
- **Example**: Redis uses this pattern, where one primary node handles writes, and replicas handle reads. Failover is managed by promoting a replica to the leader position. [Source](https://singhajit.com/redis-vs-dragonflydb-vs-keydb/)

### Multi-Leader (Active-Active) Replication
- **Design**: Multiple nodes can accept write operations simultaneously, with bidirectional asynchronous replication between them.
- **Consistency Tradeoffs**: 
  - **Eventual Consistency**: Utilizes a last-write-wins strategy based on timestamps, which can lead to overwrites if conflicts occur.
  - **No Strong Global Ordering**: This can result in data conflicts that need resolution.
- **Failure Handling**: 
  - **No Single Point of Failure**: If one leader fails, other leaders continue to accept writes, and the failed node can be resynchronized asynchronously.
- **Example**: KeyDB supports active replication with multiple masters, allowing simultaneous writes across nodes, enhancing write throughput and availability.

## Examples

1. **Single-Leader Replication**:
   - **Redis**: A common use case where a single primary node handles all writes, and replicas handle reads. Failover is managed by promoting a replica to the primary role using Redis Sentinel.

2. **Multi-Leader Replication**:
   - **KeyDB**: This system allows multiple nodes to simultaneously handle write operations, reducing write latency and increasing throughput. Conflicts are resolved using a last-write-wins approach.

## Practice Questions

1. **What are the main advantages and disadvantages of single-leader replication in terms of consistency and failure handling?**
2. **How does multi-leader replication handle write conflicts, and what are the potential risks?**
3. **In what scenarios would you prefer single-leader replication over multi-leader replication, and vice versa?**

## Further Reading

- **Redis Sentinel Documentation**: Explore how Redis manages failover and replication.
- **KeyDB Active Replication**: Understand how KeyDB implements multi-leader replication and its conflict resolution strategies.
- **Database Replication Patterns**: A comprehensive guide to different replication strategies and their tradeoffs.

By understanding these patterns, you can make informed decisions about which replication strategy best suits your application's needs, balancing consistency, availability, and performance.