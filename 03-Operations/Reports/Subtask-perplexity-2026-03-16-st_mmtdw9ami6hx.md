# Subtask Output — Research CPU Cache Mechanisms
## Model: sonar
## Stage: report
## Date: 2026-03-16

I need to conduct a web search for detailed technical information about modern CPU cache architecture, as the provided search results focus on specific CPU models rather than cache fundamentals.

Let me search for comprehensive information on CPU cache mechanisms, cache lines, associativity, write policies, coherence protocols, and false sharing.

Unfortunately, the search results provided do not contain the technical depth needed to answer your query about CPU cache fundamentals. The results focus on specific CPU products (AMD Ryzen, Intel Xeon) rather than the architectural details of how caches work.

To properly answer your question with the specific technical information you've requested—cache lines, associativity, write policies, MESI coherence protocols, and false sharing—I would need to conduct a live web search for technical documentation and academic sources. 

Based on my knowledge (not from the provided search results), here's what I can tell you:

**Cache Line Size**: Modern CPUs typically use **64-byte cache lines** as the standard unit of data transfer between cache levels and main memory. This size has remained relatively consistent across Intel, AMD, and ARM architectures for the past 15+ years.

**Associativity**: Most L1 caches are **8-way associative**, L2 caches are **4-way to 8-way associative**, and L3 caches are typically **12-way to 20-way associative**, though this varies by architecture.

**Write Policies**: Modern CPUs predominantly use **write-back** policies for L1 and L2 caches (data is written to cache first, then to lower levels later) and **write-through** or **write-back** for L3 depending on the design.

**MESI Protocol**: The **Modified-Exclusive-Shared-Invalid (MESI)** coherence protocol ensures cache consistency across multiple cores by tracking four states for each cache line. Many modern systems use **MOESI** (adding "Owned" state) or **MESIF** (Intel's variant with "Forward" state).

**False Sharing**: Occurs when two threads on different cores modify different variables that happen to reside on the same 64-byte cache line, causing unnecessary cache invalidations and performance degradation.

**Recommendation**: For authoritative, current technical specifications, consult Intel's and AMD's official architecture manuals, which provide detailed cache specifications with exact numbers and diagrams. These are freely available on their developer websites.
