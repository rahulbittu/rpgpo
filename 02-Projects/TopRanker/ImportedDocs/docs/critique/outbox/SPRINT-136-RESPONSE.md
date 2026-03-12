# Sprint 136 External Critique

## Verified wins
- Two real core-loop performance fixes shipped, with specific implementation detail and scope:
  - `server/storage/members.ts`: Pioneer rate N+1 replaced with a single correlated subquery.
  - `server/storage/businesses.ts`: rank recalculation O(N) loop replaced with a single window-function `UPDATE`.
- The claimed impact is concrete and tied to the product path: worst-case rating submission query load dropped from ~700+ to ~2.
- Audit #11 was actually produced: `docs/audits/ARCH-AUDIT-135.md`.
- Longstanding docs drift was materially reduced:
  - README and CONTRIBUTING test counts/path fixes
  - CHANGELOG backfilled for Sprints 127–136
- 46 new tests were added, including a dedicated perf test file and a compliance/accessibility test file.
- Privacy policy A/B testing disclosure and tooltip accessibility changes are at least explicitly documented and scoped.

## Contradictions / drift
- You say this sprint was a direct response to terrible core-loop scores, but over half the shipped items listed are still non-core-loop work: docs, privacy policy, accessibility, audit writeup. That is improvement, not full focus.
- “Most impactful sprint in months” is not well supported by the packet beyond the two query fixes. Everything else is debt/compliance/admin work.
- Test-count drift still exists immediately after a sprint explicitly framed as fixing documentation drift:
  - sprint doc says 1351
  - actual is 1369
  - `MEMORY.md` says 1323+
  This undercuts the “drift fixed” claim.
- Audit summary says 2 High items are file sizes and storage coverage gaps, while “no rate limiting on payment routes” is listed as Medium. But open action items promote payment rate limiting to P1. Severity/priority handling is inconsistent.
- Proposed next sprint includes “activate confidence_tooltip A/B experiment,” but open action items only name the server-side assignment endpoint. The rollout dependency chain is incomplete in the packet.
- Audit cadence note says every 5 sprints and next should be 140, but this is left as “verify this happens,” which means even the cadence rule is not being actively enforced.

## Unclosed action items
- Audit P1: add rate limiting to payment routes.
- Audit P1: write tests for `storage/members.ts` and `storage/ratings.ts`.
- Audit P1: extract `profile.tsx` sub-components from 1073 LOC file.
- Retro 135 #2: server-side experiment assignment endpoint.
- Retro 135 #5: tier data staleness check.
- Audit P2: extract `wrapAsync` middleware to remove 68 duplicated catch blocks.
- Audit P2: sanitize `req.query.city/category` in 6 locations.
- Audit P2: move `@types/*` to devDependencies.
- Resolve client/server logic duplication: `lib/data.ts` vs `server/storage/helpers.ts`.
- Fix remaining documentation drift:
  - sprint doc test total
  - `MEMORY.md` test total
  - verify/enforce next audit at Sprint 140

## Core-loop focus score
**6/10**

- Two shipped changes are clearly core-loop and materially improve the rating → consequence → ranking path.
- The impact is substantial: query collapse from hundreds to near-constant work is meaningful.
- But the sprint still spent visible bandwidth on docs, privacy, accessibility, and audit paperwork instead of staying narrowly on the loop.
- No scoring, ranking logic, or loop reliability changes beyond performance are shown.
- Key core-adjacent gaps remain open right after the sprint: storage-layer coverage and duplicated logic.
- This is a rebound from Sprint 135, not a fully disciplined core-loop sprint.

## Top 3 priorities for next sprint
1. **Close storage-layer test gaps for `storage/members.ts` and `storage/ratings.ts`.**  
   You optimized core-loop storage code; now prove it with direct coverage in the layer that was explicitly called out by the audit.

2. **Add rate limiting to payment routes.**  
   It is an open P1/security issue regardless of whether the audit labeled it Medium. Leaving payment endpoints unprotected is worse than more cleanup work.

3. **Finish the experiment pipeline before trying to “activate” anything.**  
   Build the server-side assignment endpoint first, then enable the experiment. Do not count experiment activation as progress while assignment infrastructure is still open.

**Verdict:** This was a better sprint than 135 because it finally shipped two real core-loop fixes with measurable impact, but the packet still overstates focus. You did not run a clean core-loop sprint; you ran a mixed sprint with two important performance wins surrounded by docs cleanup, compliance work, and lingering contradictions. The biggest problem now is not lack of action items—it is failure to close the P1 list cleanly and keep documentation/status claims consistent even immediately after a “drift fix” sprint.
