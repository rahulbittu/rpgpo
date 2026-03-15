# Subtask Output — Research Distributed Consensus Principles
## Model: sonar
## Stage: audit
## Date: 2026-03-15

## Finding 1: CD-Raft Consensus Protocol (March 2026)
CD-Raft is an optimized Raft variant for cross-domain latency reduction in distributed systems, using two leader types: Domain Leader (per domain) and Global Leader (elected from Domain Leaders). In-domain consensus mirrors standard Raft with majority agreement; cross-domain commit requires majority in Global Leader's domain plus one other domain, minimizing RTT to nearest domain. Safety ensures no brain-split via election needing N-1 Domain Leaders (for N domains) and log up-to-date vs N-2 others.[1]  
**Source:** https://arxiv.org/html/2603.10555

## Finding 2: Paxos and Raft Core Principles
No 2026-specific papers or updates found on original Paxos (Leslie Lamport, 1989/1998) or Raft (Diego Ongaro/Dylan McDermott, 2014); recent searches reference them indirectly via derivatives like CD-Raft. Raft uses leader-based replication with majority quorums for commits, handling leader failure via elections; Paxos achieves consensus via propose-accept phases with majority votes. Replication lag occurs between leader commit and replica catch-up; quorums tie commit to majority replication across nodes.[5]  
**Source:** https://designgurus.substack.com/p/the-complete-replication-guide-for (no direct 2026 URLs for originals; [1] cites Raft safety via , unspecified)

## Finding 3: Blockchain Consensus Thresholds and Validators
Public permissionless blockchains use varying consensus rules like supermajority (e.g., two-thirds threshold) vs unanimity for validator agreement on transaction order; stricter thresholds enhance security but reduce capacity. Model assumes continuum of validators [0,1] with costs to contribute; global games framework analyzes incentives.[2] General definition: consensus ensures all nodes agree on shared data via mechanisms like Proof-of-Stake.[4]  
**Source:** https://www.bis.org/publ/work1335.pdf  
**Source:** https://mokshya.io/blog/blockchain-consensus-mechanisms

**No additional 2026 results found** for classic Paxos/Raft implementations, numbers (e.g., quorum sizes beyond majorities), or events like Consensus Hong Kong 2026/BCRA 2026 yielding technical details—those focus on institutional trends, not protocols.[3][6] Refine query to "Paxos Raft tutorial 2026" or "etcd Raft updates" for more.
