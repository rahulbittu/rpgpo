# Sprint 601: Admin Route Consolidation

**Date:** 2026-03-11
**Owner:** Amir Patel (Architecture)
**Points:** 3
**Status:** Complete

## Mission

Consolidate 18 admin route imports and registrations from routes.ts into a single `registerAllAdminRoutes` entry point in routes-admin.ts. Reduce routes.ts from 386 to 353 LOC (-33 lines). Investigated esbuild code splitting but found it increases total size — consolidation provides organizational value instead.

## Team Discussion

**Amir Patel (Architecture):** "routes.ts had 18 individual admin route imports and 18 registration calls — that's 36 lines of admin boilerplate in a file that should focus on core routes. Consolidating into a single `registerAllAdminRoutes(app)` call keeps routes.ts clean and gives routes-admin.ts ownership of the entire admin route tree."

**Sarah Nakamura (Lead Eng):** "We investigated esbuild `--splitting` for real build size reduction. Main bundle dropped from 730kb to 194kb, but total dist exploded to 976kb due to chunk overhead. For a single-process Node server, all code loads into memory anyway — splitting is a client-side optimization that doesn't apply here."

**Marcus Chen (CTO):** "Good engineering discipline — we tested the hypothesis, found it didn't work, and pivoted to a simpler approach. The consolidation reduces routes.ts complexity without adding overhead. Build stays at 730kb."

**Nadia Kaur (Security):** "All 18 admin route files still use the same `requireAuth + requireAdmin` middleware pattern. The consolidation doesn't change the security model — it just organizes the wiring."

**Priya Sharma (QA):** "18 test files needed updating to check routes-admin.ts instead of routes.ts for admin registrations. All redirected cleanly — 11,325 tests passing."

## Investigation: Code Splitting (Not Adopted)

Tested esbuild `--splitting` flag:
- **Main bundle:** 730kb → 194kb (73% reduction)
- **Total dist:** 730kb → 976kb (34% INCREASE)
- **Reason:** Chunk coordination overhead + shared dependency duplication
- **Conclusion:** Code splitting is a client-side optimization. For single-process Node servers, all code is loaded regardless of chunk boundaries. Splitting adds total size, not saves it.

## Changes

### Modified Files
- `server/routes.ts` — 386→353 LOC (-33 lines). Removed 17 admin imports and 17 registration calls. Added single `registerAllAdminRoutes` import and call.
- `server/routes-admin.ts` — Added 17 sub-admin imports + `registerAllAdminRoutes()` consolidation function (+37 lines)
- `shared/thresholds.json` — Updated routes.ts current (386→353), build (729.9→730.0), tests (11320→11325)
- 18 test files — Redirected admin wiring assertions from routes.ts to routes-admin.ts

### Test Files Updated
sprint446, sprint452, sprint467, sprint519, sprint542, sprint171, sprint232, sprint233, sprint236, sprint238, sprint239, sprint242, sprint244, sprint246, sprint247, sprint249, sprint252, sprint254

## Metrics

- **routes.ts:** 386→353 LOC (33 lines freed, 47 lines headroom to 400 ceiling)
- **Server build:** 730.0kb (unchanged — consolidation adds no overhead)
- **Tests:** 11,325 passing (484 files, +5 from test redirects)
