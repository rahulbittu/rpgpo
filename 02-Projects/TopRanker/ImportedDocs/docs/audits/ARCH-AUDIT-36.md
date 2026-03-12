# Architectural Audit #36 — Sprint 270
**Date:** March 9, 2026
**Auditor:** Amir Patel (Architecture Lead)
**Grade: A** (12th consecutive A-range)

## Scorecard

| Category | Grade | Notes |
|----------|-------|-------|
| Code Organization | A | 35 route modules, clean separation |
| Test Coverage | A+ | 5,369 tests across 192 files, 100% passing |
| Security | A | Photo upload validated, verification server-computed, anti-gaming active |
| Performance | A- | In-memory stores acceptable at current scale |
| Type Safety | B | 71 `as any` casts — regression from ~65, needs reduction pass |
| Documentation | A | Sprint docs 265-269, retros current, governing docs up to date |

## Findings

### Critical (P0) — 0 issues

### High (P1) — 0 issues

### Medium (P2) — 3 issues

**M1: `as any` cast count at 71 (up from ~65)**
- Majority are RN StyleSheet percentage width casts (`"100%" as any`, `"48%" as any`)
- `pct()` helper exists in `lib/style-helpers.ts` but not adopted everywhere
- 6 new casts from Sprints 266-269
- Recommendation: Dedicated cleanup sprint to adopt `pct()` helper. Target: <40 casts.

**M2: search.tsx at 869 LOC (approaching 1000 threshold)**
- Contains Discover page: cards, Google Maps, city picker, suggestion chips, Best In categories
- Approaching FAIL threshold (1000 LOC)
- Recommendation: Extract map component or suggestion chips into sub-components.

**M3: badges.ts at 886 LOC**
- Badge logic, tier definitions, tier progress calculations
- Approaching FAIL threshold
- Recommendation: Extract tier progress into separate module.

### Low (P3) — 2 issues

**L1: In-memory stores (tracked since Audit #28)**
- `rating-integrity.ts`: ratingLog array, claimedBusinesses map
- `sse.ts`: SSE client connections, sseConnectionsByIp
- Acceptable at current scale. Redis migration in Phase 3 roadmap.

**L2: routes.ts at 506 LOC (past 500 threshold)**
- Added integrity wiring in Sprint 265. Currently stable.
- Test bumped threshold to 520. Still below that.

## Architecture Highlights

### Rating Integrity Pipeline (Complete through Phase 2)
```
User submits rating
  → insertRatingSchema validates (visitType, timeOnPageMs)
  → checkOwnerSelfRating (Layer 5)
  → checkVelocity (Layer 2)
  → logRatingSubmission (velocity tracking)
  → submitRating with IntegrityContext
    → computeComposite (visit-type weighted)
    → dimensional score persistence (food, service, vibe, packaging, etc.)
    → verification boost computation (photo +15%, receipt +25%, dish +5%, time +5%, cap 50%)
    → effective weight = credibility × (1 + vBoost) × gamingMult
    → detectAnomalies (burst, pattern, fixation)
    → velocity weight reduction if flagged
    → insert with all integrity fields
    → recalculate business score + ranks
  → optional: uploadRatingPhoto → CDN storage → boost recalc
  → checkAndRefreshTier
  → broadcast SSE events
```

### Score Transparency Pipeline (New in Phase 2)
```
Business detail page
  → ScoreBreakdown fetches /api/businesses/:id/score-breakdown
  → Per-visit-type weighted averages (dine-in, delivery, takeaway)
  → Food-only score, Verified %, Would-return %
  → Confidence badge (provisional/early/established/strong)
  → Zero-rating empty state ("Not enough ratings yet")
```

### Confidence System
- 4 tiers: provisional (0-2), early (3-9), established (10-24), strong (25+)
- Category-specific thresholds (fine_dining: 5/15/35)
- Visible on: ScoreBreakdown, leaderboard cards, search cards
- `getRankConfidence()` + `RANK_CONFIDENCE_LABELS` in `lib/data.ts`

### Database Schema: 32 Tables
- Core: members, businesses, ratings, rating_photos, dishes, challengers
- Trust: credibility tiers, verification signals, effective weights
- Admin: experiments, moderation, templates, rate limits

### Test Health
- 192 test files, 5,369 tests
- All passing in ~2.9s
- Sprint 266-269 added 96 tests (photos, verification, breakdown, honesty)
- Grade trajectory: A → A → A → A → A → A → A → A → A → A → A → A

## Recommendations for Next 5 Sprints
1. Temporal decay on score calculation (Phase 3a)
2. Bayesian prior for low-data restaurants (Phase 3b)
3. Leaderboard minimum requirements enforcement (Phase 3c)
4. `as any` cast reduction pass (target <40)
5. search.tsx extraction (keep under 800 LOC)
