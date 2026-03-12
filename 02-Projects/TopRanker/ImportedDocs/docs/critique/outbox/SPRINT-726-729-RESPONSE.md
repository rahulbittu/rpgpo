# Sprints 726-729 External Critique

## Verified wins
- Observability coverage clearly expanded across three core failure surfaces: React crashes, network transitions, and API request timing/error paths.
- Sprint 726 added concrete instrumentation to `components/ErrorBoundary.tsx`: crash/retry/go-home analytics, breadcrumb emission, and component stack capture. This is specific and test-backed.
- Sprint 727 added both user-visible/network-state instrumentation and an in-memory API error buffer via `recordApiError()` / `getRecentApiErrors()`. The 50-entry cap is a good containment detail.
- Sprint 728 moved from isolated helpers to actual request-path wiring in `lib/query-client.ts`, which matters more than adding more observability helpers.
- Sprint 729 connected diagnostics to a user action path by attaching perf summary, recent API errors, and breadcrumbs to feedback submission payloads. That closes the loop better than instrumentation alone.
- Console hygiene work is specific and scoped: 5 `console.log/error` calls in `lib/sentry.ts` and the push token log in `app/_layout.tsx` were guarded with `__DEV__`.
- Test growth is consistent with claimed work: +65 tests across 4 files for the four sprint items.

## Contradictions / drift
- The theme is “Beta Observability Stack Completion,” but the packet still describes Sentry as a console stub and explicitly asks whether the abstraction is right when a real DSN is added. That is not completion; it is preparatory scaffolding.
- “Completion” is also overstated because the team is still asking whether feedback payload limits are right, whether status `0` is the correct network-failure convention, and whether stack truncation should be different. Core data-shape decisions are still unsettled.
- Sprint 729 emphasizes console hygiene, but the team itself asks whether other production console statements remain. That means the audit was partial, not complete.
- The work is observability-heavy, but there is no evidence in the packet of review tooling, dashboards, alerting, or even a documented event taxonomy. This is instrumentation accumulation, not a full stack.
- The build-size flatline is good, but it also suggests this sprint range was almost entirely internal plumbing. If beta observability was the stated goal, there is still no evidence of operational readiness beyond emitting and bundling diagnostics.

## Unclosed action items
- Decide the diagnostic payload budget for feedback submissions. Current limits exist, but they are presented as unresolved.
- Decide and document the canonical representation for network failures in API error tracking (`0` vs a non-numeric sentinel).
- Decide whether error boundary stack capture should remain top-3 frames or expand.
- Finish the production console audit beyond `lib/sentry.ts` and `app/_layout.tsx`.
- Decide whether the current Sentry-stub abstraction is durable enough for real provider integration or needs a formal provider layer.
- Validate whether the feedback diagnostics path has any privacy/redaction constraints. The packet lists payload contents but says nothing about filtering.

## Core-loop focus score
**7/10**

- The work is mostly on the critical failure-reporting loop: app breaks, network fails, API fails, user submits feedback, team gets diagnostics.
- Wiring instrumentation into `query-client` and feedback submission is strong core-loop work; it is closer to useful than standalone helper additions.
- Score is capped because the “loop” still appears incomplete: no evidence of downstream consumption, triage workflow, or real backend provider.
- Too many fundamental conventions are still undecided for something labeled “completion.”
- Console hygiene consumed part of Sprint 729; useful, but peripheral compared to proving observability data is actionable.

## Top 3 priorities for next sprint
1. **Set and document observability contracts**
   - Freeze payload limits, network error encoding, and stack-frame capture policy.
   - Write the canonical event/diagnostic schema instead of leaving conventions implicit.

2. **Complete the production-readiness pass**
   - Do a repo-wide production console audit.
   - Add redaction/privacy rules for breadcrumbs, API errors, and feedback diagnostics before a real provider is enabled.

3. **Prove the stack end-to-end**
   - Replace or dual-wire the console stub with a real provider path in at least one environment.
   - Verify that emitted crash/network/API events and feedback diagnostics are actually recoverable and useful downstream.

**Verdict:** This sprint range produced real instrumentation progress, especially by wiring failures into request paths and feedback payloads, but the “stack completion” framing is inflated. You have better observability plumbing, not a completed observability stack. Several core conventions remain undecided, the provider remains a stub, and the console audit is openly incomplete.
