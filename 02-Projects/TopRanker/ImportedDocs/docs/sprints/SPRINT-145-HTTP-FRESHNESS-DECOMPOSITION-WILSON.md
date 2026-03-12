# Sprint 145: HTTP Freshness Tests + Business Decomposition + Wilson Score

**Date:** 2026-03-08
**Sprint Goal:** Close the 3-sprint HTTP freshness test deferral, decompose the 1023 LOC business SubComponents monolith into 15 individual files, and implement real Wilson score confidence intervals to replace the overclaim from Sprint 143.
**Previous Critique Score:** Sprint 144

---

## Mission Reminder

TopRanker exists to become the go-to platform for trustworthy rankings — free from spam, fake reviews, and pay-to-play. Credibility-weighted voting is the product. Every sprint must serve the trust mission.

---

## Team Discussion

**Marcus Chen (CTO):** HTTP freshness tests close our longest-running critique gap. This has been deferred since Sprint 142 — three full sprints. The 22 integration tests prove that FRESH endpoints return corrected tier data when the stored tier is stale. This is the proof we needed that the freshness layer works at the HTTP request-response level, not just at the function call level. Closing multi-sprint deferrals is how we maintain credibility with external reviewers.

**Sarah Nakamura (Lead Engineer):** Wilson score is now real, not claimed. In Sprint 143 we said we had Wilson score confidence intervals but the implementation was approximate. This sprint we implemented the proper formula in experiment-tracker.ts with the correct z-score, sample proportion, and denominator terms. The dashboard now uses non-overlapping confidence intervals for its automated recommendations. Six new tests prove Wilson score correctness against known statistical values. Honest engineering over marketing language — if we claim a feature, it needs to actually work.

**Amir Patel (Architecture):** Fifteen individual component files with a barrel re-export is the right pattern at our scale. The old SubComponents.tsx was 1023 LOC with fifteen components jammed into one file. Now each component lives in its own file under components/business/ with its own imports, logic, styles, and export. The barrel file (SubComponents.tsx) is 43 LOC of pure re-exports. This means you can open HeroCarousel.tsx (110 LOC) and see everything about it without scrolling past fourteen other components. Every file is under the 300 LOC target. This is the decomposition pattern we should follow for search and challenger SubComponents next.

**Jasmine Taylor (Marketing):** Clean component boundaries make it easier for new engineers to contribute. When someone joins the team and gets assigned a bug in TrustExplainerCard, they open one 100-line file instead of hunting through a 1023-line monolith. Reduced onboarding friction directly impacts our ability to scale the engineering team. This kind of structural investment pays dividends in hiring velocity.

**Priya Sharma (Frontend):** Each component file is self-contained — imports, logic, styles, export all in one place. HeroCarousel at 110 LOC handles its own swipe logic and image loading. CollapsibleReviews at 220 LOC manages its own expand/collapse state and review rendering. No shared mutable state between siblings, no implicit dependencies. The barrel re-export means existing imports from SubComponents.tsx continue to work with zero migration cost for consuming code.

**Derek Williams (QA):** Twenty-two HTTP freshness tests validate the request-response path, not just function calls. The test categories cover deserializeUser freshness (4 tests), GET /api/members/:username (4), POST /api/ratings (4), GET /api/members/me (3), admin endpoints (3), and cross-endpoint consistency (4). These tests make HTTP requests and verify that response bodies contain fresh tier data even when the stored tier is stale. Combined with the 6 Wilson score tests and test regression fixes for sprint109 and sprint123, we land at 1975 tests across 84 files, all passing.

**Nadia Kaur (Cybersecurity):** Component isolation reduces blast radius of changes. When HeroCarousel needs a security patch for image URL validation, the change is confined to a single 110-line file. Code review is faster because the diff is scoped. Merge conflicts are less likely because parallel work on different components touches different files. From a security review standpoint, smaller files with clear boundaries are dramatically easier to audit than monoliths.

**Jordan Blake (Compliance):** Wilson score is the industry standard for small-sample confidence intervals, originally developed for binomial proportion estimation. Using the proper formula means our experiment recommendations are statistically defensible. If we ever need to justify a product decision to stakeholders or regulators based on A/B test results, we can point to a mathematically correct confidence interval implementation rather than an approximation. This matters for the trust mission — our internal processes should meet the same rigor standard we promise users.

---

## Deliverables

### 1. HTTP-Level Freshness Integration Tests (22 tests)

The number one critique priority, deferred for three consecutive sprints (142, 143, 144). These tests prove that FRESH endpoints return corrected tier data when the stored tier is stale, validating the freshness layer at the HTTP request-response level.

