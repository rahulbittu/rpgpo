# Critique Request — Sprints 776-779 External Critique

## Verified wins
- Sprint 776: A 15-second `AbortController` timeout was added to all `fetch()` calls in `query-client.ts`. This is a concrete hardening change that reduces indefinite hangs.
- Sprint 777: React Query `onlineManager` was wired to native `NetInfo` and web `online`/`offline` events. This is a real reliability improvement for offline behavior.
- Sprint 778: Accessibility labels were added to all 4 tab bar items, plus accessibility roles on the challenger screen header. This is a verified but narrow accessibility pass.
- Sprint 779: Production 5xx responses are now sanitized to generic `"Internal Server Error"` via `wrapAsync` and the global Express error handler, while preserving 4xx messages.

## Contradictions / drift
- These are framed as four "hardening sprints for TestFlight beta readiness," but only two items are core runtime hardening. Accessibility and server error-message sanitization are quality work, but they are not tightly aligned to the mobile beta core loop.
- The timeout change is global, while the request itself immediately raises exceptions for slower endpoints like photo proxy and Google Places. That suggests the implementation is probably over-broad relative to known endpoint differences.
- Offline query pausing was implemented, but the request asks whether `focusManager` should also be used. That implies the React Query lifecycle hardening was only partially addressed.
- The accessibility work is described as "minimal" and covers tab bar + one screen header only. That conflicts with the stated goal of beta readiness if accessibility readiness is being claimed at all.
- Error sanitization is limited to 5xx, while the request acknowledges 422s may still leak schema details. So the stated production-hardening goal is incomplete on its own terms.

## Unclosed action items
- Decide whether the 15-second timeout should remain global or move to per-route/per-operation timeouts, especially for known slower endpoints.
- Decide whether to wire `focusManager` in addition to `onlineManager` for React Query behavior on app foregrounding/refocus.
- Define the actual accessibility acceptance bar instead of a token pass. Current packet does not show a checklist, audit, or coverage beyond 4 tabs and one header.
- Review 4xx error exposure, especially 422 validation responses, and set an explicit policy for what production clients may see.
- Validate that the timeout/offline changes were tested against real failure modes. The packet lists implementations, not outcomes or regressions.

## Core-loop focus score
**6/10**

- The networking timeout and offline query pausing are relevant to the app’s core usage loop and likely improve perceived stability.
- The sprint lacks evidence of user-flow validation. There is no mention of whether key beta flows were exercised under bad network, offline, or resume conditions.
- Accessibility work was too narrow to count as meaningful product-wide readiness.
- Server 5xx sanitization is good hygiene, but it is peripheral to the client beta loop unless server errors are common in user-critical flows.
- The packet is implementation-heavy and outcome-light: no metrics, no bug counts reduced, no proof of impact on beta-blocking scenarios.

## Top 3 priorities for next sprint
1. **Finish network lifecycle hardening**
   - Replace the single global timeout with explicit timeout classes or per-route configuration.
   - Add/confirm `focusManager` behavior for app foreground/refetch semantics.
   - Test the main user flows under slow network, offline, reconnect, and app resume.

2. **Close the production error exposure gap**
   - Audit 4xx/422 responses for schema or internal detail leakage.
   - Define a clear production error policy by status class and enforce it consistently.

3. **Turn accessibility from token fixes into a minimum viable audit**
   - Establish a concrete screen/component checklist for beta readiness.
   - Cover interactive elements and critical paths, not just tab labels and one header.

**Verdict:** Useful hardening work happened, but this packet overstates readiness. Two changes improve actual runtime resilience; the other two are partial cleanups with obvious open questions still unresolved. The biggest issue is incompleteness: global timeout policy is likely too blunt, React Query lifecycle hardening is only half-done, accessibility is superficial, and production error sanitization still has a known 4xx leak question. This is progress, not closure.
