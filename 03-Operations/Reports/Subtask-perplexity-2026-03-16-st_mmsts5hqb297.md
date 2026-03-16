# Subtask Output — Research Web Rendering Process
## Model: sonar
## Stage: research
## Date: 2026-03-16

## Finding 1: Browser Rendering Pipeline Overview (HTML to Pixels)
Modern web browsers follow the **critical rendering path**: HTML parsing builds the **DOM**, CSS parsing builds the **CSSOM**, their combination forms the **render tree**, followed by **layout/reflow**, **paint**, and **compositing** with GPU acceleration, targeting **60 FPS** (16ms per frame).[1][2][3]

- **HTML Parsing → DOM Construction**: Browsers stream-parse HTML into a tree-structured **Document Object Model (DOM)** before full download completes; JavaScript scripts block parsing until executed.[1]
- **CSS Parsing → CSSOM**: CSS resolves into **CSS Object Model (CSSOM)** via cascade, specificity, and inheritance, yielding computed styles for elements.[1]
- **DOM + CSSOM → Render Tree**: Merges DOM and CSSOM into **render tree** of only visible elements with styles (e.g., excludes `<head>`, `display: none`).[1]
- **Layout (Reflow)**: Calculates geometry (width, height, position, margins) for render tree nodes.[1]
- **Paint**: Converts layout into pixels, filling layers with colors, images, etc.[1][3]
- **Compositing**: Splits page into GPU layers (triggered by `transform`, `opacity`, `position: fixed`, `video`, `canvas`); GPU composites layers into final screen image.[1]

Source: https://coderlegion.com/12816/how-the-browser-rendering-pipeline-actually-works[1]

## Finding 2: 16ms Frame Budget and GPU Acceleration Details
Browsers target **60 frames per second**, allocating ~**16ms per frame** for JS execution, style recalc, layout, paint, and composite; **composite-only properties** like `transform` and `opacity` are fastest as they skip earlier stages via GPU.[1]

- **requestAnimationFrame**: Schedules JS callbacks to sync with browser's repaint cycle (~60Hz), ensuring smooth animations within 16ms budget; used for GPU-accelerated transforms.[1]
- GPU role: Handles layer compositing off main thread, enabling 60FPS even on complex pages.

Source: https://coderlegion.com/12816/how-the-browser-rendering-pipeline-actually-works[1]

## Finding 3: Recent Deep Dive (February 2026)
**Frontend Digest** details the pipeline from HTML parsing through critical rendering path to paint/composite, emphasizing GPU layers for performance; published **February 20, 2026**.[3]

Source: https://frontenddigest.com/fundamentals/how-browsers-render-web-pages[3]

## Finding 4: Duplicate Pipeline Explanation
Dev.to post mirrors [1], outlining HTML → DOM → CSSOM → render tree → layout → paint → composite, dated ~2025-2026 based on context.[2]

Source: https://dev.to/vishdevwork/how-the-browser-rendering-pipeline-actually-works-29n5[2]

*Note: No sources from last 30 days (post-Feb 14, 2026) beyond [3]; searched alternatives like "browser rendering pipeline 2026 GPU requestAnimationFrame" yielded no newer specifics. Core process unchanged since Chromium/Blink standardization ~2010s.*
