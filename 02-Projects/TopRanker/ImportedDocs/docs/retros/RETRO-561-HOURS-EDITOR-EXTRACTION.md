# Retro 561: HoursEditor Extraction

**Date:** 2026-03-10
**Duration:** 1 sprint cycle
**Story Points:** 3
**Facilitator:** Sarah Nakamura

## What Went Well

**Sarah Nakamura:** "Textbook extraction. HoursEditor was already well-isolated inside dashboard.tsx — own state, own hooks, own styles. The extraction was mechanical, no refactoring needed. This is how components should be structured: extractable when the time comes."

**Amir Patel:** "100 LOC reduction is the largest single extraction this cycle. Dashboard went from 97% threshold to 96% (492/510). And the new component at 111/130 has room for future hours features without threshold pressure."

**Marcus Chen:** "First of three scheduled extractions complete. Owner API extraction (Sprint 562) is next. Both Low findings from Audit #70 will be addressed in back-to-back sprints."

## What Could Improve

- **Extraction sprints feel repetitive** — The pattern (extract, redirect tests, update thresholds) is well-practiced but doesn't exercise new design thinking. Consider pairing extractions with small enhancements when possible.
- **No runtime tests for extracted component** — All tests are source-based. The extracted component works because it's identical code, but a render test would catch import issues.
- **Three test files needed redirection** — The per-sprint test pattern means extractions always require multi-file updates. Centralized threshold tests (file-health.test.ts) help, but component-level assertions still scatter.

## Action Items

- [ ] Sprint 562: Owner API extraction from api.ts — **Owner: Sarah**
- [ ] Sprint 563: Photo carousel lift from CollapsibleReviews — **Owner: Sarah**
- [ ] Consider adding render test for extracted components — **Owner: Amir**

## Team Morale
**8/10** — Solid execution on maintenance work. The team knows extraction sprints are necessary but is looking forward to Sprint 564's feature work (hours integration test).
