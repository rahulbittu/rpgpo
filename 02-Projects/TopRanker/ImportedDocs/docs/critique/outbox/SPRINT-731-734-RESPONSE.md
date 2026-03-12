# SPRINT-731-734 External Critique

## Verified wins
- Deep link handling appears materially implemented, not just scaffolded: listener + cold-start handling in `app/_layout.tsx`, domain allowlisting in `lib/sharing.ts`, associated domain entry in `app.json`, and 20 tests.
- App Store metadata was centralized in `config/store-metadata.ts`, with tests enforcing Apple character limits. That is a concrete pre-submission safeguard, not process theater.
- Rate limiting was actually wired onto live write endpoints: `POST /api/ratings`, `POST /api/feedback`, and `POST /api/ratings/:id/photo`. Putting limiter middleware before auth is a real resource-protection decision.
- Offline degradation is real but narrow: a reusable hook exists, a banner component exists, and Rankings uses cached-data fallback instead of a hard error.
- Sprint impact stayed small: +90 tests, +0.4kb build size, no schema churn.

## Contradictions / drift
- Sprint 731 is framed as “Deep Link Handler,” but the packet admits the server does not serve the AASA file yet. That means universal links are not actually end-to-end ready. Client configuration without AASA deployment is partial completion presented as readiness work.
- Theme is “Beta Readiness — Final Code Sprints,” but Sprint 732 is mostly metadata centralization. Useful, but it does not advance the product core loop unless submission is the actual blocker.
- Sprint 734 introduces a reusable offline-aware pattern, then applies it only to Rankings. That is framework-first, adoption-later work during a “final code sprints” window.
- Health metrics say rate limiters went from 5 to 7, while Sprint 733 lists three new dedicated limiters. Either one replaced/merged an older limiter, or the accounting is inconsistent.
- The review questions are still asking for threshold validation, offline scope decisions, keyword swaps, and stale-banner behavior. For “final code sprints,” too many product decisions are still unresolved after implementation.

## Unclosed action items
- AASA file deployment is still not done, so universal link support is unclosed.
- Decide whether universal links need a simpler hosting path than Railway, then ship it. Until then, deep links are incomplete.
- Validate rate limit thresholds with expected user behavior or observed traffic; current numbers are arbitrary in this packet.
- Decide whether `useOfflineAware` must be wired into Discover and Business Detail before beta. Current scope is unresolved.
- Resolve StaleBanner behavior: static vs auto-dismiss. Right now UX is undecided.
- Finalize App Store keyword selection based on actual ASO strategy rather than filling 97/100 chars.

## Core-loop focus score
6/10

- Deep linking supports acquisition/re-entry into the app, which helps the loop indirectly.
- Rate limiting protects write endpoints tied to ratings/feedback, which is relevant to core interaction quality.
- Offline handling on Rankings improves one important read surface, but only one.
- App Store metadata is launch/admin work, not core-loop product work.
- Too much of the sprint output is partially complete or awaiting decisions: AASA, thresholds, offline scope, banner UX.
- The packet shows polish and guardrails more than completed end-to-end beta readiness on the main user path.

## Top 3 priorities for next sprint
1. Ship AASA hosting and verify true end-to-end universal link behavior on device. Stop counting deep linking as done until the server side exists.
2. Finish or explicitly cut offline graceful degradation for the critical read surfaces before beta. If Discover and Business Detail matter in the main user journey, wire them now; if not, document the cut.
3. Close decision debt on rate-limit thresholds and stale-banner behavior with explicit launch defaults. Do not carry unresolved policy/UX questions into beta.

**Verdict:** This sprint range delivered several real implementation pieces, but too much of it is “configured,” “centralized,” or “reusable” rather than fully closed. The biggest problem is readiness drift: deep linking is not actually ready without AASA, offline support is only partially adopted, and launch-sensitive choices are still open questions. The work is competent, but the packet overstates completion relative to beta-readiness.
