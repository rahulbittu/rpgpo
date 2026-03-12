# Critique Request — Sprints 736-739

**Date:** 2026-03-11
**Requesting Team:** TopRanker Engineering
**Sprint Range:** 736-739
**Theme:** Final Beta Polish — Static Files, Offline UX, Analytics, Accessibility

---

## Summary of Changes

### Sprint 736: Static Files + Discover Offline + Android Deep Links
- `public/.well-known/apple-app-site-association`: AASA file for iOS universal link verification
- `public/robots.txt`: SEO crawl directives (allow root, disallow /api/ and /admin/)
- `server/index.ts`: Explicit AASA route with application/json + public/ static middleware
- `app/(tabs)/search.tsx`: Wired useOfflineAware + StaleBanner (2nd screen)
- `app.json`: Added topranker.io to Android intentFilters (4 path prefixes)
- 21 tests

### Sprint 737: Business Detail + Profile Offline-Aware
- `app/business/[id].tsx`: Wired useOfflineAware + StaleBanner
- `app/(tabs)/profile.tsx`: Wired useOfflineAware + StaleBanner
- All 4 major screens now have offline graceful degradation (100% coverage)
- 18 tests

### Sprint 738: Session Analytics + AASA Fix + Pre-Submit Hardening
- `lib/analytics.ts`: Added sessionId + sessionDurationMs to every tracked event
- `app/feedback.tsx`: Added sessionId and sessionDurationMs to diagnostics payload
- `public/.well-known/apple-app-site-association`: Fixed TEAM_ID → RKGRR7XGWD
- `scripts/pre-submit-check.sh`: Added AASA, robots.txt, store metadata, rate limiter checks
- 22 tests

### Sprint 739: Accessibility + ErrorBoundary Network Awareness
- `app/+not-found.tsx`: Added accessibilityRole, accessibilityLabel, accessibilityElementsHidden
- `components/ErrorBoundary.tsx`: Added isNetworkError() for context-aware messaging, accessibilityRole="header"
- `app/_layout.tsx`: Added accessible + accessibilityLabel to splash container
- 21 tests

---

## Questions for Reviewer

1. **Offline-aware on all screens:** Is the `useOfflineAware` hook pattern the right abstraction? Should we add automatic retry when connectivity returns?

2. **Session ID format:** We use `{timestamp_base36}-{random_6chars}`. Is this sufficient for uniqueness, or should we use UUID?

3. **AASA deployment:** The file is in `public/` and served via Express. Should we also deploy it as a standalone file to the CDN/DNS level for faster iOS verification?

4. **ErrorBoundary network detection:** We check error message strings for "network", "fetch", "timeout", "offline". Is this heuristic sufficient, or should we integrate NetInfo state?

5. **Pre-submit script completeness:** The script now checks 15 items. Are there any other deployment prerequisites we should validate?

---

## Health Metrics

| Metric | Sprint 735 | Sprint 739 | Delta |
|--------|-----------|-----------|-------|
| Tests | 12,665 | 12,746 | +81 |
| Test files | 544 | 548 | +4 |
| Build size | 662.7kb | 663.0kb | +0.3kb |
| Offline screens | 1/4 | 4/4 | +3 |
| Rate limiters | 7 | 7 | 0 |

---

## Awaiting Response

Response expected in: `docs/critique/outbox/SPRINT-736-739-RESPONSE.md`
