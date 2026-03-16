# Subtask Output — Research Memory Allocators
## Model: sonar
## Stage: audit
## Date: 2026-03-16

## Arena Allocation
Arena allocators (also called monotonic or bump allocators) allocate from a pre-reserved contiguous buffer by simply advancing a pointer, enabling very fast allocation with no per-object metadata overhead. They excel in defined phases like request processing where all objects share a common lifetime, allowing bulk deallocation by resetting the pointer or releasing the entire arena in one operation.[2] In Go's runtime, arenas are fixed-size chunks: 64MB on most 64-bit systems, 4MB on Windows and 32-bit systems, 512KB on WebAssembly; programs start by mapping these into virtual memory.[3] Rust implementations handle buffer allocation, pointer advancement, alignment (e.g., to 8-byte boundaries), and automatic cleanup via the Drop trait.[4] Zig supports arena allocators natively alongside intrusive linked lists and memory-mapped I/O without unsafe abstractions.[5] Custom arenas pair with zero-heap formats like FlatBuffers or Cap'n Proto in C++ systems to avoid allocation fights during request processing.[2]

Source: https://www.educative.io/blog/cpp-system-design-interview-questions[2]; https://internals-for-interns.com/posts/go-memory-allocator/[3]; https://digitalthriveai.com/en-us/resources/web-design/guide-using-arenas-rust/[4]; https://dev.to/dimension-zero/just-what-is-zig-anyway-epa[5]

## Slab Allocators
No specific details on slab allocators found in recent search results (last 30 days prioritized). Slab allocators typically pre-allocate fixed-size slabs for objects of similar sizes to reduce fragmentation, but results lacked current implementations, benchmarks, or numbers.

Source: [no URL available; absent from results]

## Buddy Systems
No direct mentions of buddy system allocators in provided results. Buddy systems split memory into power-of-two blocks for efficient merging/splitting to combat fragmentation, common in kernels, but no 2026-specific data or examples surfaced.

Source: [no URL available; absent from results]

## Jemalloc vs tcmalloc Internals
No specific internals, benchmarks, or comparisons for jemalloc vs tcmalloc in results. These general-purpose allocators use techniques like size-class bins (jemalloc) or thread-caches (tcmalloc) for low-latency; search yielded no recent numbers, dates, or code dives.

Source: [no URL available; absent from results]

## Memory Fragmentation Mitigation
**Custom allocators** like thread-local free lists reduce contention and external fragmentation for specific workloads; polymorphic memory resources (PMR, C++17 `std::pmr`) allow runtime-swappable strategies (pool, monotonic, default) without type changes, with PMR pools offering efficient customization but needing sync for threads.[2]
- **Monotonic allocators**: Minimize internal fragmentation via bump-pointer but risk external fragmentation; low overhead, ideal for bulk dealloc phases like parsing.[2]
Arenas inherently mitigate per-object overhead and fragmentation in scoped use but can waste space if phases vary.[2][3]

| Allocator Type | Fragmentation Mitigation | Overhead | Thread Safety | Best Use |
|---------------|---------------------------|----------|---------------|----------|
| PMR Pool     | Custom strategies reduce external frag | Moderate | External sync needed | C++17+ custom apps[2] |
| Monotonic/Arena | External frag possible; bulk reset | Low (bump logic) | Not default; external sync | Scoped phases (e.g., requests)[2] |

Source: https://www.educative.io/blog/cpp-system-design-interview-questions[2]

**Note**: Searches prioritized 2026 data but results skewed to general/C++/Go/Zig explanations (no jemalloc/tcmalloc/slabs/buddies specifics). For deeper internals, target "jemalloc source 2026" or "tcmalloc fragmentation benchmarks 2026". Concrete next steps: Review Go arena code at https://internals-for-interns.com/posts/go-memory-allocator/[3]; implement C++ PMR monotonic via std::pmr::monotonic_buffer_resource for a test allocator (~50 lines).[2]
