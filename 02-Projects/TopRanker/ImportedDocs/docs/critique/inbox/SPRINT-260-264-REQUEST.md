# External Critique Request — Sprints 260-264

Date: 2026-03-09
Requesting: External review of 5-sprint block (260-264)

## Sprint Summaries

### Sprint 260: SLT Mid-Year + Arch Audit #34
- Points: 3
- SLT-260 meeting: Mid-year review, Memphis/Nashville expansion assessment
- Arch Audit #34: A- (downgraded from A+ due to anti-requirement violations and rating integrity gaps)
- 2 High findings: anti-requirement violations, missing visit type separation
- Roadmap 261-265 established for Rating Integrity Phase 1

### Sprint 261: Visit Type Selection in Rating Flow (Phase 1a)
- Points: 5
- Visit type picker (dine-in, delivery, takeaway) in rating flow UI
- Dimensional score gating: different questions based on visit type
- Visit type stored on rating record
- 28 new tests

### Sprint 262: Score Calculation Engine (Phase 1b)
- Points: 8
- `shared/score-engine.ts`: Pure functions for composite score calculation
- Visit-type weighted averages: dine-in (50/25/25), delivery (60/25/15), takeaway (65/20/15)
- `computeComposite`, `computeEffectiveWeight`, `computeDecayFactor` exports
- Shared between client preview and server computation
- 35 new tests

### Sprint 263: Rating Integrity Checks (Phase 1c)
- Points: 8
- `server/rating-integrity.ts`: Owner self-rating block, velocity detection, submission logging
- Owner block checks business claim records
- Velocity detection: 3 per business/24h, 10 per IP/hour, same business/IP combo
- Weight reduction (0.05x) instead of deletion for flagged ratings
- 30 new tests

### Sprint 264: Best In Wiring
- Points: 5
- Best In category display integrated with city context
- Category chips in Rankings tab
- Category cards in Discover tab
- 22 new tests

## Test Count Progression

| Sprint | Total Tests | Test Files | Delta |
|--------|------------|------------|-------|
| 260 | 5,170 | 185 | +0 (process sprint) |
| 261 | 5,198 | 186 | +28 |
| 262 | 5,233 | 187 | +35 |
| 263 | 5,263 | 188 | +30 |
| 264 | 5,273 | 188 | +22 (test added to existing file) |
| **Total** | **5,273** | **188** | **+115** |

## Key Modules Added (Sprints 260-264)

- `shared/score-engine.ts` — Pure computation: composite scores, effective weight, decay factor
- `server/rating-integrity.ts` — Owner block, velocity detection, submission logging
- `components/rate/VisitTypePicker.tsx` — Dine-in/Delivery/Takeaway selection UI

## Known Contradictions / Risks

1. **Audit downgrade to A-:** First downgrade in 10 sprints. Caused by anti-requirement violations (carried) and rating integrity not yet being live. The A- was intentional — acknowledging that architecture docs said one thing while code did another.

2. **Score engine is pure but untested at scale:** The score engine computes weighted averages but has only been tested with synthetic data. No production data validation. The formulas match the Rating Integrity doc but haven't been stress-tested with adversarial inputs.

3. **Owner block relies on claimed businesses:** If a business is not yet claimed, the owner block has no effect. An owner could rate their own business before claiming it, then claim it later. The velocity detection partially mitigates this but doesn't specifically target pre-claim self-rating.

## Questions for External Reviewer

1. **Score engine validation:** The composite score formula uses fixed weights (dine-in: food 0.50, service 0.25, vibe 0.25). These weights are from the Rating Integrity doc but are not empirically derived. How do ranking platforms typically validate scoring weights? Should we implement A/B testing for weight configurations, or is expert-determined weighting acceptable for V1?

2. **Owner block pre-claim gap:** An owner can rate their own business before claiming it. Should we implement retroactive owner-rating flagging at claim time (scan existing ratings when a business is claimed)? What is the expected volume of this edge case?

3. **Velocity detection thresholds:** 3 ratings per business per 24h, 10 per IP per hour. These are conservative defaults. Should thresholds be adaptive based on category popularity (e.g., higher thresholds for fast casual vs fine dining)? What threshold ranges do other platforms use?

4. **Phase 1 completeness:** Rating Integrity Phase 1 covers visit type, score engine, and integrity checks. Phase 2 adds photo verification and score breakdown. Is there a gap between Phase 1 and Phase 2 where the system is partially trustworthy? Should all phases ship together, or is incremental rollout acceptable?
