# Retro 568: City Comparison Search Overlay

**Date:** 2026-03-10
**Duration:** 1 sprint cycle
**Story Points:** 3
**Facilitator:** Sarah Nakamura

## What Went Well

**Sarah Nakamura:** "Third consecutive feature sprint. The overlay reuses the existing city stats API — zero new server code. The StatCompare helper makes it easy to add new comparison metrics later. search.tsx only grew 4 lines."

**Amir Patel:** "The component automatically adapts to new cities via SUPPORTED_CITIES. When Memphis or Nashville hit active status, they'll appear as comparison options without any code change. Good forward compatibility."

**Jasmine Taylor:** "The cross-city comparison angle is compelling for marketing. 'Irving vs Plano: Which city has better food?' — that's a headline that writes itself for WhatsApp groups."

## What Could Improve

- **Only shows one comparison city at a time** — Could show a compact 3-city comparison grid. Current cycling approach works but requires taps to explore.
- **No dimension-level comparison in overlay** — The CityComparisonCard on business pages shows dimension bars (food, service, vibe). The overlay could show this in an expandable section.
- **search.tsx at 670/680 LOC (99%)** — Getting close to threshold. Next feature addition to search.tsx will likely need an extraction.

## Action Items

- [ ] Sprint 569: Credibility breakdown tooltip — **Owner: Sarah**
- [ ] Consider multi-city comparison grid (future sprint) — **Owner: Amir**
- [ ] Monitor search.tsx LOC — next addition should trigger extraction — **Owner: Sarah**

## Team Morale
**9/10** — Three feature sprints in a row (566-568). Each one builds on existing infrastructure — dish photos, velocity widget, city comparison — without threshold pressure. The codebase is in great shape.
