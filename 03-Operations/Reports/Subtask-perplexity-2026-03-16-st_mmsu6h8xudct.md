# Subtask Output — Research Multi-Region Database Replication
## Model: sonar
## Stage: research
## Date: 2026-03-16

## Active-Active vs Active-Passive Comparison

Active-active architectures run production traffic simultaneously across multiple regions, directing users to the nearest region via DNS or global load balancing, with data replication maintaining consistency; this suits strict data residency needs but adds complexity in cross-region operations.[2] Active-passive setups use a primary region for all writes with replicas in secondary regions for reads or failover, as in AWS RDS/Aurora cross-region read replicas where the secondary serves reads to reduce latency and acts as a promotable DR target.[1]

| Aspect | Active-Active | Active-Passive |
|--------|---------------|----------------|
| Traffic Handling | All regions serve production traffic simultaneously[2] | Primary handles writes/traffic; secondary for reads/backup[1] |
| Examples | OCI GoldenGate bi-directional replication between US-Phoenix-1 and US-Ashburn-1; DynamoDB Global Tables[3][4] | AWS RDS/Aurora cross-region read replicas (us-east-1 primary to eu-west-1 replica)[1]; BigLake metastore primary/secondary regions[5] |
| Use Case | Global performance, data residency across jurisdictions[2] | Read latency reduction, DR promotion[1] |

## Conflict Resolution Approaches

Real-world implementations rely on service-native mechanisms: DynamoDB Global Tables handle multi-active writes with last-writer-wins or custom resolvers; OCI GoldenGate uses bi-directional replicats with mapping rules to apply changes from one region (e.g., Phoenix trail files to Ashburn database).[3][4] No explicit last-write-wins details in recent sources, but Terraform-managed S3 bidirectional replication infers bucket-level conflict handling via versioning or overwrites.[3]

## Consistency Models: Eventual vs Strong

**Strong consistency** requires every write to replicate across regions before acknowledgment, ensuring identical data but increasing latency and reducing availability during network partitions.[2] **Eventual consistency** allows immediate write success with asynchronous replication, improving performance/availability at the risk of temporary data divergence; AWS Aurora Global Database achieves <1 second replication lag.[1][2]

| Model | Trade-offs | Examples |
|-------|------------|----------|
| Strong | Low tolerance for divergence; higher latency[2] | Not recommended for multi-region due to inter-region comms dependency[2] |
| Eventual | Better perf/availability; lag risk[2] | Aurora Global (<1s lag); async RDS replicas; BigLake metastore replication[1][5] |

## Latency Optimization Strategies

Serve reads from region-proximal replicas (e.g., eu-west-1 replica for European users from us-east-1 primary) and monitor replication lag for data freshness; prefer Aurora Global over standard RDS for sub-second replication.[1] Use 20Gbps private networking for intra-region and VPN/direct connects for inter-region to minimize replication bandwidth use via async methods.[2]

**Concrete numbers**: Aurora Global Database: typically <1 second replication lag.[1]

**Next steps**:
- Deploy Terraform providers for us-east-1 (primary) and eu-west-1 (replica) as in [1].
- Test lag monitoring: Alert if >1s on Aurora metrics.

## Disaster Recovery: RPO/RTO Targets

Sources emphasize replication lag as RPO proxy (e.g., monitor DynamoDB/S3/RDS lag to quantify potential data loss); no explicit numerical RPO/RTO targets found, but promotion of cross-region replicas enables rapid failover (e.g., RDS replica to standalone DB).[1][3] BigLake supports one-click primary/secondary region switchover for Iceberg tables; Astro offers one-click cross-region failover with continuous metadata/log sync (no scheduled windows).[5][6]

**Real examples**:
- AWS RDS: Promote replica during primary outage; test in DR drills.[1]
- OCI GoldenGate: Instantaneous sync for active-active MongoDB workloads across US-Phoenix-1/US-Ashburn-1.[4]
- Astro: Enable DR at AWS cluster creation, auto-provisions secondary.[6]

**Next steps**:
- Implement Terraform for RDS/Aurora replication [1]: `provider "aws" { alias = "replica"; region = "eu-west-1"; }`.
- Set alerts on replication lag via OneUptime for all services.[3]
- Run promotion tests quarterly per best practices.[1]

**Limitations**: No sources from last 30 days (post-2026-02-23) provide exact RPO/RTO numbers (e.g., <15min); AWS outage analysis questions multi-region efficacy but lacks specifics.[7] For latest, search "AWS Aurora Global RPO 2026" or equivalent.
