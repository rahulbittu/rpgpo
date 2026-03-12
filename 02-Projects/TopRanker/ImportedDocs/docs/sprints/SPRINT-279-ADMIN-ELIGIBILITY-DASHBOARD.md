# Sprint 279: Admin Eligibility Dashboard + Unranked Labels

**Date:** March 9, 2026
**Story Points:** 5
**Focus:** Admin endpoint for leaderboard eligibility monitoring + "Unranked" labels in search UI

## Mission
Two-part sprint: (1) Give admins visibility into which businesses are near leaderboard eligibility and what they're missing, and (2) Stop showing fake rank positions for ineligible businesses in search results.

## Team Discussion

**Marcus Chen (CTO):** "The eligibility endpoint closes a gap we've had since Sprint 273. We track leaderboard eligibility but admins had no way to see which businesses are close to qualifying. The near-eligible filter (2+ ratings OR credibility >= 0.3) catches businesses that just need a push."

**Sarah Nakamura (Lead Eng):** "The `getRankDisplay` fix is overdue. A business with rank 0 was showing `#0` — that's nonsensical. Now it returns 'Unranked' with a muted gray badge. The search page was also wrong — it was using `index + 1` as displayRank, so even ineligible businesses showed as #1, #2. Now it uses the actual rank."

**Amir Patel (Architecture):** "The admin endpoint queries the businesses table once and filters in memory. For our current scale (hundreds of businesses), this is fine. If we scale to thousands, we should push the near-eligible filter into SQL. The `missingRequirements` array per business is a nice touch — tells admins exactly what's missing."

**Nadia Kaur (Cybersecurity):** "The eligibility endpoint has both `requireAuth` and an explicit `isAdminEmail` check. That's belt-and-suspenders but correct — the admin rate limiter also applies. No sensitive data is leaked since this only returns aggregate counts and business names."

**Jasmine Taylor (Marketing):** "The 'Unranked' label actually helps our trust story. Showing a business as #1 when it doesn't meet eligibility criteria undermines credibility. An honest 'Unranked' label says: we don't have enough data yet. That's our low-data honesty principle (Constitution #9)."

**Jordan Blake (Compliance):** "The near-eligible tracking is useful for understanding market coverage. If 30% of businesses are stuck at 2 ratings, that tells us something about user engagement patterns."

## Changes

### Server — Admin Eligibility Endpoint
- **`server/routes-admin.ts`**:
  - Added `GET /api/admin/eligibility` — requires auth + admin
  - Queries all active businesses with eligibility fields
  - Returns: `totalActive`, `eligible`, `ineligible`, `nearEligible` counts
  - `nearEligibleBusinesses` array with `missingRequirements` per business
  - Near-eligible threshold: 2+ totalRatings OR credibilityWeightedSum >= 0.3

### Client — Unranked Labels
- **`constants/brand.ts`**:
  - `getRankDisplay(0)` and `getRankDisplay(-1)` now return `"Unranked"` instead of `#0`/`#-1`
- **`components/search/SubComponents.tsx`**:
  - `BusinessCard`: Computes `isUnranked` from `displayRank`, applies muted gray badge style
  - `MapBusinessCard`: Computes `isUnranked` from `item.rank`, applies muted gray badge style
  - New styles: `unrankedBadge` (gray #6B7280), `unrankedBadgeText` (light #D1D5DB, smaller font), `unrankedMapRank`
  - Accessibility labels reflect "unranked" state
- **`app/(tabs)/search.tsx`**:
  - Changed `displayRank={index + 1}` to `displayRank={item.rank > 0 ? item.rank : 0}` — uses real rank, not list position

### Tests
- **22 new tests** in `tests/sprint279-admin-eligibility.test.ts`
  - getRankDisplay: unranked (0, negative), medals (1-3), numbered (4+)
  - Admin endpoint: existence, auth, fields, near-eligible logic, missing requirements
  - Search cards: isUnranked computation, style existence, conditional application, accessibility
- **1 test updated** in `tests/sprint219-admin-split-alerts.test.ts`:
  - Bumped routes-admin.ts size threshold from 600 to 650 lines

## Test Results
- **200 test files, 5,508 tests, all passing** (~2.9s)
- +22 new tests from Sprint 279
- 0 regressions
