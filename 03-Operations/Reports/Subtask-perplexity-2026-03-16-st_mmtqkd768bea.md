# Subtask Output — Research Modern Web Bundlers
## Model: sonar
## Stage: audit
## Date: 2026-03-16

# Modern Web Bundlers: Current Capabilities and Performance (2026)

## Finding 1: Vite vs Webpack Performance Benchmarks

**Build Speed:** In a production React application comparison, **Vite 5 built in 12 seconds** while **Webpack 6 took 47 seconds**—a 4x performance advantage for Vite[2]. Bundle sizes were comparable: Vite produced 847 KB (gzipped) versus Webpack's 892 KB, with Vite's initial chunk at 389 KB compared to Webpack's 423 KB[2].

**Hot Module Replacement (HMR):** Vite leverages native ES modules to provide **nearly instant HMR updates with minimal configuration**, while Webpack's HMR is highly configurable but may slow down as projects grow[1]. For development velocity, Vite's approach is superior for smaller to medium projects, though Webpack's customization advantages complex, multi-layered applications[1].

Source: https://jsmanifest.com/vite-vs-webpack-2026

## Finding 2: Code Splitting and Tree Shaking

**Code Splitting:** Vite's default code splitting is **more aggressive than Webpack**, creating smaller chunks that load on-demand[2]. This architectural difference directly impacts bundle optimization without requiring manual configuration.

**Tree Shaking & Dead Code Elimination:** Bundlers perform static analysis at build time to remove unused exports—a capability unavailable in native ESM, which loads and evaluates all modules eagerly[4]. Minification and compression (gzip/brotli) are **considerably more efficient on bundled code** compared to individual modules, reducing total bytes sent over the network[4].

Source: https://jsmanifest.com/vite-vs-webpack-2026 and https://rolldown.rs/in-depth/why-bundlers

## Finding 3: Module Resolution and Network Optimization

**HTTP/2 Constraints:** Most browsers and servers have a default limit of **~100 concurrent streams per connection**[4]. Bundlers address this by combining thousands of modules into optimal chunk sizes, reducing network overhead and server load[4].

**Import Chain Flattening:** Bundling flattens import chain depth to reduce waterfalls and enables generation of `modulepreload` directives, moving module combination work from runtime to the build phase[4]. This is critical for large applications on poor network conditions[4].

Source: https://rolldown.rs/in-depth/why-bundlers

## Finding 4: Market Adoption and Ecosystem Maturity

**GitHub Popularity:** As of the search results, **Vite has 68,051 GitHub stars** while **Webpack has 64,645 stars**[1]. Vite's rapid adoption since 2020 stems from fast speed, ease of use, and native modern JavaScript support[1].

**Framework Integration:** Vite now powers frameworks like **Nuxt, SvelteKit, and Astro by default**, while Webpack remains entrenched in production for some of the largest applications on the web[2]. Webpack 6 shipped with performance improvements but couldn't overcome fundamental architectural constraints compared to Vite's ESM-first design[2].

**Legacy Support Edge:** Webpack retains advantages for **IE11 and pre-ES6 browser support** with a more mature transpilation pipeline; Vite requires additional plugin configuration for older browser targets[2].

Source: https://www.syncfusion.com/blogs/post/webpack-vs-vite-bundler-comparison and https://jsmanifest.com/vite-vs-webpack-2026

## Finding 5: When to Choose Each Tool

**Choose Vite for:** Maximum speed, instant project startup, fast HMR, simple setup, modern ES Module-based apps, and teams prioritizing quick development cycles[1].

**Choose Webpack for:** Custom loaders, deep configuration control, support for older systems, unusual asset handling, very large apps with many entry points, and specialized monorepo setups requiring granular chunk splitting[1][2].

Source: https://www.syncfusion.com/blogs/post/webpack-vs-vite-bundler-comparison and https://jsmanifest.com/vite-vs-webpack-2026
