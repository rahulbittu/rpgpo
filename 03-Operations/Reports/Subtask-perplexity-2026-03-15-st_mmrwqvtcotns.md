# Subtask Output — Research Consensus Algorithms
## Model: sonar
## Stage: audit
## Date: 2026-03-15

## Raft Consensus Algorithm
Raft ensures all nodes in a distributed system agree on a shared log of operations by breaking consensus into three sub-problems: **leader election**, **log replication**, and **safety**. It requires a majority (quorum) of nodes to commit entries, tolerating up to *f* failures in a cluster of *2f+1* nodes; for example, in a 5-node cluster, it handles 2 failures.[2]

- **Leader election**: Nodes use randomized timeouts (150-300ms election timeout) and heartbeats to elect a leader; the leader handles all client requests.[2]
- **Log replication**: Leader appends entries to its log, replicates to followers via AppendEntries RPCs; followers acknowledge if logs match.[2]
- **Safety**: Ensures no conflicts by checking log consistency and commit indices; designed for understandability over Paxos.[2]
- **Real example**: Used in etcd (Kubernetes cluster store) for key-value storage; requires 3-7 nodes typically.[2]
- **Analogy for networking basics**: Like TCP reliable delivery—leader is the "sender" sequencing packets (log entries), followers ACK like receivers; majority ACKs commit like successful delivery.

## Paxos Consensus Algorithm
Paxos achieves consensus on a single value (single-decree) or sequence (Multi-Paxos) via propose-accept phases, using proposers, acceptors, and learners; Multi-Paxos elects a stable leader to reduce messages from 4 to 2 per decision.[2]

- **Basic flow**: Proposer sends Prepare (proposal number) to majority acceptors; if accepted, sends Accept with value; majority Accept commits.[2]
- **Multi-Paxos extension**: Separate instance per log slot; leader skips Prepare for consecutive proposals.[2]
- **Real examples**: Google Chubby (lock service), Google Spanner (across data centers), Apache Mesos (cluster manager).[2]
- **Analogy**: Like electing a group leader in a network via bids (proposal numbers)—highest unique bid wins majority votes; prevents ties via numbering.
- **FLP context**: Uses timeouts/heartbeats to detect failures, as pure async consensus is impossible with 1 crash.[2]

## ZAB (ZooKeeper Atomic Broadcast) Consensus Algorithm
ZAB provides total order broadcast for Apache ZooKeeper, ensuring strict consistency via leader-driven broadcast; used for coordination like leader election and configuration.[1][2]

- **Key phases**: Leader proposes updates, followers ACK; leader commits after majority ACKs (quorum); handles leader changes via elections.[1]
- **Differences**: Focuses on broadcast ordering over logs; supports recovery via snapshots/diffs.[1]
- **Real example**: Apache ZooKeeper (distributed coordination service); runs on 3-5 nodes (odd for quorum), e.g., Netflix uses it for service discovery.[1]
- **Analogy**: Like UDP multicast with ACKs in a LAN—leader broadcasts ordered "messages" (operations), waits for majority receipt before "delivering" to all.

## Comparisons and Practical Use
| Algorithm | Key Strength | Message Rounds (per decision) | Real-World Systems | Failure Tolerance |
|-----------|--------------|-------------------------------|--------------------|-------------------|
| **Raft** | Understandable, leader-focused | 2 (with stable leader) | etcd, Consul | f in 2f+1 nodes[2] |
| **Paxos** | Flexible, foundational | 2-4 | Chubby, Spanner[2] | f in 2f+1 nodes[2] |
| **ZAB** | Total order broadcast | 2 (quorum ACKs) | ZooKeeper[1] | f in 2f+1 nodes[1] |

All assume partial synchrony (timeouts) to beat FLP impossibility; prioritize **consistency** in CAP theorem.[1][2] No 2025-2026 updates found in results; core designs stable since 2008-2014.[2]
