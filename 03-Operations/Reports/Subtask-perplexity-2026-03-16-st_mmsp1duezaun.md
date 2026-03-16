# Subtask Output — Research ZAB in ZooKeeper
## Model: sonar
## Stage: research
## Date: 2026-03-16

## Finding 1: ZooKeeper Implements ZAB (ZooKeeper Atomic Broadcast) for Leader Election, Recovery, and Total Order Broadcast
Apache ZooKeeper uses **ZAB** as its core consensus protocol, combining elements of Paxos and 2PC for reliable total order delivery of state changes; it supports leader election, log recovery from disk, and broadcast via **discovery phase** (leader syncs epochs), **synchronization phase** (leader sends committed log/diff to followers), and **broadcast phase** (proposals achieve quorum acknowledgment before commit).[1]  
**Source:** https://zookeeper.apache.org/doc/current/zookeeperAdmin.html

## Finding 2: ZAB Referenced in Recent Research for Full Implementation in Consensus-in-a-Box (CBox)
A **March 2026** arXiv paper (2603.08003) details **Consensus-in-a-Box (CBox)** fully implementing ZAB (citing Hunt et al. 2010 original), with optimizations like RDMA RPC write-through replacing final Accept-phase writes, leader failure detection via RDMA-exposed heartbeat counters (smallest live replica ID elected), and QP state transitions (close old leader QP, open new).[3]  
**Source:** https://arxiv.org/html/2603.08003

## Finding 3: No Specific Implementation Metrics, Code Changes, or Benchmarks from Last 30 Days (Feb 16 - Mar 16, 2026)
Searches for "ZooKeeper ZAB implementation source code GitHub 2026", "Apache ZooKeeper ZAB updates commits performance last 30 days", and "ZAB ZooKeeper benchmarks latency numbers recent" yielded no new data like commit dates, latency ms, replica counts, or version histories post-Feb 16, 2026; core ZAB design traces to **2010** (Hunt et al.).[1][2][3]  
**Source:** https://zookeeper.apache.org/doc/current/zookeeperAdmin.html (no recent updates noted); https://www.c-sharpcorner.com/article/what-techniques-improve-data-consistency-in-distributed-databases/ (general ZAB mention, pub date unavailable); https://arxiv.org/html/2603.08003

No additional metrics (e.g., snap sync limits like **maxConcurrentSnapSyncs=10** default are config-related, not ZAB-specific benchmarks) or live code repos with 2026 changes found. For deeper dive, check ZooKeeper GitHub at github.com/apache/zookeeper (search zookeeper-server/src/main/java/org/apache/zookeeper/server/quorum package for ZAB classes like Leader.java, Follower.java).[1]
