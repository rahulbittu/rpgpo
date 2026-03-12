# External Critique Request — Sprints 396-399 External Critique

## Verified wins
- Sprint 396 shows an actual modularization win: `business/[id].tsx` dropped from 596 LOC to 476 LOC after extracting `BusinessBottomSection.tsx` (165 LOC). That is a measurable reduction in parent complexity.
- Sprint 396 notes “2 test cascades,” which at least indicates downstream impact was exercised rather than a blind move.
- Sprint 397 added concrete leaderboard UX signals: entry count badges, a high-confidence badge, and a rating CTA.
- Sprint 398 added explicit verification breakdown UI, share CTA, and follow-on CTA. That is direct post-rating UX expansion.
- Sprint 399 added autocomplete highlighting, cuisine suggestions, and a result count footer. Those are all search-discovery enhancements tied to a core entry point.

## Contradictions / drift
- Sprint 396 is framed as extraction/refactor, but the extracted component still owns business-rule logic (“3+ days” rate gating). That is not clean separation; it moved code, not responsibility boundaries.
- Sprint 396 reduced parent LOC, but the child takes 6 props. This may just be prop-drilling the same complexity into a new file rather than simplifying the interface.
- Sprint 397 adds a “high-confidence” badge with a hardcoded threshold of 10, while Sprint 398 shows verification boosts computed client-side from fixed percentages. Same pattern: product-significant trust logic is embedded in UI constants instead of sourced from shared/domain logic.
- Sprint 397’s “Rate this dish” CTA goes to generic search, not a dish-specific flow. That weakens intent capture and breaks the user’s current context.
- Sprint 398 presents a detailed verification boost breakdown, but by your own note it is not derived from actual server-side values. That risks displaying false precision.
- Sprint 398’s share CTA uses a generic business URL, not a rating-specific URL. The feature says “share,” but the destination is not the thing just created.
- Sprint 399’s result count footer excludes cuisine suggestions while the dropdown now includes cuisine suggestions. The UI is mixing result types but only partially accounting for them.
- Across 397-399, several additions are generic redirects to search/business pages instead of context-preserving flows. This is drift toward easy navigation patches over tighter core-loop completion.

## Unclosed action items
- Decide whether `BusinessBottomSection` should keep 6 discrete props or take a structured object / hook-backed interface.
- Decide where the 3+ day rate gating rule should live; it is currently UI-owned but reads like domain logic.
- Resolve whether the 10-rating “high-confidence” threshold is a stable product rule or should be configurable/shared.
- Resolve whether “Rate this dish” should remain a search redirect or become a dish-specific rating path.
- Resolve whether `RatingConfirmation` should display server-sourced verification values instead of client-side assumed percentages.
- Resolve whether share links should target rating-specific URLs rather than generic business pages.
- Resolve whether “Rate another place” should stay a generic search redirect or use a more relevant next-step target.
- Resolve whether autocomplete highlighting should support all matches instead of first match only.
- Resolve whether cuisine suggestion limit of 3 is intentional or arbitrary.
- Resolve whether cuisine suggestions should be included in the result count footer.

## Core-loop focus score
**6/10**

- Work is mostly adjacent to the core loop: business page CTA area, dish leaderboard CTA, confirmation screen, search autocomplete.
- Sprint 399 is the strongest core-loop contribution because search entry quality directly affects rating initiation.
- Sprint 398 helps post-action retention, but the share and “rate another place” CTAs are generic and not especially tight to successful repeat rating.
- Sprint 397 looks useful, but the key CTA does not complete the local intent; it punts users to search.
- Sprint 396 is mostly maintainability work, not direct loop improvement.
- Repeated use of UI-local constants and generic redirects suggests surface polish over flow integrity.

## Top 3 priorities for next sprint
1. **Fix context-breaking CTAs**
   - Replace generic search/business redirects with intent-preserving flows for dish rating, sharing, and “rate another place” where possible.
2. **Move product rules out of UI components**
   - Centralize rate gating, confidence thresholds, and verification boost definitions in shared/domain logic or server-backed values.
3. **Clean up mixed-result search semantics**
   - Make autocomplete counting, suggestion types, and highlighting behavior internally consistent instead of partially implemented.

**Verdict:** These sprints shipped real UI improvements, but too much of the logic is still hardcoded in presentation layers and too many CTAs dump users into generic destinations. The pattern is incremental surface work without enough discipline around shared product rules or intent-preserving flow design.
