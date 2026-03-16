# Subtask Output — Research Linux Networking Stack
## Model: sonar
## Stage: research
## Date: 2026-03-16

I need to conduct a web search to find current, specific information about Linux networking stack packet processing with the technical depth you've requested. The provided search results cover some networking tuning but lack the comprehensive packet processing flow details, eBPF/XDP specifics, and current 2026 information you need.

Let me search for this information now.

Based on the search results provided, I can offer partial coverage of your query, but I must be transparent: **the provided results do not contain comprehensive information about the complete Linux networking stack packet processing flow, eBPF/XDP performance tuning, or current 2026-specific data on these topics.**

Here's what the results do cover:

## Interrupt Handling and CPU Distribution

**RPS (Receive Packet Steering)** distributes incoming packet processing across multiple CPU cores using software-based hashing when hardware RSS (Receive Side Scaling) is unavailable[1]. The system monitors softirq distribution with `cat /proc/softirqs | grep NET_RX`[1], and you can tune the per-CPU backlog queue by increasing `net.core.netdev_budget` from the default 1000 to 5000 packets for high-traffic servers[1].

**IRQ Affinity** pins NIC interrupt handlers to specific CPU cores to reduce cache misses, checked via `cat /proc/interrupts | grep eth0`[2]. On multi-socket NUMA systems, NIC interrupts should be handled by CPUs on the same NUMA node as the NIC for optimal memory access performance[2].

## Packet Processing Optimization

**TSO/GSO/GRO Offloading** reduces CPU load on high-throughput servers—check offload settings with `ethtool -k eth0`[2]. **XPS (Transmit Packet Steering)** maps TX queues to specific CPUs to reduce lock contention on transmit[3].

For connection tracking, the search results highlight a critical bottleneck: **conntrack exhaustion** occurs under heavy loads when the Linux kernel maintains massive connection tracking tables for NAT. Modern OpenShift networking eliminates this by adopting stateless routing through CUDN and BGP, removing the NAT tax entirely and allowing significantly higher packet-per-second (PPS) rates[4].

## What's Missing

The provided results do **not** include:
- Detailed sk_buff structure and lifecycle documentation
- NAPI (New API) polling mechanism specifics
- Netfilter hook chain details
- eBPF and XDP program examples or performance benchmarks
- Current 2026 kernel versions and their networking improvements
- Real-world eBPF/XDP performance metrics

**To get the comprehensive, current information you need on sk_buff handling, NAPI polling, Netfilter hooks, and eBPF/XDP performance tuning, you would need additional web searches specifically targeting:**
- Linux kernel networking documentation (kernel.org)
- eBPF/XDP performance case studies from 2025-2026
- Cilium or Calico networking stack documentation
- Recent kernel release notes (6.x series)

The results provided focus on tuning and optimization rather than the foundational packet processing architecture you're asking about.
