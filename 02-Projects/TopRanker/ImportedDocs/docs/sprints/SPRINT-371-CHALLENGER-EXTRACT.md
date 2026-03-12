# Sprint 371: Extract Challenger Tip + Status Badge

**Date:** March 10, 2026
**Story Points:** 2
**Focus:** Extract onboarding tip card and persistence hook from challenger screen

## Mission
challenger.tsx was at 543 LOC (99% of 550 threshold) for 2 consecutive audits. SLT-370 prioritized extraction. This sprint moves the tip card, tip persistence hook, and all tip styles into `components/challenger/ChallengerTip.tsx`, reducing challenger.tsx by 64 lines.

## Team Discussion

**Amir Patel (Architecture):** "challenger.tsx dropped from 543 to 479 LOC — 87% of the 550 threshold. The extracted component is 87 LOC with self-contained hook (useChallengerTip), component (ChallengerTipCard), and styles."

**Sarah Nakamura (Lead Eng):** "The useChallengerTip hook encapsulates the AsyncStorage read/write pattern. The ChallengerTipCard accepts a single onDismiss prop. challenger.tsx no longer needs the direct AsyncStorage import."

**Priya Sharma (QA):** "19 new tests for the extraction. Updated sprint107 test to check ChallengerTip.tsx instead of challenger.tsx for the persistence key. 280 test files, 6,823 tests, all passing."

**Marcus Chen (CTO):** "This extraction was overdue — the file sat at 99% for 2 governance cycles (Audits #55 and #56). The proven extraction pattern (identify, extract, update tests) delivered cleanly. 64 lines extracted is significant."

## Changes

### `components/challenger/ChallengerTip.tsx` (NEW — 87 LOC)
- `useChallengerTip()` — Hook managing tip visibility + AsyncStorage persistence
- `ChallengerTipCard` — Presentational tip card with onDismiss callback
- Self-contained styles: tipCard, tipIcon, tipTextStack, tipTitle, tipSubtext, tipDismiss

### `app/(tabs)/challenger.tsx` (543→479 LOC, -64 lines)
- Replaced inline tip state/effects with `useChallengerTip()` hook
- Replaced inline tip JSX with `<ChallengerTipCard>` component
- Removed 7 tip-related style definitions
- Removed AsyncStorage direct import

### Test updates
- `tests/sprint371-challenger-extract.test.ts` (NEW — 19 tests)
- `tests/sprint107-full-team.test.ts` — Redirected tip key assertion to ChallengerTip.tsx

## Test Results
- **280 test files, 6,823 tests, all passing** (~3.7s)
- **Server build:** 599.3kb (unchanged)
