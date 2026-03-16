# Subtask Output — Research Consistent Hashing
## Model: sonar
## Stage: research
## Date: 2026-03-16

## Consistent Hashing Overview
**Consistent hashing** maps keys to nodes in a hash ring (a circular structure from 0 to 2^32-1), minimizing data remapping during node changes by assigning keys clockwise from the successor node on the ring.[1][2]

## Hash Rings
Hash rings place each server at a random position (token) on a circular hash space. Keys hash to a point on the ring and are stored on the next clockwise server, enabling wrap-around for even distribution.[2]

## Virtual Nodes
Virtual nodes (vnodes) create multiple replicas per server (e.g., 150 replicas total across servers) by hashing "server:i" for i in 0 to replicas-1, improving load balance and reducing remapping to ~12.5% on node addition (e.g., 125,000 of 1M keys move from 150 to 200 vnodes).[1][2]

## Load Balancing
Distributes keys via binary search on the sorted ring to find the first position >= key hash, with wrap-around to index 0 if needed; health checks remove failed servers.[1]

## Node Addition/Removal Impact
Traditional hashing remaps ~75% of keys (750,000 of 1M) when adding a node (3→4 servers). Consistent hashing limits to ~25% (250,000 of 1M); virtual nodes further reduce to ~12.5%.[2]

## Real-World Implementations
- **DynamoDB**: Uses consistent hashing with virtual nodes and tokens on a ring; keys route to the next clockwise server via `ring.findNextClockwise(hash(key))`.[2]
- **Cassandra**: Employs consistent hashing (no specific 2026 details in results); general use minimizes movement on node changes.[3]

**Next Steps**: Implement the Python ConsistentHashBalancer from [1] (replicas=150) for a prototype; test with 3 servers adding a 4th to verify ~25% remapping on 1M keys.

**Sources**:
- [1] https://oneuptime.com/blog/post/2026-02-20-load-balancing-algorithms/view (Feb 20, 2026)
- [2] https://platformwale.blog/2026/02/19/understanding-amazon-dynamo-a-deep-dive-into-distributed-system-design/ (Feb 19, 2026)
- [3] https://blog.stackademic.com/distributed-databases-in-modern-system-design-221bc93728b1 (date not specified)
