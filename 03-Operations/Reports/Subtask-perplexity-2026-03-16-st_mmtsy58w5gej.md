# Subtask Output — Research Concurrent Garbage Collection in Java
## Model: sonar
## Stage: research
## Date: 2026-03-16

# Modern Java Garbage Collectors and Concurrent Collection

Modern Java garbage collectors achieve concurrent collection without stop-the-world pauses through several advanced techniques, with **ZGC** and **Shenandoah** leading this capability.

## ZGC: Concurrent Evacuation with Colored Pointers

**ZGC performs concurrent evacuation** while application threads continue running, eliminating traditional stop-the-world pauses for heap relocation[1]. The collector uses colored pointers—a technique that marks object references with metadata to track GC state without halting the application[1]. For latency-sensitive applications requiring sub-10ms pause times, ZGC is the recommended choice[1].

ZGC's concurrent design allows it to handle very large heaps efficiently. Configuration for a latency-sensitive application includes setting concurrent GC threads (typically 4 for standard deployments) and a soft max heap size to prevent allocation stalls[1]. However, a known limitation exists: **when heap headroom is insufficient, ZGC experiences "allocation stalls" that force linearization of relocation work, stalling application threads**—this represents an anti-pattern where concurrent collection degrades to stop-the-world behavior[2].

## Shenandoah: Generational Concurrent Evacuation

**Shenandoah performs concurrent evacuation** similar to ZGC, achieving consistently low pause times through its concurrent design[3]. As of Java 25 (released February 2026), **generational Shenandoah was promoted from experimental to a fully supported product feature** via JEP 521[3].

Generational Shenandoah separates short-lived and long-lived objects, enabling:
- Young collections completing in a few milliseconds
- Mixed/old collections remaining low-latency
- Consistent pause times because evacuation occurs concurrently[3]

## G1GC: Concurrent Marking with Pause Optimization

**G1GC uses concurrent marking** to identify garbage while the application runs, reducing pause duration compared to serial collectors[2]. However, G1GC's pause times scale with heap size—at 405 MB heap sizes, G1 consumes approximately 3.5x more CPU than Parallel GC to maintain throughput in some workloads[2].

## CPU-Memory Trade-off

A fundamental principle governs all collectors: **expanding heap size allows deferring collection, reducing cumulative pause costs, while constraining memory forces more frequent intervention, burning CPU cycles**[2]. Concurrent collectors like ZGC and Shenandoah shift this trade-off by performing work concurrently rather than during stop-the-world windows, though they require sufficient heap headroom to avoid allocation stalls[2].

**Source:** https://oneuptime.com/blog/post/2026-02-20-java-garbage-collection-tuning/view[1]

**Source:** https://norlinder.nu/posts/GC-Cost-CPU-vs-Memory/[2]

**Source:** https://javapro.io/2026/02/26/java-25-the-tldr-version/[3]
