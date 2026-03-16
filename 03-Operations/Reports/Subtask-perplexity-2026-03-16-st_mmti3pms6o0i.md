# Subtask Output — Research GPU Computing for Non-Graphics Workloads
## Model: sonar
## Stage: audit
## Date: 2026-03-16

# GPU Computing for Non-Graphics Workloads: CUDA Programming Model Deep Dive

I'll search for current technical information on CUDA architecture, thread execution models, and performance optimization strategies.

---

## Finding 1: CUDA Thread Block Architecture and Warp Execution Model

**Details:**
NVIDIA's CUDA programming model organizes threads into blocks, which are then grouped into grids. The fundamental execution unit is the **warp** — a group of 32 threads that execute in lockstep on modern NVIDIA GPUs (Ampere, Hopper, and Blackwell architectures).

- **Warp size:** 32 threads (constant across all modern NVIDIA GPUs)
- **Thread block dimensions:** Up to 1,024 threads per block (configurable as 1D, 2D, or 3D)
- **Warp execution:** All 32 threads in a warp execute the same instruction simultaneously; divergent code paths cause serialization (performance penalty)
- **Occupancy:** The ratio of active warps to maximum possible warps per streaming multiprocessor (SM). Higher occupancy generally improves performance by hiding memory latency

**Key constraint:** If your code has conditional branches where threads in the same warp take different paths, execution serializes. For example, an `if-else` statement where half the warp takes one branch and half takes another will execute both branches sequentially.

Source: https://docs.nvidia.com/cuda/cuda-c-programming-guide/

---

## Finding 2: Shared Memory and Memory Hierarchy Optimization

**Details:**
CUDA GPUs have a multi-level memory hierarchy. Shared memory is on-chip, low-latency memory shared among threads within a single block.

- **Shared memory per block:** 96 KB (Ampere/Hopper), configurable between L1 cache and shared memory
- **Latency:** ~5 cycles (shared memory) vs. ~400-800 cycles (global memory)
- **Bandwidth:** ~8 TB/s (shared memory on Hopper H100) vs. ~2 TB/s (global memory on H100)
- **Bank conflicts:** Shared memory is organized into 32 banks. If multiple threads in a warp access the same bank simultaneously, access serializes. Stride patterns matter: sequential access (thread i accesses bank i) is optimal; stride-2 access causes 2-way bank conflicts.

**Practical example:** Matrix multiplication (GEMM) kernels use shared memory to tile input matrices, reducing global memory traffic by 10-100x depending on tile size.

Source: https://docs.nvidia.com/cuda/cuda-c-programming-guide/#shared-memory

---

## Finding 3: Memory Coalescing and Global Memory Access Patterns

**Details:**
Memory coalescing determines how efficiently threads access global memory. When threads in a warp access consecutive memory addresses, the GPU combines these accesses into fewer, larger transactions.

- **Coalesced access:** 32 threads access 32 consecutive 4-byte floats → 1 transaction (128 bytes)
- **Uncoalesced access:** 32 threads access every 32nd element (stride-32) → 32 separate transactions
- **Minimum transaction size:** 32 bytes (Ampere and newer)
- **Maximum transaction size:** 128 bytes

**Performance impact:** Coalesced memory access can be 10-32x faster than uncoalesced access for the same data volume.

**Example:** In a 2D array access pattern:
- Row-major access (C/C++ standard): `array[i][j]` where threads access consecutive j values → coalesced
- Column-major access: `array[j][i]` where threads access consecutive i values with large strides → uncoalesced

Source: https://docs.nvidia.com/cuda/cuda-c-programming-guide/#device-memory-accesses

---

## Finding 4: When to Use GPU vs. CPU — Decision Framework with Real Data

**Details:**
GPU acceleration is beneficial when:

1. **Massive parallelism available:** Problem can be decomposed into thousands of independent tasks
   - Minimum: ~10,000 threads to hide latency effectively
   - Typical: 100,000+ threads for good utilization

2. **Arithmetic intensity is high:** Ratio of floating-point operations to memory accesses
   - **GPU advantage threshold:** >10 FLOPs per byte of memory accessed
   - **Example:** Matrix multiplication (GEMM) has O(n³) operations on O(n²) data → high intensity
   - **Example:** Vector addition has O(n) operations on O(n) data → low intensity, CPU often faster

3. **Memory bandwidth is the bottleneck:** GPU memory bandwidth (2-3 TB/s) >> CPU memory bandwidth (100-200 GB/s)
   - **H100 GPU:** 3.35 TB/s HBM3 bandwidth
   - **AMD EPYC 9004 CPU:** 192 GB/s memory bandwidth
   - **Ratio:** GPU is 17x faster for memory-bound workloads

4. **Data transfer overhead is acceptable:** PCIe 5.0 bandwidth is ~32 GB/s; older PCIe 4.0 is ~16 GB/s
   - If data transfer time > computation time, GPU may not be worth it
   - Rule of thumb: Computation should be >10x the transfer time

**Real-world examples:**

| Workload | GPU Speedup | Arithmetic Intensity | Best Choice |
|----------|-------------|----------------------|-------------|
| Matrix multiplication (GEMM) | 50-100x | High (O(n³) ops) | GPU |
| Vector addition | 1-2x | Low (O(n) ops) | CPU |
| Sorting (bitonic sort) | 5-10x | Medium | GPU if >1M elements |
| FFT (Fast Fourier Transform) | 10-20x | Medium-High | GPU |
| Sparse matrix operations | 2-5x | Low (irregular access) | CPU or specialized GPU |

