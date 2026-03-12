# Retrospective — Sprint 379

**Date:** March 10, 2026
**Duration:** 1 session
**Story Points:** 3
**Facilitator:** Sarah Nakamura

## What Went Well

**Amir Patel:** "Backward-compatible enhancement. Single-photo mode still works if setPhotoUris isn't passed. The fallback logic is clean — compute `photos` array from either source."

**Marcus Chen:** "Multi-photo directly maps to our verification strategy. Food photo + receipt + ambiance = 3x verification signal potential. This is the infrastructure for maximum credibility weighting."

**Priya Sharma:** "All 24 tests passed first run. No existing test cascading needed — the enhancement is additive. 287 test files, nearly 7,000 tests."

## What Could Improve

- **Server-side photo upload not implemented** — The client captures photos but the submit handler doesn't actually upload them yet. The photoUri was already a placeholder — multi-photo makes this gap more visible.
- **No photo compression/resize** — expo-image-picker does basic compression (quality: 0.8) but no resizing. Large photos from modern phones could be 5-10MB each. Need client-side resize before upload.
- **Camera permission UX** — If the user denies camera permission, the function silently returns. Should show a message explaining why camera access is needed.

## Action Items
- [ ] Sprint 380: SLT Review + Arch Audit #58 (governance)
- [ ] Sprint 381-384: TBD (backlog refinement in SLT-380)

## Team Morale: 8/10
Multi-photo upload is a meaningful UX improvement. Close to 7,000 tests milestone.
