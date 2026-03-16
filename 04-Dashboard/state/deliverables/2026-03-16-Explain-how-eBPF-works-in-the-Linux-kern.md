# Explain how eBPF works in the Linux kernel. Cover program types, verifier safety

**Domain:** learning | **Date:** 2026-03-16 | **Subtasks:** 2



## Research eBPF in the Linux Kernel
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

## Synthesize eBPF Explanation
## Explanation

### Introduction to eBPF
eBPF (extended Berkeley Packet Filter) is a powerful technology in the Linux kernel that allows for efficient and safe execution of user-defined programs within the kernel space. It provides a mechanism for running sandboxed programs in response to events such as network packets, system calls, or tracepoints, without changing the kernel source code.

### eBPF Program Types
eBPF supports various program types, each designed for specific tasks within the kernel:

- **XDP (eXpress Data Path):** Used for high-performance packet processing at the network interface level.
- **tc (Traffic Control):** For classifying and managing network traffic.
- **tcx/ingress:** A newer type introduced in Linux 6.6+ for chaining traffic control programs. Programs can return verdicts like `TCX_NEXT` to pass control to the next program or `TCX_PASS` to accept the packet.
- **Tracing Probes (kprobes/uprobes):** For monitoring kernel and user-space function calls.
- **Socket Filters:** For filtering network packets at the socket level.

### Verifier Safety Guarantees
The eBPF verifier ensures the safety and stability of the kernel by analyzing eBPF bytecode before execution. It checks for:

- **Memory Safety:** Ensures no illegal memory access occurs.
- **Loop Safety:** Prevents infinite loops by rejecting programs with unbounded loops.
- **Execution Safety:** Ensures programs cannot crash the kernel or affect its stability.

This verification process allows eBPF programs to run with near-zero overhead while maintaining the integrity of the kernel.

### Maps for State Sharing
eBPF maps are data structures that facilitate state sharing between eBPF programs and user-space applications. They support various types, such as:

- **Per-CPU Hash Maps:** Used for storing counters and avoiding race conditions in multi-CPU environments.
- **Global Maps:** Used for tasks like connection tracking and NAT in projects like Cilium.

Maps allow for atomic updates and can store metadata such as packet length, protocol, and interface information.

### XDP for Packet Processing
XDP is a specialized eBPF program type optimized for high-speed packet processing. It operates at the earliest point in the Linux networking stack, allowing for actions like packet dropping, forwarding, or modifying with minimal latency.

## Examples

- **Traffic Control with tcx/ingress:** A program attached to `tcx/ingress` can collect statistics on incoming packets and decide their fate based on predefined rules.
- **Connection Tracking with Maps:** Cilium uses eBPF maps to maintain a global list of connections, which can be queried for real-time network insights.

## Practice Questions

1. What are the primary benefits of using eBPF over traditional kernel modules?
2. How does the eBPF verifier ensure program safety?
3. Explain the role of eBPF maps in state sharing between kernel and user-space.

## Further Reading

- **"BPF and XDP Reference Guide"** by Brendan Gregg: A comprehensive resource on eBPF programming.
- **Cilium Documentation:** For practical applications of eBPF in networking and security.

By understanding these components, you can leverage eBPF for advanced observability and security tasks, enhancing system performance and reliability.