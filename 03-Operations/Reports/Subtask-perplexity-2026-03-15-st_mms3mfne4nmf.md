# Subtask Output — Research CAP theorem, PACELC, and consistency models
## Model: sonar
## Stage: research
## Date: 2026-03-15

## CAP Theorem
The **CAP theorem** states that in a distributed system, it is impossible to simultaneously guarantee **consistency** (every read receives the most recent write or an error), **availability** (every request receives a response, without guarantee that it contains the most recent write), and **partition tolerance** (the system continues to operate despite arbitrary message delays or failures that partition the network).[1][2] Partition tolerance is mandatory in real-world distributed systems due to unavoidable network failures, forcing a choice between consistency (CP systems reject requests during partitions to avoid stale data) or availability (AP systems serve possibly stale data).[1][2]

- **CP systems** (e.g., prioritize consistency): Use quorums or leader-based replication; refuse operations without agreement, resulting in errors/timeouts but no split-brain state.[2]
- **AP systems** (e.g., prioritize availability): Serve requests from available nodes, resolving inconsistencies later via convergence.[1]
- **CA systems** (consistency + availability): Rare, as they assume no partitions; typically single-data-center setups.[1]

Source: https://www.systemdesignhandbook.com/blog/cap-theorem-in-distributed-systems/[1]; https://blog.levelupcoding.com/p/cap-theorem-explained[2]

## PACELC Theorem
**PACELC** extends CAP by addressing latency trade-offs: if there is a partition (P), choose between consistency (C) and availability (A); else (E, normal operation), choose between consistency (C) and lower latency (L).[3] It replaces binary partition tolerance with quantitative apparent latency (CAL theorem reference), reducing visible "soft partitions" via technologies like Open Atomic Ethernet (OAE), which uses bisynchrony and mesh topologies for nanosecond fault healing.[3]

Source: https://arxiv.org/abs/2602.21182[3]

## Consistency Models in Distributed Systems
Consistency models define guarantees for reads/writes across replicas:
- **Strong consistency**: All reads see the latest write (e.g., via synchronous replication, ACID transactions); higher latency, used in banking/inventory.[5]
- **Eventual consistency**: Replicas converge over time if no new writes; prioritizes availability.[1][2]
Trade-offs balance business needs: strong consistency for accuracy-critical apps (e.g., finance), eventual for high uptime (e.g., social feeds).[5]

Source: https://www.tencentcloud.com/techpedia/141862[5]; https://www.systemdesignhandbook.com/blog/cap-theorem-in-distributed-systems/[1]

## Real-World Applications: Cassandra, CockroachDB, Spanner

| Database | CAP Classification | Key Features & Examples | Trade-offs & Use Cases |
|----------|---------------------|--------------------------|------------------------|
| **Cassandra** | AP (Availability + Partition Tolerance) | Tunable consistency (e.g., quorum reads/writes); eventual consistency by default; handles high write throughput. Used for Netflix recommendations (serves stale data during partitions, converges later).[1][6] | Sacrifices strong consistency for 99.9%+ availability; no results found for 2026-specific metrics. |
| **CockroachDB** | CP (Consistency + Partition Tolerance); supports tunable models | Serializable strong consistency via Raft consensus; multi-region replication. Powers Cockroach Labs' internal services for financial workloads requiring ACID.[6] | Rejects writes during partitions; lower availability but zero stale reads. |
| **Spanner** | CP with external consistency; TrueTime for global clocks | Strong consistency across datacenters via Paxos + atomic clocks; used by Google Ads (handles 10B+ QPS, 99.999% availability outside partitions).[6] | Higher latency (15ms reads) for global consistency; no 2026 updates found. |

**Next Steps**:
- Test CAP trade-offs: Deploy Cassandra locally (docker run --name cassandra -p 9042:9042 cassandra:4.1) and simulate partitions with Chaos Mesh.
- Read PACELC deep-dive: Review arXiv:2602.21182 for OAE implementation (23 pages, code potential via GitHub search).
- Benchmark: Use YCSB on CockroachDB vs. Spanner free tiers for your data engineering workloads.

**Search Gaps**: No results found for "PACELC Cassandra CockroachDB Spanner 2026" or "consistency models updates March 2026"; limited 2026-specific examples beyond arXiv paper. Refine with "database CAP benchmarks 2026". 

Sources: https://www.systemdesignhandbook.com/blog/cap-theorem-in-distributed-systems/[1]; https://blog.stackademic.com/distributed-databases-in-modern-system-design-221bc93728b1[6]; https://arxiv.org/abs/2602.21182[3]
