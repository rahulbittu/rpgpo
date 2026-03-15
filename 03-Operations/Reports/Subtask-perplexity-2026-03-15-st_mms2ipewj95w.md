# Subtask Output — Research Kubernetes Networking
## Model: sonar
## Stage: research
## Date: 2026-03-15

## Calico Networking and Network Policies
Calico's architecture handles pod creation, network policy application, and cross-node routing via components like Felix, BIRD, Typha, and CNI plugins. For a new pod, kubelet calls CNI to allocate IP (e.g., 10.0.1.5 from IPPool), creates veth pair, notifies Felix to add host routes and policy rules in iptables/eBPF dataplane, and exports routes via BGP.[1]  
Cross-node packet from Pod A (10.0.1.5 on Node 1) to Pod B (10.0.2.5 on Node 2) routes via Felix policy check, BGP-learned routes, to Node 2's cali<hash> device.[1]  
**Source:** https://oneuptime.com/blog/post/2026-03-13-calico-networking-architecture-map-traffic/view (Published March 13, 2026)

## Ingress and Gateway API Transition
Roughly half of cloud-native environments use NGINX Ingress Controllers, now transitioning to Gateway API for extensible routing, policy enforcement, and GitOps alignment; no one-for-one annotation mapping requires phased migration.[2]  
Gateway API supports hybrid infrastructures (containers, VMs, AI, edge) as a unified "front door" for consistent routing, security, observability, reducing fragmentation.[2][4]  
Ingress evolves beyond cluster routing to cross-environment access with location-agnostic policies.[2][4]  
**Source:** https://thecuberesearch.com/kubernetes-networking-enters-a-transition-moment-as-ingress-architectures-evolve/ (2026)[2]; https://www.efficientlyconnected.com/kubernetes-networking-enters-a-transition-moment-as-ingress-architectures-evolve/ (2026)[4]

## Services and Pod Networking
In EKS, pods on different nodes (e.g., node 1 and node 4) communicate via local pod networks independent of node networks, using VPC, subnets, security groups, load balancers, and ingress setup.[5]  
Internal platforms standardize on managed K8s (EKS/AKS/GKE) with zero-trust networking, controlled ingress/egress via GitOps (Argo CD/Flux), private clusters.[3]  
**Source:** https://www.youtube.com/watch?v=vA4deYQST8Q (2026 EKS Guide)[5]; https://www.vcluster.com/blog/building-an-internal-kubernetes-platform (2026 Guide)[3]

## Network Policies and Multi-Tenancy
Network policies with RBAC, quotas, Kyverno/OPA enable namespace isolation in shared clusters; vClusters provide stronger isolation with private node groups, Karpenter provisioning.[3]  
Calico applies policies per endpoint via Felix programming dataplane rules during pod creation or updates.[1]  
Kubernetes-native firewalls and eBPF enhance policy enforcement in zero-trust setups.[7]  
**Source:** https://www.vcluster.com/blog/building-an-internal-kubernetes-platform (2026)[3]; https://oneuptime.com/blog/post/2026-03-13-calico-networking-architecture-map-traffic/view (March 13, 2026)[1]; https://www.anantacloud.com/post/kubernetes-security-in-2026-modern-threats-and-how-to-defend-against-them (2026)[7]

## Service Mesh (Implied via Gateways and AI)
No direct 2026 service mesh (e.g., Istio/Linkerd) results; AI Gateway WG proposes semantic routing, caching, RAG integration, TLS/cross-cluster routing via declarative processors for AI inference—extends Gateway API for service-like mesh features.[6]  
**Source:** https://www.kubernetes.dev/blog/2026/03/09/announcing-ai-gateway-wg/ (March 9, 2026)

No recent (post-Feb 2026) results on core service mesh implementations; refined search suggested: "Istio 2026 updates" or "Linkerd Kubernetes 2026".
