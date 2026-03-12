# Sprint 561: HoursEditor Extraction — dashboard.tsx 592→492 LOC

**Date:** 2026-03-10
**Story Points:** 3
**Status:** Complete
**Tests:** 25 new + 10 redirected (10,559 total across 451 files)

## Mission

Extract HoursEditor component and its styles from dashboard.tsx into `components/dashboard/HoursEditor.tsx`. Dashboard was at 592/610 LOC (97% threshold) — the first Low finding from Audit #70. This extraction reduces dashboard.tsx by 100 LOC to 492, well below the new 510 threshold.

## Team Discussion

**Marcus Chen (CTO):** "This is the first of three extractions in the 561-565 roadmap. Dashboard was the most urgent — 97% of threshold. Now at 492/510, we've bought significant headroom for future dashboard features."

**Sarah Nakamura (Lead Eng):** "Clean extraction. The HoursEditor was self-contained — its own state, its own query, its own mutation, its own styles. No cross-dependencies to untangle. That's the benefit of keeping components well-scoped from the start."

**Amir Patel (Architecture):** "100 LOC reduction in a single extraction. The new component at 111 LOC has its own threshold at 130. Three test redirections: sprint554, sprint556, and the new sprint561 test validates the extraction contract."

**Rachel Wei (CFO):** "Extraction sprints don't ship user value, but they keep the codebase healthy. The alternative — hitting the 610 threshold — would block the next feature sprint. This is preventive maintenance."

**Cole Richardson (City Growth):** "10,559 tests now. The redirections show the extraction working: tests that checked dashboard.tsx inline content now check the extracted component. Zero behavior change."

## Changes

### New File: `components/dashboard/HoursEditor.tsx` (111 LOC)
- Extracted from dashboard.tsx (Sprint 554 + 556 code)
- Self-contained: own imports, own state (editing, hours, initialized), own queries (useQuery + useMutation), own styles
- Exports `HoursEditor` function component with `businessId` and `delay` props
- Contains DAY_NAMES constant, pre-fill logic, edit/save toggle, TextInput per day, cancel button

### Modified: `app/business/dashboard.tsx` (592→492 LOC, -100)
- Removed inline HoursEditor function + DAY_NAMES constant (-85 LOC)
- Removed hours-specific styles (-14 LOC)
- Removed unused imports: TextInput, Alert, useMutation, useQueryClient, updateBusinessHours, HoursUpdate, useCallback
- Added import of HoursEditor from extracted component

### Modified: `shared/thresholds.json`
- dashboard.tsx: maxLOC 610→510, current 592→492
- Added HoursEditor.tsx: maxLOC 130, current 111

### Test Redirections
- `sprint554-hours-update.test.ts` — 9 assertions redirected from dashboard.tsx to HoursEditor.tsx
- `sprint556-hours-prefill.test.ts` — 7 assertions redirected from dashboard.tsx to HoursEditor.tsx

## Test Summary

- `__tests__/sprint561-hours-editor-extraction.test.ts` — 25 tests
  - Extracted component: 14 tests (export, props, DAY_NAMES, useQuery, initialized, useMutation, toggle, TextInput, cancel, alert, invalidate, source indicator, styles, LOC)
  - Dashboard after extraction: 8 tests (import, no inline HoursEditor, no DAY_NAMES, no hours styles, no useMutation, no TextInput, still renders, LOC bounds)
  - Thresholds: 3 tests (dashboard lowered, HoursEditor tracked)
