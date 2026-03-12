# Sprint 581: Claim Progress Timeline UI

**Date:** 2026-03-10
**Story Points:** 3
**Status:** Complete

## Mission

Add a step-by-step vertical timeline to the ClaimStatusCard showing the claim's journey from submission through verification to decision. Users see exactly where their claim stands in the process.

## Team Discussion

**Marcus Chen (CTO):** "The status card from Sprint 579 shows state but not progress. The timeline shows the journey — much better for managing user expectations during a multi-day review process."

**Priya Sharma (Design):** "Four steps with clear visual indicators: green circle for complete, amber for active, gray for upcoming, red for failed. The vertical line connects steps and changes color based on progress."

**Dev Okonkwo (Frontend):** "The getSteps function adapts to all three claim states. Pending shows steps 1-2 complete, 3-4 upcoming. Approved shows all green. Rejected shows steps 1-2 green, step 3 red, step 4 red."

**Sarah Nakamura (Lead Eng):** "Clean separation — ClaimProgressTimeline is a pure display component that takes props. ClaimStatusCard handles the data fetching. No coupling."

## Changes

### New Files
- **`components/business/ClaimProgressTimeline.tsx`** (100 LOC)
  - `ClaimProgressTimelineProps`: claimStatus, verificationMethod, submittedAt, reviewedAt
  - `TimelineStep` interface with label, icon, status, detail, timestamp
  - `StepStatus` type: complete | active | upcoming | failed
  - `getSteps()` generates 4 steps based on claim status
  - `stepColor()` maps status to visual color
  - Vertical timeline with circles, connecting lines, timestamps

### Modified Files
- **`components/business/ClaimStatusCard.tsx`** (+2 LOC)
  - Imports ClaimProgressTimeline
  - Renders timeline between status header and CTA buttons

### Test Files
- **`__tests__/sprint581-claim-timeline.test.ts`** (21 tests)
  - Component structure (6), step generation per status (5), visual styling (4)
  - Date formatting (2), integration with ClaimStatusCard (2), LOC threshold (1), misc (1)

### Threshold Updates
- `shared/thresholds.json`: tests 11010→11031

## Test Results
- **11,031 tests** across 469 files, all passing in ~6.0s
- Server build: 716.8kb (unchanged — client-only component)
