# Sprint 135 Critique

## Verified wins

- **A/B testing framework is well-architected.** Pure functions, deterministic DJB2 hashing, no side effects, override support for QA, deduplication on exposure events. 34 tests. This is solid infrastructure that will compound.
- **Confidence tooltips landed on both surfaces (search + leaderboard).** Consistent UX, local state per card, content sourced from `RANK_CONFIDENCE_LABELS` — stays in sync with the confidence system. This directly serves transparency.
- **Personalized vote weight in Challenger.** Showing users their tier's influence makes the credibility system tangible. Logged-out fallback is sensible.
- **Compliance flagged A/B testing consent early.** Jordan Blake's GDPR Article 22 note is exactly the kind of proactive legal awareness that prevents fires.
- **Clean parallel execution.** Three independent streams merged without conflicts. The team's decomposition discipline is real.

## Contradictions / drift

1. **README says "70 tests across 5 files" and "Vitest | 70 tests, <120ms execution."** Sprint 135 doc says 847 tests across 50 files. Actual repo likely has 880+ (847 + 34 new). The README has been wrong since Sprint 56 — **79 sprints of documentation drift.** This is not minor. Any new contributor reads the README first and gets a number that's off by 12x.

2. **CONTRIBUTING says "currently 70, <120ms" and "all 70+ tests passing."** Same stale number. The PR checklist references a test count that hasn't been true for 79 sprints.

3. **CHANGELOG ends at Sprint 81.** Sprint 135 means 54 sprints of changelog are missing. The CHANGELOG section in the packet starts mid-Sprint-81 with no header — it's a fragment, not a maintained document.

4. **Sprint doc paths disagree.** README says `docs/SPRINT-N-*.md` and "See individual sprint docs in `docs/SPRINT-N-*.md`". MEMORY.md says `docs/sprints/SPRINT-N-*.md`. The actual files are in `docs/sprints/`. README is wrong.

5. **Audit cadence is broken.** CONTRIBUTING says "every 5 sprints" with output in `docs/audits/ARCH-AUDIT-N.md`. Latest audit is Sprint 100. At every-5-sprint cadence, audits should exist at 105, 110, 115, 120, 125, 130, 135. That's **7 missed audits.** The Sprint 100 audit says "Next audit at Sprint 105" — it never happened.

6. **Sprint doc says "Total test count: 847 tests across 50 files."** But the Sprint 134 doc (prior sprint) and the actual test file count from recent commits suggest higher numbers. The sprint doc's own test count may be stale within the sprint it was written.

7. **Recent commits are dominated by Replit preview fixes, not core loop work.** Of the 10 most recent commits, 6 are about Replit preview, sync-build, or merge operations. Only 1 commit relates to the confidence thresholds feature. The sprint doc describes clean feature work, but git history tells a different story of firefighting.

## Unclosed action items

| Source | Item | Status |
|--------|------|--------|
| Retro 135, #1 | Wire A/B experiments into confidence_tooltip — activate experiment, connect variant to tooltip visibility | Target: Sprint 136 — **open** |
| Retro 135, #2 | Server-side experiment assignment endpoint `/api/experiments/assign` | Target: Sprint 137 — **open** |
| Retro 135, #3 | Accessibility audit of tooltip interactions — screen reader labels, focus management | Target: Sprint 136 — **open** |
| Retro 135, #4 | Add A/B testing disclosure to privacy policy | Target: Sprint 136 — **open** |
| Retro 135, #5 | Tier data staleness check for personalized weight | Target: Sprint 137 — **open** |
| Sprint 100 Audit, M2 | Email provider (still using console mode) | Target: Sprint 101 — **35 sprints overdue** |
| Sprint 100 Audit, M3 | Cancel → expire placement gap | Target: Sprint 101 — **35 sprints overdue** |
| Sprint 100 Audit, L1 | E2E smoke tests (no end-to-end tests) | Flagged Sprint 100 — **still open** |
| Audit cadence | Architectural audits every 5 sprints | Last: Sprint 100 — **7 audits overdue** |
| MEMORY.md | "Next audit: Sprint 95" | Sprint 95 was 40 sprints ago — **MEMORY.md itself is stale** |
| README/CONTRIBUTING | Test count "70" | Stale since Sprint 56 — **79 sprints overdue** |
| CHANGELOG | Maintained changelog | Last entry: Sprint 81 — **54 sprints behind** |

## Core-loop focus score

**4 / 10**

- The core loop is: **rate → consequence → ranking.** A user rates, their credibility determines consequence (vote weight), and rankings update accordingly.
- A/B testing framework is **infrastructure**, not core loop. It enables future measurement but doesn't strengthen rate→consequence→ranking today. All 3 experiments ship inactive.
- Confidence tooltips are **transparency UX** — they explain the ranking system but don't improve it. Users don't rate more or better because they see a tooltip.
- Personalized vote weight display is the **closest to core loop** — it makes consequence visible, which could motivate rating behavior. But it's read-only UI, not a system improvement.
- No work was done on: rating quality signals, ranking algorithm improvements, credibility scoring refinements, temporal decay tuning, or anti-manipulation measures.
- No work was done on closing the 7 overdue architectural audits that would surface systemic issues in the core loop.
- The sprint shipped 0 changes to `lib/data.ts` (credibility engine), `server/storage/ratings.ts` (rating persistence), or ranking computation.

## Top 3 priorities for next sprint

1. **Fix documentation drift.** README test count (70 → actual), CONTRIBUTING test count, CHANGELOG (54 sprints behind), sprint doc paths (`docs/SPRINT-N-*.md` → `docs/sprints/`). This is a 30-minute job that's been ignored for 79 sprints. Do it first.

2. **Run an architectural audit.** You're 7 audits behind schedule. Sprint 135 is an audit boundary (every 5 sprints). The audit will surface real issues in the core loop that feature work alone won't find. The process exists — use it.

3. **Ship something that improves rate→consequence→ranking.** Examples: rating quality signals that feed credibility, ranking recalculation on tier changes, temporal decay tuning based on actual data, or anti-gaming measures. The A/B framework is ready — activate the `confidence_tooltip` experiment and measure whether it changes rating behavior. Infrastructure without activation is inventory, not value.

**Verdict:** Sprint 135 shipped competent infrastructure (A/B framework) and useful UX touches (tooltips, personalized weight), but none of it changes how ratings flow into rankings. The team is building around the core loop instead of through it. Meanwhile, foundational hygiene has collapsed: the README has been wrong for 79 sprints, the CHANGELOG is 54 sprints stale, 7 architectural audits are overdue, and 2 medium-severity findings from Sprint 100 remain open 35 sprints later. The retro reports 9/10 morale and "closing backlog items feels good" — but the backlog of documentation and process debt is growing faster than the team acknowledges. Ship less new infrastructure. Fix what's broken. Activate what's been built. Audit what's been ignored.
