# Sprint 491: Rating Submission Route Extraction

**Date:** 2026-03-10
**Duration:** 1 sprint cycle
**Story Points:** 3
**Owner:** Sarah Nakamura (Lead Eng)

## Mission

Extract rating submission endpoints (POST, PATCH, DELETE, flag) from routes.ts to a new routes-ratings.ts. Resolves M-1 from Audit #56 (routes.ts at 91.0%, 546/600 LOC). The rating submission handler alone was ~90 LOC with integrity checks, push triggers, and cache invalidation — a natural extraction unit.

## Team Discussion

**Sarah Nakamura (Lead Eng):** "routes.ts went from 546→369 LOC (32% reduction). The rating block was the largest inline handler — 170 lines including POST, PATCH, DELETE, and flag. Clean extraction with all integrity checks, push triggers, and SSE broadcasts preserved."

**Amir Patel (Architect):** "routes.ts is back to 61.5% of threshold (369/600). This is the healthiest it's been since Sprint 171's initial extraction cycle. The file now has zero inline handlers over 20 lines — everything complex is delegated."

**Marcus Chen (CTO):** "12 test files needed redirects — the highest ever for a single extraction. This is the tax of source-based testing at scale. The pattern is well-understood though: change the readFileSync path. The agent handled all 12 cleanly."

**Dev Kapoor (Frontend):** "The extraction removed 6 unused imports from routes.ts: insertRatingSchema, sanitizeNumber, trackEvent, getUserExperiments, trackOutcome, checkAndRefreshTier, checkOwnerSelfRating, checkVelocity, logRatingSubmission. Cleaner dependency graph."

**Nadia Kaur (Cybersecurity):** "All integrity checks preserved in the extraction: owner self-rating block, velocity detection, sanitization. The push trigger wiring from Sprint 488 moved cleanly — same fire-and-forget pattern."

## Changes

### New: `server/routes-ratings.ts` (~199 LOC)
- `registerRatingRoutes(app)` — registers 4 endpoints
- `POST /api/ratings` — submit with integrity checks, push triggers, cache invalidation
- `PATCH /api/ratings/:id` — edit within 24h window
- `DELETE /api/ratings/:id` — delete own rating
- `POST /api/ratings/:id/flag` — flag suspicious rating

### Modified: `server/routes.ts` (-177 LOC, 546→369)
- Removed all 4 rating endpoints
- Removed 9 now-unused imports
- Added import and registration of registerRatingRoutes
- Updated header comments

### Modified: `server/routes.ts` imports cleanup
- Removed: insertRatingSchema, sanitizeNumber, trackEvent, getUserExperiments, trackOutcome, checkAndRefreshTier, submitRating, checkOwnerSelfRating, checkVelocity, logRatingSubmission

### Test redirects (12 files):
- `__tests__/sprint488-push-trigger-wiring.test.ts` — routes.ts → routes-ratings.ts
- `tests/sprint141-tier-path-coverage.test.ts` — checkAndRefreshTier → routes-ratings.ts
- `tests/sprint142-tier-semantics-enforcement.test.ts` — FRESH path → routes-ratings.ts
- `tests/sprint146-freshness-boundary-audit.test.ts` — tier-emitting endpoints → routes-ratings.ts
- `tests/sprint158-challenger-broadcast.test.ts` — broadcast → routes-ratings.ts
- `tests/sprint163-rate-gate-analytics.test.ts` — rate gate → routes-ratings.ts
- `tests/sprint171-routes-splitting.test.ts` — /api/ratings → registerRatingRoutes
- `tests/sprint175-push-triggers.test.ts` — tier upgrade → routes-ratings.ts
- `tests/sprint180-ssr-prerendering.test.ts` — prerender cache → routes-ratings.ts
- `tests/sprint183-rating-moderation.test.ts` — rating API → routes-ratings.ts
- `tests/sprint265-integrity-wiring.test.ts` — integrity checks → routes-ratings.ts
- `tests/sprint387-rating-edit-delete.test.ts` — edit/delete → routes-ratings.ts

### New: `__tests__/sprint491-rating-extraction.test.ts` (17 tests)
- Module structure: exports, endpoints, imports, integrity, triggers, middleware
- routes.ts: registration, no rating content, LOC under 380
- LOC thresholds for both files

## Test Coverage
- 17 new tests, all passing
- Full suite: 9,059 tests across 380 files, all passing in ~4.9s
- Server build: 650.9kb (unchanged — same code, different file)
