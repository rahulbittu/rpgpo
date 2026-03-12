# Architectural Audit #38 — Sprint 280
**Date:** March 9, 2026
**Auditor:** Amir Patel (Architecture Lead)
**Grade: A** (14th consecutive A-range)

## Scorecard

| Category | Grade | Notes |
|----------|-------|-------|
| Code Organization | A | Score breakdown, sparkline, top dishes — clean single-responsibility components |
| Test Coverage | A+ | 5,508 tests across 200 files, 100% passing |
| Security | A+ | Input validation hardened (int scores, required visitType, HTML stripping) |
| Performance | A- | In-memory stores acceptable, SVG sparkline is lightweight |
| Type Safety | B+ | 70 `as any` casts (down from 71) — Sprint 278 removed visitType cast |
| Documentation | A | Sprint docs 276-279, retros current, SLT-280 meeting doc |

## Findings

### Critical (P0) — 0 issues

### High (P1) — 0 issues

### Medium (P2) — 3 issues

**M1: `as any` cast count at 70** (was 71)
- Down 1 from Sprint 275 (visitType cast removed in Sprint 278).
- Still above target of <40. Dedicated cleanup sprint recommended.
- Breakdown: server 34, app 17, components 15, lib 4.

**M2: search.tsx at 869 LOC** (unchanged)
- 131 LOC from 1000 FAIL threshold.
- Map component and suggestion chips are extraction candidates.
- Sprint 282 scheduled for extraction.

**M3: badges.ts at 886 LOC** (unchanged)
- 114 LOC from 1000 FAIL threshold.
- Tier progress module and badge registry are extraction candidates.
- Sprint 283 scheduled for extraction.

### Low (P3) — 2 issues

**L1: In-memory stores** (unchanged)
- Velocity detection, SSE connections, claimed businesses.
- Redis migration partial (Sprint 259). Acceptable at current scale.

**L2: routes.ts at 506 LOC** (unchanged)
- Stable since Sprint 265. Below 520 threshold.

**L3: routes-admin.ts at 604 LOC** (NEW)
- Grew from ~550 to 604 with eligibility endpoint (Sprint 279).
- Test threshold bumped to 650. If more admin endpoints added, split to routes-admin-eligibility.ts.

## Architecture Highlights

### New Components (Sprints 276-279)

```
ScoreTrendSparkline (Sprint 276)
  → Self-fetching from /api/businesses/:id/score-trend
  → SVG polyline sparkline, trend direction indicator
  → Returns null for <2 data points

TopDishes (Sprint 277)
  → Self-fetching from /api/businesses/:id/top-dishes
  → Ranked list #1-#5 with photo, name, vote count
  → Navigation to dish detail page

Admin Eligibility (Sprint 279)
  → GET /api/admin/eligibility
  → Near-eligible: 2+ ratings OR credibility >= 0.3
  → Missing requirements per business
```

### Validation Pipeline (Sprint 278)
```
User submits rating
  → Zod schema:
    q1/q2/q3Score: z.number().int().min(1).max(5)
    visitType: z.enum(["dine_in", "delivery", "takeaway"]) — REQUIRED
    note: z.string().max(2000).transform(strip HTML) — optional
    timeOnPageMs: z.number().int().min(0).max(3600000) — optional
  → Server:
    data.visitType as VisitType (no fallback, no cast)
```

### Unranked Label System (Sprint 279)
```
getRankDisplay(rank):
  rank <= 0 → "Unranked" (gray badge)
  rank 1-3 → medal emoji (AMBER badge)
  rank 4+ → #N (AMBER badge)

Search cards:
  BusinessCard: displayRank = item.rank > 0 ? item.rank : 0
  MapBusinessCard: uses item.rank directly
  Both: conditional unrankedBadge style (gray #6B7280)
```

### Test Health
- 200 test files, 5,508 tests
- All passing in ~2.9s
- Sprints 276-279 added 72 tests
- Grade trajectory: A → A → A → A → A → A → A → A → A → A → A → A → A → A

## Recommendations for Next 5 Sprints
1. `as any` cast reduction — target <50 (highest impact on type safety grade)
2. search.tsx extraction — target <700 LOC (extract map + suggestion chips)
3. badges.ts extraction — target <700 LOC (extract tier progress)
4. Admin eligibility dashboard UI (make the API endpoint visible)
5. Consider routes-admin split if more endpoints added
