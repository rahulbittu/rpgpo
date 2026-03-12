# Sprint 143 — Behavioral Freshness + Component Extraction + Experiment Dashboard External Critique

## Verified wins
- The behavioral freshness tests (26 total in `sprint143-behavioral-freshness.test.ts`) are a genuine improvement over Sprint 142's structural-only approach. They construct stale state, invoke `checkAndRefreshTier`, and then assert that downstream artifacts (vote weight, display name, influence label, color, temporal-decayed contribution) reflect the corrected tier, not the stale one. The stale-vs-fresh comparison tests explicitly compute both paths and assert divergence. This is the behavioral proof Sprint 142 asked for.
- The boundary test suite (38 tests in `sprint143-core-loop-boundaries.test.ts`) covers exact-threshold, one-below, one-above for every tier gate in `getTierFromScore`, including activity gates (rating count, category count, days active, flags). It also covers temporal decay band edges, credibility score component caps, rank confidence per category, and degenerate inputs (NaN, negative, empty string tier). This directly addresses Sprint 142's priority #2.
- File extractions are real and measurable: `challenger.tsx` 944 to 482 LOC, `business/[id].tsx` 951 to 533 LOC. Both files are now under 600 lines. This is straightforward housekeeping done well.
- Test count grew from 1815 to 1899 (+84), all passing, suite under 1.4s. No regressions reported.

## Contradictions / drift
- **Sprint 142 priority #3 was actively contradicted.** The critique said: "Either run a real experiment or freeze experiment infrastructure." Sprint 143 did neither. Instead, it expanded the experiment infrastructure by adding `computeExperimentDashboard()` with Wilson score confidence intervals (claimed in the request, though the actual code uses a simple 5-percentage-point threshold, not Wilson intervals), recommendation logic, and 20 more tests for it. This is the opposite of what was asked. The experiment pipeline still has zero live experiments, zero real users, and zero validated learnings. More plumbing was added to an unused system.
- The request document claims "Wilson score confidence intervals for conversion rates" but the actual `computeExperimentDashboard()` implementation uses a flat 5-percentage-point difference threshold with a 100-exposure minimum. There is no Wilson score computation anywhere in the code. This is a factual overstatement in the request packet.
- The behavioral freshness tests call real functions (`checkAndRefreshTier`, `getVoteWeight`, `calculateCredibilityScore`) but they are still pure-function unit tests composing library calls in test code. They do not mock or exercise HTTP request/response paths, middleware, database reads, or cache layers. The request calls them "end-to-end" but they are behavioral unit tests. Better than structural, but not E2E.
- The `SubComponents.tsx` extraction pattern puts multiple unrelated components into a single file per feature directory. `components/business/SubComponents.tsx` is 997 LOC, which is larger than the original file it was extracted from. This is a lateral move in file complexity, not a reduction. The request acknowledges this in its critique question but still claims it as a win.

## Unclosed action items
- Run a live experiment through the experiment pipeline or stop building it. This was explicitly asked in Sprint 142 and explicitly not done. It must be addressed.
- Replace the claimed "Wilson score confidence intervals" with actual statistical rigor, or correct the documentation to match the simple threshold logic that is actually implemented.
- Graduate behavioral freshness tests from pure-function composition to tests that exercise the actual HTTP handler path (mocked request to rating endpoint, stale tier in DB mock, assertion on response and side effects). The current tests prove the math is correct but not that the server code actually invokes it.
- Address the `SubComponents.tsx` file size problem: `components/business/SubComponents.tsx` at 997 LOC is not an improvement over a 951 LOC source file. Consider one-component-per-file or a more meaningful decomposition.

## Core-loop focus score
**7/10**
- The behavioral freshness and boundary test suites are directly on the core loop and represent real quality improvement. That work earns credit.
- File extraction is housekeeping, not core-loop focus, but it is reasonable maintenance.
- The experiment dashboard expansion is off-mission relative to what the critique asked for. Sprint budget was spent building more infrastructure for a system with no users, directly contradicting the "run or freeze" directive. This actively pulls the score down.
- The Wilson score overclaim is a credibility issue. Claiming statistical rigor that does not exist in the code undermines trust in the rest of the packet.
- Net: two of three priorities addressed well, one contradicted. Score drops from 8 to 7.

## Top 3 priorities for next sprint
1. **Run one live experiment or delete the experiment dashboard code.** No more building. Either validate the pipeline with real traffic and real metrics, or remove it from the codebase to stop the ongoing sprint tax. This is the third consecutive sprint where this has been flagged.
2. **Upgrade behavioral freshness tests to handler-level integration tests.** Mock the HTTP layer (request to `POST /api/ratings` with a user whose stored tier is stale) and assert that the response and database writes use the corrected tier. This closes the gap between "the math works" and "the server uses the math."
3. **Fix the SubComponents.tsx pattern.** `components/business/SubComponents.tsx` at 997 LOC defeats the purpose of extraction. Split into individual component files or re-evaluate the decomposition boundaries so no single file exceeds the original target.
