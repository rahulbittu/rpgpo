# SPRINT-696-699-REQUEST External Critique

## Verified wins
- Sprint 696 shows actual dead-code removal, not disguised refactor: 20 unused error styles removed across 4 tab screens, plus unused `Animated` and `useRef` imports removed from `Skeleton.tsx`.
- Sprint 697 appears to have reduced file concentration: `NetworkBanner.tsx` went from 294 LOC to ~150 LOC, with `ErrorState.tsx` extracted at 116 LOC and backward-compatible re-exports retained.
- Sprint 698 standardized loading transitions across all 4 tab screens. The packet gives concrete behavior details: `SkeletonToContent`, 350ms fade+slide, 8px `translateY`.
- Sprint 699 includes at least one measurable user-facing improvement: splash duration reduced from ~2.9s to ~2.1s.
- Sprint 699 also removed one clearly unused asset: `PlayfairDisplay_400Regular_Italic`.
- Tests increased from 12,042 to 12,098, and audit grade is reported as A (#155).

## Contradictions / drift
- The packet frames these as “cleanup/polish” sprints under feature freeze, but Sprint 699 includes behavior change and startup data strategy work (`prefetch onboarding flag + default leaderboard data during splash`). That is not just cleanup; it changes app startup behavior and caching assumptions.
- Build size is reported unchanged at 662.3kb despite code removal, an unused font removal, and structural cleanup. That does not invalidate the work, but it undercuts any implied binary-size or packaging win.
- Schema ceiling is raised as a concern, but your own metrics show zero movement across the sprint range: 911 LOC to 911 LOC. If schema size was a real target during these sprints, there is no evidence of progress.
- “All 4 tab screens now use `SkeletonToContent` for consistent transitions” is consistency work, but it is not clearly tied to the core loop unless those screens are on the primary ranking-browse path. The packet does not prove impact beyond UI polish.
- Feature freeze discipline is presented as a question, but the sprint content already drifted into UX tuning and prefetch strategy. So this is not a strict freeze; it is controlled product behavior adjustment.

## Unclosed action items
- Re-export cleanup from Sprint 697 is still open. Backward-compatible re-exports are an interim state, not a finished one.
- Splash duration is still unresolved by your own benchmark question. If `<2s` is the target, 2.1s is not done.
- Prefetch strategy is unresolved. You are currently prefetching default Dallas/restaurant data, but you are questioning whether last-viewed city should replace it.
- Schema ceiling decision is unresolved: raise threshold, split modules, or accept plateau. No action appears taken.
- Feature-freeze scope is unresolved. The packet asks whether to keep freezing or ship features, which means the operating mode itself is not settled.

## Core-loop focus score
**6/10**
- Startup speed improvement is relevant to the core loop because it affects time-to-rankings access.
- Default leaderboard prefetch is also core-loop adjacent, assuming Rankings is the main entry path.
- Dead-style deletion and import cleanup are low-value maintenance wins; they do not materially advance the user loop.
- Transition standardization is polish, not loop expansion or reliability proof.
- The sprint range shows modest tests growth, but no metrics on launch success rate, screen load time, rankings render latency, or retention. Core-loop claims are weakly evidenced.
- Too much of the packet is about code hygiene while open strategic questions remain unresolved.

## Top 3 priorities for next sprint
1. **Close the interim states you created.** Either migrate imports off `NetworkBanner` re-exports or explicitly time-box keeping them. Do not leave compatibility shims indefinite.
2. **Measure and finish startup work.** Decide whether 2.1s is acceptable, and validate prefetch impact with real startup/render metrics before adding more complexity like AsyncStorage-driven last-viewed prefetch.
3. **Resolve the schema policy instead of repeatedly asking about it.** Pick one: keep 950, modularize, or accept 911 as stable. Lingering threshold anxiety without action is process noise.

**Verdict:** These sprints produced some real cleanup and one credible startup improvement, but the packet overstates cohesion. You are mixing maintenance, UI polish, and startup behavior changes while still treating major decisions as open questions. The work is not bad; it is just incomplete and strategically soft. Close the temporary patterns, stop carrying unresolved policy debates sprint to sprint, and prove startup changes with actual performance metrics rather than narrative.
