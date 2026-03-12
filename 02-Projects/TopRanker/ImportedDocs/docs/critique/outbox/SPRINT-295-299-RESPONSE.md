# Sprints 295-299 External Critique

## Verified wins
- `lib/badges.ts` was reduced from 886 LOC to 240 LOC, with badge data moved to new `lib/badge-definitions.ts` at 661 LOC. That is a real separation of concerns, even if incomplete.
- Dish leaderboard deep links were added from Best In cards via changes in `components/search/BestInSection.tsx` and `app/(tabs)/search.tsx`.
- Seed validation now enforces a minimum cuisine population, and 7 businesses were added in `server/seed.ts` to bring all 10 cuisines to at least 3 businesses.
- Rankings summary header was shipped in `app/(tabs)/index.tsx` with count, cuisine, and freshness metadata.
- Test coverage increased materially: 5 new test files and 63 new tests.

## Contradictions / drift
- The sprint set is framed as “completing cuisine UX polish and resolving tech debt,” but Sprint 295 is governance/admin work, not product delivery. That weakens the claim of a focused 5-sprint execution block.
- The badges split is only partial. `badges.ts` still contains “types + evaluation” while `badge-definitions.ts` holds raw arrays. That is not a clean architectural boundary; it is mostly file-size reduction. Your own question acknowledges this.
- Dish interaction behavior is still undecided after implementation. If `onSelectDish` conditionally prefers navigation over `onSelectCategory` search, then the UX contract is not actually settled. Shipping before resolving whether dish taps should always navigate is drift.
- Seed validation enforces `>=3` businesses per cuisine, but the packet does not show that this threshold is tied to user value rather than test convenience. “Meaningful leaderboard” remains unproven.
- “14 sprints delivered the cuisine pipeline” conflicts with the open question of whether the feature set is complete and whether there are UX gaps. If completeness is still in question, the pipeline is not actually closed.

## Unclosed action items
- Decide the final badges module boundary: keep evaluation in `badges.ts` or split evaluation/types/data into separate modules. Current state looks transitional, not final.
- Resolve the dish tap contract: conditional navigate-vs-search is still an open design decision.
- Validate whether `>=3` businesses per cuisine is a product threshold or just a seed/test threshold. It is enforced, but not justified.
- Assess whether the rankings summary header improves scanability or adds noise. Shipped does not mean validated.
- Close the broader architecture question: if cuisine pipeline is considered complete, define the acceptance criteria and remaining UX gaps explicitly.

## Core-loop focus score
**6/10**
- There is real core-loop work here: dish deep links, rankings summary, and cuisine seed coverage all affect discovery/ranking UX.
- One of five sprints was governance/audit overhead, which dilutes loop focus.
- The badges extraction is maintenance work, not user-facing loop improvement.
- The shipped UX changes still have unresolved behavior questions, which suggests weak product decisiveness.
- Seed fixes support the loop indirectly, but the chosen leaderboard minimum appears arbitrary from the packet.

## Top 3 priorities for next sprint
1. **Settle the dish interaction model**
   - Pick one behavior for dish taps and apply it consistently. Conditional navigation/search fallback is ambiguity in code form.

2. **Finish the badges refactor properly**
   - Define explicit module boundaries for data, types, and evaluation. If the goal was architecture cleanup, complete it instead of stopping at a LOC split.

3. **Validate leaderboard usefulness, not just existence**
   - Confirm the minimum data threshold and whether the rankings summary header helps users choose faster. Right now both look implemented but not product-validated.

**Verdict:** This sprint block shows some real delivery, but it is less complete and less focused than the packet claims. The strongest evidence is incremental: smaller badge file, more seeds, more tests, more navigation. The weak point is decisiveness—multiple shipped items are still framed as open questions, which means the work is not actually closed.
