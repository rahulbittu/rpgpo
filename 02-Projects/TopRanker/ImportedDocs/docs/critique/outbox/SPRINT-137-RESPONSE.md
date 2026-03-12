# Sprint 137 External Critique

## Verified wins
- Closed the three cited Audit #11 P1 items with evidence in the packet:
  - file size reduction on `app/(tabs)/profile.tsx` from 1073 → 671 LOC
  - 100 storage tests added across `storage/members.ts` and `storage/ratings.ts`
  - payment rate limiting implemented at 20 req/min
- Added `adminRateLimiter` at 30 req/min and isolated limiter namespaces via `keyPrefix` in `server/rate-limiter.ts`.
- Added server-side experiment assignment via `GET /api/experiments/assign`, with 19 tests and stated DJB2 parity verification.
- Applied input sanitization to 8 previously unsanitized `req.query` / `req.body` params.
- Net test count increased by 119, to 1488 across 67 files.

## Contradictions / drift
- The sprint claims all three prior external critique priorities were addressed, but the experiment pipeline is still not actually active: `confidence_tooltip` remains unactivated despite “infrastructure complete.”
- “Core-loop impact” is framed positively, but the packet admits there were no direct changes to scoring, ranking, or credibility formulas. This was an infra/test sprint, not a core-loop improvement sprint.
- The proposed next sprint is a design/animation sprint, while major structural cleanup remains open: 68 duplicated catch blocks, client/server logic duplication, stale deps, and tier-data staleness checks.
- Backend/infra concentration continues across Sprints 134–137, and the proposed response is mostly polish work rather than resolving remaining product and architecture drift.
- Audit P1s are closed, but known P2 debt remains broad and repeated enough to be chronic, not incidental.

## Unclosed action items
- Extract `wrapAsync` middleware; 68 duplicated catch blocks remain across route files.
- Resolve client/server logic duplication between `lib/data.ts` and `server/storage/helpers.ts`.
- Activate the `confidence_tooltip` A/B experiment now that assignment infrastructure exists.
- Add tier data staleness checks for personalized weight.
- Move `@types/*` packages to `devDependencies`.
- Remove unused packages: `expo-google-fonts/inter`, `expo-symbols`.
- Address complete lack of design/animation work across Sprints 134–137 if that is actually considered a product requirement.
- Enforce audit cadence toward Sprint 140 instead of just noting it.

## Core-loop focus score
**4/10**

- The sprint improved confidence in core-loop mechanics through tests, but did not change the mechanics themselves.
- Storage and ratings coverage is useful because it validates vote weight, anomaly detection, and ranking integrity.
- Payment/admin rate limiting is operationally valuable but peripheral to the user core loop.
- Experiment assignment infrastructure is only partial value until an experiment is actually activated and measured.
- Profile file extraction is maintainability work, not core-loop work.
- Too much of the sprint value is defensive/infra rather than user-visible loop improvement.

## Top 3 priorities for next sprint
1. **Activate and run the `confidence_tooltip` experiment**
   - Infrastructure without activation is dead weight.
   - Ship exposure, assignment, and measurement on a live experiment before building more experiment plumbing.

2. **Fix the biggest repeated architecture debt**
   - Extract `wrapAsync` and remove the 68 duplicated catch blocks.
   - Resolve client/server business-logic duplication so rules are not split across `lib/data.ts` and `server/storage/helpers.ts`.

3. **Close the remaining data integrity gap**
   - Implement tier data staleness checks for personalized weight.
   - This is closer to actual ranking correctness than adding animations, audio, or transitions.

**Verdict:** Sprint 137 was competent cleanup and infrastructure work, and it did close the stated P1 audit items. But the packet overstates core-loop progress: most of the sprint was verification, hardening, and maintainability, not product movement. The biggest drift is proposing a broad animation/polish sprint while experiment activation, duplicated backend error handling, shared-logic divergence, and personalized-weight correctness are still open.
