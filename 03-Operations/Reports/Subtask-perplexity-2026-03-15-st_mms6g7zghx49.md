# Subtask Output — Compile Performance Optimization Tips
## Model: sonar
## Stage: research
## Date: 2026-03-15

# Performance Optimization Tips for the Browser Rendering Pipeline

Based on the search results, here are specific techniques addressing common bottlenecks across DOM construction, CSSOM, layout, paint, and compositing:

## Layout & Reflow Optimization

**Minimize layout recalculations** by avoiding changes to geometric properties during animations and scrolling. The layout stage is computationally expensive because the browser must recalculate the position and size of every element affected by a change[2].

For animations, **stick to animating only `transform` and `opacity` properties**—these are the only properties that can be handled by the browser's compositor thread without triggering layout or paint. Animating properties like `width`, `height`, `top`, or `left` is significantly more expensive[2].

Use `requestAnimationFrame` for JavaScript-driven animations to synchronize with the browser's refresh cycle, ensuring your animation code runs at the optimal time and avoiding unnecessary frame drops[2].

## Paint Optimization

**Identify repainting bottlenecks** using Chrome Developer Tools. Go to the Rendering tab and enable "Paint flashing"—Chrome will highlight areas being repainted in green. Scroll through your site to discover elements unnecessarily repainted during scrolling[2].

When changing **non-geometric attributes** (backgrounds, text color, shadows), the browser skips the layout step, reducing the rendering pipeline overhead[2].

**Always use the exact image size** that the browser needs to display, avoiding unnecessary scaling and paint operations[2].

## Compositing & Layer Management

Create new layers for certain elements to optimize compositing performance. This allows the browser's compositor thread to handle animations independently without triggering layout or paint on the main thread[2].

## Large List Rendering

**Use list virtualization (windowing)** for rendering 100+ similar or complex items. Libraries like `react-window` add only ~4-5 KB to your bundle while eliminating rendering overhead by rendering only visible items instead of all items in the DOM[1]. For a 1,000-item list, you render only the visible items instead of all 1,000[1].

## Server-Side Rendering & Streaming

**Implement Server-Side Rendering (SSR)** to send pre-rendered HTML that the browser only needs to hydrate, improving First Contentful Paint (LCP) and Largest Contentful Paint (LCP)[1].

Use the `renderToPipeableStream` API to stream HTML to the browser in chunks as components finish rendering, allowing above-the-fold content to be delivered first while data-heavy sections stream later[1].

Combine `<Suspense>` components with streaming to define where rendering can pause and resume while displaying fallback UI, enabling selective streaming and incremental content reveal[1].

## Core Web Vitals Targets

Optimize for these performance metrics at the 75th percentile[3]:

- **Largest Contentful Paint (LCP):** < 2.5 seconds (loading performance)
- **Interaction to Next Paint (INP):** < 200 ms (interactivity and responsiveness)
- **Cumulative Layout Shift (CLS):** < 0.1 (visual stability)
- **Time to First Byte (TTFB):** < 800 ms (server responsiveness)

## Frame Rate Target

Aim for **60 FPS** during scrolling and animations. Lower frame rates increase the likelihood of stutters[2].

**Source:** https://www.debugbear.com/blog/measuring-react-app-performance

**Source:** https://savvy.co.il/en/blog/wordpress-speed/frontend-scrolling-performance/

**Source:** https://developers.cloudflare.com/reference-architecture/diagrams/content-delivery/distributed-web-performance-architecture/
