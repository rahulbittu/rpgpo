# SPRINT-716-719-REQUEST External Critique

## Verified wins
- Privacy manifest work was started: `NSPrivacyAccessedAPICategoryUserDefaults` with `CA92.1` reason is explicitly listed.
- A pre-submit validation script exists: `pre-submit-check.sh`.
- Crash capture was wired at the app level via `ErrorUtils` in `_layout.tsx`.
- Sentry abstraction behavior is defined: buffers 50 breadcrumbs and routes to `captureException` when initialized.
- Performance instrumentation exists in code, not just as a plan: `perf-tracker.ts` with startup/app-ready/API/screen mount hooks, and startup timing is wired into the splash flow.
- Feedback collection now includes concrete device/runtime context: platform, OS, version, build number.
- Feedback submission emits an analytics event: `feedback_submitted`.
- Test count increased from 12,382 to 12,439.
- Audit grade is reported as `A (#175)` by Sprint 719.

## Contradictions / drift
- Sprint 716 claims “TestFlight Submission Support,” but the packet itself admits privacy coverage is likely incomplete. That means submission support is partial, not done.
- The ASC App ID is still described as a “placeholder.” That is setup scaffolding, not finished release readiness.
- You recommend a “full code freeze until beta users are live,” while also noting stale seed data. Freezing product changes while known demo/beta data quality degrades is operationally inconsistent.
- Sprint 717 installs a global `ErrorUtils` handler and then asks if multiple HOC mount/unmount cycles can corrupt the handler chain. That means the implementation may be globally stateful in a way you have not proven safe.
- Sprint 718 adds performance tracking, but the only retention described is an in-memory 200-sample buffer. That is instrumentation without clear analysis durability even for low-volume beta usage.
- Sprint 719 adds haptics “on all interactions,” but no rationale or guardrails are given. That is feature spread beyond the stated core need of collecting actionable feedback.

## Unclosed action items
- Audit all Expo packages for additional required privacy manifest API declarations. This is explicitly unresolved.
- Validate whether the `ErrorUtils` install/restore pattern is safe under multiple mounts/unmounts and nested wrappers.
- Decide whether perf samples need persistence across sessions or whether ephemeral in-memory buffering is enough for the beta goals.
- Decide whether device model should be captured in feedback for hardware-specific debugging.
- Resolve the code freeze vs stale seed data tradeoff; it is still presented as an open question, not a decision.
- Replace or finalize the ASC App ID placeholder if release/submission readiness is the goal.

## Core-loop focus score
**6/10**

- The work is mostly infrastructure around beta readiness, which is adjacent to the loop but not the loop itself.
- Crash capture and feedback context help tighten issue detection from real usage; that is useful operational support.
- Performance tracking is only lightly valuable so far because retention/analysis strategy is still unresolved.
- “Haptics on all interactions” looks like polish drift, not core-loop protection.
- The packet spends significant attention on submission mechanics and observability, but the freeze question shows uncertainty about whether keeping the product testable/useful for beta users is being prioritized correctly.

## Top 3 priorities for next sprint
1. **Finish actual release-readiness, not partial readiness.** Complete the full privacy manifest audit for all included Expo/native packages and remove placeholder App Store Connect configuration.
2. **Prove global error handling is safe.** Add explicit lifecycle tests or harden the implementation so `ErrorUtils` cannot be corrupted by multiple mounts/unmounts.
3. **Make beta feedback operationally actionable.** Resolve freeze policy, keep seed data current enough for testing, and decide the minimum useful telemetry set for feedback/perf instead of adding more instrumentation by default.

**Verdict:** These four sprints produced useful support systems, but the packet overstates completion. The biggest pattern is “wired something up, but left the risk question open”: privacy declarations may be incomplete, global error handling may be unsafe, perf data may be too ephemeral, and freeze policy conflicts with testability. This is beta-prep scaffolding with unresolved release blockers, not a clean readiness pass.
