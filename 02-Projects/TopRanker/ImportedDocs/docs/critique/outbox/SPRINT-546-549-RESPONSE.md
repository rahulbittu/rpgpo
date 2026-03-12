# Sprints 546-549 External Critique

## Verified wins
- Sprint 546 delivered a concrete UX fix: `excludeQueries` removes recent/popular overlap in the search panel.
- Sprint 547 completed domain alignment from `topranker.app` to `topranker.com` across share URLs and deeplinks.
- Sprint 548 shipped visible rating-card indicators: “Photo Verified” and “Receipt Verified” badges.
- Sprint 549 added server-side leaderboard filtering for neighborhood + priceRange with chip UI.
- Test suite scale remains high and current: 10,314 tests across 438 files.
- Schema stayed flat at 996/1000 LOC, so the sprint work did not bloat the schema layer.

## Contradictions / drift
- The biggest miss is explicit: Sprint 539 launched WhatsApp sharing on `topranker.app` while deeplinks expected `topranker.com`, and this stayed broken through Sprint 547. That is core distribution-path drift that existing tests failed to catch.
- Sprint 547’s tests apparently validated URL generation but not actual deeplink resolution. That means the test suite is proving string assembly, not end-to-end behavior.
- Sprint 548 shipped “Photo Verified” badges while the click path does nothing and the carousel is not ready. That is UI promise ahead of capability.
- Sprint 549 duplicates an existing filter pattern from Discover despite already having extracted chip components there. Unless there is a documented UX difference, this is implementation drift toward parallel UI systems.
- Sprint 549 increased `index.tsx` from 423 to 505 LOC and extraction is deferred to Sprint 553. That is acknowledged debt, not controlled scope.
- “12 test threshold redirections in 4 sprints” is process drift: contract tests are creating repetitive maintenance work instead of clarifying risk.

## Unclosed action items
- Add an automated check for share URL → deeplink resolution. This is the main unclosed gap exposed by Sprint 547.
- Decide whether source-based LOC threshold assertions stay decentralized or move to a shared threshold config.
- Resolve the rating-photo interaction gap: either wire badge click to photo viewing or remove/de-emphasize the badge until expansion exists.
- Decide whether Rankings should reuse Discover chip components or document why it should not.
- Extract leaderboard filter UI from `index.tsx` to `LeaderboardFilterChips` in Sprint 553 as already planned; this is still open debt.

## Core-loop focus score
**6/10**
- 546 and 549 are core-loop improvements: better query hygiene and better ranking discovery/filtering.
- 547 matters because sharing affects acquisition, but the fact it was broken for ~8 sprints undercuts the value of the shipped work.
- 548 is the weakest on loop integrity: it adds a trust signal without the underlying photo-view flow being complete.
- Too much evidence of surface-level completion: visible UI shipped, but behavior and integration lag behind.
- Repeated threshold-test redirections suggest engineering attention is leaking into maintenance churn.

## Top 3 priorities for next sprint
1. Add one real integration/E2E check for share flows that validates domain consistency and deeplink resolution, not just generated URL strings.
2. Close the rating-photo loop: make the badge open photos, or stop presenting it as actionable verification until that exists.
3. Stop duplicating filter UI patterns: either reuse Discover chip components on Rankings or extract a shared abstraction immediately while also reducing `index.tsx` size.

**Verdict:** These sprints shipped visible output, but too much of it is partial, duplicated, or falsely validated. The strongest contradiction is that a share-domain break sat in production for ~8 sprints because tests checked the wrong thing. The second is shipping “Photo Verified” affordances without photo viewing. The next sprint should prioritize closing behavior gaps and removing duplicated implementations before adding more UI.
