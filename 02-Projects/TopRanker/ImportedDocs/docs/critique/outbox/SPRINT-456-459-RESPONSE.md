# Sprints 456–459 External Critique

## Verified wins
- Sprint 456 reduced `DiscoverFilters.tsx` size by extracting 3 chip components into `FilterChipsExtended.tsx` while preserving backward compatibility via re-exports. That is a real file-health improvement with lower immediate migration cost.
- Sprint 457 added an hours badge / closing-soon behavior. This is a concrete user-facing search card enhancement tied to current business state.
- Sprint 458 added bulk enrichment routes for dietary data and dietary-by-cuisine. This is a real admin throughput gain, assuming operators are already trusted.
- Sprint 459 made rating flow and photo prompts visit-type-aware. That is a concrete UX refinement and better matches the user’s actual context.

## Contradictions / drift
- The packet says these sprints covered “file health, search card UX enhancement, admin bulk operations, and visit-type-aware rating flow improvements,” but the open questions show the work is not cleanly closed: auth on admin routes is still missing, verification claims are overstated, and extraction policy is still undecided.
- Sprint 456 improved file health, but the team is still debating whether consumers should import from the new file directly. That means the extraction solved LOC pressure without fully resolving module ownership. Re-exports are acceptable as a transitional move, not as an endpoint.
- Sprint 457 shipped a hardcoded 60-minute `isClosingSoon()` threshold, but the question immediately raises whether 30 minutes or city/business-specific tuning is needed. That suggests the behavior was shipped before the product rule was settled.
- Sprint 458 repeats known auth debt from the 451–454 critique. This is not isolated drift; it is a pattern of expanding admin surface area without closing the same security gap.
- Sprint 459 frames visit-type photo prompts as “harder to fake” and “soft verification,” but the packet itself concedes stock photos still defeat this. That is a UX feature being sold as an integrity feature without strong evidence.
- `RatingExport.tsx` being at 98% of threshold for two audit cycles is being treated as P0 despite no growth. That looks like process rigidity overriding actual risk.

## Unclosed action items
- Admin enrichment routes still lack `requireAuth` / `requireAdmin` middleware. This was previously flagged and remains open.
- Decide whether `DiscoverFilters.tsx` re-exports are temporary or permanent. If temporary, set a migration plan and deprecation end state.
- Revisit the `isClosingSoon()` threshold with an explicit product rule. Right now it is a hardcoded assumption, not a justified policy.
- Stop describing visit-type photo prompts as verification unless there is evidence they materially improve integrity outcomes.
- Reassess `RatingExport.tsx` extraction priority based on growth/change risk, not threshold proximity alone.

## Core-loop focus score
**6/10**

- There is some core-loop alignment: search card hours and visit-type-aware rating flow both affect user interaction quality.
- Bulk enrichment can improve listing quality at scale, which indirectly supports the loop.
- But file extraction and threshold/audit management consume sprint capacity without obvious near-term user impact.
- Security debt on admin routes is basic platform hygiene and should not keep trailing while new admin capabilities are added.
- The packet overstates integrity value for photo prompts, which suggests narrative drift away from actual measured user benefit.

## Top 3 priorities for next sprint
1. Add `requireAuth` and `requireAdmin` across the admin enrichment surface before adding more admin endpoints.
2. Convert the `FilterChipsExtended` re-export pattern into a defined migration plan: keep as short-term compatibility only, then move consumers to direct imports.
3. Validate or narrow the product claims on hours badge and visit-type photo prompts: set an explicit `isClosingSoon()` rule and stop labeling photo prompts as verification without evidence.

**Verdict:** Some useful UX and file-health work shipped, but the packet shows repeated slippage on fundamentals: admin auth debt remains open, shipped behaviors are still policy-debated after launch, and integrity claims are inflated relative to what the feature actually does. The strongest contradiction is expanding admin power while still not enforcing auth.
