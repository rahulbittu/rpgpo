# Sprints 411-414 External Critique

## Verified wins
- Sprint 411 delivered a real extraction: `VisitTypeStep` moved out of `rate/[id].tsx`, and the parent file dropped from 631→554 LOC.
- WATCH backlog reduction is evidenced in the packet: all 6 key files are reported at OK status.
- Sprint 412 appears low-risk and targeted: `search.tsx` only changed by 1 line while sort presentation logic moved into `SortResultsHeader`.
- Sprint 413 added lightbox behavior without major page bloat: `business/[id].tsx` only grew 18 LOC for wiring.
- Sprint 414 kept `profile.tsx` unchanged and pushed logic into `CredibilityJourney` plus pure helpers, which is the right containment pattern.
- Stability signals are strong in the packet: 315 test files, 7,519 tests passing, 41 consecutive A-range audits, 0 medium findings in Audit #41.

## Contradictions / drift
- Sprint 411 claims “Cleared entire WATCH backlog,” but Sprint 414 immediately grows `CredibilityJourney` from 225→347 LOC. That may not violate a formal threshold, but it is still new concentration of UI/logic in one leaf component right after celebrating backlog clearance.
- Sprint 412 introduces `hint` strings that are “defined but never rendered.” That is dead config, not finished functionality. It reads as speculative abstraction.
- Sprint 414 adds `getNextTierPerks` and `getMilestones` as pure functions, but the reviewer question asks whether milestone logic should be server-driven. That suggests the implementation decision was made before the product/source-of-truth question was settled.
- Sprint 413 adds a lightbox using `ScrollView` paging, while the main technical question is whether the implementation approach is reliable across platforms. Shipping first and validating platform reliability after is avoidable drift.
- The sprint set is split across four different surfaces: rating flow, search sorting, business photos, profile tier progress. That is breadth, not a tight loop.

## Unclosed action items
- Decide whether `SORT_DESCRIPTIONS.hint` is real product scope. If yes, render it for accessibility; if no, delete it.
- Validate `PhotoLightbox` paging initialization across platforms. `contentOffset` reliability is explicitly unresolved.
- Decide whether `CredibilityJourney` should be split before it becomes the next WATCH file. At 347 LOC, it is not critical, but it is the obvious new hotspot.
- Resolve ownership of milestone logic: client-derived constants vs server-driven tier rules.
- Clarify whether gesture zoom/pan for photos is in scope. Right now the implementation is a basic lightbox with an open question attached.

## Core-loop focus score
**4/10**

- Work is spread across four separate product areas with no clear single loop being deepened.
- Sprint 411 is the strongest core-maintenance item because it reduces complexity in a key rating flow file.
- Sprint 412 is mostly presentation polish, not loop leverage.
- Sprint 413 improves detail-page media UX, but the packet does not tie it to a measurable conversion or engagement step.
- Sprint 414 improves profile/tier display, but again this is peripheral unless tier progress directly drives rating/review behavior.
- The strongest common theme is “contained UI additions with low blast radius,” not “tightening one core user journey.”

## Top 3 priorities for next sprint
1. Finish the partial work you already shipped: resolve `PhotoLightbox` platform reliability and either keep the current approach with evidence or switch to ref-based initialization.
2. Remove speculative code paths: either render `SORT_DESCRIPTIONS.hint` accessibly or delete the field.
3. Prevent the next maintenance hotspot: split `CredibilityJourney` now if milestones/perks/progress are expected to grow further; otherwise set an explicit cap and leave it alone.

**Verdict:** The packet shows competent, low-risk shipping, but the sprint set lacks focus and includes multiple “implemented now, justified later” decisions. The best work here is Sprint 411’s extraction. The weakest pattern is speculative or unresolved implementation detail being left in place: dead `hint` fields, undecided milestone ownership, and a lightbox paging approach still under question after shipping.
