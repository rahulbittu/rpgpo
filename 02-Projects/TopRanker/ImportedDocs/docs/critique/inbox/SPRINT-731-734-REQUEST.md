# Critique Request — Sprints 731-734

**Date:** 2026-03-11
**Requesting Team:** TopRanker Engineering
**Sprint Range:** 731-734
**Theme:** Beta Readiness — Final Code Sprints

---

## Summary of Changes

### Sprint 731: Deep Link Handler
- `app/_layout.tsx`: Added Linking URL event listener for universal links + cold-start deep link handling. Routes to business, dish, challenger, and share screens.
- `app.json`: Added `applinks:topranker.io` to associatedDomains.
- `lib/sharing.ts`: Added topranker.io to SHARE_DOMAINS and getDeepLinkParams whitelist.
- Analytics breadcrumb on every deep link open.
- 20 tests.

### Sprint 732: App Store Metadata
- `config/store-metadata.ts`: Centralized App Store Connect metadata — name, subtitle (30 char limit), description (4000 char limit), keywords (100 char limit), screenshot specs, AASA config.
- Tests enforce Apple's character limits to prevent submission failures.
- 26 tests.

### Sprint 733: Rate Limiting Hardening
- `server/rate-limiter.ts`: Added ratingRateLimiter (10/min), feedbackRateLimiter (5/min), uploadRateLimiter (10/min).
- Wired before requireAuth on POST /api/ratings, POST /api/feedback, POST /api/ratings/:id/photo.
- Rate limit before auth ensures spam doesn't waste auth resources.
- 22 tests.

### Sprint 734: Offline Graceful Degradation
- `lib/hooks/useOfflineAware.ts`: Hook that returns `showError` (only when no cached data) and `isStale`/`staleLabel` (when showing cached data during error).
- `components/StaleBanner.tsx`: Minimal banner — "Updated 5m ago — showing cached data".
- Rankings screen wired: shows cached data with StaleBanner instead of error state when offline.
- 22 tests.

---

## Questions for Reviewer

1. **Deep link AASA deployment:** The client is configured but the server doesn't serve the AASA file yet. Is there a simpler approach than deploying to Railway?

2. **Rate limit thresholds:** Are 10 ratings/min and 5 feedback/min appropriate? Too strict could frustrate power users; too loose defeats the purpose.

3. **Offline-aware scope:** Only Rankings uses `useOfflineAware`. Should we prioritize wiring into Discover and Business Detail before beta, or is Rankings sufficient for launch?

4. **Store metadata keywords:** We used 12 keywords totaling 97/100 chars. Any terms we should swap for better App Store discoverability?

5. **StaleBanner UX:** The current banner is static and non-dismissible. Should it auto-dismiss after a few seconds, or stay until data refreshes?

---

## Health Metrics

| Metric | Sprint 730 | Sprint 734 | Delta |
|--------|-----------|-----------|-------|
| Tests | 12,575 | 12,665 | +90 |
| Test files | 540 | 544 | +4 |
| Build size | 662.3kb | 662.7kb | +0.4kb |
| Schema LOC | 911 | 911 | 0 |
| Rate limiters | 5 | 7 | +2 dedicated |

---

## Awaiting Response

Response expected in: `docs/critique/outbox/SPRINT-731-734-RESPONSE.md`
