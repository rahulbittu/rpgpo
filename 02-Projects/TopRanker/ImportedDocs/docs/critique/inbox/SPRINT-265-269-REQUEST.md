# External Critique Request — Sprints 265-269

Date: 2026-03-09
Requesting: External review of 5-sprint block (265-269)

## Sprint Summaries

### Sprint 265: Integrity Checks Wired into POST /api/ratings (Phase 1e)
- Points: 8
- Wired `checkOwnerSelfRating`, `checkVelocity`, `logRatingSubmission` into actual POST /api/ratings endpoint
- `IntegrityContext` passed to `submitRating` with velocity flag data
- `computeComposite` from score engine replaces naive average
- Velocity-flagged ratings reduced to 0.05x weight (never deleted)
- Arch Audit #35: Grade A (11th consecutive A-range)
- SLT-265 meeting: Phase 1 completion assessment, roadmap 266-270
- 21 new tests

### Sprint 266: Rating Photos + CDN Storage (Phase 2a)
- Points: 8
- `rating_photos` table in schema (id, ratingId, photoUrl, cdnKey, isVerifiedReceipt, uploadedAt)
- POST /api/ratings/:id/photo — validates MIME, size, stores to CDN
- Client-side `uploadRatingPhoto` helper with base64 conversion
- Photo URI passed through rating flow
- "+15% verification boost" UI hint on photo button
- 22 new tests

### Sprint 267: Verification Boost + Effective Weight (Phase 2b)
- Points: 8
- 15 new columns on ratings table: dimensional scores, verification signals, effective weight, gaming fields
- Verification boost: photo +15%, receipt +25%, dish detail +5%, time plausibility +5%, capped at 50%
- Effective weight: credibility × (1 + verificationBoost) × gamingMultiplier
- Time plausibility check: ≥10 seconds on page
- Dimensional scores persisted per rating
- 38 new tests

### Sprint 268: Score Breakdown API + Visit-Type Display (Phase 2c)
- Points: 7
- GET /api/businesses/:id/score-breakdown
- Returns: totalRatings, overallScore, foodScoreOnly, per-visit-type breakdowns, verifiedPercentage, wouldReturnPercentage, raterDistribution
- ScoreBreakdown component on business detail page
- Visit type rows with icons (restaurant/bicycle/bag)
- Stats row: Food Only score, Verified %, Return %
- 16 new tests

### Sprint 269: Low-Data Honesty — Confidence Badges (Phase 2d)
- Points: 5
- 4-tier confidence system: provisional (0-2), early (3-9), established (10-24), strong (25+)
- Category-specific thresholds (fine_dining: 5/15/35)
- ScoreBreakdown: confidence badge for non-strong, zero-rating empty state
- Leaderboard cards: hourglass for provisional/early, shield for established/strong
- Search cards: confidence indicators
- Business page passes category prop to ScoreBreakdown
- 20 new tests

## Test Count Progression

| Sprint | Total Tests | Test Files | Delta |
|--------|------------|------------|-------|
| 265 | 5,273 | 188 | +21 |
| 266 | 5,295 | 189 | +22 |
| 267 | 5,333 | 190 | +38 |
| 268 | 5,349 | 191 | +16 |
| 269 | 5,369 | 192 | +20 |
| **Total** | **5,369** | **192** | **+96** (from start of block) |

## Key Modules Added/Modified (Sprints 265-269)

- `server/routes.ts` — Integrity wiring: owner block, velocity check, score engine integration
- `server/storage/ratings.ts` — IntegrityContext, dimensional scores, verification boost, effective weight
- `server/routes-rating-photos.ts` (new) — Photo upload, CDN storage, verification boost trigger
- `server/routes-score-breakdown.ts` (new) — Per-visit-type weighted average API
- `shared/schema.ts` — rating_photos table, 15 new columns on ratings
- `components/business/ScoreBreakdown.tsx` (new) — Breakdown card with confidence badges
- `components/rate/RatingExtrasStep.tsx` — Photo boost hint UI
- `lib/hooks/useRatingSubmit.ts` — Photo upload, timeOnPageMs tracking
- `app/rate/[id].tsx` — pageEnteredAt timestamp, timeOnPageMs passing
- `app/business/[id].tsx` — ScoreBreakdown integration with category prop

## Arch Audit #36 Summary (Sprint 270)

- Grade: A (12th consecutive A-range)
- 0 Critical, 0 High
- 3 Medium: `as any` at 71, search.tsx at 869 LOC, badges.ts at 886 LOC
- 2 Low: In-memory stores (known), routes.ts at 506 LOC
- Rating Integrity pipeline end-to-end complete through Phase 2

## Known Contradictions / Risks

1. **Effective weight formula complexity:** `credibility × (1 + verificationBoost) × gamingMultiplier` has three multiplicative factors. A high-credibility user (top tier = 1.0x) with full verification (+50%) and no gaming flag (1.0x) gets effective weight 1.5. A community tier user (0.10x) with no verification (0%) and velocity-flagged (0.05x) gets 0.005. The 300x ratio between max and min effective weight is large. Is this range appropriate, or could it create invisible suppression of legitimate low-tier users?

2. **Verification boost gaming:** Photo verification gives +15% boost but the current implementation doesn't verify photo authenticity — it only checks MIME type and file size. A user could upload any food photo from Google Images. Receipt verification (+25%) has the same issue. Without AI-based image analysis, the boost rewards upload behavior, not actual verification.

3. **Score breakdown performance:** The score-breakdown endpoint runs an aggregation query across all non-flagged ratings for a business. For popular restaurants with hundreds of ratings, this could be slow. No caching strategy exists. Pre-computed snapshots or query-level caching should be considered before marketing drives traffic.

4. **Category-specific confidence thresholds are hardcoded:** `CATEGORY_CONFIDENCE_THRESHOLDS` maps category names to threshold numbers. Adding new categories requires a code change. Should this be admin-configurable or data-driven?

5. **`as any` cast regression:** 71 casts, up from ~65. The `pct()` helper exists but adoption is slow. At this trajectory, the codebase will cross 100 casts within 20 sprints.

## Questions for External Reviewer

1. **Effective weight 300x ratio:** The gap between maximum effective weight (1.5) and minimum (0.005) is 300x. In practice, this means a velocity-flagged community user's rating counts 300x less than a verified top-tier user's. Is this ratio defensible, or should there be a floor on effective weight to prevent complete suppression? How do platforms like Reddit (karma weighting) or Stack Overflow (reputation scoring) handle weight ratios?

2. **Photo verification without AI:** The +15% photo boost rewards uploading any image, not verified proof of visit. Is this acceptable for V1, or does it create a perverse incentive (upload stock photos for boost)? At what user scale does AI-based photo verification become necessary? What open-source or API options exist for food photo verification (e.g., Google Vision, AWS Rekognition)?

3. **Low-data honesty UX:** The confidence badge system shows "Provisional" for restaurants with 0-2 ratings. User research at other platforms suggests that showing ANY score for <5 ratings can be misleading regardless of badge. Should we suppress scores entirely below a threshold, or is the badge sufficient? What is the industry standard?

4. **Score breakdown query performance:** The aggregation query runs at read time with no caching. What's the expected query cost at 100, 500, and 1,000 ratings per business? Should we pre-compute and cache breakdowns at write time (eventual consistency) or query at read time with in-memory caching?

5. **Schema growth trajectory:** 15 new columns added to ratings table in Sprint 267. The table now has ~25+ columns. At what point should we consider a ratings_metadata or ratings_integrity companion table to keep the primary ratings table lean? What is the PostgreSQL performance impact of wide tables for scan-heavy aggregation queries?
