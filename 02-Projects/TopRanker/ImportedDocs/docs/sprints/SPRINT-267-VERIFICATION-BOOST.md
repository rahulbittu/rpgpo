# Sprint 267: Verification Boost Computation + Schema Migration (Phase 2b)

**Date:** March 9, 2026
**Story Points:** 10
**Focus:** Persist dimensional scores, verification signals, effective weight, and time-on-page in ratings table

## Mission
Complete the data model for Rating Integrity by adding all dimensional score columns, verification signal flags, and effective weight computation to the ratings table. Every rating now carries a full audit trail: what was the visit type, what were the dimensional scores, what verification signals were present, what was the effective weight.

## Team Discussion

**Sarah Nakamura (Lead Eng):** "This is the schema migration sprint. The ratings table went from 15 columns to 30. Every field from Rating Integrity Part 7 is now in the schema: visit_type, food/service/vibe/packaging/wait_time/value scores, composite_score, has_photo, has_receipt, dish_field_completed, verification_boost, effective_weight, gaming_multiplier, gaming_reason, time_on_page_ms."

**Amir Patel (Architecture):** "The dimensional scores are stored at the 1-10 scale from the score engine, not the 1-5 UI scale. This means the database matches the Rating Integrity doc's mathematical model exactly. The composite_score column stores the visit-type weighted result from computeComposite."

**Nadia Kaur (Cybersecurity):** "Verification boost is now computed at submission time from two signals: dish detail (+5%) and time plausibility (+5%). Photo (+15%) and receipt (+25%) boosts are added async when the photo uploads. The total is capped at 50%. The effective_weight column = credibility_weight * (1 + verification_boost) * gaming_multiplier — this is the exact formula from Part 6."

**Marcus Chen (CTO):** "Time-on-page tracking is end-to-end: the client records the timestamp when the rate screen opens, computes the delta on submit, sends it as timeOnPageMs. Server-side, ratings completed in under 10 seconds don't get the time plausibility boost. This is a soft signal — no penalty, just no bonus."

**Rachel Wei (CFO):** "The data model is now complete for trustworthy rankings. Every rating has a full provenance chain: who rated, how they experienced it, what verification they provided, how much weight it carries. This is what we tell investors: 'every number on our leaderboard is computed, not guessed.'"

## Changes

### Schema Migration — 15 new columns on ratings table
- **Visit type:** `visit_type` (dine_in/delivery/takeaway)
- **Dimensional scores:** `food_score`, `service_score`, `vibe_score`, `packaging_score`, `wait_time_score`, `value_score`
- **Composite:** `composite_score`
- **Verification signals:** `has_photo`, `has_receipt`, `dish_field_completed`
- **Boost:** `verification_boost` (0.000 to 0.500)
- **Weight:** `effective_weight` (credibility x boost x gaming)
- **Gaming:** `gaming_multiplier`, `gaming_reason`
- **Time tracking:** `time_on_page_ms`

### Storage — Full audit trail persistence
- `submitRating` now persists all dimensional scores, composite score, verification signals
- Verification boost computed from: dish detail (+5%), time plausibility (+5%)
- Effective weight = baseWeight * (1 + boost) * gamingMultiplier
- Time-on-page plausibility threshold: 10+ seconds

### Client — Time-on-page tracking
- `app/rate/[id].tsx`: Records `pageEnteredAt` timestamp on mount
- `useRatingSubmit`: Sends `timeOnPageMs` = current time - page entry time
- `insertRatingSchema`: Validates timeOnPageMs (0 to 3,600,000ms)

### Photo Upload — Proper verification boost update
- `routes-rating-photos.ts`: Updates `hasPhoto`, `hasReceipt`, `verificationBoost` on rating record
- Boost accumulates: dish (+5%) + time (+5%) + photo (+15%) + receipt (+25%) = up to 50%

### Tests
- **38 new tests** in `tests/sprint267-verification-boost.test.ts`
- Schema columns, storage persistence, verification computation, time tracking, effective weight

## Test Results
- **190 test files, 5,333 tests, all passing** (~2.8s)
- +38 new tests from Sprint 267
- 0 regressions
