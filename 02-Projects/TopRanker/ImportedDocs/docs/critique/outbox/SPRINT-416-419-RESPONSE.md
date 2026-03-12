# Sprints 416-419 External Critique

## Verified wins
- Four UI increments were shipped with concrete scope:
  - Sprint 416: animated top-rank highlight, rank delta badge, redundant wrapper removal.
  - Sprint 417: collapsible comparison details with 5 stat categories and winner highlighting.
  - Sprint 418: map pan/zoom CTA, marker info windows, 6 beta city coordinates.
  - Sprint 419: profile activity feed with icon tiers, deep links, and show more/less.
- Testing/build hygiene appears intact by the packet’s own evidence: 319 test files, 7,603 tests passing, 42 consecutive A-range audits, 6 key files OK.
- Sprint 416 includes at least one cleanup item, not just feature add: removing redundant `FadeInView` because `RankedCard` already animates.

## Contradictions / drift
- Sprint 418 claims “Search Map Improvements,” but the key behavior is explicitly incomplete: `onSearchArea` exists and is not wired. That means the headline feature is only partially shipped.
- Sprint 416 adds indefinite `Animated.loop` effects while also asking whether they should be stopped for resource savings. That is feature-first polish drift without lifecycle/resource closure.
- Sprint 417’s “winner highlighting” is presented as comparison detail, but the implementation is only numeric-only for some fields. That creates a mismatch between the UX implication (“winner”) and the actual comparison logic.
- Sprint 418 uses raw HTML in map info windows while asking whether a branded overlay should replace it. That suggests the implementation is knowingly provisional, not a settled product decision.
- Sprint 419 introduces 4 icon tiers but the team is still unsure whether thresholds are intuitive or should be explained. Again: UI shipped before semantics were validated.

## Unclosed action items
- Wire `onSearchArea` in `search.tsx` from Sprint 418; currently incomplete and should not have been deferred if it is core to the map interaction.
- Resolve animation lifecycle for `TopRankHighlight`: stop after N cycles, pause off-screen, or otherwise cap background work.
- Clarify or narrow “winner highlighting” in `ComparisonDetails` so users are not shown pseudo-comparisons for non-numeric categories.
- Decide whether map popups remain native/raw HTML or move to custom overlay; current state reads as temporary.
- Validate or adjust `ActivityFeed` score-icon thresholds; current values are arbitrary unless grounded in user meaning.

## Core-loop focus score
**6/10**
- Rankings animation and challenger comparison are reasonably close to the ranking/voting loop.
- Profile activity feed can support retention, but it is secondary to the core loop.
- Map improvements are relevant only if they materially improve finding/ranking businesses; the main callback is not wired, so impact is reduced.
- Too much of the sprint packet is “UI added, decision deferred later.”
- Several shipped items are presentation-layer enhancements rather than completed loop improvements.

## Top 3 priorities for next sprint
1. Finish the incomplete map loop: wire `onSearchArea` and verify the pan/zoom-to-results flow actually works end to end.
2. Close the semantics gaps in shipped UI: define comparison rules for `ComparisonDetails` and validate `ActivityFeed` icon thresholds.
3. Remove avoidable resource/provisional debt: cap or pause infinite ranking animations and decide whether map popup rendering is final or temporary.

**Verdict:** This was a mostly UI-forward sprint block with decent delivery hygiene, but too many items shipped in knowingly incomplete or ambiguous states. The biggest issue is partial completion masquerading as progress: the map feature is not end-to-end, the comparison logic is semantically loose, and animation/popup decisions were deferred after implementation. The next sprint should close these gaps instead of adding more surface area.
