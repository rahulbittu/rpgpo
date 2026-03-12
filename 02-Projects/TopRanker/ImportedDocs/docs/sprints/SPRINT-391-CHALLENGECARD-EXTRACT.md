# Sprint 391: Extract ChallengeCard from challenger.tsx

**Date:** 2026-03-09
**Type:** Code Health (P0 Extraction)
**Story Points:** 5

## Mission

Extract the ChallengeCard component from `app/(tabs)/challenger.tsx` into `components/challenger/ChallengeCard.tsx`. The file was at 95% of its 575 LOC threshold — flagged as ACTION in Audit #60 and prioritized as P0 in SLT-390.

## Team Discussion

**Marcus Chen (CTO):** "This is the same pattern we ran with index.tsx at Sprint 386. File hits 95%, we extract before it breaks. challenger.tsx goes from 544 to 142 LOC — that's a 74% reduction. Largest single extraction we've ever done."

**Sarah Nakamura (Lead Eng):** "ChallengeCard was the obvious candidate — it's a self-contained component with its own state, hooks, styles, and JSX. The challenger screen becomes a pure shell: query data, render list. Clean separation."

**Amir Patel (Architecture):** "The extraction moved 5 imports worth of hooks (usePressAnimation, useShareCard, useAuth, useExperiment, formatCountdown) out of the screen file. challenger.tsx now only imports what it needs for the screen shell: useQuery, useCity, Haptics."

**Priya Sharma (Frontend):** "Test cascade was 4 files this time: sprint389, sprint363, sprint144, sprint107. All redirected to the new ChallengeCard.tsx path. The pattern is well-established — we can do these cascades efficiently now."

**Jasmine Taylor (Marketing):** "The component structure makes future card enhancements easier. If we want to add swipe-to-vote or card animations, we're working in an isolated file, not a 500-line screen."

## Changes

### Modified Files
- `app/(tabs)/challenger.tsx` — Removed ChallengeCard function + 30 card-specific styles. 544 → 142 LOC (-402 lines, 74% reduction)
- `tests/sprint389-challenger-timer.test.ts` — Redirected readFile to ChallengeCard.tsx
- `tests/sprint363-challenger-refresh.test.ts` — Redirected card assertions to ChallengeCard.tsx
- `tests/sprint144-product-validation.test.ts` — Added ChallengeCard.tsx checks for experiment/extraction tests
- `tests/sprint107-full-team.test.ts` — Redirected TYPOGRAPHY check to ChallengeCard.tsx
- `tests/sprint371-challenger-extract.test.ts` — Updated LOC threshold from 575 to 175

### New Files
- `components/challenger/ChallengeCard.tsx` — Extracted component (320 LOC) with full card logic + styles
- `tests/sprint391-challengecard-extract.test.ts` — 16 tests

## Test Results
- **296 files**, **7,144 tests**, all passing
- Server build: **599.3kb**, 31 tables
