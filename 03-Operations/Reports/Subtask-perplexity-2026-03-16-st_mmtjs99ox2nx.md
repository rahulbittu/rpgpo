# Subtask Output — Research Kubernetes Networking Components
## Model: sonar
## Stage: research
## Date: 2026-03-16

# Kubernetes Networking Components: Current State (March 2026)

## Core Networking Architecture

Kubernetes networking operates through a **layered model of pods, services, and ingress** to route traffic within and into the cluster[1]. Every pod receives its own IP address, and all containers within a pod share that network namespace. The foundation assumes a **flat network where every pod can communicate with every other pod**, regardless of which node it's on, enabled by the Container Network Interface (CNI)[1].

## CNI Plugins and Pod-to-Pod Communication

**Common CNI implementations** include Calico, Cilium, and Flannel[1]. For cross-node pod communication, Calico uses VXLAN encapsulation in its default mode: when Pod A (192.168.1.4 on Node 1) sends traffic to Pod B (192.168.2.5 on Node 2), Felix programs a route on Node 1 (`192.168.2.0/26 via 10.0.0.2 dev vxlan.calico`), and the kernel encapsulates the packet in VXLAN (UDP/4789) before Node 2 decapsulates and delivers it[3].

## Service Discovery and Load Balancing

Services abstract away pod volatility through **DNAT (Destination Network Address Translation)** using iptables or eBPF to route traffic from a ClusterIP (e.g., 10.96.0.1:80) to backend pods[3]. The search results reference kube-proxy's role in implementing load balancing through these mechanisms, though specific implementation details for CoreDNS service discovery are not detailed in the provided sources.

## Ingress Controllers and Traffic Management

**Ingress-Nginx is retiring** as Kubernetes 1.36 launches on April 22, 2026[4]. Research indicates that roughly **half of all cloud-native environments rely on NGINX Ingress Controllers today**[5]. External traffic typically enters via a LoadBalancer, hits an Ingress Controller, and is routed to the appropriate service and pod[1].

The ecosystem is shifting toward **Gateway API**, defined as an "expressive and role-oriented" successor to Ingress that delivers more sophisticated routing management, better traffic splitting, and multi-tenant networking[4]. However, Gateway API adoption is still evolving, and **migration paths are not always one-to-one**—Gateway API today does not provide one-for-one mapping for many ingress annotations, requiring a phased approach[5].

## Network Policies

The search results do not contain specific details about network policies implementation. This represents a gap in the provided sources.

## Recent Kubernetes 1.36 Enhancements (April 2026)

**Kubelet PodResources API expansion** now bridges visibility gaps for external monitoring tools like Prometheus and NVIDIA's DCGM exporter. The feature extends monitoring to include DRA (Dynamic Resource Allocation) hardware such as GPUs or FPGAs, with a guaranteed **99.9% success rate** for `Get` and `List` requests and P99 latency under 100ms[2].

**IP address validation improvements** use ratcheting validation to prevent new invalid entries without breaking existing workloads, ensuring consistency between Kubernetes and underlying network plugins (Calico and Cilium)[2].

## Enterprise Networking Trends

Modern ingress architectures are evolving from cluster-level routing tools into **cross-environment application access layers** supporting hybrid infrastructure (VMs, containers, edge, and AI workloads)[5]. Platform teams are implementing zero trust networking with controlled ingress and egress, GitOps-driven configuration using Argo CD or Flux, and automated node provisioning with Karpenter[6].

---

**Note:** The search results provided do not include comprehensive details on CoreDNS service discovery mechanics or detailed kube-proxy load balancing algorithms. For complete coverage of these components, additional sources would be needed.
