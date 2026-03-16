# Subtask Output — Research Database Replication Patterns
## Model: sonar
## Stage: research
## Date: 2026-03-16

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
