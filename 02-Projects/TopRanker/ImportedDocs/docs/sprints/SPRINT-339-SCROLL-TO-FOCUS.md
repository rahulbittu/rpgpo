# Sprint 339: Rating Flow Scroll-to-Focus on Small Screens

**Date:** March 9, 2026
**Story Points:** 3
**Focus:** Auto-scroll to the next focused dimension in the rating flow for small screen usability

## Mission
Sprint 334 added auto-advance: after answering a question, the next unanswered question highlights. But on small screens (iPhone SE, Android compact), the highlighted question may be below the fold. This sprint adds scroll-to-focus: when `focusedDimension` changes, the ScrollView auto-scrolls to bring the focused question into view. Combined with the amber highlight from Sprint 334, the rating flow now guides users both visually and spatially.

## Team Discussion

**Marcus Chen (CTO):** "Constitution #3: Fast structured input. If the user answers Q1 and the highlighted Q2 is offscreen, they have to manually scroll. That's friction. Scroll-to-focus removes it."

**Sarah Nakamura (Lead Eng):** "Implementation uses `useRef<ScrollView>` for the scroll ref and a `dimensionYPositions` ref that stores Y offsets from each question's `onLayout`. When `focusedDimension` changes (via useEffect), we call `scrollTo` with a 40px top padding for visual breathing room. We only scroll for dimensions 1-3 — Q1 is always visible on load."

**Amir Patel (Architecture):** "The `onLayout` approach is more reliable than hardcoded pixel offsets because it adapts to dynamic content (dish context banners, different label lengths). The ref array `[0, 0, 0, 0]` stores positions for all 4 questions."

**Jasmine Taylor (Marketing):** "The rating flow is our conversion funnel. Every micro-friction removed increases completion rate. Scroll-to-focus makes the flow feel guided on every screen size."

**Priya Sharma (QA):** "15 new tests across 3 groups: ScrollView ref attachment, dimension Y position tracking (4 onLayout handlers), and auto-scroll effect (animated, padded, guarded)."

## Changes
- `app/rate/[id].tsx` — Added `scrollViewRef` (useRef<ScrollView>), `dimensionYPositions` (useRef<number[]>), useEffect for auto-scroll, ScrollView ref attachment, 4 onLayout handlers on compactQuestion Views

## Test Results
- **256 test files, 6,270 tests, all passing** (~3.5s)
- **Server build:** 590.5kb (unchanged)
