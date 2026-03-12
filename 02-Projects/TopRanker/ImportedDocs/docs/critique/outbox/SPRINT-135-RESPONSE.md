# Sprint 135 External Critique

## Verified wins
- `lib/ab-testing.ts` exists as new infrastructure with deterministic bucketing, overrides, dedup, and analytics integration.
- `tests/sprint135-ab-testing.test.ts` adds 34 tests; this is the strongest verified deliverable in the packet.
- Confidence tooltips were added in both search and leaderboard surfaces via `components/search/SubComponents.tsx` and `components/leaderboard/SubComponents.tsx`.
- Personalized vote-weight display was added in `app/(tabs)/challenger.tsx`.
- Parallel delivery appears to have landed without merge conflict churn.

## Contradictions / drift
- The biggest issue is not feature quality; it is process drift. Audit cadence is every 5 sprints, but no audit has happened since Sprint 100. Sprint 135 is itself one of 7 overdue audits.
- The sprint shipped an A/B framework, but all 3 experiments are inactive. That means the headline feature is infrastructure without user-facing validation yet.
- Core-loop claim is weak by your own packet: no changes to credibility engine, ratings storage, or ranking computation. This sprint mainly improved explanation and experimentation scaffolding, not the product’s core mechanism.
- Retro says exposure schema was locked down early, but privacy disclosure for A/B testing is still open. Instrumentation moved faster than governance.
- Retro flags client-side bucketing leakage as a known weakness and defers server-side assignment to Sprint 137. So the framework is already acknowledged as insufficient for high-stakes use.
- Personalized vote weight depends on potentially stale `AuthProvider` tier data. So one of the few user-facing additions may be inaccurate at display time.
- Documentation drift is severe and long-lived: README and CONTRIBUTING still claim ~70 tests; CHANGELOG is 54 sprints stale; sprint doc paths are wrong.
- Sprint 135 doc claims "847 tests across 50 files" while the same packet says actual is ~880+ and prior context suggests higher. Even this sprint’s own documentation baseline is unreliable.
- MEMORY.md still says "Next audit: Sprint 95," which shows operational memory is not being maintained at all.
- Recent git history being dominated by Replit preview fixes contradicts disciplined core-loop prioritization.

## Unclosed action items
- Retro 135 #1: Wire A/B into `confidence_tooltip` feature (Sprint 136).
- Retro 135 #2: Server-side experiment assignment endpoint (Sprint 137).
- Retro 135 #3: Accessibility audit of tooltip interactions (Sprint 136).
- Retro 135 #4: A/B testing disclosure in privacy policy (Sprint 136).
- Retro 135 #5: Tier data staleness check (Sprint 137).
- Sprint 100 Audit M2: Email provider still in console mode — 35 sprints overdue.
- Sprint 100 Audit M3: Cancel → expire placement gap — 35 sprints overdue.
- Sprint 100 Audit L1: E2E smoke tests — 35 sprints overdue.
- Architectural audits for 105, 110, 115, 120, 125, 130, 135 are all overdue.
- README test count is stale.
- CONTRIBUTING test count is stale.
- CHANGELOG is stale by 54 sprints.
- README sprint doc paths are stale/incorrect.
- MEMORY.md audit pointer is stale.

## Core-loop focus score
**2/10**

- No verified changes to rating ingestion, consequence mechanics, or ranking computation.
- The largest deliverable, A/B infrastructure, is inactive and therefore not yet affecting user behavior or outcomes.
- Confidence tooltips improve explanation, not the loop itself.
- Personalized vote weight is adjacent to the loop, but read-only and potentially based on stale tier data.
- Some sprint capacity also went to Replit preview fixes, which further diluted core-loop work.

## Top 3 priorities for next sprint
1. **Do an overdue architectural audit immediately and close at least one Sprint 100 audit item.** Seven missed audits is process failure, not backlog normalcy.
2. **Ship one real core-loop change** in ratings, consequence, or ranking logic, with measurement attached. Stop calling explanation-layer work core-loop progress.
3. **Close the obvious trust/compliance gaps around the new UI/instrumentation:** tooltip accessibility, privacy disclosure for A/B testing, and tier-data freshness validation.

**Verdict:** This sprint produced competent peripheral work, but it did not materially improve the core loop and it sits on top of severe operational neglect. The A/B framework is only half-shipped because experiments are inactive and assignment is knowingly weak on the client. Documentation, audits, and old audit findings have been allowed to rot for dozens of sprints. The main problem is not execution within the sprint; it is chronic failure to close foundational maintenance and governance work while continuing to add surface-area features.
