# Critique Request: Sprints 761-769

**Date:** 2026-03-12
**Requesting Team:** TopRanker Engineering

---

## Context

Sprints 761-769 were a focused production deployment and hardening cycle. The server was deployed to Railway but had 3 stacking crash bugs (log import, callable logger, DB schema mismatch). After fixing those, we enriched seed data with real Google Places photos, cleaned up log noise, and prepared for TestFlight.

## Key Changes

1. **Sprint 761:** Fixed `log is not defined` — import aliasing masked undefined variable
2. **Sprint 762:** Fixed `log2 is not a function` — logger was object, not callable function. Also moved `server.listen()` before background DB tasks
3. **Sprint 763:** Added 5 missing `serves_*` columns to Railway PostgreSQL
4. **Sprint 764:** Fixed misleading "0 routes registered" startup log
5. **Sprint 765:** Enriched 56 seed restaurants with real Google Places photos (709 total)
6. **Sprint 766:** Deduplicated Redis "not set" log (was logging on every cache operation)
7. **Sprint 767:** Bumped photo limit from 3 to 5 per restaurant
8. **Sprint 768:** Updated EAS build API URL to topranker.io custom domain
9. **Sprint 769:** Created branded OG image + fixed social meta tags to topranker.io

## Questions for Review

1. **Production readiness:** Are there any remaining deployment risks we should address before TestFlight?
2. **Data quality:** The seed data still uses Unsplash URLs in seed.ts. Should we update seed.ts to use Google Places API, or is the production DB enrichment sufficient?
3. **Photo proxy architecture:** The photo proxy fetches from Google Places API on every request (with 24h browser cache). Should we implement server-side caching (Redis or filesystem) to reduce API calls?
4. **Schema drift prevention:** This is the third time we've had missing columns in production. What automated checks would you recommend in the CI/CD pipeline?
5. **OG image:** The current OG image is SVG-to-PNG generated. Is this sufficient for launch or do we need professional design?

## Files for Review

- `server/logger.ts` — Callable function export pattern
- `server/index.ts` — Startup order (listen before background tasks)
- `server/redis.ts` — Cached negative check pattern
- `server/photos.ts` — Photo proxy with legacy fallback
- `eas.json` — Build configuration for iOS/Android
- `app/+html.tsx` — OG meta tags
