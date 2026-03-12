# Sprint 273: Leaderboard Minimum Requirements Enforcement (Rating Integrity Phase 3c)

**Date:** March 9, 2026
**Story Points:** 5
**Focus:** Enforce leaderboard minimum requirements: 3+ raters, 1+ dine-in, credibility-weighted sum >= 0.5

## Mission
Rating Integrity Part 6 Step 7: "A restaurant does not appear on the leaderboard until it has at least 3 unique raters, at least 1 dine-in rating, and credibility-weighted sum >= 0.5." Sprint 273 adds the tracking columns, computes eligibility at rating time, and filters the leaderboard query.

## Team Discussion

**Marcus Chen (CTO):** "This is the final gate for leaderboard quality. A restaurant with 1 rating from a community-tier user cannot appear in rankings. It needs breadth (3 raters), depth (at least 1 in-person dine-in), and weight (combined credibility >= 0.5). These are the minimum standards for a trustworthy ranking."

**Sarah Nakamura (Lead Eng):** "Three new columns on businesses: `dineInCount`, `credibilityWeightedSum`, and `leaderboardEligible`. These are computed in `recalculateBusinessScore` alongside the score itself. The leaderboard query and rank calculation both filter by `leaderboardEligible = true`. Ineligible businesses still appear in search but not in ranked lists."

**Amir Patel (Architecture):** "The `meetsLeaderboardThreshold` function in the score engine has had this logic since Sprint 262. Sprint 273 wires it into the actual database layer. Now the score engine's threshold check is enforced at the storage level, not just available as a utility."

**Nadia Kaur (Cybersecurity):** "The credibility-weighted sum threshold of 0.5 is specifically anti-gaming. Three community-tier users (0.10x each) with gaming flags (0.50x) only sum to 0.15 — below the 0.5 threshold. You need at least one city-tier or higher rater, or multiple community users with clean records, to make the leaderboard."

**Jordan Blake (Compliance):** "Eligibility criteria are transparent and rule-based. No human discretion involved. This is the kind of system that holds up under regulatory scrutiny — clear rules, computed automatically, same for every business."

## Changes

### Schema
- **`shared/schema.ts`**:
  - `dineInCount` (integer, default 0) — number of dine-in ratings
  - `credibilityWeightedSum` (numeric 8,4, default 0) — sum of effective weights across all ratings
  - `leaderboardEligible` (boolean, default false) — computed eligibility flag

### Server — Business Score Recalculation
- **`server/storage/businesses.ts`**:
  - `recalculateBusinessScore` now reads `visitType` column
  - Tracks `dineInCount` and `credibilityWeightedSum` during rating loop
  - Computes `eligible = totalRatings >= 3 && dineInCount >= 1 && credibilityWeightedSum >= 0.5`
  - Persists all three fields on business record
  - Zero-rating case sets `leaderboardEligible: false`

### Server — Leaderboard Query
- **`server/storage/businesses.ts`**:
  - `getLeaderboard` adds `eq(businesses.leaderboardEligible, true)` to WHERE clause
  - `recalculateRanks` adds `AND leaderboard_eligible = true` to ranking SQL

### Tests
- **17 new tests** in `tests/sprint273-leaderboard-eligibility.test.ts`
- Schema tests: column existence for all 3 new fields
- Server tests: dineInCount tracking, credibility sum, eligibility computation, persistence, leaderboard filter, rank filter, zero-rating case
- Score engine tests: meetsLeaderboardThreshold rejection reasons, acceptance criteria, mixed visit types

## Test Results
- **195 test files, 5,423 tests, all passing** (~2.8s)
- +17 new tests from Sprint 273
- 0 regressions

## Leaderboard Eligibility Rules (Rating Integrity Part 6 Step 7)
```
A business appears on the leaderboard when ALL of:
  1. totalRatings >= 3 (minimum sample size)
  2. dineInCount >= 1 (at least one in-person visit)
  3. credibilityWeightedSum >= 0.5 (sufficient rater quality)

Ineligible businesses:
  - Still appear in search results
  - Still have scores computed (for when they become eligible)
  - Do NOT appear in ranked leaderboard
  - Do NOT receive rank positions
```
