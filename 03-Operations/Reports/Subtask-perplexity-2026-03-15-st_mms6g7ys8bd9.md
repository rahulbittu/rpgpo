# Subtask Output — Research Browser Rendering Pipeline
## Model: sonar
## Stage: research
## Date: 2026-03-15

The **browser rendering pipeline** is a multi-stage process that converts HTML and CSS into pixels displayed on your screen, consisting of seven sequential steps: HTML parsing, DOM construction, CSSOM creation, render tree building, layout calculation, painting, and compositing[1].

## DOM Construction

The browser begins by **parsing HTML and creating the Document Object Model (DOM)**, a tree structure representing the page's content[1]. This is the foundational step where raw HTML is converted into a structured, programmatic representation that the browser can work with.

## CSSOM Creation

Simultaneously, the browser processes CSS and creates the **CSS Object Model (CSSOM)**, resolving the cascade, specificity, and inheritance rules to compute the final styles for every element[1].

## Render Tree Building

The browser then **merges the DOM and CSSOM to create a render tree**, which contains only visible elements with their computed styles[1]. Hidden elements—such as those with `display: none`, `<script>` tags, and `<meta>` tags—are excluded from this tree. The render tree represents what actually needs to be drawn on the screen[1].

## Layout (Reflow)

Once the render tree is built, the browser calculates the **geometry of each element**, determining width, height, position, and spacing through box model calculations[1][2]. This stage is called layout or reflow.

## Paint

After layout, the browser converts elements into **drawing instructions**, determining how text, colors, borders, shadows, and images should be visually rendered[1]. At this stage, pixels are not yet combined into the final frame—the browser is preparing the visual instructions.

## Compositing

Modern browsers split the page into **layers and send them to the GPU compositor**[1]. Certain CSS properties trigger separate layer creation, including `transform`, `opacity`, `position: fixed`, `video`, and `canvas` elements[1]. The GPU combines these layers into the final image displayed on screen, enabling smooth animations and efficient rendering[1].

**Source:** https://coderlegion.com/12816/how-the-browser-rendering-pipeline-actually-works

**Additional resource:** https://frontenddigest.com/fundamentals/how-browsers-render-web-pages (published February 20, 2026)
