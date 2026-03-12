# SPRINT-666-669-REQUEST External Critique

## Verified wins
- Apple Sign-In was extended to signup, and auth parity is now stated across signup/login for Google, Apple, and email/password.
- Apple token verification added concrete checks: issuer validation, `kid` matching, and JWKS-backed verification with caching.
- Offline rating queue exists as a real mechanism, not just error handling: queueing, persistence to AsyncStorage, app-foreground sync trigger, and retry limits are all explicitly described.
- EAS preview config now supports physical-device installs through a configured preview profile and API URL.
- Navigation polish shipped as actual shared config plus gesture behavior on modal screens.

## Contradictions / drift
- “Offline capability” is described as handling network failures gracefully, but the implementation silently drops queued ratings after 3 failed attempts, including server errors. That is not graceful for the core action; it is unobservable data loss.
- The packet frames offline sync as supporting the core loop, while the chosen failure policy explicitly allows a user rating to disappear with no visible consequence. That directly conflicts with the product logic stated in your own reviewer question.
- Retry policy lumps 4xx and 5xx together for silent drop. These are materially different classes of failure. A bad request should not follow the same recovery path as a transient server failure.
- Preview builds point at production while the sprint theme is “iOS readiness” and physical-device testing. That is operationally convenient, but it drifts from safe test isolation and contaminates production data during QA.
- “Gesture dismissal works consistently across iOS stack” is presented as polish, but global enablement on all modal screens is a blunt default. Consistency is not correctness if it risks dismissing stateful flows like rating submission.

## Unclosed action items
- Decide and implement product behavior for permanently failed queued ratings. Right now this is unresolved and dangerous because it affects the core rating loop.
- Split offline retry/drop handling by failure type at minimum: network/transient server failures vs permanent client/server validation failures.
- Define whether preview builds are allowed to write production data, and if yes, under what controls; otherwise create a UAT target before broader device testing.
- Audit modal screens and explicitly disable gesture dismissal where in-progress input/submission can be lost.
- Revisit Apple JWKS cache policy only after the above; 1-hour TTL is not the urgent problem in this packet.

## Core-loop focus score
**6/10**
- Strong focus on prerequisites around auth and device testing, which do support shipping.
- The only direct core-loop resilience work here is offline rating queueing, and it is undermined by silent permanent drops.
- Global gesture dismissal may actively harm the rating flow if applied to stateful screens without exceptions.
- Preview-build-to-production improves testing speed but mixes QA with real user data, which is not disciplined core-loop protection.
- Native polish work is real but mostly peripheral compared to unresolved reliability on submitting ratings.

## Top 3 priorities for next sprint
1. **Fix offline rating failure semantics.** Do not silently drop core-loop actions. Add visible recovery state or a retry inbox/outbox, and separate handling for 4xx vs 5xx/network failures.
2. **Audit and scope modal gesture dismissal.** Disable swipe-dismiss on rating/submission/confirmation screens where dismissal can lose input or create ambiguous state.
3. **Stop using production as the default preview backend once any broader testing begins.** Either gate production preview usage tightly or stand up UAT before scaling device testing.

**Verdict:** These sprints improved shipping readiness, but the packet’s main reliability feature is currently compromised by silent loss of user ratings, which is a direct violation of core-loop integrity. The auth and polish work is fine; the bigger issue is that you are optimizing edges while leaving the central action path allowed to fail invisibly.
