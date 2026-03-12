# Sprints 305-309 External Critique

## Verified wins
- Category → Cuisine → Dish → Rate path is described end-to-end, and the packet provides concrete shipped elements at each stage.
- Sprint 306 appears to have delivered actual cuisine-to-dish navigation via `CUISINE_DISH_MAP` and visible shortcut chips on Rankings.
- Sprint 307 added pagination behavior with explicit UX details: `PAGE_SIZE=10`, preserved total count, and “N remaining” button text.
- Sprint 308 added persistence on two surfaces with named storage keys: `rankings_cuisine` and `discover_cuisine`.
- Sprint 309 connected leaderboard entries to rating via `/rate/[id]?dish=dishName`, which is a real bridge from browse to action.

## Contradictions / drift
- The stated focus is “Complete Category → Cuisine → Dish → Rate pipeline,” but Sprint 305 is governance/archive work, not core-loop delivery. That is drift inside a 5-sprint focus window.
- “All stages exist and are connected” is weaker than “the loop is closed.” The packet stops at “leaderboard recalculation” with no evidence of user-visible confirmation, freshness timing, or return path after rating.
- The architecture note claims a full pipeline, but the review questions still expose unresolved product decisions in core areas: source of truth for cuisine→dish, CTA density, persistence behavior, and pagination sizing. That means the pipeline exists structurally but is not settled behaviorally.
- Separate cuisine persistence keys conflict with the stated end-to-end pipeline framing. If Rankings and Discover represent the same user intent, independent state creates inconsistent traversal through the same loop.
- `CUISINE_DISH_MAP` is a manual shared-module mapping while the rest of the flow is framed as leaderboard/data driven. That is a brittle hand-curated choke point in the middle of the pipeline.

## Unclosed action items
- Decide whether `CUISINE_DISH_MAP` is curated infrastructure or derived from API data. This is not a minor implementation detail; it determines maintenance cost and correctness.
- Resolve whether cuisine preference should be shared across Rankings and Discover or intentionally isolated. Current behavior is implemented, but the product decision is still open.
- Validate whether “Rate [dish]” on every card improves action rate or just adds noise. No evidence is given.
- Validate `PAGE_SIZE=10` with actual behavior or experiment data. Right now it is just a chosen constant.
- Close the post-rating loop: there is no evidence of “rating submitted → visible impact/acknowledgment → return to updated dish context.”
- Clarify recalculation semantics: immediate, delayed, optimistic, or batched. The packet asserts recalculation exists but gives no operational behavior.

## Core-loop focus score
**7/10**

- Stronger than average because most of the sprint range did push the browse→drill-down→rate path forward.
- Not higher because one of five sprints was audit/governance work, which diluted a supposedly focused sequence.
- The loop is connected, but not convincingly closed from the user’s perspective after submission.
- Key middle-layer dependency (`CUISINE_DISH_MAP`) is still unresolved in principle, which threatens scale and correctness.
- Multiple shipped choices are still open questions rather than validated decisions: CTA placement, persistence model, and page size.

## Top 3 priorities for next sprint
1. **Close the post-rating loop**
   - Add an explicit post-submit state that returns users to dish context and shows that their rating was accepted and affected the leaderboard process.
2. **Resolve source of truth for cuisine → dish navigation**
   - Either keep `CUISINE_DISH_MAP` as intentionally curated with ownership/process, or replace it with derived API-backed mapping. Do not leave this as an ambiguous hybrid.
3. **Unify and test core interaction choices**
   - Pick a policy for shared vs separate cuisine persistence.
   - Measure card-level Rate CTA performance before keeping it everywhere.
   - Validate `PAGE_SIZE=10` with usage data instead of preference.

**Verdict:** You did ship most of the structural pipeline, but the packet overstates completeness. The loop is assembled, not finished: the post-rating experience is undefined, the cuisine→dish layer is still a brittle manual seam, and several core UX choices were implemented before being decided. This is decent progress with unresolved product and architecture debt sitting directly inside the main path.
