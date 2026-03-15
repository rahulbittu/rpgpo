# Subtask Output — Research CAP Theorem
## Model: sonar
## Stage: research
## Date: 2026-03-15

## CAP Theorem Principles
The **CAP theorem**, formulated by Eric Brewer in 2000 and proven by Gilbert and Lynch in 2002, states that a distributed system cannot simultaneously guarantee **Consistency (C)**, **Availability (A)**, and **Partition Tolerance (P)** during network partitions[3][2]. 

- **Consistency (C)**: All nodes see the same data at the same time; every read receives the most recent write[3].
- **Availability (A)**: Every request to a non-failing node receives a response, even if not the latest data[3].
- **Partition Tolerance (P)**: The system continues operating despite network communication failures between nodes; real-world systems must prioritize P, forcing a choice between C and A[1][3].

## Implications
During partitions, systems choose between **CP** (consistency over availability, e.g., blocking requests until data syncs) or **AP** (availability over consistency, e.g., allowing stale reads)[3][4]. Partition tolerance is non-negotiable in distributed systems, making full CAP impossible; trade-offs include higher latency in CP systems or temporary inconsistencies in AP systems[1][4]. Brewer later nuanced it as a spectrum, not strict binary, but P remains mandatory[3].

## Examples in Distributed Databases
- **CP Systems** (e.g., traditional ACID-compliant SQL databases like PostgreSQL with synchronous replication): Prioritize consistency via quorum writes (e.g., majority acknowledgment before commit); reject reads/writes during partitions to avoid stale data. Trade-off: Reduced availability, higher latency (e.g., banking transfers delay until all replicas sync)[3][4].
- **AP Systems** (e.g., Cassandra, DynamoDB): Use eventual consistency with asynchronous replication; serve stale data during partitions, resolving conflicts later. Trade-off: High availability for social feeds or catalogs, but temporary inconsistencies (e.g., users see old product stock)[4].
- **Blockchain Applications** (e.g., Bitcoin, Ethereum protocols): Accept AP-like behavior with partition tolerance; continue operating during forks (inconsistent views), resolving via longest chain (reversing shallow transactions). Finality is probabilistic—deeper blocks (e.g., 6+ confirmations) reduce reversal risk to near-zero[1].

## Recent Discussions (2026)
- On March 6, 2026, Tencent Cloud article emphasized business-driven CAP choices: High-consistency for finance (synchronous ACID transactions); high-availability for feeds (async replication with caching)[4].
- No results found for CAP theorem updates or new proofs post-2022 in last 30 days (searched Feb 13–Mar 15, 2026).

**Next Steps**: Test CAP trade-offs in a local cluster—deploy Cassandra (AP) vs. MongoDB (configurable CP/AP) using Docker; simulate partitions with tc/netem (e.g., 50% packet loss for 30s) and measure latency/consistency via YCSB benchmark[3].
