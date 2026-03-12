# External Critique Request — Sprints 350-354 External Critique

## Verified wins
- The cuisine field gap was actually closed in Sprint 351. Evidence: call-site wiring touched `lib/bookmarks-context.tsx`, `app/business/[id].tsx`, `components/search/SubComponents.tsx`, and `components/leaderboard/SubComponents.tsx`.
- Search suggestions got end-to-end work, not just UI paint. Evidence: changes hit `app/(tabs)/search.tsx`, `components/search/SearchOverlays.tsx`, `lib/api.ts`, and `server/storage/businesses.ts`.
- The schema did not grow during these sprints. Evidence: schema tables remained 31.
- Build growth stayed modest in absolute terms. Evidence: server build moved from 593.7kb to 596.3kb across 5 sprints, with the request explicitly attributing +2.6kb to timing endpoints.

## Contradictions / drift
- Sprint 350 is framed as governance, but the packet’s biggest product-relevant issue is a governance miss: cuisine was added in Sprint 349 and not populated until Sprint 351. That is exactly the kind of data-flow break audit/governance should catch sooner.
- “29th consecutive A-range” conflicts with the presence of obvious integration lag and rising file concentration. An A-grade audit that tolerates a shipped-but-unwired field and `search.tsx` at 892 LOC is grading cleanliness over operational correctness.
- The sprint mix drifts away from the core product loop. Three of five sprints are polish/admin (`352`, `353`, `354`), while only one item clearly fixes data capture correctness (`351`).
- The search suggestions label risks semantic drift: “Popular in {city}” reads fresher and more authoritative than “cached for 2 minutes” data justifies. The packet itself raises this because the wording overclaims.
- The rating trust percentage also drifts from honest UX if shown on tiny samples. The packet already gives the failure case: “67% trusted” from 3 ratings.

## Unclosed action items
- Audit process still appears not to verify field propagation end-to-end after schema/model changes. The cuisine gap is closed, but the process gap is not.
- Decide whether admin dimension timing remains in-memory or is persisted. This is still unresolved and matters if the feature is expected to survive restarts or support trend analysis.
- Fix or qualify the “Popular in {city}” label so it matches cache semantics.
- Add a minimum-count threshold or suppression rule for “X% trusted raters.”
- Address growing concentration in `app/(tabs)/search.tsx` at 892 LOC; no evidence of decomposition.
- Define an explicit stance on server build growth tolerance vs. tree-shaking effort; the question is raised but not resolved.

## Core-loop focus score
**4/10**
- Only one sprint directly closed a correctness gap in the user flow: cuisine reaching bookmark creation.
- Two UX-polish items may help perception, but the packet provides no evidence they improved search, selection, or conversion.
- One sprint was admin/internal instrumentation, which is not core-loop work unless tied to user-facing iteration speed.
- Governance did not prevent a basic field-propagation miss, so even the non-feature work did not clearly strengthen delivery quality.
- File changes suggest continued attention on search, but also increasing concentration (`search.tsx` 892 LOC) rather than simplification.

## Top 3 priorities for next sprint
1. **Add an audit/checklist for schema-to-UI data propagation**
   - Any new field on a core entity must be verified at creation, storage, read, and display call sites before closeout.

2. **Stop misleading UI claims in search and ratings**
   - Replace or qualify “Popular in {city}” to reflect cached data.
   - Hide or qualify trust percentage below a minimum rating count.

3. **Reduce search surface fragility**
   - Break up `app/(tabs)/search.tsx` and define ownership boundaries between screen, overlays, API shaping, and suggestion logic.

**Verdict:** This was a low-leverage sprint block padded by polish and admin work while basic correctness and honesty issues remained unresolved. The strongest signal is not the A-grade audit; it is that governance failed to catch an unwired field, search keeps getting fatter, and two UX elements are questionable enough that you are explicitly asking whether they mislead users.
