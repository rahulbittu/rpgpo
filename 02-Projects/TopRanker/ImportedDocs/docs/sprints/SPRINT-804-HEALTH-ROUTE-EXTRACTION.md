# Sprint 804 — Extract Health Routes to routes-health.ts

**Date:** 2026-03-12
**Theme:** Refactor — extract /_ready and /api/health to dedicated module
**Story Points:** 1 (refactoring)

---

## Mission Alignment

- **File health:** routes.ts was at 414/420 LOC threshold — one more addition would breach it
- **Separation of concerns:** Health/readiness endpoints are infrastructure, not application logic

---

## Problem

routes.ts accumulated observability additions (Sprints 798-803): DB latency, environment, push stats, error counts, SSE clients, rate limit stats. This pushed it to 414/420 LOC. Any future health endpoint enhancement would breach the threshold.

## Fix

1. Created `server/routes-health.ts` with `registerHealthRoutes(app)` containing `/_ready` and `/api/health`
2. routes.ts calls `registerHealthRoutes(app)` — down from 414 to 374 LOC (40 lines extracted)
3. Updated 9 test files that read routes.ts for health-related assertions to read routes-health.ts instead
4. Removed unused imports from routes.ts (config, getLogStats, getClientCount, getRateLimitStats)

---

## Team Discussion

**Amir Patel (Architecture):** "Clean extraction. routes-health.ts is 52 lines — a self-contained module with all its imports. routes.ts drops to 374 LOC with 46 lines of headroom."

**Sarah Nakamura (Lead Eng):** "9 test files needed updates. This is the cost of source-reading tests — they're coupled to file structure. But the updates were mechanical (change file path) and took minutes."

**Marcus Chen (CTO):** "This is the kind of refactoring that prevents future problems. We'd have hit the 420 threshold on the next sprint otherwise."

**Derek Okonkwo (Mobile):** "The health endpoints are now in their own module, which makes it obvious where to add new health signals without touching core routing logic."

**Rachel Wei (CFO):** "Extracting before breaching the threshold is better than breaching and then extracting. Proactive engineering discipline."

---

## Changes

| File | Change |
|------|--------|
| `server/routes-health.ts` | NEW — registerHealthRoutes with /_ready and /api/health |
| `server/routes.ts` | Removed inline health routes, calls registerHealthRoutes (414→374 LOC) |
| 9 test files | Updated to read routes-health.ts instead of routes.ts |

---

## Tests

- **Modified:** 9 test files updated for new file path
- **Total:** 13,463 tests across 604 files — all passing
- **Build:** 669.6kb (max 750kb)
