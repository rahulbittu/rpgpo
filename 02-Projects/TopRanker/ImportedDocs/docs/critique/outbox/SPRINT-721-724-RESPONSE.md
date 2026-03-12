# Sprints 721–724 External Critique

## Verified wins
- Privacy manifest work is at least partially real, not hand-wavy: 4 API types were identified and `pre-submit-check.sh` was updated to validate all 4.
- A concrete StrictMode-related fix was made: a `useRef` mount guard was added to prevent ErrorUtils handler re-installation corruption.
- Accessibility work shipped in two visible places: onboarding now checks `AccessibilityInfo.isReduceMotionEnabled()`, and splash reduced-motion behavior was added.
- App lifecycle analytics wiring appears implemented at the app shell level: `app_open` and `app_background` were connected through an `AppState` listener, with matching analytics convenience methods added.
- City analytics moved into `CityProvider`, which is the correct place if the goal is to capture every city selection consistently.
- Seed-data integrity got actual automated coverage: 25 validation tests spanning completeness, uniqueness, cuisine coverage, score constraints, and price-range distribution.

## Contradictions / drift
- The packet says these four sprints addressed findings from prior external reviews, but one repeatedly flagged item is explicitly still unresolved: analytics still logs to console. That is not “closed”; it is deferred.
- The metric “Critique items closed: 6/6” conflicts with the questions section, which still asks whether console logging is acceptable after noting it was flagged twice. Either the item is closed or it is not.
- Sprint 721 is described as “Release Hardening,” but one of its central outputs is adding device model/brand to feedback. That is product/debug instrumentation, not release hardening.
- Reduced-motion work is presented as accessibility progress, but the packet admits individual screen-enter animations still fire. So coverage is partial while the summary reads broader than the actual implementation.
- “Wired city_change analytics … fires on every city selection” may be overcounting by design if re-selecting the same city or initialization paths also emit. The packet does not distinguish meaningful changes from all selections.
- Build size staying exactly 662.3kb from Sprint 721 to 724 while adding analytics hooks, accessibility logic, feedback device info, and 25 tests is plausible only because tests do not ship, but the packet offers no useful runtime impact metrics beyond that single static number.

## Unclosed action items
- **Analytics backend remains unresolved.** Events still go to console; prior critique already flagged this twice.
- **Privacy manifest reason-code correctness is unresolved.** The team is still asking whether DDA9.1 / 35F9.1 / E174.1 are actually correct for Expo usage patterns.
- **ErrorUtils mount-guard lifecycle safety is unresolved.** The packet explicitly asks whether true unmount/remount cycles could break legitimate re-installation.
- **Reduced-motion coverage is incomplete.** Screen-level Reanimated entry animations still run.
- **Seed-data freshness is unresolved.** Structural validation exists; real-world accuracy verification does not.
- **Analytics semantics for `city_change` are not validated.** “Fires on every city selection” is implementation detail, not proof that the event definition is correct.

## Core-loop focus score
**6/10**

- Most work is support-layer hardening: privacy manifest, lifecycle hooks, accessibility, seed validation. Useful, but not strongly tied to the user’s rank/find/use loop.
- Seed-data integrity is the most core-loop-relevant item here because bad rankings and thin category coverage directly damage the product experience.
- City selection analytics is adjacent to the loop, but analytics without a real sink is mostly performative at this stage.
- Accessibility improvements on onboarding and splash improve first-run experience, but they do not materially strengthen ranking quality, browsing depth, or conversion.
- Too much effort went into critique cleanup and compliance while a previously flagged analytics gap remains open.
- The packet shows stronger hygiene than product movement.

## Top 3 priorities for next sprint
1. **Finish analytics properly or stop calling it done.** Replace console-only logging with a real provider, verify event delivery for `app_open`, `app_background`, and `city_change`, and define dedupe/semantic rules for city-change events.
2. **Close the reduced-motion gap across screen-level animations.** Apply the setting consistently to Reanimated entry transitions instead of only onboarding and splash.
3. **Add a minimum viable seed-data freshness process.** Do manual verification on a defined sample of high-traffic restaurants/cities, document pass/fail criteria, and treat stale entries as launch blockers where they affect top-ranked results.

**Verdict:** This was a decent cleanup sprint block, but the packet overstates closure. The biggest problem is credibility drift: you claim critique items are closed while openly admitting analytics is still console-only and several release-risk questions remain unanswered. Seed integrity work is the strongest contribution because it touches the actual product loop; the rest is mostly compliance and polish with unfinished edges.
