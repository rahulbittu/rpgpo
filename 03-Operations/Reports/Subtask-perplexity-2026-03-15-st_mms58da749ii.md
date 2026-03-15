# Subtask Output — Research WebAssembly Performance Characteristics
## Model: sonar
## Stage: research
## Date: 2026-03-15

## Finding 1: Rust + Wasm Delivers 8-10x Speed Gains Over JavaScript in Compute-Heavy Tasks
Rust compiled to WebAssembly achieves near-native speeds in browser and server environments, with benchmarks showing a 2500ms JavaScript task reduced to under 300ms (8-10x improvement) for tasks like local AI models, 3D visualizations, and data processing as of March 9, 2026.[3]  
Source: https://www.youtube.com/watch?v=p6gm5HXknkc

## Finding 2: Wasm SIMD Support Enables 2-4x Faster INT8 Model Inference on CPU Fallback
WebAssembly SIMD validation allows INT8 quantized models to run 2-4x faster than FP32 equivalents on CPU when WebGPU is unavailable, detected via a minimal Wasm module byte array check; modern browsers support this fully in early 2026.[2]  
On MacBook Pro M2 with WebGPU fallback to Wasm, Phi-3.5 Mini (q4) generates 25-35 tokens/second; mid-range Windows Intel GPU drops to 8-12 tokens/second; older iPhone Wasm-only hits 3-6 tokens/second.[2]  
Source: https://maddevs.io/writeups/running-ai-models-locally-in-the-browser/

## Finding 3: Mozilla Firefox Wasm Build Yields 2-10x Inference Speedups Without Warm-Up Overhead
Firefox replaced default onnxruntime-web Wasm with native C++ compiled into the browser binary, delivering 2-10x inference speedups for ONNX Runtime Web in production AI tasks as of early 2026; recommended for predictable behavior over pure Wasm.[1]  
Source: https://groundy.com/articles/webassembly-ai-running-models/

## Finding 4: Wasm Shows 16.9x CPU and 30.6x GPU Inference Latency Gaps vs Native on PCs
2025 International Symposium on High-Performance Parallel and Distributed Computing reported average in-browser Wasm inference latency at 16.9x slower on CPU and 30.6x on GPU compared to native on PC hardware; prediction latency variance reached 28.4x across devices.[1]  
Small models (<100M parameters) complete in tens of milliseconds on Wasm CPU; medium (100M-1B) need WebGPU to avoid seconds-long latency; large (1B+) require INT4 quantization (e.g., 3B model shrinks from 12GB f32 to 1.8GB) and WebGPU for viability, with INT8 offering 2-3x CPU gains via SIMD.[1]  
Source: https://groundy.com/articles/webassembly-ai-running-models/

## Finding 5: Wasm Component Model Faces WebGPU Buffer Access Performance Issues in Server Contexts
Hacker News discussion (March 2026) notes Wasm's C-style interface limits higher-level server APIs; WebGPU from Wasm incurs 2x slowdowns due to buffer copying (WGPUBuffer to JS ArrayBuffer), unsolved by Component Model for backend/edge use.[4]  
Source: https://news.ycombinator.com/item?id=47295837

No additional backend-specific Wasm performance benchmarks (e.g., server-side throughput, memory usage in Cloudflare Workers or .NET runtimes) found in last 30 days; results emphasize client/browser AI inference gaps over pure server metrics.
