# Subtask Output — Research Consensus Algorithms
## Model: sonar
## Stage: research
## Date: 2026-03-16

## Raft Consensus Algorithm

Raft uses **election terms** where nodes vote for a **leader**; a leader is elected with a majority of votes (e.g., >50% of cluster nodes), becoming responsible for log replication and consensus.[1] The leader replicates logs by sending AppendEntries RPCs to followers; entries commit once a majority acknowledges them, ensuring no overwrites.[1] **Split-brain** (split-vote) occurs if multiple candidates emerge during network partitions; it's resolved by incrementing the term for a new election until one secures majority votes—if no majority, candidates remain stalled.[1][2]

- **Real-world example**: In etcd clusters on Talos Linux (Kubernetes), leader election fails due to network issues preventing heartbeats (timeout ~1 second), triggering elections; clock skew >milliseconds disrupts timeouts, causing unpredictable elections—check with `talosctl time` across nodes like 192.168.1.10-12.[2] Post-partition, minority partitions stay read-only; reconciliation happens on heal via logs like `talosctl logs etcd | grep -i "leader\|election"` (March 3, 2026).[2]
- **Cisco NSO 6.1 HA**: Leader handover via `ha-raft handover`; force reset with `ha-raft reset force` syncs to new leader non-deterministically.[1]

## Paxos Consensus Algorithm

Search results yielded no specific details on Paxos leader election, log replication, or split-brain handling from the last 30 days (post-2026-02-14). General knowledge: Paxos uses proposers, acceptors, and learners; no explicit "leader" but a distinguished proposer often acts as one via repeated proposals until majority acceptance; logs replicate via numbered proposals accepted by majority; split-brain avoided by unique ballot numbers ensuring higher ones override.

- No real-world examples, numbers, dates, or URLs in results. Alternative searches ("Paxos leader election 2026", "Paxos split-brain examples recent") returned no relevant hits.

## PBFT Consensus Algorithm

Search results contained no information on PBFT (Practical Byzantine Fault Tolerance) leader election, log replication, or split-brain scenarios.

- General knowledge (not from live search): PBFT elects a primary (leader) via view changes; leader multicasts pre-prepare/prepare/commit messages for replication, tolerating <1/3 faults; split-brain prevented by view-stabilizing messages requiring 2f+1 matching replicas (f=faults).
- No real-world examples, numbers, dates, or URLs in results. Alternative searches ("PBFT consensus recent examples 2026", "PBFT leader election mechanics") returned no relevant hits.

## Additional Variants
**CD-Raft** (cross-domain Raft, arXiv 2603.10555v1, ~March 2026): Elects **Domain Leaders** per domain (Raft-style majority) and **Global Leader** from them (needs N-1 Domain Leaders' votes, log more up-to-date than N-2 others for N domains); replication: Domain Leader replicates in-domain to majority, Global Leader coordinates across; **split-brain** prevented by non-empty intersection of election/decision nodes and strict commit (majority in Global Leader's domain +1 other).[3]

**Next Steps**:
- Review etcd troubleshooting: Run `talosctl logs etcd -f | grep -i "leader"` on Talos clusters for replication issues.[2]
- Test Raft in code: Use seaweedfs/raft (updated May 2023, GitHub move July 2022) for leader election/log files like `append_entries.go`.[4]
- For Paxos/PBFT gaps: Search academic repos like arXiv for "Paxos PBFT 2026 implementations".
