# Sprint 88 — Business Claims API, Real Dashboard, Admin Route Extraction

**Date:** 2026-03-08
**Duration:** 1 session
**Story Points:** 13
**Theme:** Close P0 launch blockers — working claim flow, real analytics, cleaner architecture

---

## Mission Alignment

Business owners claiming their listings is the gateway to our B2B revenue (Dashboard Pro $49/mo, Challenger $99). Without a working claim API, this entire revenue stream is blocked. The dashboard showing mock data instead of real analytics undermines trust with verified owners. And routes.ts at 800+ LOC was becoming a maintenance hazard.

---

## Team Discussion

**Marcus Chen (Backend Lead):** "The claim endpoint follows our existing storage pattern — `submitClaim` inserts into `businessClaims` with the member ID and verification method. The duplicate check via `getClaimByMemberAndBusiness` prevents spam. Clean API: POST slug/claim → returns claim ID + pending status."

**Priya Sharma (Architect):** "The admin route extraction was overdue. We went from 800+ LOC in routes.ts to ~550 by moving 14 admin endpoints to `routes-admin.ts`. Added a proper `requireAdmin` middleware so every admin route doesn't repeat the `isAdminEmail` check inline. DRY at the infrastructure level."

**Kai Nakamura (Frontend Lead):** "The dashboard now uses React Query to fetch from `/api/businesses/:slug/dashboard`. No more `MOCK_ANALYTICS`. The chart, stats, insights — all driven by real data. The `timeAgo` formatter converts ISO timestamps to human-readable relative times. If a business has zero data, everything degrades gracefully."

**Sarah Nakamura (QA Lead):** "18 new tests covering claim validation (role required, length limits, phone type), endpoint contracts (401/404/409 responses), dashboard data shape, and the timeAgo formatter. We're at 283 tests now, still under 500ms."

**Sage (Backend Engineer):** "I like that the claim endpoint checks for existing claims and returns 409 instead of silently creating duplicates. The verification method stores role + phone as a compound string — simple, auditable, no extra columns needed."

**Jordan Blake (Compliance):** "The claim process is now properly tracked in the DB with timestamps, status lifecycle (pending → approved/rejected), and the reviewing admin's ID. Full audit trail for business ownership verification."

**Rachel Wei (CFO):** "This unblocks the $49/mo Dashboard Pro upsell. The dashboard now shows real value — ratings, rank trends, top dishes, return rate. Owners can see exactly what they're getting. Next step: wire the Pro upgrade to Stripe."

---

## Changes

### 1. Business Claim API
- **`POST /api/businesses/:slug/claim`** — new endpoint
  - Requires auth, validates role field
  - Checks for duplicate claims (409 conflict)
  - Stores claim with verification method
  - Returns `{ id, status: "pending" }`
- **`server/storage/claims.ts`** — added `submitClaim()` and `getClaimByMemberAndBusiness()`
- **`app/business/claim.tsx`** — wired to real API (was console.log stub)

### 2. Business Dashboard Real Data
- **`GET /api/businesses/:slug/dashboard`** — new endpoint
  - Returns: totalRatings, avgScore, rankPosition, rankDelta, wouldReturnPct, topDish, ratingTrend, recentRatings
  - Aggregates from `getBusinessRatings`, `getRankHistory`, `getBusinessDishes`
- **`app/business/dashboard.tsx`** — replaced `MOCK_ANALYTICS` with React Query fetch
  - Dynamic insights based on real rank delta, return rate, top dish
  - `timeAgo()` formatter for relative timestamps
  - Chart and trend display handle empty data gracefully

### 3. Admin Route Extraction
- **`server/routes-admin.ts`** — NEW file with all 14 admin endpoints
  - `requireAdmin` middleware (DRY admin check)
  - Category suggestions, seed cities, fetch photos, claims, flags, members
- **`server/routes.ts`** — reduced by ~260 lines
  - Calls `registerAdminRoutes(app)` instead of inline admin routes
  - Removed unused imports: `isAdminEmail`, `getPendingClaims`, `reviewClaim`, etc.

### 4. Tests
- **`tests/business-claims.test.ts`** — 18 tests
  - Claim validation: role required, empty rejection, length limits, phone type
  - Claim endpoint contract: auth, not found, duplicate, success
  - Dashboard endpoint contract: data shape, null topDish, empty trend
  - timeAgo formatter: minutes, hours, days, weeks

---

## Files Changed

| File | Change |
|------|--------|
| `server/routes.ts` | Removed 14 admin routes, added claim + dashboard endpoints |
| `server/routes-admin.ts` | **NEW** — extracted admin routes with requireAdmin middleware |
| `server/storage/claims.ts` | Added submitClaim, getClaimByMemberAndBusiness |
| `server/storage/index.ts` | Export new claim functions |
| `app/business/claim.tsx` | Wired to real API endpoint |
| `app/business/dashboard.tsx` | React Query + real data, removed MOCK_ANALYTICS |
| `tests/business-claims.test.ts` | **NEW** — 18 tests |

---

## Quality Gates

- [x] 283 tests passing (23 files) — sub-500ms
- [x] Zero TypeScript errors
- [x] routes.ts reduced from ~800 to ~550 LOC
- [x] No mock data in dashboard
- [x] Claim endpoint validates input and prevents duplicates
- [x] Admin routes use DRY requireAdmin middleware
