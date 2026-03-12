# Sprints 381-384 External Critique

## Verified wins
- `DiscoverEmptyState` extraction has the clearest payoff: `search.tsx` dropped from 851 → 751 LOC and the feature added concrete UX improvements.
- Receipt verification UI is a real product-surface addition, not just refactor work: upload flow, camera/gallery pickers, preview, badge, and `isReceipt: true` flag are specific shipped changes.
- Profile history pagination added a visible usability improvement with explicit behavior: 10 initial items, +10 expansion, reset to 10, remaining count in button.
- Test suite is still green at stated scale: 291 files, 7,045 tests passing.
- Arch Audit remains stable at Grade A, which at minimum suggests these changes did not obviously degrade broad architectural checks.

## Contradictions / drift
- Sprint 381 is framed as extraction, but the measurable result is weak: `business/[id].tsx` only moved 604 → 596 LOC. That is not meaningful decomposition; it is component shuffling with near-zero complexity reduction.
- Sprint 384 increased `profile.tsx` from 671 → 709 LOC while being presented as an improvement. Functionally useful, but architecturally this is the opposite of simplification.
- Sprint 382 added meaningful capability, but `RatingExtrasStep` grew 391 → 506 LOC. That is a clear hotspot getting worse. Calling it “receipt verification UI” understates that the step is now oversized and accumulating concerns.
- The stated extraction pattern includes “redirect tests,” and Sprint 383 explicitly required 5 test files to be rewritten due to extraction. That implies tests are too coupled to file structure/component boundaries rather than behavior. The pattern is not scaling cleanly.
- Scope is split between refactors and feature work without a clear through-line. Only receipt verification directly strengthens the rating core loop. Empty states and history pagination are adjacent; action bar extraction is mostly maintenance.

## Unclosed action items
- `RatingExtrasStep` extraction decision is unresolved. At 506 LOC after adding receipt upload, this is not a hypothetical future issue.
- Testing strategy is unresolved. The packet itself flags the “test cascade problem,” and Sprint 383 provides evidence it already exists.
- CTA destination for “Be the first to rate” is unresolved. That is a core conversion-path question, not polish.
- Client-side history pagination has no stated threshold or migration plan to API pagination.
- Extraction cadence/criteria are unresolved. The packet asks if 4 extractions in 3 sprints is too eager, which means there is no explicit rule for when extraction is justified.

## Core-loop focus score
**6/10**
- Receipt verification is strong core-loop work because it directly improves rating trust and likely rating quality.
- Discover empty-state improvements can support contribution/review generation, but the CTA ambiguity weakens the loop impact.
- History pagination helps consumption, not creation; useful, but secondary to the main growth loop.
- BusinessActionBar extraction is mostly maintenance and does not materially move user behavior or system quality based on the evidence given.
- Too much of the sprint narrative is about file movement and LOC deltas instead of conversion, completion, or integrity outcomes.
- The strongest feature work also created the clearest new hotspot (`RatingExtrasStep` at 506 LOC), so core-loop progress came with avoidable debt.

## Top 3 priorities for next sprint
1. **Extract receipt upload/verification out of `RatingExtrasStep` now.**  
   506 LOC is already too large for a step component handling flow logic plus media selection, preview, badge UI, and async upload behavior.

2. **Fix test strategy to reduce extraction-triggered rewrites.**  
   Move tests up to behavior/user-flow boundaries where possible; stop letting component/file reshuffles force assertion rewrites unless behavior changed.

3. **Resolve the empty-state CTA and define a pagination threshold.**  
   Pick the destination that shortens time-to-first-rating, then set an explicit cutoff for when client-side history pagination must move to API-backed pagination.

**Verdict:** This packet shows one meaningful core-loop improvement, two decent UX additions, and too much energy spent on extraction theater. The biggest warning sign is not the number of extractions; it is that extraction is producing test churn while the most important screen got larger and more complex anyway. The next sprint should stop celebrating file movement and close the open architecture/product decisions created by these changes.
