# Sprint 703 — Rate Flow Validation Hints

**Date:** 2026-03-11
**Theme:** Rating UX Polish
**Story Points:** 2

---

## Mission Alignment

The rating flow had strong validation — users couldn't proceed without scores and wouldReturn — but no feedback about _why_ the Next button was disabled. First-time raters could be confused by a grayed-out button with no explanation. This sprint adds contextual validation hints that explain what's still needed.

---

## Team Discussion

**Sarah Nakamura (Lead Eng):** "The validation logic was already solid (canProceed function, server-side schema). What was missing was communication. Now when the Next button is disabled, a small hint appears below it: 'Rate all dimensions · Answer Would you return?' — exactly what the user needs to do."

**Priya Sharma (Design):** "The hint uses 11px DMSans_400Regular in textTertiary — subtle enough to not compete with the main button, prominent enough to be noticed. It disappears the moment all requirements are met."

**Amir Patel (Architecture):** "The validationHint function is pure — it derives hints from existing state (step, scores, wouldReturn). No new state, no new effects. Clean functional approach."

**Derek Liu (Mobile):** "This is the #1 thing I'd notice as a new user. 'Why can't I tap Next?' is a question that should never need to be asked."

**Marcus Chen (CTO):** "This is exactly the kind of polish that matters before beta. Users who get stuck on the rating flow won't come back. Every friction point we remove increases completion rate."

---

## Changes

| File | Change |
|------|--------|
| `app/rate/[id].tsx` | Added `validationHint()` function with step-specific messages |
| `app/rate/[id].tsx` | Added hint display below Next button when disabled |
| `app/rate/[id].tsx` | Added `validationHint` style |
| `__tests__/sprint621-dimension-scoring-extraction.test.ts` | Updated LOC threshold (520→540) for validation additions |
| `__tests__/sprint703-rate-validation-hints.test.ts` | 19 tests for hint function, UI, existing validation |

---

## Validation Hints by Step

| Step | Condition | Hint |
|------|-----------|------|
| 0 (Visit Type) | No type selected | "Select how you visited" |
| 1 (Scoring) | Missing scores | "Rate all dimensions" |
| 1 (Scoring) | Missing wouldReturn | "Answer \"Would you return?\"" |
| 1 (Scoring) | Both missing | "Rate all dimensions · Answer \"Would you return?\"" |
| 2-3 (Extras/Review) | Always valid | No hint shown |

---

## Health Metrics

| Metric | Value |
|--------|-------|
| Build size | 662.3kb / 750kb (88.3%) |
| Tests | 12,154 pass / 519 files |

---

## What's Next (Sprint 704)

Settings screen — logout, version info, feedback link.
