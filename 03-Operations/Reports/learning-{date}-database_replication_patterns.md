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