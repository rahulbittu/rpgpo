# Sprints 641-644 External Critique

## Verified wins
- Sprint 641 appears to have completed the minimum wiring needed for proximity to affect search: user lat/lng is passed into `SearchContext`, and the proximity signal from Sprint 639 is connected into result processing.
- Sprint 644 appears to have shipped a full basic share loop, not just UI chrome: share button added to `SortResultsHeader`, share URL generation via `buildSearchUrl`, share copy via `getSearchShareText`, and share analytics tracking.
- Sprint 643 shows a coherent Challenger refresh rather than random visual edits: badge, subtitle rewrite, and empty-state update all point in the same presentation direction.
- Sprint 642 established a clearer visual button pattern for business detail actions instead of leaving mixed styling.

## Contradictions / drift
- Sprint 641 says “Wire Proximity to Frontend Search,” but the packet only proves signal plumbing, not that proximity materially changes ranking outcomes. Wiring is not impact.
- The proximity weighting listed in the review questions makes the feature look strategically underpowered: proximity at `0.08` is lower than text, category, dish, volume, and barely above city. That conflicts with the apparent importance implied by dedicating a sprint to proximity.
- Sprint 644 claims “Search Share Button,” but the open question says the current UX is clipboard + Alert. That is not really a native mobile share experience; the implementation sounds web-leaning while the review questions are framed as mobile UX concerns.
- Sprint 643 adds a `LIVE` badge, but the team itself questions whether it implies real-time behavior they may not provide. That is product-language drift: urgency/status language without confirmed backing behavior.
- Sprint 642 adopts 40x40 tap targets while simultaneously asking whether 44px is needed per Apple HIG. That means the shipped pattern likely knowingly undershoots a common mobile accessibility baseline.
- The packet mixes feature delivery with unresolved design-system debt: `ActionButton` pattern changes, `LIVE` status semantics, and file-ceiling concerns are all still open-ended after shipment. That suggests polishing before standards were settled.

## Unclosed action items
- Decide whether search sharing should use native share sheet vs clipboard fallback; current packet does not show this is resolved.
- Replace Alert-based feedback for share completion with a better feedback pattern if this is mobile-first; question is still open.
- Validate whether the `LIVE` badge is semantically accurate for Challenger or remove/rename it.
- Reassess action button touch target sizing; 40x40 is shipped, but accessibility compliance is still unresolved.
- Reassess search ranking weights with explicit product intent for proximity; current packet gives weights but no evidence of tuning or outcome validation.
- Address file ceiling creep in `DiscoverFilters` and `analytics.ts`; team is already seeing the warning signs and has not closed them.

## Core-loop focus score
**6/10**
- Sprint 641 is core-loop relevant because search ranking quality directly affects discovery.
- Sprint 644 is adjacent to the core loop: sharing can drive acquisition, but it does not improve the primary search/select/use flow itself.
- Sprint 642 is mostly presentation polish; weak core-loop contribution.
- Sprint 643 is mostly page modernization and messaging polish; again weak direct core-loop impact.
- The strongest core-loop item, proximity, appears under-validated and possibly underweighted, which reduces the score.
- Too much of the packet is UI semantics and polish questions rather than measured search/discovery improvements.

## Top 3 priorities for next sprint
1. **Prove or fix proximity ranking**
   - Run outcome checks on ranking changes, not just wiring.
   - If proximity is meant to matter for food/delivery behavior, `0.08` likely needs justification or retuning.
   - Define when proximity should dominate versus when relevance should dominate.

2. **Resolve misleading/mobile-inconsistent UX patterns**
   - Replace clipboard + Alert with a deliberate share UX strategy.
   - Remove or rename `LIVE` unless the page truly behaves live.
   - Fix action targets to an accepted accessibility minimum instead of debating after rollout.

3. **Pay down obvious structural debt on next touch**
   - Extract from `DiscoverFilters` and `analytics.ts` before they become harder to change.
   - Stop shipping UI/pattern changes into files already at ceiling.
   - Treat file ceiling warnings as active debt, not future trivia.

**Verdict:** This batch shipped visible changes, but too much of it is cosmetic or half-committed. The only major core-loop item—proximity—looks more “connected” than “validated,” while several shipped choices are already being second-guessed by the team itself: non-native share UX, questionable `LIVE` semantics, and undersized touch targets. The work is not cleanly closed; it reads like implementation first, product/accessibility decisions later.
