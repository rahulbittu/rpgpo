# Subtask Output — Research eBPF in the Linux Kernel
## Model: sonar
## Stage: research
## Date: 2026-03-16

## eBPF Program Types
eBPF supports multiple program types for kernel attachment, including **tcx/ingress** for traffic control chaining (introduced in Linux 6.6+), **tc** for classifiers, and others like XDP, tracing probes (kprobes/uprobes), and socket filters.[4] TCX enables composable chains where programs return verdicts like **TCX_NEXT** (-1) to pass to the next program or **TCX_PASS** (0) for acceptance, as shown in this example code:
```
SEC("tcx/ingress")
int tcx_stats(struct __sk_buff *skb) {
    // stats collection
    return TCX_NEXT;
}
```
[4]

## Verifier Safety Guarantees
The eBPF **verifier** is a kernel component that statically analyzes bytecode before loading, ensuring programs cannot crash the kernel, access invalid memory, or loop infinitely—unlike kernel modules.[1][2] It enforces sandboxing by rejecting unsafe code (e.g., unbounded loops or invalid exits), providing near-zero overhead execution with safety; programs run in a virtual machine without modifying kernel source.[1][2][3]

## Maps for State Sharing
eBPF **maps** enable state sharing between kernel programs and user-space, such as per-CPU hash maps for counters (e.g., `__u64 stats_hits`) to avoid races in multi-CPU setups.[4] Examples include global BPF maps for connection tracking (`cilium bpf ct list global`) and NAT (`cilium bpf nat list`) in Cilium, queried via `wc -l` for utilization.[6] Maps support atomic updates and are used for logging metadata like packet length, protocol, and interface index.[4]

## XDP for Packet Processing
**XDP** (eXpress Data Path) is an eBPF program type for high-performance packet processing at the driver level, enabling drops, redirects, or edits before kernel stack processing.[2] It's foundational for networking in tools like Cilium (used in GKE Dataplane V2), replacing iptables for scalable Kubernetes routing and policies.[2][6] Recent TCX builds on similar ingress/egress hooks for loopback interfaces (e.g., `sudo ./tcx_demo -i lo` on Linux 6.6+).[4]

## Practical Use Cases in Observability
- **Performance tracing**: Attach to kprobes for low-overhead CPU/memory/IO analysis; e.g., DTrace uses eBPF for kernel tracing on Intel/AMD/ARM (available for years, installs as userland package).[1][5]
- **Kubernetes monitoring**: Cilium's `cilium monitor --type drop` or `--from-endpoint EP_ID` for real-time traffic; OpenTelemetry eBPF for zero-code telemetry.[6][7]
- Adopted by **Google, Meta, Netflix, Cloudflare** for near-zero overhead observability.[3]

## Practical Use Cases in Security
- **Policy enforcement**: Dynamically insert kernel policies for syscall blocking, pod communication (Kubernetes network policies), and packet filtering.[1][2]
- **GKE Dataplane V2**: Cilium eBPF replaces iptables for scalable security; debug with `cilium endpoint regenerate EP_ID` or `cilium bpf` map checks.[6]
- **Real-time sandboxing**: Custom filtering without user-space overhead.[1]

**Next Steps**:
- Compile/run TCX example: `cd bpf-developer-tutorial/src/50-tcx; make; sudo ./tcx_demo -i lo` (requires Linux 6.6+, libbpf).[4]
- Install eBPF DTrace on Oracle Linux: `sudo dtrace -s script.d`.[5]
- Debug Cilium: `kubectl exec -n kube-system $CILIUM_POD -- cilium monitor --related-to IP_ADDRESS`.[6]
