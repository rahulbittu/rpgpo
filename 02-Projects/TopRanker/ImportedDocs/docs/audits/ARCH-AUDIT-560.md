# Architectural Audit #70 — Sprint 560

**Date:** 2026-03-10
**Auditor:** Amir Patel (Architecture)
**Scope:** Sprints 556-559
**Previous:** Audit #69 (Sprint 555)

## Grade: A (70th consecutive A-range)

## Findings Summary

### Critical: 0
### High: 0
### Medium: 0
### Low: 2

1. **dashboard.tsx at 592/610 LOC (97%)** — Continued growth from Sprint 556 hours pre-fill. Extraction planned for Sprint 561.
2. **api.ts at 691/710 LOC (97%)** — Approaching threshold. Owner API extraction planned for Sprint 562.

## File Health Matrix

| File | Sprint 555 LOC | Sprint 560 LOC | Change | Threshold | % | Status |
|------|----------------|----------------|--------|-----------|---|--------|
| shared/schema.ts | 935 | 935 | 0 | 950 | 98% | Stable |
| server/routes.ts | 383 | 383 | 0 | 400 | 96% | Stable |
| server/storage/businesses.ts | 599 | 599 | 0 | 620 | 97% | Stable |
| server/routes-owner-dashboard.ts | 81 | 86 | +5 | 100 | 86% | Healthy |
| server/hours-utils.ts | 200 | 200 | 0 | 220 | 91% | Healthy |
| lib/api.ts | 691 | 691 | 0 | 710 | 97% | Watch |
| app/(tabs)/index.tsx | 443 | 443 | 0 | 460 | 96% | Stable |
| CollapsibleReviews.tsx | 407 | 407 | 0 | 420 | 97% | Stable |
| dashboard.tsx | 569 | 592 | +23 | 610 | 97% | Monitor |

## Sprint 556-559 Changes

- **Hours pre-fill (556):** +23 LOC to dashboard.tsx (useQuery + initialized state + source indicator)
- **Hours conversion (557):** +63 LOC to hours-utils.ts (weekdayTextToPeriods + periodsToWeekdayText). No existing file growth.
- **Threshold config (558):** New files: thresholds.json, file-health.test.ts. Process improvement, no production code changes.
- **Hours wiring + cache (559):** +5 LOC to routes-owner-dashboard.ts, net-zero to CollapsibleReviews.tsx (useQuery replacement). Build +2.7kb.

## Metrics

- **10,507 tests** across 449 files (Δ+64 from Sprint 555)
- **711.4kb** server build (Δ+2.7kb)
- **935 LOC** schema (unchanged)
- **2 test threshold redirections** in 4 sprints (down from 17 in 551-554)
- **0 new `as any` casts** added
- **Centralized thresholds live** — shared/thresholds.json tracks 13 files

## Grade Justification

Grade A maintained. The 70th consecutive A-range. Redirect overhead dropped 88% (17→2) thanks to centralized threshold config. No medium or higher findings. Two low concerns are scheduled for extraction in Sprints 561-562. Build size growth minimal (2.7kb from hours-utils import). Hours pipeline is architecturally complete.

## Recommendations

1. Extract HoursEditor from dashboard.tsx (Sprint 561) — at 97% threshold
2. Extract owner API functions from api.ts (Sprint 562) — at 97% threshold
3. Consider lifting PhotoCarouselModal to shared component (Sprint 563)
4. Add roundtrip conversion tests for hours utilities (Sprint 564)
