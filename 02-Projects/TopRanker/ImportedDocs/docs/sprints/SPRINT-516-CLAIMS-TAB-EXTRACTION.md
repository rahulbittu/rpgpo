# Sprint 516: Admin Claims Tab Extraction

**Date:** 2026-03-10
**Story Points:** 3
**Status:** Complete
**Tests:** 14 new (9,512 total across 405 files)

## Mission

Extract the claims tab rendering from `app/admin/index.tsx` into a standalone `ClaimsTabContent` component to resolve the 603 LOC watch file flagged in Audit #61. Reduce admin dashboard complexity while preserving all functionality.

## Team Discussion

**Marcus Chen (CTO):** "The admin dashboard crossed 600 LOC — our audit caught it immediately. This is exactly why we run architectural audits every 5 sprints. Extraction is the right move: isolate the claims tab, pass data as props, and bring admin/index.tsx back under threshold."

**Amir Patel (Architecture):** "The extraction pattern is clean: ClaimsTabContent receives claims data, evidence array, loading state, action handler, and a QueueItem component type as props. No state management moves — the parent still owns all queries and handlers. This is a pure render extraction."

**Sarah Nakamura (Lead Eng):** "We also had to redirect the sprint509 tests. The claims wiring tests were reading admin/index.tsx for ClaimEvidenceCard references, but those moved to ClaimsTabContent.tsx. Updated the test to read both files and check each for its own responsibilities."

**Rachel Wei (CFO):** "603→585 LOC. That's an 18-line reduction with a clean component boundary. The watch file from Audit #61 is resolved. We should see this reflected in Audit #62 at Sprint 520."

## Changes

### New Files

| File | LOC | Purpose |
|------|-----|---------|
| `components/admin/ClaimsTabContent.tsx` | 97 | Extracted claims tab: QueueItem cards + ClaimEvidenceCard + empty/loading states |
| `__tests__/sprint516-claims-tab-extraction.test.ts` | 84 | 14 tests covering extraction, props, LOC thresholds |

### Modified Files

| File | Before | After | Delta | Change |
|------|--------|-------|-------|--------|
| `app/admin/index.tsx` | 603 | 585 | -18 | Replace inline claims rendering with `<ClaimsTabContent>` |
| `__tests__/sprint509-claim-v2-dashboard.test.ts` | 128 | 128 | 0 | Redirect claims wiring tests to read ClaimsTabContent |

### Architecture

- **Component extraction pattern:** Parent owns data (useQuery), child owns rendering
- **Props interface:** `claims`, `claimEvidence`, `claimsLoading`, `isFullTab`, `onClaimAction`, `QueueItem`
- **QueueItem passed as component type** — avoids circular dependency, keeps ClaimsTabContent reusable
- **LOC thresholds:** ClaimsTabContent < 110, admin/index.tsx < 600

## PRD Gaps Closed

- Admin dashboard LOC watch file resolved (Audit #61 action item)

## Test Summary

- `__tests__/sprint516-claims-tab-extraction.test.ts` — 14 tests
  - ClaimsTabContent exports, QueueItem rendering, evidence matching, empty/loading states, LOC < 110
  - Admin imports, prop passing, no inline claim rendering, LOC < 600, other tabs retained
- `__tests__/sprint509-claim-v2-dashboard.test.ts` — redirected 6 claims wiring tests to read both files