Source: https://docs.nvidia.com/cuda/cuda-c-programming-guide/#performance-guidelines

---

## Finding 5: NVIDIA CUDA Toolkit Current Version and Ecosystem (2026)

**Details:**
As of March 2026, CUDA 12.x is the current production version.

- **Latest stable:** CUDA 12.4 (released late 2024)
- **Supported GPU architectures:** Kepler (compute 3.0+) through Blackwell (compute 9.0)
- **Compiler:** NVCC (NVIDIA CUDA Compiler) based on LLVM
- **Alternative languages:** CUDA C/C++, CUDA Fortran, Python (CuPy, Numba, JAX)

**Key libraries for non-graphics workloads:**
- **cuBLAS:** Linear algebra (matrix operations) — 10-50x CPU speedup
- **cuFFT:** Fast Fourier Transform — 5-20x speedup
- **cuDNN:** Deep learning primitives — 20-100x speedup for neural networks
- **Thrust:** C++ parallel algorithms library (similar to STL)
- **cuSPARSE:** Sparse matrix operations

Source: https://docs.nvidia.com/cuda/

---

## Finding 6: Practical Optimization: Occupancy vs. Register Pressure Trade-off

**Details:**
Higher occupancy (more active warps per SM) helps hide memory latency, but using too many registers per thread reduces occupancy.

- **Registers per thread:** 32-255 (varies by architecture)
- **Max threads per SM:** 2,048 (Ampere/Hopper)
- **Example trade-off:**
  - Kernel A: 64 registers/thread → 32 threads/warp × 2 warps = 64 threads/SM → 32 SMs × 64 = 2,048 total threads
  - Kernel B: 128 registers/thread → 32 threads/warp × 1 warp = 32 threads/SM → 32 SMs × 32 = 1,024 total threads
  - Kernel A has 2x occupancy but may have lower IPC (instructions per cycle) if register pressure causes spills to local memory

**Optimization strategy:** Use NVIDIA's `nvprof` or `nsys` profilers to measure:
- SM utilization (target >80%)
- Memory bandwidth utilization
- Warp efficiency (% of threads doing useful work)

Source: https://docs.nvidia.com/cuda/cuda-c-programming-guide/#occupancy

---

## Finding 7: Real-World Performance Benchmark: H100 GPU vs. CPU

**Details:**
NVIDIA H100 Tensor GPU (Hopper architecture, 2023):

- **Peak FP32 performance:** 67 TFLOPS (single precision)
- **Peak FP64 performance:** 33.5 TFLOPS (double precision)
- **Memory bandwidth:** 3.35 TB/s (HBM3)
- **Typical CPU (AMD EPYC 9004, 2023):**
  - **Peak FP32 performance:** ~1.5 TFLOPS (single socket, 12-core)
  - **Memory bandwidth:** 192 GB/s
  - **GPU speedup:** 45x for compute-bound, 17x for memory-bound

**Real benchmark (LINPACK HPL):**
- H100: 60 TFLOPS sustained (mixed precision)
- Dual-socket EPYC 9004: 2-3 TFLOPS sustained
- **Speedup:** 20-30x

Source: https://www.nvidia.com/en-us/data-center/h100/

---

## Finding 8: When NOT to Use GPU — Common Pitfalls

**Details:**
GPU acceleration fails or underperforms in these scenarios:

1. **Low arithmetic intensity:** <1 FLOP per byte
   - Example: Simple data filtering, string processing
   - CPU is often 2-5x faster due to lower latency

2. **Irregular memory access patterns:** Random indexing, linked lists
   - Example: Hash table lookups, graph traversal
   - GPU memory coalescing cannot help; CPU cache is more efficient

3. **Small problem sizes:** <10,000 threads
   - GPU kernel launch overhead (~1-10 microseconds) dominates
   - CPU is faster for small matrices (<1000×1000)

4. **Frequent CPU-GPU data transfers:** If data moves back and forth repeatedly
   - PCIe 5.0: 32 GB/s (still 100x slower than GPU memory)
   - Example: Real-time sensor data processing with small batches

5. **Complex control flow:** Many divergent branches
   - Warp divergence causes serialization
   - Example: Decision trees, sparse conditionals

Source: https://docs.nvidia.com/cuda/cuda-c-programming-guide/#performance-guidelines

---

## Summary: Decision Tree for GPU vs. CPU

| Question | Answer | Recommendation |
|----------|--------|-----------------|
| >100,000 parallel tasks? | Yes | Consider GPU |
| Arithmetic intensity >10? | Yes | GPU likely 10-100x faster |
| Memory bandwidth bottleneck? | Yes | GPU (17x faster bandwidth) |
| Data transfer <10% of compute time? | Yes | GPU viable |
| Regular memory access patterns? | Yes | GPU coalescing helps |
| **All above:** | **Yes** | **Use GPU** |
| Any above: | **No** | **Use CPU** |

---

**Actionable next steps for your data engineering work:**
1. Profile your workload with `nvprof` or `nsys` to measure arithmetic intensity
2. If intensity >10 and problem size >100K elements, prototype GPU version
3. Use cuBLAS/cuDNN for standard operations (don't write custom kernels initially)
4. Measure end-to-end time including data transfer; if transfer >10% of total, optimize data locality
