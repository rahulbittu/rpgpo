# Sprints 686–689 External Critique

## Verified wins
- Haptic coverage was extended to the two named missing pull-to-refresh surfaces: `app/(tabs)/profile.tsx` and `app/business/[id].tsx`. That matches the stated goal of completing coverage across 5 surfaces.
- Query retry behavior was made more explicit in `lib/query-client.ts`: retries are limited, mutations do not retry, and retry/backoff policy now exists instead of being implicit/default.
- Native offline detection was added via `@react-native-community/netinfo`, with platform-specific handling called out for web vs native. That is a concrete resilience improvement.
- Inline error markup was consolidated across all 4 tab screens into shared `ErrorState` usage. The changed files listed support that claim.
- Test count increased from 11,866 to 11,934 and test files from 505 to 508. There is at least some validation added alongside the changes.
- Build size stayed flat at 662.3kb despite adding NetInfo. No regression shown in the provided metric.

## Contradictions / drift
- “Complete network resilience story” is overstated. The packet shows retry policy, connectivity detection, and shared error UI, but nothing about request cancellation, stale-data fallback, mutation queueing, cache hydration strategy, or recovery flows. This is resilience work, not a complete story.
- The retry classifier is explicitly coupled to string formatting: `^4\d{2}:` depends on `throwIfResNotOk` emitting `${status}: ${message}`. That is brittle by design. Logic should not depend on presentation formatting.
- “Banner shows offline/online/demo states” is broader than the listed file and summary of sprint 689. The packet does not show whether those states are actually consumed consistently across all screens, only that `components/NetworkBanner.tsx` changed.
- Error/empty/shared-state consolidation is incomplete by the packet’s own wording: only “all 4 tab screens” were migrated. Business detail is in changed files for haptic only, not error-state adoption. So this is tab-level consolidation, not app-wide consolidation.
- `ErrorState` living in `NetworkBanner.tsx` is drift in module boundaries. A supposedly general-purpose component is housed under a network-specific filename. That weakens discoverability and indicates expedient co-location over clean ownership.
- “Mutations never retry” is tidy but blunt. It avoids duplicate writes, but also ignores clearly idempotent operations. That is a policy shortcut, not a finished resilience stance.

## Unclosed action items
- Replace regex/string-parsing retry detection with structured error metadata (`status`, `code`, `retryable`) emitted by the fetch layer.
- Decide and document whether both `isConnected` and `isInternetReachable` are required on native, and define precedence for null/unknown states. The packet asks the question but does not resolve it.
- Extract `ErrorState` (and likely `EmptyState`) from `components/NetworkBanner.tsx` into a neutral file if they are intended for reuse beyond network UX.
- Revisit retry policy by operation type: keep `retry: false` as default for mutations, but explicitly whitelist idempotent mutations if supported.
- Validate whether 2 retries is correct with observed mobile failure patterns; the packet gives no production evidence, only the chosen number.
- Confirm whether non-tab surfaces should also adopt shared `ErrorState`; current consolidation scope is partial.

## Core-loop focus score
**7/10**
- The work mostly targets real user friction in the fetch/display loop: refresh feedback, transient network failure handling, offline detection, and error rendering.
- Sprint 686 and 687 are directly core-loop relevant: refresh interaction and query reliability affect ranking consumption immediately.
- Sprint 688 is also core-loop relevant, but the packet emphasizes banner state more than recovery behavior. Detection without strong recovery UX is only partial loop support.
- Sprint 689 improves consistency and maintainability, but it is more UI cleanup than direct loop acceleration.
- Some effort drift is visible in component organization and formatting-coupled retry logic; both suggest implementation speed over durable loop infrastructure.

## Top 3 priorities for next sprint
1. **Decouple retry logic from error strings.** Add structured HTTP/network error objects and make retry decisions on fields, not regex over formatted messages.
2. **Finish the resilience policy.** Define behavior for native connectivity unknown states, online recovery/refetch behavior, and whether idempotent mutations can retry safely.
3. **Clean module boundaries for shared state components.** Move `ErrorState`/`EmptyState` out of `NetworkBanner.tsx` and standardize their use beyond just the 4 tab screens if they are intended as shared primitives.

**Verdict:** Solid incremental work, but the packet oversells it as a “complete” resilience arc. The biggest flaw is architectural: retry classification is tied to error message formatting, which is fragile and avoidable. The rest is mostly competent cleanup and UX hardening, with some unfinished policy decisions still sitting in question form instead of being resolved.
