# Sprint 158 External Critique

## Verified wins
- `challenger_updated` SSE broadcast is now actually fired. That is a real fix to dead plumbing.
- Added targeted test coverage for the challenger broadcast path: `tests/sprint158-challenger-broadcast.test.ts` with 5 tests.
- Scope appears tightly constrained to the stated code change: `server/routes.ts` one broadcast line added.
- Google Maps was audited and correctly identified as not needing work. Avoiding unnecessary fixes is a win.
- Test suite status is strong on paper: 2152 tests across 95 files passing.

## Contradictions / drift
- “Activated challenger_updated SSE broadcast” is a fix to previously incomplete behavior, not a new capability. This sprint mainly closed an omission.
- “Challenger cards now refresh via dedicated event + rating_submitted (double coverage)” suggests redundancy, but there is no evidence here that both paths are necessary rather than overlapping band-aids.
- The sprint summary highlights Google Maps audit, but no changed files or implementation work relate to it. That is status reporting, not sprint output.
- Retro says “forward-progress sprint,” but the only listed product change is one broadcast line plus tests. That is progress, but modest.
- The known missing closure mechanism remains the larger functional gap in the challenger loop, so this sprint improved refresh behavior while leaving end-state correctness unresolved.

## Unclosed action items
- Challenger closure mechanism is still missing:
  - batch job/expiry handling
  - server-side winner resolution
- Need explicit decision on whether client should show challenger-specific toast behavior; currently raised as a question, not resolved.
- Need explicit decision on whether challenger SSE payload should include vote counts to avoid refetch; currently unresolved.
- Need validation that “double coverage” does not create duplicate refreshes, unnecessary load, or inconsistent UI timing. No evidence provided either way.

## Core-loop focus score
**6/10**
- The work is on the challenger loop, which is core-path relevant.
- It fixes a real interaction gap: updates now broadcast instead of silently failing.
- But the actual scope is very small: one server line and one new test file.
- The core loop is still incomplete because challenger closure/winner resolution remains missing.
- Some sprint attention went to an audit with no corresponding shipped change, which dilutes the impact of the sprint summary.

## Top 3 priorities for next sprint
1. **Implement challenger closure end-to-end**
   - expiry trigger
   - server-side winner calculation
   - final state broadcast/update
   This is the biggest unresolved correctness gap.
2. **Resolve the event model**
   - Decide whether `challenger_updated` and `rating_submitted` should both drive refreshes.
   - Remove redundancy if one event can be authoritative.
   - If refetch is too expensive or slow, add a richer challenger payload intentionally rather than layering accidental duplication.
3. **Prove client behavior, not just server emission**
   - Add tests for actual card refresh behavior on the client side.
   - Verify no duplicate UI updates, no missed updates, and no stale post-close state.

**Verdict:** This sprint fixed a missing wire and added tests, which is useful but narrow. The bigger challenger problem—closure and winner resolution—remains open, so the loop is still not complete. The summary overstates momentum a bit by mixing in an audit and “double coverage” language without proving the architecture is clean. Next sprint should stop polishing update signals and finish the challenger lifecycle.
