# Sprint 130: Per-Category Confidence Calibration
**Date:** March 8, 2026
**Sprint Goal:** Make ranking confidence thresholds category-aware so niche categories require more data before their rankings are considered well-calibrated.

---

## Team Discussion

**Marcus Chen (CTO):** "This is a meaningful step for trust. A fast food spot with 20 ratings has a fundamentally different signal quality than a fine dining place with 20. If we treat them the same, we're lying to users about how confident we are. I'm glad we're encoding that distinction now. Long term, I want to see this feed into how we display confidence badges on the frontend — muted styling for low-confidence rankings, bold for high."

**Amir Patel (Architecture):** "I designed the threshold map as a simple constant for now — three tiers: high-volume, standard, and niche. The key architectural decision is that `getRankConfidence` accepts an optional `category` parameter, which means every existing caller keeps working unchanged. Next iteration, I want this map to be admin-configurable via a settings endpoint. The shape is already right for that — we just swap the constant for a DB lookup with an in-memory cache."

**Liam O'Brien (Backend Engineer):** "The optional parameter pattern was the right call. I checked every call site — there are exactly two in the frontend and one in the leaderboard subcomponents. All three now pass category. The fallback to `DEFAULT_THRESHOLDS` when category is undefined or unrecognized means we have zero risk of regression. Clean diff, no surprises."

**Sarah Nakamura (Lead Engineer):** "Five new tests cover the full matrix: default thresholds with no category, a high-volume category like fast_food, a niche category like fine_dining, an unknown category string falling back to defaults, and a mid-range case with brewery. Every tier boundary is exercised. Test count is at 1230, all green, under 800ms."

**Priya Sharma (Mobile Engineer):** "I verified both call sites in `app/business/[id].tsx` and the one in `SubComponents.tsx`. Each now passes `item.category` or `business.category` respectively. The confidence badge renders correctly across all three tiers — I spot-checked fast_food, fine_dining, and a standard restaurant in the simulator. No layout shifts or visual regressions."

**Nadia Kaur (Cybersecurity):** "I reviewed this for gaming vectors. The thresholds are entirely server-defined constants — no user input touches the threshold selection. A user cannot manipulate their category assignment to lower the confidence bar. When we move to admin-configurable thresholds, we will need role-based access control on that endpoint, but for now the attack surface is unchanged."

---

## Changes

### lib/data.ts
- Added `CATEGORY_CONFIDENCE_THRESHOLDS` map with three tiers:
  - **High-volume** (`fast_food`, `casual_dining`, `buffet`) — lower rating count thresholds for confidence since these categories accumulate reviews quickly
  - **Standard** (`restaurant`, `cafe`, `brunch`, `bar`) — default thresholds, unchanged from previous behavior
  - **Niche** (`fine_dining`, `brewery`, `dessert_bar`, `food_hall`) — higher thresholds requiring more ratings before confidence is established
- Updated `getRankConfidence(totalRatings, category?)` to accept an optional `category` parameter
- Backwards-compatible: callers without a category argument use `DEFAULT_THRESHOLDS` (identical to prior behavior)

### components/leaderboard/SubComponents.tsx
- `RankedCard` now passes `item.category` to `getRankConfidence()` so leaderboard confidence badges reflect category-specific thresholds

### app/business/[id].tsx
- Both `getRankConfidence()` calls now receive `business.category`, ensuring the business detail page shows category-aware confidence

### tests/credibility.test.ts
- 5 new tests for category-aware confidence:
  1. Default thresholds when no category is provided
  2. High-volume category thresholds (`fast_food`) — lower bar
  3. Niche category thresholds (`fine_dining`) — higher bar
  4. Unknown category string falls back to default thresholds
  5. Mid-range category (`brewery`) — niche tier thresholds

---

## Technical Decisions

| Decision | Rationale |
|---|---|
| Optional `category` parameter | Backward compatibility — zero changes required at existing call sites that don't have category context |
| 3-tier threshold system | Balances granularity with maintainability; avoids per-category magic numbers |
| Unknown categories fall back to defaults | Defensive coding — new categories added later won't break confidence calculations |
| Server-defined constants (not user-facing) | No gaming vector — users cannot influence which threshold tier applies to a business |

---

## Testing
- **1230 tests** passing across all test files (up from 1225)
- **5 new tests** covering all threshold tiers and edge cases
- **0 new TypeScript errors**
- All tests complete in under 800ms

---

## PRD Alignment
- Directly serves the core trust mission: confidence signals must be accurate per category
- Credibility-weighted voting becomes more meaningful when the confidence baseline is calibrated to category norms
- Future work: admin-configurable thresholds, confidence badge styling differentiation on frontend
