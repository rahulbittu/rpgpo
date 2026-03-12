# Sprint 409: Rating Flow Accessibility Audit

**Date:** 2026-03-09
**Type:** Accessibility — WCAG Compliance
**Story Points:** 3

## Mission

Comprehensive accessibility audit of the entire rating flow: rate/[id].tsx, SubComponents.tsx, and RatingExtrasStep.tsx. Add WCAG-aligned semantic roles, accessible labels, hints, live regions, and value descriptors. Aligns with Constitution #10 (premium feel) and SLT-405's accessibility prep mandate.

## Team Discussion

**Jordan Blake (Compliance):** "This is compliance prep. If we ever need ADA certification for enterprise clients, we need a clean accessibility audit trail. Every interactive element in the rating flow now has proper role, label, and state."

**Priya Sharma (Design):** "The CircleScorePicker already had good basics — accessibilityRole, label, state. We added accessibilityHint ('Double tap to select this score') which helps VoiceOver users understand the interaction model."

**Marcus Chen (CTO):** "The live score preview now announces changes via accessibilityLiveRegion='polite'. As users adjust dimensions, the weighted score updates and VoiceOver reads it without interrupting. That's real-time feedback for screen reader users."

**Rachel Wei (CFO):** "Accessibility isn't just good UX — it's legal compliance and market expansion. 15% of the global population experiences some form of disability. Making the rating flow accessible expands our addressable market."

**Amir Patel (Architecture):** "rate/[id].tsx stayed at 631 LOC despite inline additions. Zero LOC growth because we replaced existing props with enriched versions. SubComponents grew by 4 LOC, RatingExtrasStep by 6 LOC — minimal footprint."

**Sarah Nakamura (Lead Eng):** "25 accessibility-specific tests covering every component in the rating flow. Test coverage validates: roles, labels, hints, states, live regions, header roles, and value descriptors."

## Changes

### Modified Files
- `components/rate/SubComponents.tsx` (586→590 LOC, +4)
  - ProgressBar: Added `accessibilityValue` with min/max/now/text
  - StepIndicator: Added `accessibilityRole="text"` with step + completion label
  - StepDescription: Added `accessibilityRole="text"` with current step label
  - DishPill: Added `accessibilityRole="button"`, `accessibilityLabel` with name+votes, `accessibilityState`, `accessibilityHint`

- `components/rate/RatingExtrasStep.tsx` (505→511 LOC, +6)
  - Dish TextInput: Added `accessibilityLabel` and `accessibilityHint`
  - Note TextInput: Added `accessibilityLabel` and `accessibilityHint`
  - Dish suggestions: Added `accessibilityRole="button"` and label per suggestion
  - Clear dish button: Added descriptive `accessibilityLabel`
  - Score summary card: Added `accessibilityRole="summary"` with full score readout

- `app/rate/[id].tsx` (631 LOC, unchanged)
  - Live score preview: Added `accessibilityLiveRegion="polite"` and score label
  - Business name: Added `accessibilityRole="header"`

### Test Files
- `__tests__/sprint409-accessibility-audit.test.ts` — 25 tests: CircleScorePicker (4), ProgressBar (2), StepIndicator (1), StepDescription (1), DishPill (4), RatingExtrasStep (7), rate/[id].tsx (6)

## Test Results
- **311 files**, **7,432 tests**, all passing
- Server build: **601.1kb**, 31 tables
- 0 test cascades

## Accessibility Coverage Summary

| Component | Roles | Labels | States | Hints | Live Regions | Values |
|-----------|-------|--------|--------|-------|-------------|--------|
| CircleScorePicker | button | score+text | selected | select hint | - | - |
| ProgressBar | progressbar | step label | - | - | - | min/max/now/text |
| StepIndicator | text | step+pct | - | - | - | - |
| DishPill | button | name+votes | selected | select/deselect | - | - |
| TextInput (dish) | - | label | - | hint | - | - |
| TextInput (note) | - | label | - | hint | - | - |
| Score summary | summary | full readout | - | - | - | - |
| Live score | - | score+weight | - | - | polite | - |
| Business name | header | - | - | - | - | - |
