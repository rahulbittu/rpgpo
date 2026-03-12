# Sprint 736 — Static Files + Discover Offline + Android Deep Links

**Date:** 2026-03-11
**Theme:** Beta Deployment Readiness
**Story Points:** 2

---

## Mission Alignment

Three deployment gaps closed: (1) Apple App Site Association file for iOS universal link verification, (2) robots.txt for SEO crawl control, (3) Discover screen offline graceful degradation. Plus topranker.io added to Android intent filters for deep link parity.

---

## Team Discussion

**Derek Liu (Mobile):** "The AASA file is the missing piece for universal links. iOS checks `topranker.com/.well-known/apple-app-site-association` to verify that the app is authorized to handle links from that domain. Without it, links open in Safari instead of the app."

**Sarah Nakamura (Lead Eng):** "The server now serves the AASA file with explicit `application/json` content type via a dedicated route. This prevents any content-type sniffing issues that could break iOS verification."

**Amir Patel (Architecture):** "robots.txt is simple but important — it blocks API and admin endpoints from search engine crawling while allowing public pages. The sitemap reference points to topranker.io for future SEO."

**Jasmine Taylor (Marketing):** "Android deep links now include all 4 path prefixes for topranker.io: business, share, dish, and join. Both platforms, both domains — complete deep link coverage."

**Leo Hernandez (Frontend):** "Discover is now the second screen with offline-aware behavior. Same pattern as Rankings: `useOfflineAware` returns `showError` and `isStale`, StaleBanner shows cached data timestamp. Took 5 minutes to wire."

**Marcus Chen (CTO):** "This is the deployment gap sprint. AASA, robots.txt, and complete deep link coverage across both platforms and both domains. Combined with the store metadata from Sprint 732, we're ready to deploy."

---

## Changes

| File | Change |
|------|--------|
| `public/.well-known/apple-app-site-association` | New: AASA file for iOS universal link verification |
| `public/robots.txt` | New: SEO crawl directives |
| `server/index.ts` | Explicit AASA route with application/json + static middleware for public/ |
| `app/(tabs)/search.tsx` | Wired useOfflineAware + StaleBanner (same pattern as Rankings) |
| `app.json` | Added topranker.io to Android intentFilters (4 path prefixes) |
| `__tests__/sprint736-static-files-discover-offline.test.ts` | 21 tests: AASA (5), robots (4), server (3), discover offline (4), android (4), loader (1) |

---

## Health Metrics

| Metric | Value |
|--------|-------|
| Build size | 663.0kb / 750kb (88.4%) |
| Tests | 12,686 pass / 545 files |

---

## What's Next (Sprint 737)

Further beta polish or feedback-driven iteration.
