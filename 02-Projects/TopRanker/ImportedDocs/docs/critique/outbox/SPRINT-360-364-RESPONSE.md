# Sprints 360-364 External Critique

## Verified wins
- Sprint 361 produced a real structural improvement: persistence logic moved out of `search.tsx` into `lib/hooks/useSearchPersistence.ts`, with 4 named hooks and `search.tsx` reduced from 900→855 LOC.
- Sprint 364 added concrete moderation capabilities, not just UI polish: bulk approve/reject, filtered queue endpoint, resolved history endpoint, and per-member item lookup.
- Sprint 362 improved gallery behavior with explicit rules for display states: counter badge for 6+ photos, dots for 2-5, and expanded grid eligibility from >3 to >1.
- Test surface remains large: 275 test files and 6,703 tests.
- Audit continuity is strong on paper: Audit #55 Grade A, 31st consecutive.

## Contradictions / drift
- Sprint 361 is presented as hook extraction, but the result is weak relative to the starting point: `search.tsx` only dropped 45 LOC from 900→855. That is not meaningful decompression of a file already far beyond sane size.
- Sprint 361 claims modularization, but concentrates 4 hooks into one file. That improves location of logic, not necessarily maintainability. It partially answers size pressure while preserving aggregation.
- Sprint 362 and 363 are both mostly presentation work while two app files remain near or above practical size limits. `business/[id].tsx` grew 587→619 and `challenger.tsx` grew 485→543. This is drift away from codebase maintainability toward UI iteration.
- Sprint 363 pushed `challenger.tsx` to 99% of threshold instead of extracting before the limit. That is governance reacting late, not early.
- Sprint 362 expanded gallery rendering from >3 to >1 photos, meaning many more businesses now enter the more complex gallery path. The packet gives no evidence this was driven by user behavior, performance review, or content distribution data.
- Sprint 364 added bulk approve/reject up to 100 items, but the request itself flags there is no undo. That is an ops-risk feature shipped without the obvious safety rail.
- “Audit → extract” is not keeping pace if the system still allows files at 855 LOC and 543/550 LOC. The audit grade and the actual file sizes are in tension.

## Unclosed action items
- `search.tsx` is still 855 LOC after the extraction. It remains an unclosed decomposition problem.
- `business/[id].tsx` at 619 LOC is already beyond the cited 550 threshold logic implied elsewhere. No extraction follow-up is listed.
- `challenger.tsx` at 543 LOC is effectively at the wall. Preemptive extraction is still unclosed.
- The hook extraction pattern is unresolved: 4 hooks in one file may be transitional, but no next step is stated.
- Bulk moderation safety is unresolved: no undo capability is documented despite 100-item batch actions.
- The gallery threshold change (>1) is unresolved from a product-risk standpoint because no evidence is provided that the more aggressive behavior is correct.

## Core-loop focus score
**5/10**

- Sprint 364 is core-loop adjacent if moderation quality directly affects marketplace/content health; it is at least operationally relevant.
- Sprint 361 is maintenance work that supports velocity, but the impact was shallow because the oversized file is still oversized.
- Sprints 362 and 363 read as visual refinement, not obvious core-loop acceleration.
- Two of four sprints increased page-level file bloat while shipping presentation changes, which is a bad trade.
- The packet shows strong audit/testing hygiene, but governance is not preventing predictable size drift in key files.

## Top 3 priorities for next sprint
1. **Force decomposition of oversized page files**
   - Extract from `search.tsx`, `business/[id].tsx`, and `challenger.tsx` now.
   - Do not wait for threshold breach; the threshold is already being treated as optional.

2. **Add safety rails to bulk moderation**
   - Ship undo/reversal support, confirmation guards, or smaller privileged batch execution before expanding operator power further.
   - A 100-item irreversible action is too risky.

3. **Tighten governance from audit theater to enforcement**
   - Set hard action rules for files nearing limits and require extraction before more feature/UI work lands in them.
   - Re-evaluate whether “4 hooks in one file” counts as final architecture or just temporary relocation.

**Verdict:** This sprint set has one meaningful backend/admin win and one partial refactor, but too much of the work drifted into UI polish while maintainability debt remained visible and in some cases worsened. The strongest contradiction is claiming disciplined governance while tolerating 855 LOC, 619 LOC, and a 543/550 LOC file. Bulk moderation shipped useful power without documented recovery. The next sprint should be cleanup and safeguards, not more surface-level iteration.
