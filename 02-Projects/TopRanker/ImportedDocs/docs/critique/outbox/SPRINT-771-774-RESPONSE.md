# Sprints 771-774 External Critique

## Verified wins
- The packet gives a clear, bounded migration scope: API base URLs, AASA serving, email/share/QR/OG links, and Expo Router origin were all updated across four sprints.
- You explicitly preserved `.com` where backward compatibility or platform linkage requires it: URL parsing, mobile deep-link associations, and allowlists. That is a concrete compatibility decision, not vague intent.
- The AASA change has a stated operational cause: Railway/Nixpacks changing cwd at runtime, which breaks `sendFile()` assumptions. The inline response is at least tied to an observed deployment constraint.
- You identified one area not fully migrated: email templates still hardcode URLs. That is useful because it names remaining debt instead of pretending the migration is complete.

## Contradictions / drift
- The headline claim is “migrated all user-facing URLs from `topranker.com` to `topranker.io`,” but later you state email templates still hardcode URLs. Those cannot both be true.
- You say `.com` is kept for “backwards-compatible URL parsing” and deep linking, but you also ask whether `.com` should remain a dead domain. Keeping old links parseable while leaving the old domain dead is a broken migration experience, not backward compatibility.
- “Defense in depth” is not a convincing justification for keeping a dead domain in CORS/CSP origins. If `.com` is not live, this is stale allowlist surface unless there is an active redirect or active traffic path.
- The effort drifts from core user outcome into scattered string replacement. “29+ replacements across 8 server files” suggests no central URL authority, which is exactly why the migration took four sprints and still left hardcoded URLs behind.
- The packet asks about Apple AASA caching risk, but provides no verification that the inline JSON response matches required headers/content-type/path behavior. That means the riskiest platform-specific change is presented without evidence.

## Unclosed action items
- Decide whether `topranker.com` will be redirected to `topranker.io` or intentionally retired. Current state is unresolved and contradictory to “backwards compatibility.”
- Audit and remove remaining hardcoded email-template URLs, or explicitly accept that the migration is incomplete.
- Validate AASA delivery end-to-end on device/platform behavior, not just server implementation. The packet does not show that this was verified.
- Reassess `.com` in CORS/CSP origins after the domain decision. Right now this looks like carryover, not deliberate policy.
- Define a single canonical site URL/config source. The spread across app config, server files, templates, sharing, and OG generation shows this is still not centralized.

## Core-loop focus score
**4/10**

- Domain migration is infrastructure/support work, not direct core-loop improvement.
- Some parts were necessary because broken links and deep links harm activation and sharing, so this is not zero-value maintenance.
- Four sprints for URL migration indicates weak configuration centralization and too much surface area for a non-product change.
- The packet still leaves core user-facing gaps unresolved: dead old domain, hardcoded email URLs, and unverified AASA behavior.
- The work reduced inconsistency, but did not clearly improve the core loop beyond preventing regressions.

## Top 3 priorities for next sprint
1. **Make a domain decision and close it:** either set up `topranker.com → topranker.io` redirects or formally remove `.com` from backward-compatibility claims and allowlists where possible.
2. **Centralize canonical URL config:** one source for site origin used by email templates, share links, QR codes, OG images, router/app config, and server responses.
3. **Verify platform-critical behavior:** test AASA/universal links and mobile deep linking end-to-end, then document headers/content-type/caching expectations instead of leaving it as an open question.

**Verdict:** This was not a clean migration; it was a multi-sprint string-replacement campaign with unresolved policy decisions left at the end. The biggest problem is contradiction: you claim all user-facing URLs moved to `.io` while admitting hardcoded leftovers and leaving `.com` dead but still treated as “backward compatible.” Until you decide redirect vs retirement, centralize site URL config, and verify AASA behavior on real clients, this migration is incomplete.
