# Subtask Output — Research WebAssembly Compilation and Execution
## Model: sonar
## Stage: audit
## Date: 2026-03-16

## WebAssembly Compilation from Source Code to Execution

WebAssembly (Wasm) compiles high-level source code to a compact binary format for a stack-based virtual machine, enabling platform-independent execution in browsers or standalone runtimes.[1][2] The process involves language-specific compilers targeting `wasm32` architectures, producing `.wasm` binaries that run via just-in-time (JIT) or ahead-of-time (AOT) compilation in runtimes like Wasmtime.[4]

- **Core Flow**: Source code → Compiler (e.g., LLVM-based) → `.wasm` binary → Runtime loads binary, validates, compiles to machine code, executes on stack machine with linear memory.[1][2][4]
- **Stack-Based VM**: Instructions use operand stack (push/pop) instead of registers; no dynamic types beyond integers/floats.[7]

## Compilation Targets

| Language | Target | Command/Example | Notes/Source |
|----------|--------|-----------------|-------------|
| **Rust** | `wasm32-unknown-unknown` (bare), `wasm32-wasi` (WASI Preview 1), `wasm32-wasip2` | `cargo build --release --target wasm32-wasip2` | Supports sandboxing; used in Azure IoT, Kubewarden.[2][5] |
| **C/C++** | `wasm32-unknown-unknown` via Clang/LLVM | Emscripten for JS interop | C-ABI compatible; secure extensions via WASI.[2][7] |
| **Go** | `GOOS=wasip1 GOARCH=wasm` (Go 1.21+) | `GOOS=wasip1 GOARCH=wasm go build -o go-cel.wasm main.go` | Official compiler; lacks function exports for waPC (issue tracked as of June 2023).[3][6] |
| **Kotlin** | `wasm-wasi` | Kotlin compiler to Wasm | Server-side via WASI; browser or standalone.[1] |

Other languages: Java (TeaVM), Swift, JavaScript (SpiderMonkey).[2]

## WASI Runtime

**WebAssembly System Interface (WASI)** standardizes access to system resources (files, network, STDIN/STDOUT/STDERR, env vars) outside browsers, via sandboxed APIs.[1][2][3][4] 

- **Preview 1**: Basic libc-like interface (strings, memory alloc); Rust/C++/Kotlin/Go targets.[2]
- **Preview 2/Component Model**: WIT (WebAssembly Interface Types) for language-agnostic interfaces; `wit-bindgen` generates bindings.[2][5]
- **Runtimes**: Wasmtime (Bytecode Alliance reference impl, Cranelift JIT/AOT, WASI full support).[2][4][8]
- **Use**: `wasmtime component run` or embed in apps; configurable sandbox limits.[2][4]

## Memory Model

Wasm uses **linear memory**: single contiguous byte array (growable, 0-indexed), accessed via offsets; 32-bit addressing by default (up to 4GB).[2][4][7]

- Host allocates/shares memory; modules can't overflow due to bounds checks.[2]
- Multi-memory/SIMD proposals supported in Wasmtime.[4]
- Java example: Host writes JSON/policy to Wasm-allocated memory before calling.[6]

## JavaScript Interop

In browsers, Wasm modules import/export functions via JS; Emscripten mixes C++/JS in files for polyfills (e.g., browser API diffs via if-else).[7]

- **Calls**: JS instantiates Wasm, calls exports; Wasm imports JS funcs.[7]
- **No High-Level Types**: Tunnel via C-ABI or Interface Types/GC proposals.[7][9]

## Real-World Performance Benchmarks

Search results lack 2025-2026 native vs. Wasm benchmarks with specific numbers; older data notes Wasmtime's high-perf JIT (Cranelift) approaches native for server/edge, with trade-offs in JIT/AOT modes and low memory footprint for IoT.[4]

- **Wasmtime**: Production-ready for cloud-native; low-latency streaming in Azure IoT (Rust/Python modules).[4][5]
- **No Recent Metrics Found**: Tried queries "WebAssembly vs native benchmarks 2026", "Wasmtime performance numbers 2025"; results emphasize AOT for max speed but no % diffs (e.g., vs. native Rust/C++).[4] Use Wasmtime CLI for local tests: `wasmtime run --wasm-features=all module.wasm`.[4]

**Next Steps**:
- Compile Rust sample: `cargo new wasm-test; add wasm32-wasip2 target; build/test with Wasmtime v22.0+`.
- Benchmark locally: Hyperfine tool on fib(40) in Rust native vs. `wasm32-wasip2`.
- Explore WIT: `cargo install wit-bindgen-cli` for Component Model.[5]
