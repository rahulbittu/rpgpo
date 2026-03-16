# Subtask Output — Research Modern JIT Compilers
## Model: sonar
## Stage: research
## Date: 2026-03-16

## Finding 1: HotSpot JVM Tiered Compilation with C1/C2 Compilers
HotSpot JVM uses **5 execution levels** (L0 to L4) and two JIT compilers: **C1 (client compiler)** for quick, low-overhead code generation with fewer optimizations, and **C2 (server compiler)** for highly optimized code with higher overhead. Execution starts at **L0 (interpreter)**; hot methods transition to **L2 (C1 with profiling)** or **L3 (C1 without profiling)** based on C2 queue pressure—preferring L2 under high load, L3 otherwise for richer profiling. Methods at L2/L3 promote to **L4 (C2)** after profiling; trivial methods may use **L1 (optimized C1 without profiling)**. C1 queue lengths adjust thresholds to prevent overload.
- Source: https://arxiv.org/html/2603.06551v1 (published 2025, empirical study on JIT performance bugs).

## Finding 2: Profile-Guided Optimization in HotSpot Tiered Compilation
Tiered compilation in HotSpot relies on **profiling data** from runtime execution to select compilation strategies per level. At **L3**, richer profiling is collected before promotion to **L4 (C2)**; policy heuristics use **C2 queue pressure** and profiling to decide L2 vs. L3 entry, with L2 methods later moving to L3 if pressure eases. This balances compilation speed, optimization depth, and runtime environment.
- Source: https://arxiv.org/html/2603.06551v1 (2025 paper detailing HotSpot levels and transitions in Figure 4).

## Finding 3: .NET Tiered JIT Compilation and Configuration
.NET supports **tiered JIT/AOT compilation** (enabled by default, configurable via `<TieredCompilation>true/false</TieredCompilation>` in MSBuild props) alongside ready-to-run images and AOT to reduce startup latency. Tier 0 (interpreter-like) vs. Tier 1 (optimized JIT) can produce varying native code, but logical behavior remains deterministic. Introduced/enhanced in .NET 6+; performance gains include low-latency GC and SIMD support.
- Source: https://learn.microsoft.com/en-us/dotnet/core/project-sdk/msbuild-props (Microsoft docs, ongoing .NET 8+ updates).
- Source: https://www.educative.io/blog/is-c-sharp-and-net-still-relevant (2026 article on .NET relevance).
- Source: https://dev.to/georgekobaidze/can-ai-generate-binary-directly-is-it-feasible-does-it-make-sense-b62 (recent dev analysis).

## Finding 4: Other Modern JIT Examples (V8, SpiderMonkey)
V8 added **Maglev** (2023, faster compilation) and **Sparkplug** (2021) alongside **TurboFan**; uses tiered approaches for warmup. SpiderMonkey (Firefox) has **Baseline Compiler** and **WarpMonkey** as two-tier JITs.
- Source: https://arxiv.org/html/2603.06551v1 (2025 comparative study, Table 1 lists subjects).

*Note: No recent (2026 or last 30 days) sources directly detail **deoptimization traps** or **OSR (On-Stack Replacement) compilation** in search results. HotSpot docs imply deopt in tier transitions (e.g., L3 to L4), but specifics unavailable here. Recommend searching OpenJDK wiki or V8 blog for updates.*
