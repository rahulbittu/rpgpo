# Sprint 136 Critique Request

## Sprint summary
Sprint 136 was a direct response to both internal critique (4/10 core-loop score) and external critique (2/10 core-loop score) from Sprint 135. Shipped: (1) Pioneer rate N+1 query replaced with single correlated subquery in storage/members.ts — reduces worst case from 201 queries to 1; (2) Rank recalculation O(N) loop replaced with single window-function UPDATE in storage/businesses.ts — reduces worst case from 500 queries to 1; (3) Architectural Audit #11 (Sprint 135 boundary, B+ grade, 0 Critical, 2 High, 4 Medium); (4) Fixed 79-sprint documentation drift in README, CONTRIBUTING, CHANGELOG; (5) Privacy policy Section 13 A/B testing disclosure; (6) Tooltip accessibility improvements. 13 story points, 46 new tests (1369 total across 64 files).

## Retro summary
8/10 morale. External critique stung but channeled into most impactful sprint in months. Pioneer rate and rank recalculation fixes are genuine performance multipliers. Documentation drift fix felt like clearing long-accumulated debt. Team knows Sprint 137 must close P1 audit items (payment rate limiting, storage tests, profile extraction).

## Audit summary
Audit #11 (ARCH-AUDIT-135.md): B+ grade. 0 Critical, 2 High (file sizes — 7 files over 800 LOC, test coverage gaps for core storage layer), 4 Medium (22 `as any` casts, no rate limiting on payment routes, 68 duplicated catch blocks, dependency hygiene). Core-loop performance issues found and fixed same sprint.

## Verified completed work
- Pioneer rate N+1 → single subquery (server/storage/members.ts)
- Rank recalc O(N) → window function (server/storage/businesses.ts)
- Architectural Audit #11 written (docs/audits/ARCH-AUDIT-135.md)
- README test count 70 → 1369, sprint doc paths fixed
- CONTRIBUTING test count 70 → 1369, paths fixed
- CHANGELOG backfilled Sprints 127-136 (was 54 sprints behind)
- Privacy policy Section 13: A/B testing disclosure
- Tooltip accessibility: accessible={true} + accessibilityLabel on both surfaces
- 46 new tests (1369 total, 64 files, <1.1s)

## Open action items
- Audit P1: Add rate limiting to payment routes (Nadia Kaur, Sprint 137)
- Audit P1: Write tests for storage/members.ts + storage/ratings.ts (Sarah Nakamura, Sprint 137)
- Audit P1: Extract profile.tsx sub-components (1073 LOC) (Priya Sharma, Sprint 137)
- Retro 135 #2: Server-side experiment assignment endpoint (Marcus Chen, Sprint 137)
- Retro 135 #5: Tier data staleness check (Sarah Nakamura, Sprint 138)
- Audit P2: Extract wrapAsync middleware — 68 catch blocks (Amir Patel, Sprint 138)
- Audit P2: Sanitize req.query.city/category in 6 locations (Sprint 138)
- Audit P2: Move @types/* to devDependencies (Sprint 138)
- Client/server logic duplication (lib/data.ts vs server/storage/helpers.ts)

## Known contradictions or drift
- Sprint doc says "1351 total tests" but actual run shows 1369 — sprint doc was written before final test count
- MEMORY.md Current State now says "1323+ tests" but actual is 1369 — needs update
- Audit cadence says "every 5 sprints" — next should be Sprint 140, verify this happens

## Changed files / product areas
- server/storage/members.ts — Pioneer rate query optimization (core loop)
- server/storage/businesses.ts — Rank recalculation optimization (core loop)
- README.md, CONTRIBUTING.md, CHANGELOG.md — Documentation drift fix
- app/legal/privacy.tsx — A/B testing disclosure (compliance)
- components/search/SubComponents.tsx — Tooltip accessibility
- components/leaderboard/SubComponents.tsx — Tooltip accessibility
- docs/audits/ARCH-AUDIT-135.md — Audit document
- tests/sprint136-core-loop-perf.test.ts — 26 core-loop tests
- tests/sprint136-privacy-ab-audit.test.ts — 20 compliance/accessibility tests

## Core-loop impact
This sprint made the first direct changes to the core loop (rate → consequence → ranking) since Sprint 132:
- **Rate → Consequence**: Pioneer rate calculation (which feeds credibility score) went from O(N) queries to O(1). This directly speeds up how a rating's consequence is computed.
- **Consequence → Ranking**: Rank recalculation went from O(M) sequential UPDATEs to a single window-function statement. This directly speeds up how rankings update after a rating.
- Combined: worst-case queries per rating submission dropped from ~700+ to ~2.
- No changes to the scoring formulas themselves — the math is correct, it was the implementation that needed optimization.

## Proposed next sprint
Sprint 137 priorities (closing P1 audit items + Retro 135 carryovers):
1. Add rate limiting to payment routes (security P1)
2. Write dedicated tests for storage/members.ts + storage/ratings.ts (coverage P1)
3. Extract profile.tsx sub-components (file size P1, 1073 LOC)
4. Server-side experiment assignment endpoint /api/experiments/assign (Retro 135 #2)
5. Activate confidence_tooltip A/B experiment (Retro 135 #1 — experiments have been inactive since Sprint 135)

## Ask
Provide an external critique with:
- verified wins
- contradictions / drift
- unclosed action items
- core-loop focus score
- top 3 priorities for next sprint
- blunt verdict
