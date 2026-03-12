# Sprint 661: Threshold Tracking for New Files

**Date:** 2026-03-11
**Points:** 2
**Focus:** Close Audit #115 L1/L2 — add claim.tsx and routes-claims.ts to thresholds.json

## Mission

Arch Audit #115 identified two low-severity findings: `claim.tsx` (496 LOC) and `routes-claims.ts` (107 LOC) were created in recent sprints but not tracked in the threshold system. This sprint adds them with appropriate ceilings, closing both findings.

## Team Discussion

**Sarah Nakamura (Lead Eng):** "Simple housekeeping sprint. Two new entries in thresholds.json, ceiling set with ~5% headroom. Also updated routes.ts current LOC to 382 since registerClaimRoutes added 5 lines."

**Amir Patel (Architecture):** "claim.tsx ceiling at 520 gives room for future verification UI refinements. routes-claims.ts ceiling at 130 accommodates potential new claim-related endpoints. Both follow our standard 5-15% headroom convention."

**Marcus Chen (CTO):** "This is the discipline that keeps our codebase healthy. Every new file of significance gets tracked. 15 test files updated to expect 33 tracked files instead of 31."

**Jordan Blake (Compliance):** "The threshold system now tracks 33 files across the codebase. All within their ceilings. No violations."

## Changes

### `shared/thresholds.json` (31 → 33 tracked files)
- Added `server/routes-claims.ts`: max 130, current 107
- Added `app/business/claim.tsx`: max 520, current 496
- Updated `server/routes.ts`: current 377 → 382
- Updated test count: 11,695 → 11,697
- Updated build size: 647.0 → 647.1

### Test Fixes (15 files)
- Updated tracked file count assertions from 30/31 → 33 across 15 test files in `__tests__/`

## Health
- **Tests:** 11,697 pass (501 files)
- **Build:** 647.1kb
- **Tracked files:** 33, 0 violations
