# Sprints 481–484 External Critique

## Verified wins
- Sprint 481 added concrete behavior, not just scaffolding: 3 triggers, a rank-change threshold, self-rating exclusion, and weekly city highlights are all specific and scoped.
- Sprint 482 kept chart components presentational with no data fetching. That is a clean boundary.
- Sprint 483 introduced a dedicated `useInfiniteSearch` hook instead of embedding pagination logic directly in `search.tsx`. That is the right abstraction direction.
- Sprint 484 separated breakdown computation into `server/dimension-breakdown.ts` instead of stuffing all logic into `routes-businesses.ts`.
- 90 new tests across the 4 sprints is non-trivial and indicates these changes were not shipped completely unguarded.

## Contradictions / drift
- Sprint 482 is the clearest drift: three dashboard components were built but “aren't rendered in any screen yet.” That is inventory, not delivered product.
- The packet asks whether `notification-triggers.ts` should be split after it already reached 313 LOC and “doubled in size.” That means structure followed growth instead of leading it.
- `routes-businesses.ts` is already at 325 LOC and explicitly near a 340 threshold, yet another endpoint was added anyway. Same drift pattern as notification triggers: acknowledged hotspot, deferred extraction.
- `search.tsx` is still ~795 LOC even after introducing `useInfiniteSearch`. The hook helped, but the screen remains oversized, so the architectural problem is only partially addressed.
- The `as any` count rising from 55 to ~82 over 6 cycles is straightforward type-discipline erosion. Calling the additions “legitimate” does not change the direction of travel.
- The sprint mix is scattered: push infra, unused dashboard UI, search pagination, and business breakdown API/UI. That is throughput across surfaces, not strong loop concentration.

## Unclosed action items
- Split or otherwise modularize `server/notification-triggers.ts`; the question exists because the file is already too broad.
- Extract `routes-businesses.ts` before adding more route handlers to it.
- Integrate or delete the Sprint 482 chart components; leaving unrendered UI components in the tree is unfinished work.
- Audit infinite-scroll UX on filter/sort/query changes, especially reset behavior and scroll restoration; the packet itself raises this as an unresolved risk.
- Put a real control on `as any` growth instead of continuing threshold bumps.
- Continue decomposing `app/(tabs)/search.tsx`; replacing the query mechanism did not solve the file-size/ownership problem.

## Core-loop focus score
**4/10**
- Only Sprint 483 clearly targets a primary user loop end-to-end: search and result consumption.
- Sprint 484 is closer to core product value, but the packet does not show how the new breakdown is integrated into the main business view flow beyond a component and endpoint.
- Sprint 481 may help re-engagement, but notifications are secondary-loop infrastructure, not the core experience itself.
- Sprint 482 is the main penalty: three tested components with no screen integration is off-loop work.
- Work was spread across server infra, search UX, dashboard UI inventory, and business analytics instead of finishing one user-visible vertical slice.

## Top 3 priorities for next sprint
1. **Finish shipped surfaces before adding more primitives.** Integrate the dashboard charts into an actual screen or cut them; do not carry more unused UI inventory.
2. **Extract hot files now.** Break up `notification-triggers.ts`, start route extraction from `routes-businesses.ts`, and continue splitting `search.tsx` into smaller screen-specific units.
3. **Stop passive type drift.** Replace threshold-bumping on `as any` with a typed wrapper/util strategy for the repeated RN/icons/style cases and make the count stop increasing.

**Verdict:** This batch shows decent implementation throughput but weak product discipline. The biggest issue is not code quality in isolation; it is that you keep acknowledging structural and integration problems while still adding more surface area on top of them. Sprint 482 is the clearest waste signal, and the repeated “should we extract now?” questions mean the answer is already overdue.
