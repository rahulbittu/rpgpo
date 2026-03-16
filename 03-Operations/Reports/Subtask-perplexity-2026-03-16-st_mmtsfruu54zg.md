# Subtask Output — Research Kubernetes Scheduling
## Model: sonar
## Stage: research
## Date: 2026-03-16

## Pod Affinity in Kubernetes Scheduling

**Pod affinity attracts pods to nodes running other pods with matching labels, enabling co-location for low-latency services, while resource requests guide node selection based on available CPU/memory capacity.** The Kubernetes scheduler evaluates these during pod placement: affinity as a soft/hard preference, and requests as a hard requirement to fit within node allocatable resources.[1][4]

### Key Mechanisms
- **Pod Affinity Types**: 
  - **RequiredDuringSchedulingIgnoredDuringExecution** (hard): Pod must schedule on matching nodes or fail.
  - **PreferredDuringSchedulingIgnoredDuringExecution** (soft): Prefers matching nodes but allows fallback.[1][3]
- **Interaction with Resource Requests**: Scheduler first filters nodes by resource requests (e.g., `resources.requests.cpu: "500m"` and `resources.requests.memory: "1Gi"`), then scores by affinity rules. Requests ensure pod fits node capacity before affinity influences final choice.[4]

### Real Examples
```
apiVersion: apps/v1
kind: Deployment
spec:
  template:
    spec:
      affinity:
        podAffinity:
          requiredDuringSchedulingIgnoredDuringExecution:
          - labelSelector:
              matchExpressions:
              - key: app
                operator: In
                values: ["data-service"]
            topologyKey: kubernetes.io/hostname
      containers:
      - name: compute-pod
        resources:
          requests:
            cpu: "1"
            memory: "2Gi"
```
This YAML co-locates `compute-pod` on nodes with `data-service` pods (hostname topology), but only if node has ≥1 CPU/2Gi RAM free.[1]

- **Anti-Affinity Example** (complements affinity): Spread database replicas:
```
podAntiAffinity:
  preferredDuringSchedulingIgnoredDuringExecution:
  - weight: 100
    podAffinityTerm:
      labelSelector:
        matchLabels:
          app: db
      topologyKey: topology.kubernetes.io/zone
```
Prevents replicas on same zone, combined with requests like `cpu: "2"` for resource-intensive DB pods.[1][2]

### Best Practices
- **Use Pod Affinity For**:
  - Tightly-coupled microservices (high inter-communication).[1]
  - Data locality: Place compute near data pods to cut transfer costs.[1]
  - Hardware sharing: GPUs/accelerators on same node.[1]
- **Combine with Resource Requests**:
  - Always specify requests/limits to avoid OOM kills and enable efficient bin-packing; e.g., request exact observed usage like 500m CPU for steady workloads.[4]
  - Delay PVC provisioning with `WaitForFirstConsumer` to respect affinity/anti-affinity during scheduling.[6]
- **Avoid Affinity When**:
  - Large-scale deployments (reduces scheduling options).[1]
  - Resilience-critical apps (risks failure concentration).[1]
- **Enhancements in Recent Versions** (up to 1.36, early 2026):
  - Dynamic resource mutation in suspended Batch Jobs (CPU/Memory/GPU requests adjustable pre-unsuspend).[5]
  - Node affinity for zone-specific rules: `nodeAffinity.requiredDuringSchedulingIgnoredDuringExecution.nodeSelectorTerms.matchExpressions.key: topology.kubernetes.io/zone`.[3]

**Next Steps**:
1. Test in minikube: Apply sample YAML, `kubectl get pods -o wide` to verify placement.
2. Monitor: Use `kubectl describe pod` for scheduling events; tune requests via metrics (e.g., Prometheus).
3. Scale: Integrate with topology spread constraints for even distribution beyond binary affinity.[1]

Sources:  
- [1] https://cast.ai/blog/mastering-topology-spread-constraints-and-pod-affinity/  
- [2] https://cast.ai/blog/kubernetes-taints-and-tolerations/  
- [3] https://www.youtube.com/watch?v=CeCZdrBvnj4  
- [4] https://kubernetes.io/docs/concepts/workloads/pods/  
- [5] https://cloudsmith.com/blog/kubernetes-1-36-what-you-need-to-know  
- [6] https://www.devopsdigest.com/building-kubernetes-infrastructure-that-survives-production
