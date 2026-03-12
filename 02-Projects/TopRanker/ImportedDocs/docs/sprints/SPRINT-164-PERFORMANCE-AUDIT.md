# Sprint 164: Performance Audit — N+1 Fixes, Missing Indexes, Query Optimization

**Date:** 2026-03-09
**Story Points:** 8
**Focus:** Fix 3 critical performance issues found in architecture audit

---

## Mission Alignment
Slow API responses erode trust. If the leaderboard takes 2 seconds because of N+1 queries, users leave before seeing the rankings. Performance IS product quality.

---

## Team Discussion

**Amir Patel (Architecture):** "The featured placements endpoint was making N+1 queries — one `getBusinessById` + one `getBusinessPhotosMap` per placement. With 10 placements, that's 20 sequential queries. Now it's 2: one batch business lookup, one batch photo lookup. O(N) → O(1) database round trips."

**Sarah Nakamura (Lead Eng):** "The `detectAnomalies` function was fetching ALL member ratings twice — once for perfect-score detection, once for one-star-bomber. Combined them into a single COUNT with FILTER clauses. Same logic, one query instead of two."

**Marcus Chen (CTO):** "The `businessPhotos` table had NO index on `businessId`. Every photo lookup was a full table scan. Added `idx_biz_photos_business` on (businessId, sortOrder). Same for `credibilityPenalties` — added `idx_penalties_member` on memberId."

**Nadia Kaur (Cybersecurity):** "The FILTER-based anomaly detection is actually more precise — it counts in SQL rather than fetching rows and filtering in JS. Less data over the wire, less memory pressure."

**Rachel Wei (CFO):** "If featured placements are our $49/mo revenue product, response time directly affects conversion. Dropping from 20 queries to 2 is the kind of optimization that pays for itself."

---

## Changes

### Missing Indexes Added
- **File:** `shared/schema.ts`
- `idx_biz_photos_business` on businessPhotos(businessId, sortOrder) — fixes full table scans
- `idx_penalties_member` on credibilityPenalties(memberId) — fixes penalty lookup scans

### Featured Placements N+1 → Batch (CRITICAL)
- **File:** `server/routes.ts:401-425`
- Old: `Promise.all(placements.map(p => getBusinessById(p.businessId)))` — N queries
- New: `getBusinessesByIds(bizIds)` + `getBusinessPhotosMap(bizIds)` — 2 queries total
- Added `getBusinessesByIds()` batch function to `server/storage/businesses.ts`

### detectAnomalies Query Optimization (CRITICAL)
- **File:** `server/storage/ratings.ts:32-48`
- Old: 2 separate `SELECT rawScore` queries, each unbounded (fetching ALL ratings)
- New: 1 `SELECT COUNT(*) FILTER (WHERE ...)` query — counts in SQL, returns 3 numbers
- Preserves all 6 anomaly flag types

---

## Test Results
- **2220 tests** across 99 files — all passing, 1.65s
- 21 new tests covering: indexes, batch queries, N+1 elimination, anomaly flag preservation

---

## Performance Impact
| Endpoint | Before | After | Improvement |
|----------|--------|-------|-------------|
| GET /api/featured | 2+N queries per request | 2 queries | O(N) → O(1) round trips |
| POST /api/ratings (anomaly check) | 2 unbounded SELECT queries | 1 COUNT query | 50% fewer queries, no row transfer |
| Any businessPhotos lookup | Full table scan | Index scan | Orders of magnitude faster at scale |
| Penalty lookups | Full table scan | Index scan | Faster credibility recalculation |
