# Sprint 472: Admin Auth Middleware for Enrichment Endpoints

**Date:** 2026-03-10
**Duration:** 1 sprint cycle
**Story Points:** 2
**Owner:** Nadia Kaur (Cybersecurity)

## Mission

Add `requireAuth` + `requireAdmin` middleware to all 6 admin enrichment endpoints. This resolves the security finding flagged in 4 consecutive critique cycles (Sprints 456, 461, 466, 470). NON-NEGOTIABLE commitment from SLT-470.

## Team Discussion

**Nadia Kaur (Cybersecurity):** "Finally. Four critique cycles of flagging this. The pattern is identical to routes-admin.ts and routes-admin-experiments.ts: `requireAuth` from shared middleware + local `requireAdmin` using `isAdminEmail`. Both enrichment files now have the same auth gate as every other admin endpoint."

**Marcus Chen (CTO):** "This was the last persistent friction point from the critique protocol. The route split in Sprint 467 made this cleaner — each file gets its own `requireAdmin` function. No shared state, no circular deps."

**Amir Patel (Architect):** "6 endpoints protected: 3 GET (dashboard, hours-gaps, dietary-gaps) and 3 POST (bulk-dietary, bulk-dietary-by-cuisine, bulk-hours). The `isAdminEmail` pattern from `@shared/admin` is the canonical approach — consistent with routes-admin.ts."

**Sarah Nakamura (Lead Eng):** "The LOC bump is minimal: +12 lines per file for imports and the middleware function. Both files stay well under their 400 LOC threshold. routes-admin-enrichment.ts went from 201 to 213, bulk from 204 to 215."

**Jordan Blake (Compliance):** "This closes a security finding. Unauthenticated access to enrichment endpoints was a real risk — anyone could have enumerated business data or bulk-modified dietary tags. The 403 response for non-admin access is the right behavior."

**Rachel Wei (CFO):** "The critique protocol worked exactly as designed. Persistent flagging → SLT commitment → delivery. This validates the external review process."

## Changes

### Modified: `server/routes-admin-enrichment.ts` (+12 LOC, 201→213)
- Added `import { requireAuth } from "./middleware"`
- Added `import { isAdminEmail } from "@shared/admin"`
- Added `requireAdmin` middleware function (isAdminEmail check → 403)
- All 3 GET endpoints now use `requireAuth, requireAdmin` middleware chain

### Modified: `server/routes-admin-enrichment-bulk.ts` (+11 LOC, 204→215)
- Added `import { requireAuth } from "./middleware"`
- Added `import { isAdminEmail } from "@shared/admin"`
- Added `requireAdmin` middleware function (isAdminEmail check → 403)
- All 3 POST endpoints now use `requireAuth, requireAdmin` middleware chain

### Modified: `__tests__/sprint467-enrichment-split.test.ts`
- LOC threshold for routes-admin-enrichment.ts bumped 210→225 (auth additions)

### New: `__tests__/sprint472-admin-auth.test.ts` (19 tests)
- Dashboard routes: requireAuth + requireAdmin on all 3 GET endpoints
- Bulk routes: requireAuth + requireAdmin on all 3 POST endpoints
- Pattern consistency: both files use isAdminEmail, 403 response, same error message
- Middleware module verification

## Test Coverage
- 19 new tests, all passing
- Full suite: 8,732 tests across 364 files, all passing in ~4.7s
- Server build: 635.3kb (+0.5kb for auth imports)

## Security Impact
- **Before:** All 6 enrichment endpoints were publicly accessible (no auth)
- **After:** All 6 require authenticated session + admin email whitelist
- **Pattern:** Matches routes-admin.ts, routes-admin-experiments.ts auth pattern
- **Critique resolution:** Closes 4-cycle security finding (Sprints 456, 461, 466, 470)
