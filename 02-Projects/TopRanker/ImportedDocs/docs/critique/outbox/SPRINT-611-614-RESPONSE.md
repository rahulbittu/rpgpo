# SPRINT 611-614 External Critique

## Verified wins
- Sprint 611 added concrete analytics events with parameters: `rate_cta_discover_tap` (`surface: card/map_card`) and `share_whatsapp_tap` (`context: confirmation/business_detail/dish_leaderboard`).
- Sprint 612 established a distinct photo verification badge treatment: blue `rgba(59,130,246,0.85)`.
- Sprint 613 extended confidence indicators across named ranking surfaces: HeroCard, RankedCard, BusinessCard, and business detail.
- Sprint 614 shipped search suggestions refresh behavior rather than leaving suggestions static.
- The packet explicitly identifies build-size pressure with current measured size at `733.4kb / 750kb`.

## Contradictions / drift
- Core-loop claim is diluted by shipping 1 of 4 sprints on infrastructure while prior critique responses remain piled up as pending. That is process drift, not focus.
- “Confidence” semantics are already fragmented: photo verification = blue, receipt verification = green, VERIFIED RANKING = green. The packet itself signals likely user-facing inconsistency in what “verified” means.
- Analytics asks whether action-only tracking is enough, but the implemented events are tap-only. That means the team shipped instrumentation before answering the funnel question. You can count clicks but not diagnose non-clicks.
- Confidence rollout is presented as expanded coverage, but the packet still asks whether all high-traffic surfaces are covered. That implies the rollout was not driven by a closed surface inventory.
- Search suggestions refresh shipped as brute-force every 30 minutes while the packet already acknowledges it does not scale to 50+ cities. That is knowingly temporary infrastructure without a closure plan.
- Build size is at 97.8% of ceiling, yet the options discussion still includes simply raising the ceiling. That is avoidance, not health.

## Unclosed action items
- Pending external critique responses for 606-609.
- Pending external critique responses for 601-604.
- Pending external critique responses for 596-599.
- Need watcher attention on multiple pending critique responses.
- No resolved decision on analytics granularity beyond current tap events.
- No resolved design system decision on verification/confidence color language.
- No resolved build-size mitigation plan despite nearing the 750kb ceiling.
- No resolved scalable refresh strategy for search suggestions.
- No confirmed surface inventory for confidence indicators beyond currently named cards/detail.

## Core-loop focus score
**6/10**

- 3 of 4 sprints are described as core-loop, which is acceptable on paper.
- But one sprint consumed capacity on infrastructure while prior critique/action follow-up is stacking up unresolved.
- The shipped analytics are too shallow to validate the map CTA core-loop impact properly.
- Confidence work expanded presentation, but coverage is still uncertain on other high-traffic surfaces.
- Search suggestion refresh supports discovery, but the brute-force implementation creates future maintenance drag immediately.
- Build-size headroom is almost gone, which threatens the ability to keep iterating on the loop cleanly.

## Top 3 priorities for next sprint
1. **Close the instrumentation gap on the map/share funnel**
   - Define the funnel first, then instrument it.
   - Add visibility/impression and prompt-open events only where they answer a real drop-off question.
   - Stop adding action-only analytics that cannot explain failure.

2. **Standardize verification/confidence semantics**
   - Produce one explicit mapping of meaning -> color -> label -> surfaces.
   - Separate “photo verified,” “receipt verified,” and “ranking confidence” if they are different concepts.
   - Do not keep reusing “verified” with different visual meanings.

3. **Create headroom instead of raising limits**
   - Treat 733.4kb/750kb as a forcing function.
   - Prune dead code and lazy-load rare/admin paths before considering a ceiling increase.
   - Pair this with a non-brute-force plan for suggestions refresh so infra debt does not keep accumulating.

**Verdict:** Useful features shipped, but the sprint packet reads like a team shipping partial solutions and deferring the hard decisions. Analytics are insufficient to judge the core CTA work, verification semantics are inconsistent, search refresh is knowingly unscalable, and critique follow-up is backlogged across multiple sprint ranges. The biggest problem is not lack of output; it is lack of closure.
