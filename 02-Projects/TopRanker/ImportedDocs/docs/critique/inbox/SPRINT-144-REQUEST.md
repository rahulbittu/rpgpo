# Critique Request: Sprint 144 — Live Experiments Activated + MapView Extraction + E2E Pipeline Validation

**Previous Score:** 7/10
**Date:** 2026-03-08

---

## What Was Delivered

### 1. All 3 A/B Experiments Activated and Wired Into Product UI
The experiment system built over Sprints 135-143 is now live in the product:
- **`confidence_tooltip`** (Sprint 135) — already active in search
- **`trust_signal_style`** — NOW ACTIVE, wired into business detail SubComponents: treatment renders text labels instead of icons
- **`personalized_weight`** — NOW ACTIVE, wired into challenger page: treatment shows personalized vote weight based on user tier

This directly addresses Sprint 143 critique priority #1: "Run one live experiment or delete the experiment dashboard code." We chose to run all three.

### 2. E2E Experiment Pipeline Validation (24 tests)
Full pipeline proof from assignment through recommendation:
- **Assignment → exposure tracking → outcome recording → dashboard computation → recommendation** — complete lifecycle verified
- **Statistical correctness:** 200-user traffic split, decisive recommendations, threshold logic validated
- **Cross-component parity:** DJB2 hash consistency between client and server, deterministic assignment, registry sync
- **Lifecycle integrity:** register → activate → assign → track → compute → deactivate, with historical data preservation after deactivation

### 3. MapView Extraction from search.tsx
- `search.tsx`: **907 → 713 LOC** (-21%)
- MapView component (~160 LOC), `CITY_COORDS`, and Google Maps imports moved to `search/SubComponents.tsx` (357 → 554 LOC)
- Addresses Sprint 143 critique priority #3 (reduce oversized files)

### 4. Product Validation Tests (24 tests)
- Experiment integration verification (active flags, UI wiring, variant rendering)
- File size compliance (all major files under target)
- Component extraction integrity (exports, imports, no orphans)
- Search page regression coverage

---

## Sprint 143 Critique Priorities — Resolution Status

| Priority | Description | Status | Evidence |
|----------|-------------|--------|----------|
| 1 | Run live experiment or delete dashboard | DONE | All 3 experiments activated, 2 newly wired into UI |
| 2 | HTTP-level freshness tests | NOT DONE | Deferred — prioritized experiment activation over HTTP-layer tests |
| 3 | Break up oversized SubComponents + extract search.tsx | PARTIAL | search.tsx 907→713 LOC; business/SubComponents still 997 LOC |

---

## Test Results

- **1947 tests** across 83 files, all passing
- **48 new tests** this sprint (24 E2E experiment pipeline + 24 product validation)
- Full suite runs in **<1.5s**

---

## Critique Trajectory

| Sprint | Score |
|--------|-------|
| 135 | 2/10 |
| 136 | 6/10 |
| 137 | 4/10 |
| 138 | 3/10 |
| 139 | 5/10 |
| 140 | 6/10 |
| 141 | 7/10 |
| 142 | 8/10 |
| 143 | 7/10 |

---

## Critique Questions

1. **Does activating all 3 experiments and proving the full pipeline satisfy the "run or delete" directive?** We chose "run" — all three experiments are now active with UI integration and a validated end-to-end pipeline from assignment through statistical recommendation. Is this sufficient to consider the experiment infrastructure justified?

2. **Is the MapView extraction sufficient, or should search.tsx be further reduced?** We brought it from 907 to 713 LOC. The business/SubComponents file remains at 997 LOC and was not addressed this sprint. Should both files be the top extraction priority for Sprint 145?

3. **Should HTTP-level freshness tests be the top priority for Sprint 145?** This was Sprint 143 priority #2 and was deferred in favor of experiment activation. It remains unaddressed across two sprints. How urgently should this be tackled?

4. **What would move the score back to 8/10 and beyond?** The drop from 8 to 7 in Sprint 143 suggests something regressed or a new gap opened. What specific deliverables would demonstrate forward progress?
