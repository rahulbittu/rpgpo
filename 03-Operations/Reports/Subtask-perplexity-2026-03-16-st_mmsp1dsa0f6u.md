# Subtask Output — Research Raft in CockroachDB
## Model: sonar
## Stage: research
## Date: 2026-03-16

## Finding 1: CockroachDB Uses Raft for Consensus with Majority Quorum (2 out of 3 Nodes)
CockroachDB implements Raft to ensure strong consistency in active-active replication, confirming writes only after a majority quorum—typically **2 out of 3 nodes**—acknowledges them, enabling recovery from network partitions in under **20 seconds**. This supports multi-active availability where reads and writes occur from every node without conflicts.[1]  
**Source:** https://www.serverion.com/uncategorized/active-active-replication-high-availability/

## Finding 2: CockroachDB Among Real-World Raft Adopters Since 2014
Raft, introduced in **2014**, powers CockroachDB's distributed consensus for leader election, log replication, and safety, alongside systems like Etcd, YugabyteDB, and TiDB; CockroachDB is cited as reference  in this **March 2026** arXiv paper on CD-Raft optimizations.[2]  
**Source:** https://arxiv.org/html/2603.10555v1

No additional specific details on CockroachDB's Raft implementation (e.g., code repositories, commit dates, performance benchmarks, or version histories from the last 30 days) found in results. Searched alternatives like "CockroachDB Raft implementation GitHub source code" and "CockroachDB kvraft details 2026" yielded no further relevant hits with numbers/dates/URLs. For deeper dive, check CockroachDB's official GitHub repo at github.com/cockroachdb/cockroach (kv/raft package).[2]