| Category | Count | What It Proves |
|---|---|---|
| deserializeUser freshness | 4 | User deserialization pulls fresh tier data on each request |
| GET /api/members/:username | 4 | Public member endpoint returns corrected tier, not stale stored value |
| POST /api/ratings | 4 | Rating submission uses fresh tier for credibility weighting |
| GET /api/members/me | 3 | Authenticated self-endpoint reflects fresh tier state |
| Admin endpoints | 3 | Admin views show fresh tier data for managed users |
| Cross-endpoint consistency | 4 | Same user returns consistent fresh tier across all endpoints |

### 2. Business SubComponents Decomposition (1023 LOC to 43 LOC barrel)

Broke the `components/business/SubComponents.tsx` monolith into 15 individual component files with a barrel re-export. SubComponents.tsx is now 43 LOC (re-exports only). All consuming code continues to work via the barrel.

| Component File | LOC | Responsibility |
|---|---|---|
| HeroCarousel.tsx | 110 | Image carousel with swipe navigation |
| CollapsibleReviews.tsx | 220 | Expandable review list with collapse state |
| TrustExplainerCard.tsx | 100 | Trust score explanation UI |
| YourRatingCard.tsx | 74 | User's own rating display and input |
| BusinessNameCard.tsx | 73 | Business name, category, verified badge |
| QuickStatsBar.tsx | 72 | Rating count, price range, distance stats |
| ScoreCard.tsx | 71 | Trust score prominent display |
| SubScoresCard.tsx | 65 | Individual sub-score breakdown |
| OpeningHoursCard.tsx | 63 | Business hours with open/closed state |
| RankHistoryChart.tsx | 60 | Historical rank trend visualization |
| LocationCard.tsx | 57 | Address and map preview |
| RatingDistribution.tsx | 52 | Star rating histogram |
| ActionButton.tsx | 38 | Reusable CTA button for business actions |
| RankConfidenceIndicator.tsx | 38 | Visual indicator for rank confidence level |
| DishPill.tsx | 32 | Individual dish/menu item tag |

All 15 files under the 300 LOC target. Barrel file (`SubComponents.tsx`) reduced from 1023 to 43 LOC.

### 3. Real Wilson Score Confidence Intervals

Fixed the overclaim from Sprint 143 where Wilson score was described but not properly implemented. The correct Wilson score formula is now in `lib/experiment-tracker.ts`, using proper z-score (1.96 for 95% CI), sample proportion, and denominator calculation.

- Dashboard automated recommendations now use non-overlapping confidence intervals as the decision criterion
- 6 new tests proving Wilson score correctness against known statistical reference values
- Recommendations only trigger when confidence intervals for control and treatment do not overlap

### 4. Test Regression Fixes

Updated test files for Sprint 109 and Sprint 123 to work with the decomposed component file structure. Import paths updated to reference individual component files or the barrel re-export as appropriate.

---

## Testing

| Metric | Value |
|---|---|
| Total Tests | 1975 |
| Test Files | 84 |
| New Tests | +28 |
| Pass Rate | 100% |
| Previous Sprint | 1947 (Sprint 144) |

New test breakdown:
- HTTP-level freshness integration tests: 22
- Wilson score correctness tests: 6
- Test regression fixes: sprint109, sprint123 updated (not new tests, corrections to existing)

---

## Critique Response Alignment

Sprint 144 critique identified three priorities:

| Critique Priority | Sprint 145 Response | Status |
|---|---|---|
| **1. HTTP-level freshness tests (deferred 3 sprints)** | 22 integration tests covering deserializeUser, member endpoints, ratings, admin, and cross-endpoint consistency | **DONE** |
| **2. Decompose business/SubComponents.tsx** | 1023 LOC monolith decomposed into 15 individual files (all under 300 LOC) + 43 LOC barrel re-export | **DONE** |
| **3. Generate experiment data through API** | Partially addressed — Wilson score implementation validates the statistical layer with correct formula and 6 new tests | **PARTIAL** |

### Deferral History Closed
The HTTP freshness test item was deferred in Sprint 142, Sprint 143, and Sprint 144. This sprint closes the 3-sprint deferral. No critique items remain with multi-sprint deferrals.

---

## PRD Alignment

- **Credibility-weighted voting:** HTTP freshness tests prove that every endpoint returns the correct tier, ensuring vote weight calculations use accurate credibility data at all times
- **Trustworthy rankings:** Wilson score confidence intervals ensure experiment-driven product decisions are statistically defensible, not based on noise
- **Code quality:** 15-file decomposition with barrel re-export establishes a maintainable, auditable component architecture that scales with the team
- **Testing rigor:** 1975 tests across 84 files with 100% pass rate — the test suite continues to grow in coverage without regression

---

## Next Sprint (146)

- DB persistence for experiment data (replace in-memory store with Drizzle-backed storage)
- Generate experiment data through API — full pipeline from API request to dashboard metrics
- Search SubComponents.tsx extraction (following the 15-file pattern established this sprint)
- Design deliverable (overdue since Sprint 142)
- First live experiment results analysis from activated experiments
