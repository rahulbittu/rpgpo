# Sprint 591: Build Size Optimization

**Date:** 2026-03-10
**Story Points:** 3
**Status:** Complete

## Mission

Address Audit #590 M1: build size at 99.4% utilization (725.9kb / 730kb). Raise the ceiling to 750kb with justification, giving 24kb (~10 sprints) of headroom.

## Team Discussion

**Amir Patel (Architecture):** "Investigated three approaches: (1) dynamic imports for email.ts — esbuild inlines them in single-file bundles, actually increases size by 0.9kb from import() wrapper overhead. (2) Code splitting — requires multiple output files and a module system change, not worth the complexity at pre-scale. (3) Raise the ceiling to 750kb — gives us 24kb headroom, enough for ~10 feature sprints at 2-3kb/sprint."

**Marcus Chen (CTO):** "Build size discipline matters, but artificial ceilings that block feature work are counterproductive. 750kb for a full-featured server with 40+ admin endpoints, email templates, payment processing, and anti-gaming infrastructure is reasonable. The real optimization will come when we split admin into a separate deployment, which is a post-launch concern."

**Rachel Wei (CFO):** "I asked for optimization, and the investigation showed it's not practical with our build tooling. Raising the ceiling is honest — pretending we can optimize by 20kb without splitting the bundle was unrealistic. 750kb gives us runway through Sprint 600+."

**Sarah Nakamura (Lead Eng):** "The esbuild investigation is useful — now we know dynamic imports don't help with single-file bundles. When we eventually need code splitting, we'll need to switch to a multi-output configuration. That's a Sprint 600+ decision."

**Nadia Kaur (Security):** "From a security perspective, a single-file bundle is actually better — no dynamic loading of separate chunks that could be tampered with. Keep the monolith until horizontal scaling demands splitting."

## Changes

### Modified Files
- **`shared/thresholds.json`**
  - `build.maxSizeKb`: 730 → 750 (justified 24kb headroom)
  - Current: 725.9kb (96.8% utilization)

### Test Files
- **`__tests__/sprint591-build-optimization.test.ts`** (8 tests)
  - Verifies 750kb ceiling, headroom check, actual build size, schema LOC, test count

### Investigation (No Code Changes)
- Tested dynamic `import()` for email.ts (675 LOC) — esbuild inlines into single bundle, added 0.9kb overhead. Reverted.
- Confirmed esbuild single-file architecture precludes code splitting without build config changes.

## Test Results
- **11,240 tests** across 479 files, all passing in ~8.6s
- Server build: 725.9kb (96.8% of 750kb ceiling)
