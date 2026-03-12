# Critique Request: Sprints 586-589

**Date:** 2026-03-10
**Submitted by:** Sarah Nakamura (Lead Eng)
**Scope:** Sprints 586-589 (notification extraction, photo hash persistence, perceptual hash, business detail extraction)

## Questions for External Review

### 1. Photo Anti-Gaming Pipeline
We now have two layers for photo verification: exact SHA-256 hash (Sprint 583) and perceptual hash / average hash (Sprint 588). The pHash uses 64 evenly-spaced byte samples compared against the mean. **Is this algorithm robust enough for real-world photo gaming, or should we invest in a proper DCT-based perceptual hash?** Our concern is that the simplified average hash may not detect sophisticated edits (color grading, watermarks, text overlays).

### 2. Build Size at 99.4%
Server build is 725.9kb against a 730kb ceiling. We're adding 2-3kb per sprint from new server modules. **Should we:** (a) raise the ceiling to 800kb and stop worrying, (b) invest a sprint in tree-shaking/code splitting, or (c) split admin routes into a separate bundle loaded on demand? What's the right build size discipline at our stage (pre-scale)?

### 3. In-Memory Store Proliferation
Three in-memory stores: city dimension cache (Sprint 582), photo hash index (Sprint 583), pHash index (Sprint 588). The hash index now has DB persistence (Sprint 587) and preloads on startup. **Is the hybrid pattern (DB for persistence + in-memory for lookup speed) the right architecture, or should we go full Redis now?** We're single-process today.

### 4. Component Extraction Cascade
Business detail extraction (Sprint 589) required redirecting 13 test files. Profile extraction (Sprint 584) required 5 redirects. Each extraction creates a test maintenance cascade. **Is this a sign of over-coupled tests, or is it acceptable for source-based testing?** Should we abstract the file reads behind a helper that searches across a component and its extracted children?

### 5. Notification Endpoint Extraction Pattern
Sprint 586 extracted notification endpoints from routes-members.ts using the pattern: move endpoints → wire in routes.ts → redirect tests. This is the third route extraction (after auth, payments). **Is there a point where we should use a route auto-discovery pattern instead of explicit imports?** The routes.ts file now has 50+ import lines.
