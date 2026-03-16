# Subtask Output — Research Linux Process Scheduling
## Model: sonar
## Stage: research
## Date: 2026-03-16

# Linux Process Scheduling at the Kernel Level

## Core Scheduling Architecture

**The Completely Fair Scheduler (CFS)** is the primary CPU scheduling algorithm in modern Linux systems, introduced in kernel version 2.6.23[1][2]. CFS allocates CPU time proportionally among tasks based on priority and runtime, aiming to give each task an equal share of the CPU by creating the illusion that each task executes simultaneously on 1/n of the processor[3].

However, **EEVDF (Earliest Eligible Virtual Deadline First)** has replaced CFS as the default scheduling algorithm as of kernel version 6.6 (October 2023)[1]. While EEVDF maintains the fairness principles of CFS, it introduces a deadline mechanism specifically designed to handle lag-sensitive tasks more effectively[1].

## Nice Values and Priority Levels

The search results provided do not contain specific details about nice values or their numerical ranges in the context of CFS scheduling. However, the results indicate that CFS allocates CPU time based on **priority and runtime**[1], suggesting that priority mechanisms (including nice values) are integral to the scheduling decision process.

## Real-Time Priorities and Scheduling Classes

The search results reference **deadline scheduling class** as a distinct scheduler policy within the Linux kernel, separate from CFS[7]. This indicates that Linux supports multiple scheduling classes beyond the default CFS/EEVDF, including real-time scheduling options, though specific real-time priority ranges are not detailed in the provided results.

## Cgroups Resource Control and CPU Limits

**CPU limits in Kubernetes and Linux are implemented through the CFS bandwidth control mechanism in cgroups**[4]. The default CFS period is **100ms**, which defines the time window for CPU quota enforcement[4].

Key cgroups CPU control mechanisms include:

- **CPU throttling**: The CFS scheduler pauses a container when it has exhausted its CPU quota for the current period[4]
- **Configurable CFS period**: On Talos Linux, administrators can adjust the period (e.g., to 50ms or 20ms) for more granular scheduling, though shorter periods increase scheduler overhead[4]
- **CPU quota enforcement**: Can be enabled through kubelet configuration with the `cpu-cfs-quota` flag[4]

For latency-sensitive workloads, the recommendation is to use CPU requests without hard limits, while workloads requiring predictable CPU allocation should use the static CPU manager policy with Guaranteed Quality of Service (QoS) pods[4].

## Containers, Namespaces, and Cgroups Integration

The search results confirm that **cgroups v2 enforce CPU limits at the container level** through the CFS bandwidth control mechanism[4]. This prevents any single container from monopolizing CPU resources. However, the provided results do not contain detailed information about how namespaces specifically interact with the scheduling system or cgroups resource control.

## Recent Developments (March 2026)

A **Fair(er) DRM scheduler** patch series was submitted on March 6, 2026, implementing CFS-inspired fairness principles for GPU scheduling, with no scheduling regressions found relative to FIFO scheduling[6].

---

**Note**: The search results provided focus primarily on CFS fundamentals and cgroups CPU control. For comprehensive details on nice value ranges, real-time priority levels (SCHED_FIFO, SCHED_RR), and deeper namespace-cgroups interactions, additional kernel documentation sources would be needed.
