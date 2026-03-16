# Subtask Output — Research Distributed Lock Implementations
## Model: sonar
## Stage: research
## Date: 2026-03-16

## Redis Redlock

Redis Redlock implements distributed locks using multiple independent Redis instances (typically 5+), requiring a majority (e.g., 3/5) to acquire the lock with TTL-based expiration via `SET key value NX EX` or Redlock algorithm.[1][2] Failure modes include clock skew causing premature TTL expiry, network partitions allowing dual locks, and vulnerability to garbage collection pauses or high latency, making it unsafe for safety-critical use per debates like "Is Redlock safe?"[2][3] Most appropriate for short-lived, high-throughput locks (e.g., <1s duration) in non-critical caching scenarios, not coordination; configure Istio with `maxConnections: 300`, `connectTimeout: 1s`, `tcpKeepalive: 30s/10s` for mesh reliability.[1]

## ZooKeeper

ZooKeeper uses ZAB (ZooKeeper Atomic Broadcast) protocol for strong consistency, implementing locks via ephemeral sequential znodes with Watcher notifications for the lowest-numbered node to proceed.[1][3][4] Failure modes: session timeouts from proxy latency (mitigate with Istio `outlierDetection.consecutive5xxErrors: 0`, `connectTimeout: 2s`, aggressive keepalives 30s/10s), split-brain in minority partitions without fencing tokens.[1][3] Most appropriate for leader election, configuration management, service discovery in high-availability clusters (used by Kafka, HBase, Hadoop, Solr); ideal for metadata/coordination needing linearizability.[3]

## etcd

etcd leverages Raft consensus for distributed locks via leases (TTL-associated keys auto-delete on expiry) and transactions with revision numbers as fencing tokens.[1][3][4] Failure modes: lease renewal failures from network issues or sidecar interference (scope Istio sidecar to etcd service), watch stream desyncs without global revisions.[1][3] Most appropriate for flat key-value coordination like group membership or queues in Kubernetes environments (simpler gRPC API than ZooKeeper); prefer over Redis for correctness in consensus-required scenarios.[3][4]
