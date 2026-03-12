# Sprints 320-324 External Critique

## Verified wins
- Sprint 321 has a clear core-loop improvement: Discover empty states were changed from dead ends into dish discovery paths. That is a direct user-path fix, not just cleanup.
- Sprint 322 shipped an end-to-end business dish rankings flow: storage query → API route → React Query component → page integration. That is a verified vertical slice.
- Sprint 323 removed broken Best In subcategory chips after identifying that `selectedBestIn` was set but never passed to the leaderboard query. Removing a non-functional control is better than leaving fake affordances live.
- Sprint 324 improved leaderboard enrichment with a batch `getBatchDishRankings()` path for dish badges on business cards, which addresses the more scalable pattern for list views.
- Sprint 320 shows some governance/architecture activity occurred (`SLT-320 meeting`, `Arch Audit #46`), though no impact is evidenced here beyond process.

## Contradictions / drift
- Sprint 323 is framed as “Rankings cleanup,” but the packet itself raises the possibility that `selectedBestIn` maybe should have been wired instead of removed. That means the team may have resolved implementation debt by deleting product surface without first validating product intent.
- Sprint 324 introduces batch badge enrichment on cards, while Sprint 322 still leaves the single-business endpoint with an acknowledged N+1. You improved the list path but left the underlying data access model inconsistent.
- The packet asks whether 3 is the right max for `getBatchDishRankings()`. Shipping a hardcoded display/data limit before proving the UI and product constraint is a sign of implementation-first decisions.
- Test threshold bumps for `sprint171` and `sprint280` due to `routes.ts` growth are a process smell. If route growth repeatedly requires threshold relaxation, the metric is being managed around rather than the file/architecture being improved.
- The Rankings page had 5 filter-row layers before Sprint 323 cleanup. That strongly suggests feature stacking outpaced UX review. The broken Best In chips were likely not an isolated bug but an outcome of uncontrolled filter accretion.
- Sprint 320 includes cuisine mapping plus governance/audit work, but the later sprints focus on rankings/discovery/card badges. There is no clear through-line showing the Chinese cuisine work fed the subsequent core loop in these sprints.

## Unclosed action items
- Decide whether Best In subcategory filtering is product-required or should stay removed. Right now the team removed a broken UI, but the product question is still unresolved.
- Fix the N+1 in `getBusinessDishRankings` from Sprint 322. The packet explicitly says it was flagged in retro and remains.
- Revisit whether the `getBatchDishRankings()` max of 3 should be configurable or at least justified by UI constraints and performance data.
- Review the route/test threshold bump pattern. If `routes.ts` growth keeps forcing threshold changes, the thresholds are not the root problem.
- Do an explicit UX review of Rankings navigation/filter complexity rather than waiting for another cleanup sprint after layering more controls.

## Core-loop focus score
**6/10**
- Sprint 321 directly improved a user dead end into a discovery path; that is strong core-loop work.
- Sprint 322 also supports the core loop by surfacing dish rankings at the business level in a full-stack way.
- Sprint 324 likely improves scanability on cards, but it also adds presentation complexity before fully resolving backend consistency.
- Sprint 323 was necessary cleanup, but it is reactive cleanup of a broken feature that should not have shipped broken.
- Sprint 320 appears partially off-loop in this packet: governance and audit are listed, but no user impact is evidenced.
- The presence of UX complexity, broken filters, hardcoded limits, and unresolved N+1s shows execution drift around the loop rather than disciplined simplification.

## Top 3 priorities for next sprint
1. **Resolve rankings data-path inconsistency:** eliminate the remaining N+1 in `getBusinessDishRankings` and align single-item and batch ranking retrieval patterns.
2. **Make a product decision on Rankings filters:** either properly wire Best In filtering end-to-end or formally kill the concept; stop leaving ambiguous half-features.
3. **Constrain Rankings UI complexity:** do a focused UX pass on filter/navigation layers and set explicit rules for adding ranking controls before more badge/filter stacking continues.

**Verdict:** This was a mixed sprint block: there are real user-facing gains in empty-state recovery and business dish rankings, but too much of the work reads like patching over incremental feature stacking. The biggest issue is inconsistency: broken filters were shipped, then removed; batch ranking access was improved, while the single-business path still carries known N+1 debt; hardcoded limits and threshold bumps suggest implementation convenience is outrunning product and architectural discipline.
