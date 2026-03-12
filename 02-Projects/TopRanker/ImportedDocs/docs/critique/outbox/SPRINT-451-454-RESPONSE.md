# Sprints 451–454 External Critique

## Verified wins
- Sprint 451 added URL param sync for shareable search.
- Sprint 452 added an admin enrichment dashboard.
- Sprint 453 added dynamic hours on the business detail view.
- Sprint 454 added rating export improvements, including JSON export.
- `decodeSearchParams` does validate several params against whitelists: dietary tags, distance options, hours filters, sort modes, and price ranges.
- Both search and single-business endpoints use `computeOpenStatus()`, which is at least a consistency win.

## Contradictions / drift
- The biggest issue is not drift but an active security hole: Sprint 452 shipped admin enrichment endpoints without `requireAuth` or `requireAdmin`. Calling this a “known gap” understates it; “admin” and “open” are contradictory states.
- Sprint 451 claims validation, but `query` and `cuisine` only get presence checks. That is partial validation, not full input hardening. Shareable URL support increases exposure of unsanitized user-controlled input.
- Sprint 453’s reuse of `computeOpenStatus()` improves consistency but also duplicates per-item compute on search responses. The packet frames this as “the right pattern,” but no evidence is given that the current cost is acceptable at result-set scale.
- Sprint 454 improved exports, but pretty-printed full-array JSON pushes output size up by design. That conflicts with any expectation of export scalability for power users.
- Audit #49 is being handled at the threshold instead of as a structural component issue. Extracting only the at-risk chips is a tactical LOC fix, not a clear component architecture decision.

## Unclosed action items
- Add `requireAuth` and `requireAdmin` to `/api/admin/enrichment/*`. This should not remain open.
- Add explicit constraints to `query` and `cuisine`: at minimum length limits; preferably a conservative allowed-character policy based on actual product needs.
- Decide whether output encoding/rendering guarantees already neutralize URL-param injection risk. If not documented and enforced, the current state is incomplete.
- Measure `computeOpenStatus()` cost on realistic search payloads before discussing caching. There is no evidence here yet, only speculation.
- Define export bounds for large datasets: max size, whether pretty-printing is necessary, and whether export should reflect only loaded client data or full account history.
- Resolve DiscoverFilters extraction scope: targeted LOC relief vs a unified chips structure. The current plan sounds undecided.

## Core-loop focus score
**5/10**

- Shareable search and business hours are close to user-facing discovery, so there is some core-loop relevance.
- The admin enrichment dashboard is supporting infrastructure, not core-loop product value.
- JSON export is peripheral; useful, but not central to search → decide → visit/use.
- Too much of the packet is about edge concerns and follow-up gaps rather than closed-loop user impact.
- Shipping open admin endpoints is avoidable risk that distracts from product progress.
- The sprint range shows delivery breadth, but not a tight single-loop optimization.

## Top 3 priorities for next sprint
1. Lock down `/api/admin/enrichment/*` with authentication and admin authorization before any further expansion.
2. Harden URL param handling for `query` and `cuisine` with explicit limits and documented safety guarantees end-to-end.
3. Close the DiscoverFilters extraction decision with a single component strategy instead of another threshold-driven patch.

**Verdict:** The visible output across 451–454 is real, but the packet exposes a pattern of shipping half-closed work: partial validation in 451, openly accessible admin endpoints in 452, unmeasured performance concern in 453, and knowingly bloated export output in 454. The worst item is 452; an unauthenticated admin surface should have blocked the push. Overall this looks more like feature accumulation with deferred hardening than disciplined sprint closure.
