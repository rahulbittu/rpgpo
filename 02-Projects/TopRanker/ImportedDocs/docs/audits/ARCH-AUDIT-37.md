# Architectural Audit #37 — Sprint 275
**Date:** March 9, 2026
**Auditor:** Amir Patel (Architecture Lead)
**Grade: A** (13th consecutive A-range)

## Scorecard

| Category | Grade | Notes |
|----------|-------|-------|
| Code Organization | A | Score engine shared, eligibility computed at write time |
| Test Coverage | A+ | 5,436 tests across 196 files, 100% passing |
| Security | A | Anti-gaming pipeline complete, photo validation, owner block |
| Performance | A- | In-memory stores acceptable, Bayesian prior is O(n) per business |
| Type Safety | B | 71 `as any` casts — stable but needs cleanup |
| Documentation | A | Sprint docs 265-274, retros current, governing docs up to date |

## Findings

### Critical (P0) — 0 issues

### High (P1) — 0 issues

### Medium (P2) — 3 issues (unchanged from Audit #36)

**M1: `as any` cast count at 71**
- Stable from Sprint 270. No regression this block.
- `pct()` helper adoption stalled.
- Recommendation: Dedicated cleanup sprint. Target: <40.

**M2: search.tsx at 869 LOC**
- Unchanged. Approaching 1000 FAIL threshold.
- Recommendation: Extract map or suggestion chip components.

**M3: badges.ts at 886 LOC**
- Unchanged. Approaching 1000 FAIL threshold.
- Recommendation: Extract tier progress module.

### Low (P3) — 2 issues (unchanged)

**L1: In-memory stores**
- Velocity detection, SSE connections, claimed businesses.
- Redis migration partial (Sprint 259). Remaining stores acceptable at current scale.

**L2: routes.ts at 506 LOC**
- Stable since Sprint 265. Below 520 threshold.

## Architecture Highlights

### Complete Rating Pipeline (Phase 1-3)
```
User submits rating
  → Visit type selection (Phase 1a)
  → Dimension gating (food/service/vibe for dine-in, food/packaging/value for delivery, etc.)
  → insertRatingSchema validates (visitType, timeOnPageMs)
  → checkOwnerSelfRating (Layer 5)
  → checkVelocity (Layer 2)
  → logRatingSubmission (velocity tracking)
  → submitRating with IntegrityContext
    → computeComposite (visit-type weighted) — Phase 1b
    → Dimensional score persistence — Phase 2b
    → Verification boost (photo +15%, receipt +25%, dish +5%, time +5%, cap 50%) — Phase 2b
    → effectiveWeight = credibility × (1 + vBoost) × gamingMult — Phase 2b
    → detectAnomalies (burst, pattern, fixation)
    → Velocity weight reduction (0.05x) if flagged
    → Insert with all integrity fields
    → recalculateBusinessScore:
      → Read compositeScore + effectiveWeight (or fallback to legacy)
      → Exponential temporal decay: e^(-0.003 × days) — Phase 3a
      → Bayesian prior: (W×R + 3×6.5) / (W + 3) — Phase 3b
      → Track dineInCount, credibilityWeightedSum — Phase 3c
      → Compute leaderboardEligible (3+ raters, 1+ dine-in, sum ≥ 0.5) — Phase 3c
    → recalculateRanks (eligible businesses only)
  → Optional: uploadRatingPhoto → CDN → boost recalc
  → checkAndRefreshTier
  → Broadcast SSE events
```

### Score Transparency
```
Business detail page
  → ScoreBreakdown: per-visit-type scores with temporal decay
  → Confidence badge: provisional/early/established/strong
  → Zero-rating empty state: "Be one of the first to rate"
```

### Rate Flow UX
```
Step 0: Visit type selection (dine-in/delivery/takeaway)
Step 1: Dimensional scoring with live composite preview
Step 2: Extras (dish, photo, note) with skip option
Submit: Success haptic + confetti + tier progress
Error: Retry button + dismiss
```

### Test Health
- 196 test files, 5,436 tests
- All passing in ~2.8s
- Sprints 271-274 added 67 tests
- Grade trajectory: A → A → A → A → A → A → A → A → A → A → A → A → A

## Recommendations for Next 5 Sprints
1. Score trend sparkline (visual history on business page)
2. Dish leaderboard enrichment (top dishes per restaurant)
3. Rating validation hardening (input sanitization edge cases)
4. `as any` cast reduction (target <40)
5. search.tsx/badges.ts extraction (keep under 800 LOC)
