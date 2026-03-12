# Sprint 659: Claim Routes Extraction

**Date:** 2026-03-11
**Points:** 3
**Focus:** Extract business claim endpoints from routes-businesses.ts to routes-claims.ts

## Mission

The `routes-businesses.ts` file contained both CRUD/search endpoints and claim-specific logic (submission, email verification, rate limiting). As the claim flow grew across Sprints 649/654/657, it became a distinct domain deserving its own module. This sprint extracts all claim routes to `routes-claims.ts`, reducing routes-businesses.ts from 348→257 LOC (26% reduction).

## Team Discussion

**Amir Patel (Architecture):** "This follows the same extraction pattern as Sprint 486 (analytics) and Sprint 171 (businesses from routes.ts). Each route file should represent a single domain. Claims are a separate concern from business search/detail."

**Sarah Nakamura (Lead Eng):** "The extraction was clean — claim routes only shared `getBusinessBySlug`, `sanitizeString`, `wrapAsync`, and `requireAuth` with the parent file. No circular dependencies. The `claimVerifyRateLimiter` import moved entirely to the new file."

**Marcus Chen (CTO):** "routes-businesses.ts is now at 74% of its 360 LOC ceiling. That gives us room for future business endpoint additions without ceiling pressure."

**Nadia Kaur (Cybersecurity):** "The rate limiter wiring moved intact — `claimVerifyRateLimiter` is still the first middleware before `requireAuth` on the verify endpoint. Security posture unchanged."

**Jordan Blake (Compliance):** "4 test files needed updates to read from routes-claims.ts instead of routes-businesses.ts. All structural assertions still pass — the tests verify the same things, just in the correct file."

## Changes

### `server/routes-claims.ts` (NEW — 107 LOC)
- `registerClaimRoutes(app)` function
- `POST /api/businesses/:slug/claim` — full claim submission with email/manual paths
- `POST /api/businesses/claims/:claimId/verify` — 6-digit code verification with rate limiting

### `server/routes-businesses.ts` (348 → 257 LOC)
- Removed claim routes (lines 173-262)
- Removed `claimVerifyRateLimiter` import
- Updated header comments

### `server/routes.ts` (377 → 379 LOC)
- Added `import { registerClaimRoutes } from "./routes-claims"`
- Added `registerClaimRoutes(app)` call

### Test Fixes (4 files)
- `__tests__/sprint486-analytics-extraction.test.ts` — removed claim endpoint from "still has" check
- `tests/sprint171-routes-splitting.test.ts` — claim test reads routes-claims.ts
- `tests/sprint173-claim-verification.test.ts` — sections 5+6 read routes-claims.ts
- `tests/sprint394-claim-verification.test.ts` — section 3 reads routes-claims.ts

## Health
- **Tests:** 11,695 pass (501 files)
- **Build:** 647.1kb (+0.1kb for new module)
- **routes-businesses.ts:** 257 LOC (ceiling 360) — 71%
- **routes-claims.ts:** 107 LOC (new, no ceiling tracked)
