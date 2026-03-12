# Architectural Audit #2 — Post-Sprint 60

**Trigger**: Sprint 60 milestone (every 5 sprints per process doc)
**Date**: March 7, 2026
**Led by**: Marcus Chen (CTO) + Architecture Council (James Park, Priya Sharma, Alex Volkov, Mei Lin)
**Reviewed by**: Nadia Kaur (Security), Carlos Ruiz (QA), Victoria Ashworth (Legal)
**Scope**: Full codebase scan, focus on progress since Audit #1

---

## Executive Summary

Audit #1 (Sprint 55) identified 15 findings. Of those, **all 2 CRITICAL and all 5 HIGH findings are resolved**. 3 of 4 MEDIUM findings are resolved (M2 indexes verified, M3 rate limiting done, M4 CORS done). Only M1 (category dedup) remains. This audit focuses on new findings and progress tracking.

**Test Count**: 85 tests (up from 39 at Audit #1 — 118% increase)
**TypeScript Errors**: 0 (down from 1)
**`as any` Casts**: 41 (down from 42 — 40 remain in frontend)
**Console.log in Server**: 16 (down from 29 — seed scripts + index.ts request log)

---

## Previous Findings Status

### Resolved Since Audit #1
| Finding | Severity | Sprint | Resolution |
|---------|----------|--------|------------|
| C1: Hardcoded session secret | CRITICAL | 56 | `server/config.ts` — crashes on missing SESSION_SECRET |
| C2: Admin email whitelist x3 | CRITICAL | 56 | `shared/admin.ts` — single source, alex@demo removed |
| H1: storage.ts 1010 LOC | HIGH | 57 | Split into 6 domain modules (max 230 LOC) |
| H2: `as any` in routes.ts | HIGH | 57 | 1 removed (41 -> 40 server-side) |
| H3: 39 tests for 37K LOC | HIGH | 56-59 | Now 85 tests across 7 files |
| H4: No centralized env config | HIGH | 56 | `server/config.ts` with startup validation |
| H5: 49 console.log statements | HIGH | 58 | `server/logger.ts`, 9 files migrated |
| M2: No database indexes | MEDIUM | 58 | Verified: 8 indexes in Drizzle schema |
| M3: No rate limiting | MEDIUM | 59 | Factory pattern, 2 tiers (auth 10/min, API 100/min) |
| M4: No CORS config | MEDIUM | 59 | Production domains + Replit + localhost |
| L4: Pre-existing TS error | LOW | 57 | `ReturnType<typeof setTimeout>` |

### Still Open from Audit #1
| Finding | Severity | Status |
|---------|----------|--------|
| M1: Category data duplication | MEDIUM | OPEN (low priority) |
| L1: 4 TODO comments | LOW | OPEN (feature dependencies) |
| L2: No CI/CD pipeline | LOW | OPEN (pre-launch) |
| L3: Dependency audit needed | LOW | OPEN |

---

## New Findings

### N1: Five Frontend Files >1000 LOC (HIGH)
**Files**:
| File | LOC | Purpose |
|------|-----|---------|
| `app/business/[id].tsx` | 1,210 | Business profile (hero, scores, ratings, dishes, map, claim) |
| `app/(tabs)/search.tsx` | 1,159 | Discover (filters, trending, featured, map, categories) |
| `app/rate/[id].tsx` | 1,104 | Rating flow (2-step form, photo, dishes, confirmation) |
| `app/(tabs)/profile.tsx` | 1,056 | Profile (stats, tier, perks, history, admin link) |
| `app/(tabs)/index.tsx` | 1,007 | Leaderboard (rankings, challengers, city selector) |

**Risk**: Same as H1 from Audit #1 — merge conflicts, cognitive load, harder to test.
**Owner**: James Park (Frontend Architect)
**Fix**: Extract into focused sub-components per screen. Priority: business/[id].tsx.
**Points**: 13 (across multiple sprints)
**Severity**: HIGH

**James Park**: "These files are all feature-complete screens with embedded sub-components. The fix is straightforward: extract `BusinessHero`, `ScoreCard`, `RatingsList`, `DishGrid` from business/[id].tsx. Same pattern for the other screens. Each extraction is independent and testable."

### N2: 40 `as any` Casts in Frontend (HIGH)
**Distribution**:
| File | Count |
|------|-------|
| `app/(tabs)/challenger.tsx` | 8 |
| `app/(tabs)/index.tsx` | 8 |
| `app/(tabs)/search.tsx` | 5 |
| `app/business/[id].tsx` | 4 |
| `app/(tabs)/profile.tsx` | 3 |
| Other (7 files) | 12 |

**Risk**: Type safety holes. Most are in React Query response typing.
**Owner**: Mei Lin (Type Safety)
**Fix**: Create typed API response interfaces. Replace `as any` with proper generics.
**Points**: 5
**Severity**: HIGH

### N3: No Integration Tests (HIGH)
**Finding**: All 85 tests are unit tests. Zero tests hit actual HTTP endpoints.
**Risk**: API contract regressions go undetected.
**Owner**: Sage (Backend Engineer #2)
**Fix**: supertest suite for core endpoints (auth, ratings, leaderboard, business).
**Points**: 8
**Severity**: HIGH

### N4: Seed Scripts Still Use console.log (LOW)
**Finding**: 15 `console.log`/`console.error` calls in `seed.ts` and `seed-cities.ts`.
**Risk**: Minimal — CLI tools, not production request handlers.
**Owner**: Nina Petrov
**Fix**: Migrate to structured logger for consistency.
**Points**: 1
**Severity**: LOW

### N5: No Input Sanitization on Business Search (MEDIUM)
**Finding**: `searchBusinesses` in `storage/businesses.ts` uses `ILIKE` with user-provided query. While parameterized (safe from SQL injection), there's no length or character validation on the search query.
**Owner**: Nadia Kaur
**Fix**: Add max length (100 chars), strip special SQL characters.
**Points**: 2
**Severity**: MEDIUM

---

## Audit Summary Table

| Severity | New | Open from #1 | Total | Points |
|----------|-----|-------------|-------|--------|
| CRITICAL | 0 | 0 | 0 | 0 |
| HIGH | 3 | 0 | 3 | 26 |
| MEDIUM | 1 | 1 | 2 | 4 |
| LOW | 1 | 3 | 4 | ~8 |
| **Total** | **5** | **4** | **9** | **~38** |

---

## Progress Since Audit #1

| Metric | Audit #1 | Audit #2 | Change |
|--------|---------|---------|--------|
| Tests | 39 | 85 | +118% |
| TS Errors | 1 | 0 | Clean |
| `as any` casts | 42 | 41 | -1 |
| Console.log (server) | 29 | 16 | -45% |
| Largest file (server) | 1,010 | 230 | -77% |
| Largest file (frontend) | 1,210 | 1,210 | No change |
| CRITICAL findings | 2 | 0 | All resolved |
| HIGH findings | 5 | 3 | All old resolved, 3 new |

---

## Sprint Planning Recommendations

### Sprint 61 (NEXT)
| Item | Source | Owner | Points |
|------|--------|-------|--------|
| N5: Search input sanitization | MEDIUM | Nadia Kaur | 2 |
| N3: Integration tests (auth + leaderboard) | HIGH | Sage | 8 |
| **Total** | | | **10** |

### Sprint 62-63
| Item | Source | Owner | Points |
|------|--------|-------|--------|
| N1: Split business/[id].tsx | HIGH | James Park | 5 |
| N1: Split search.tsx | HIGH | James Park | 4 |
| N2: Typed API responses | HIGH | Mei Lin | 5 |

---

## Architecture Council Sign-Off

| Member | Role | Approved |
|--------|------|----------|
| Marcus Chen | CTO | Yes |
| James Park | Frontend Architect | Yes |
| Priya Sharma | Backend Architect | Yes |
| Alex Volkov | DevOps Lead | Yes |
| Mei Lin | Type Safety | Yes |

---

*Next architectural audit: Sprint 65*
