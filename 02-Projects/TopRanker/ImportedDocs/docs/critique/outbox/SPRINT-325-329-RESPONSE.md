# Critique Request — Sprints 325-329 External Critique

## Verified wins
- Sprint 325 and 326 delivered a clear UI change: filters/chips were moved from fixed chrome into scroll on Rankings and Discover.
- Sprint 325 reduced fixed top area from ~300px to ~100px. That is a concrete reclaimed viewport win.
- Sprint 327 added sticky cuisine behavior on Rankings after scroll-past. That is a specific attempt to preserve filter access while reclaiming space.
- Sprint 328 added native sharing from RankedCard. This is a real core-loop adjacency improvement if users are already consuming ranked lists.
- Sprint 329 added a fallback mechanism to keep dish leaderboards at a minimum of 5 entries. That addresses empty/thin leaderboard failure cases.

## Contradictions / drift
- Sprint 325 removes fixed filters to reclaim space; Sprint 327 then reintroduces a fixed element on scroll. That is not automatically wrong, but it is a reversal in the same area and needs proof it improved behavior rather than recreating chrome creep.
- The packet frames Sprint 327 as both a UX improvement and a code-structure problem. Duplicating the cuisine bar to achieve sticky behavior is implementation drift unless there is a clear technical reason it could not be shared.
- Sprints 325-326 applied “the same DoorDash pattern” twice, but the review questions still ask whether shared components should exist. Repeating a pattern without extracting it is delivery over consolidation.
- search.tsx stayed at 963 LOC after the refactor because “we moved the same JSX.” That means the sprint changed placement, not complexity. Calling that a refactor overstates what happened.
- Sprint 329 aims for minimum leaderboard depth, but the described selection rule (`displayOrder * 3`) suggests a simplistic deterministic fallback. That risks visible repetition while claiming enrichment.
- “Anti-requirement violations” being 73-77 sprints overdue is severe governance drift. The fact it is listed as an open review topic rather than an escalated blocker suggests normalization of unresolved debt.

## Unclosed action items
- Decide whether sticky cuisine rendering remains duplicated or is extracted into a shared component. This is explicitly unresolved.
- Decide whether `index.tsx` should be decomposed via `CuisineChipRow` or similar. The file size threshold issue remains open.
- Decide whether `search.tsx` should extract a shared `FilterBar` for filter/price/sort chips. Reused pattern remains unabstracted.
- Validate seed enrichment behavior for determinism and business overexposure. No evidence is provided that the fallback is varied enough.
- Validate share attribution taxonomy (`ranked_card` vs `share_sheet`) against the actual WhatsApp analysis need. Taxonomy appears still under debate.
- Resolve or formally waive the anti-requirement violations overdue by 73-77 sprints. This is plainly unclosed.

## Core-loop focus score
**6/10**
- Reclaiming viewport on Rankings/Discover is directly tied to browse/filter usability, which is core-loop relevant.
- Sticky cuisine chips try to preserve filtering access after the DoorDash-style simplification, also core-loop relevant.
- Seed enrichment supports leaderboard completeness, which helps avoid dead-end content states.
- Share on ranked cards is adjacent growth/distribution work, not the core ranking/browsing loop itself.
- Too much of the sprint packet is about UI structure and file decomposition rather than measured user impact.
- Long-overdue anti-requirement violations weaken confidence that “core-loop focus” is disciplined rather than opportunistic.

## Top 3 priorities for next sprint
1. **Close the sticky/filter architecture gap**
   - Extract shared chip/filter components instead of maintaining duplicated JSX across sticky and in-scroll variants.
   - Specifically address `index.tsx` and `search.tsx` bloat rather than letting repeated UI patterns sprawl further.

2. **Prove the nav changes helped, or stop iterating blindly**
   - Measure whether the Rankings/Discover DoorDash pattern plus sticky cuisine bar improved scroll depth, filter usage, or leaderboard engagement.
   - Without this, Sprint 327 may just be undoing Sprint 325 in a more complicated way.

3. **Escalate the overdue governance debt**
   - Anti-requirement violations overdue by 73-77 sprints should not remain a footnote.
   - Either schedule explicit closure, document accepted risk, or stop claiming disciplined sprint execution.

**Verdict:** These sprints produced tangible UI changes, but the packet shows a team repeatedly moving the same interface around without reducing complexity or proving user benefit. The biggest problem is not the sticky bar or the 963 LOC file; it is the pattern of shipping duplicated implementations, calling layout changes refactors, and tolerating governance issues that are dozens of sprints overdue.
