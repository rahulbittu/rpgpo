# Sprint 135 Critique Request

## Sprint summary
Sprint 135 shipped three features: (1) A/B testing framework (`lib/ab-testing.ts`) with DJB2 hash-based deterministic bucketing, 3 initial experiments (all inactive), QA override support, and analytics integration; (2) Confidence tooltips on search cards and leaderboard items — info icon + toggleable tooltip pulling from `RANK_CONFIDENCE_LABELS`; (3) Personalized vote weight display in Challenger's "How Voting Works" section showing logged-in users their tier influence. 10 story points, 34 new tests.

## Retro summary
9/10 morale. Three parallel streams merged without conflicts. Wins: pure-function A/B framework tested easily (34 tests), modular SubComponents pattern from Sprint 130 enabled fast tooltip integration, exposure event schema locked down from day one. Concerns: client-side bucketing leaks variants (server-side needed for high-stakes experiments, planned Sprint 137), tooltip accessibility untested with screen readers (deferred to Sprint 136), personalized weight relies on potentially stale AuthProvider tier data.

## Audit summary
Latest audit is Sprint 100 — **35 sprints ago.** Audit cadence is every 5 sprints. 7 audits are overdue (105, 110, 115, 120, 125, 130, 135). Sprint 100 findings still open: M2 (email provider — still console mode), M3 (cancel → expire placement gap), L1 (no E2E tests).

## Verified completed work
- `lib/ab-testing.ts` — A/B framework with DJB2 hashing, experiment registry, overrides, dedup (NEW, 34 tests)
- `components/search/SubComponents.tsx` — Confidence tooltip on search cards
- `components/leaderboard/SubComponents.tsx` — Confidence tooltip on leaderboard items
- `app/(tabs)/challenger.tsx` — Personalized vote weight in How Voting Works
- `tests/sprint135-ab-testing.test.ts` — 34 new tests

## Open action items
- Retro 135 #1: Wire A/B into confidence_tooltip feature (Sprint 136)
- Retro 135 #2: Server-side experiment assignment endpoint (Sprint 137)
- Retro 135 #3: Accessibility audit of tooltip interactions (Sprint 136)
- Retro 135 #4: A/B testing disclosure in privacy policy (Sprint 136)
- Retro 135 #5: Tier data staleness check (Sprint 137)
- Sprint 100 Audit M2: Email provider — 35 sprints overdue
- Sprint 100 Audit M3: Cancel → expire placement — 35 sprints overdue
- Sprint 100 Audit L1: E2E smoke tests — 35 sprints overdue
- 7 architectural audits overdue (105-135)
- README test count says "70" — actual is ~880+ (stale since Sprint 56)
- CONTRIBUTING test count says "70" — same drift
- CHANGELOG last entry: Sprint 81 — 54 sprints behind
- README sprint doc paths say `docs/SPRINT-N-*.md` — actual is `docs/sprints/`

## Known contradictions or drift
- README: "70 tests across 5 files" vs actual ~880+ across 50+ files (12x discrepancy)
- CONTRIBUTING: "currently 70, <120ms" — same stale number
- CHANGELOG: ends at Sprint 81, missing 54 sprints of entries
- README: sprint doc path `docs/SPRINT-N-*.md` vs actual `docs/sprints/SPRINT-N-*.md`
- Sprint 135 doc claims "847 tests across 50 files" but prior sprint context suggests higher
- MEMORY.md says "Next audit: Sprint 95" — that was 40 sprints ago
- Audit cadence (every 5 sprints) completely abandoned after Sprint 100
- Recent git history dominated by Replit preview fixes, not core loop work

## Changed files / product areas
- `lib/ab-testing.ts` (NEW) — A/B testing infrastructure
- `components/search/SubComponents.tsx` — Confidence tooltips on search
- `components/leaderboard/SubComponents.tsx` — Confidence tooltips on leaderboard
- `app/(tabs)/challenger.tsx` — Personalized vote weight
- `tests/sprint135-ab-testing.test.ts` (NEW) — A/B test suite
- Also in this cycle: `server/security-headers.ts`, `server/index.ts`, `.replit`, `scripts/sync-build.sh` (Replit preview fixes)

## Core-loop impact
The core loop is: **rate → consequence → ranking.**

- A/B framework: No direct impact. Infrastructure for future measurement. All experiments inactive.
- Confidence tooltips: Transparency layer — explains ranking confidence to users. Does not change how ratings produce rankings.
- Personalized vote weight: Makes consequence visible ("your tier gives you X% influence"). Closest to core loop — could motivate rating behavior, but it's read-only display.
- Net: 0 changes to `lib/data.ts` (credibility engine), `server/storage/ratings.ts`, or ranking computation. The core loop itself was not strengthened.

## Proposed next sprint
Candidates for Sprint 136:
1. Fix documentation drift (README, CONTRIBUTING, CHANGELOG — 30-min job)
2. Architectural audit (7 overdue)
3. Activate confidence_tooltip A/B experiment
4. Tooltip accessibility (screen reader labels, focus management)
5. A/B testing privacy policy disclosure
6. Core loop improvement (rating quality signals, temporal decay tuning, or anti-gaming)

## Ask
Provide an external critique with:
- verified wins
- contradictions / drift
- unclosed action items
- core-loop focus score
- top 3 priorities for next sprint
- blunt verdict
