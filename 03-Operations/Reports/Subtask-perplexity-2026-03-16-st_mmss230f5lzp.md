# Subtask Output — Research Kubernetes Scheduling
## Model: sonar
## Stage: research
## Date: 2026-03-16

## Kubernetes Scheduler Algorithm
Kubernetes uses a two-step scheduling process: **filtering** (selecting feasible nodes via predicates like resource availability, node affinity, taints/tolerations) followed by **scoring** (ranking nodes using plugins like NodeResourcesMostAllocated, NodeResourcesLeastAllocated, NodeResourcesBalancedAllocation, ImageLocality). Scoring functions assign weights to objectives like resource packing or spreading; for example, NodeResourcesBalancedAllocation weights CPU and memory equally (weight: 1 each) in custom configs.[3][4] Default scheduler scores 50-100% of nodes tunable via `--percentage-of-nodes-to-score: "50"` for faster decisions in large clusters.[4]

## Resource Requests vs Limits
**Requests** define minimum CPU/memory for scheduling (e.g., used in NodeResourcesBalancedAllocation scoring); **limits** cap maximum usage but don't affect placement directly—unspecified limits allow pods to consume node totals, causing JVMs to detect all node CPUs (e.g., 32 on a beefy node).[6] Tune JVMs with `-XX:ActiveProcessorCount` set to requests value (e.g., =2 or =3 based on measurements) to match perceived CPUs, improving predictability; monitor tail latency, GC pressure, JVM threads during gradual tuning.[6]

## Pod Affinity/Anti-Affinity
Not directly detailed in recent results; Kubernetes docs (pre-2026) use required/preferred topology keys (e.g., zone, host) for co-location (affinity) or spreading (anti-affinity). Recent GPU contexts imply integration with gang scheduling via Volcano/YuniKorn PodGroups for all-or-nothing allocation.[2] No new 2026 specifics found.

## Taints/Tolerations
Scheduler evaluates **taints** (node repels pods unless **tolerations** match) during filtering alongside resources, affinity, topology.[4] Example: Dedicate nodes via taints for GPU workloads; tolerations allow specific pods.[2] Configurable in scheduler profiles under plugins.[4]

## Priority Preemption
Not explicitly covered in results; standard Kubernetes uses **PriorityClasses** (e.g., system-critical: 1000000) for preemption—higher priority pods evict lower ones if unschedulable. Recent RL research tunes scoring weights (up to 33% improvement over defaults) but doesn't alter core preemption.[3] No 2026 updates found.

## Recent Research (2026)
- **AGMARL-DKS** (Mar 2026): RL-based scheduler outperforms default Kubernetes in GKE on fault tolerance/utilization/cost for batch workloads; uses MADD4PG with node agents.[1] Source: https://arxiv.org/html/2603.12031v1
- **RL Scoring Tuning** (Mar 2026): Learns weights for MostAllocated/LeastAllocated/RequestedToCapacityRatio; +33% vs default, +12% vs baselines on FaaS clusters.[3] Source: https://arxiv.org/html/2603.10545v1

**Next Steps**: Test custom scheduler config from Talos example on GKE (deploy YAML to /etc/kubernetes/scheduler-config.yaml, set extraArgs).[4] Source: https://oneuptime.com/blog/post/2026-03-03-set-scheduler-extra-args-in-talos-linux/view. Benchmark vs default using AGMARL-DKS stress tests.[1]
