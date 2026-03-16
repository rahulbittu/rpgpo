# Subtask Output — Research Garbage Collection Algorithms
## Model: sonar
## Stage: research
## Date: 2026-03-16

## Mark-and-Sweep Garbage Collection

Mark-and-sweep is a foundational GC algorithm that operates in two phases: marking live objects from roots, then sweeping unmarked (dead) objects for reclamation. It resolves dangling pointers but can cause fragmentation[2][3].

## Generational Garbage Collection

Generational GC divides the heap into generations (young/old) based on the weak generational hypothesis: most objects die young. Young generation uses fast copying collectors (e.g., minor GC); old generation uses slower methods like mark-sweep-compact. Parallel GC parallelizes this across cores, halving pause times on multi-core systems (e.g., 5% throughput boost on dual-core vs single-threaded serial GC)[3].

## Concurrent Marking

Concurrent marking performs the mark phase alongside application threads, reducing stop-the-world pauses. Used in low-latency collectors: ZGC achieves sub-millisecond pauses by concurrent marking, relocation, and reference processing; G1 uses concurrent marking with pause targets of 200ms[2][3].

## G1 vs ZGC Comparison in Java

G1 (Garbage-First, default since Java 9) balances throughput/latency for heaps up to ~16GB, targeting 200ms pauses via region-based collection and concurrent marking. ZGC (Z Garbage Collector, Java 11+) prioritizes ultra-low latency (<1ms pauses, even on 16TB heaps) with concurrent everything, but incurs higher memory overhead (colored pointers) and CPU in allocation stalls at small heaps (e.g., 405MB heap shows ZGC CPU capped by stalls vs G1's 3.5x higher CPU for throughput in Spring PetClinic)[2][3].

| Aspect | G1GC | ZGC |
|--------|------|-----|
| **Default Since** | Java 9 | Java 15 (production-ready) |
| **Pause Target** | 200ms | Sub-millisecond |
| **Heap Suitability** | Up to 16GB, balanced | TB-scale, latency-critical |
| **Strengths** | Throughput + latency balance; generational mode | Ultra-low pauses; handles large heaps efficiently (e.g., -Xms8g -Xmx8g with SoftMaxHeapSize=6g) |
| **Weaknesses** | Background CPU overhead ignored in metrics (79% cycles); higher CPU at small heaps (3.5x vs Parallel) | Higher memory overhead; allocation stalls at low headroom (e.g., 405MB) |
| **Tuning Example** | -XX:+UseG1GC (default) | -XX:+UseZGC -XX:+ZGenerational -XX:ConcGCThreads=4 (Java 21+)[2] |

**Sources**:
- [2] https://oneuptime.com/blog/post/2026-02-20-java-garbage-collection-tuning/view (Published ~Feb 2026; includes tuning scripts, GC graph)
- [3] https://norlinder.nu/posts/GC-Cost-CPU-vs-Memory/ (OpenJDK 26 analysis; Spring PetClinic benchmarks at 202MB/405MB heaps, dated ~2026)
