# Subtask Output — Research WebAssembly Compilation and Execution
## Model: sonar
## Stage: research
## Date: 2026-03-16

## WebAssembly Compilation Process

WebAssembly (WASM) modules are compiled from source languages like Rust or C++ into a binary format (.wasm) using toolchains such as Emscripten for C/C++ projects or `wasm-bindgen` and `spin build` for Rust-based Spin applications. For example, a Rust HTTP handler in SpinKube is compiled via `spin build`, producing a WASM module pushed to an OCI registry as `my-registry.com/my-wasm-api:v1` for Kubernetes deployment.[1] Compiling Gifsicle to WASM requires Emscripten, cloning the repo to `/tmp`, switching to a known commit, applying patches, and generating a 233KB bundle committed to the repo.[5] WIT-bindgen generates Rust bindings (e.g., `bindings.rs`) from WIT IDL files for component models, enabling safe interfaces like `image-lib` with records and resources.[3]

**Next steps**: Clone Gifsicle repo (`git clone https://github.com/kohler/gifsicle`), apply Emscripten patches per repo examples, run `emcc` to build; test with `wasm-pack build` for Rust.[5]

## Execution in Browsers

Browsers execute WASM via ahead-of-time (AOT) compilation of Core modules, loading binaries with `WebAssembly.instantiateStreaming(fetch('./module.wasm'), imports)` and accessing exports directly (e.g., `import { run } from "/module.wasm"; run();`).[3] Imports provide JS wrappers for Web APIs, such as `consoleLog` decoding WASM memory via `TextDecoder` on a shared `WebAssembly.Memory` buffer, due to WASM's lack of direct DOM/console access.[3] Wasmtime (embeddable executor) interprets or AOT-compiles WASM, handling resources via tables with manual `drop` methods to avoid memory leaks; first loads take 5-45 seconds depending on hardware (e.g., 30-45s on slower systems).[2] Firefox devtools require `about:blank` to bypass CSP blocking WASM; SpiderMonkey shell runs raw instances like `new WebAssembly.Instance(mod, { env: { log: (x) => console.log("wasm says:", x) } })` outputting "wasm says: 42".[4]

**Next steps**: Test instantiation in Chrome/Firefox console: `fetch('./module.wasm').then(r => WebAssembly.instantiateStreaming(r)).then(i => i.instance.exports.go());` – ensure imports define memory/env.[3][4]

## Performance Benchmarks

Wasmtime AOT compilation for extensions loads in 5 seconds on powerful hardware to 30-45 seconds on slower systems, with initial builds varying by platform.[2] Gifsicle WASM bundle is 233KB post-Emscripten compilation, enabling browser sandboxed GIF optimization without native binaries.[5] CVE-2026-2796 highlights JIT miscompilation risks in JS WASM components, exploitable via `Function.prototype.call.bind` unwrapping during instantiation for UAF primitives, but no numeric perf degradation reported.[4] No browser-specific FPS/latency benchmarks in last 30 days (post-2026-02-16); older data shows AOT outperforming interpretation by 2-10x in loops per V8/SpiderMonkey.[2]

**Limitations**: Recent searches (queries: "WebAssembly browser benchmarks 2026", "WASM performance AOT vs interpreter 2026", "WebAssembly compilation speed metrics") yield no new numeric data beyond load times; pre-2026 figures from Wasmtime docs indicate ~1.5x native speed for compute-heavy tasks.[2]

**Sources**:
- [1] https://oneuptime.com/blog/post/2026-02-20-wasm-kubernetes-guide/view (2026-02-20)
- [2] https://www.infoq.com/presentations/webassembly-extensions/ (recent, no exact date)
- [3] https://hacks.mozilla.org/2026/02/making-webassembly-a-first-class-language-on-the-web/ (2026-02)
- [4] https://red.anthropic.com/2026/exploit/ (2026)
- [5] https://simonwillison.net/guides/agentic-engineering-patterns/gif-optimization/ (recent)
- [6] https://news.ycombinator.com/item?id=47295837 (no date, HN thread)
