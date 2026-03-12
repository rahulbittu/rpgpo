# SPRINT-300-304 External Critique

## Verified wins
- Sprint 304 fixed a real client/server contract bug: the dish route now returns a flat `DishBoardDetail` that matches the page interface, and you report deep links working end-to-end.
- Sprint 302 added concrete instrumentation, not vague “analytics”: `cuisine_filter_select`, `cuisine_filter_clear`, and `dish_deep_link_tap`, with a `surface` parameter and implementation in both `index.tsx` and `search.tsx`.
- Sprint 303 expanded dish coverage in measurable terms: 15 new business-dish mappings, 5 new leaderboards, total 10 boards, and dish data on 36/54 businesses.
- Sprint 301 shipped the entry-count preview as progressive enhancement with fallback, which limits regression risk.

## Contradictions / drift
- The stated focus is “dish data pipeline completion and analytics instrumentation,” but Sprint 300 is governance/tech-debt/audit work. That may be valid work, but it is not evidence of progress on the stated sprint focus.
- “Dish data pipeline completion” is overstated. Your own numbers say only 36/54 businesses have dishes, so the pipeline is still partial.
- You call Sprint 304 an end-to-end deep-link success, but Sprint 302 only instruments surfaces for Rankings vs Discover while the review questions already mention likely additional surfaces like `business_page` and `notification`. The analytics model is already narrower than the product path you imply.
- The request frames Sprint 303 as expansion, but there is no evidence of quality controls on the new mappings/boards. More boards without coverage density can dilute usefulness.
- “Best In cards show ‘5 ranked’ instead of ‘Best in Dallas’” shifts from location/context copy to count copy. That is a product decision, but the packet provides no evidence it improves tap-through, only that it was implemented.

## Unclosed action items
- Resolve launch-readiness of dish coverage. 36/54 businesses with dishes is not “complete”; decide whether to backfill the remaining 18 or intentionally narrow the launch set.
- Decide whether 10 leaderboards is the right launch scope. The packet raises this explicitly and provides no usage or density data to justify the expansion.
- Validate the entry-count copy with actual CTR/tap-through data. “5 ranked” is unproven and linguistically weaker than alternatives like “5 spots” or “5 entries.”
- Expand or explicitly constrain analytics `surface` taxonomy. Current implementation only covers Rankings vs Discover, while likely user paths extend beyond that.
- Add a prevention mechanism for API/interface drift. The Sprint 304 bug was silent and only surfaced as an error state; the packet names the problem but shows no guardrail added.

## Core-loop focus score
**6/10**
- Two of the five sprints directly strengthen the dish browsing loop: more seed data and fixing the detail API contract.
- Analytics work supports learning, but only at a basic event/surface level; it does not yet close the loop with decision-quality coverage.
- Sprint 300 is off-focus relative to the stated sprint theme.
- The core content loop is still underpowered because dish coverage is incomplete: 18/54 businesses have no dish data.
- Expanding from 5 to 10 boards increases surface area, but without evidence of density or demand it risks breadth over usefulness.

## Top 3 priorities for next sprint
1. **Finish or narrow the dish dataset.** Either backfill dish mappings for the remaining 18 businesses or cut launch scope to a smaller, fully populated set of boards/businesses.
2. **Add contract checks to stop API/client drift.** Shared types, response validation, and at least one integration test for dish board detail would have prevented the Sprint 304 silent mismatch.
3. **Instrument the actual navigation funnel and test copy.** Track impressions/taps from Best In cards and dish deep links across all real surfaces, then compare “5 ranked” against clearer alternatives.

**Verdict:** This sprint range made real progress on dish functionality, but the packet overclaims completion. The strongest work is the API contract fix and basic analytics instrumentation; the weakest part is pretending partial seed coverage and broadened boards equal launch readiness. You have a wider dish surface now, but not yet a reliably populated or well-measured core loop.
