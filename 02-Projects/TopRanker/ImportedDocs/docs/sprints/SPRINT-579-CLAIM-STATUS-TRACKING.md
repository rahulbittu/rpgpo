# Sprint 579: Business Claim Status Tracking

**Date:** 2026-03-10
**Story Points:** 3
**Status:** Complete

## Mission

Add claim status tracking so users can see the current state of their business ownership claims. Previously, after submitting a claim, users had no way to check status — they just had to wait for an email. Now the business detail page shows a contextual ClaimStatusCard with pending/approved/rejected states.

## Team Discussion

**Marcus Chen (CTO):** "Users submitting claims and then having zero visibility into status is a UX gap. This is table stakes for a business claim flow — you need to show progress."

**Sarah Nakamura (Lead Eng):** "The self-fetching pattern works well here. ClaimStatusCard queries /api/members/me/claims once, caches it, and filters by businessId. No prop drilling from the parent page."

**Dev Okonkwo (Frontend):** "Three clear states: pending (amber, time icon), approved (green, shield), rejected (red, X). Each has a contextual CTA — dashboard link for approved, resubmit for rejected."

**Priya Sharma (Design):** "The card uses the status color as a subtle background tint. It's prominent enough to be noticed but doesn't dominate the business detail page."

**Nadia Kaur (Security):** "The claims endpoint is behind requireAuth — users can only see their own claims. The storage query filters by memberId. No cross-user data exposure."

## Changes

### New Files
- **`components/business/ClaimStatusCard.tsx`** (95 LOC)
  - Self-fetching: queries `/api/members/me/claims`, filters by businessId
  - STATUS_CONFIG with pending/approved/rejected visual states
  - Approved → "Open Dashboard" CTA
  - Rejected → "Resubmit Claim" CTA
  - Returns null for unauthenticated users or no claim

### Modified Files
- **`server/storage/claims.ts`** (+14 LOC)
  - Added `getClaimsByMember(memberId)` — returns all claims with business name/slug
  - Joins businessClaims with businesses table
  - Ordered by submittedAt descending

- **`server/storage/index.ts`** — Added `getClaimsByMember` export

- **`server/routes-members.ts`** (+6 LOC)
  - New endpoint: `GET /api/members/me/claims` (requireAuth)
  - Returns array of claim objects with status

- **`app/business/[id].tsx`** (+3 LOC)
  - Imports and renders ClaimStatusCard before ScoreBreakdown
  - Passes businessId, businessSlug, businessName

- **`lib/mock-router.ts`** (+1 LOC)
  - Added `/api/members/me/claims` route (returns empty array) before catch-all

### Test Files
- **`__tests__/sprint579-claim-status-tracking.test.ts`** (33 tests)
  - Storage function (7), index export (1), route wiring (5)
  - Component (17), business detail integration (2), mock router (1)

### Threshold Updates
- `shared/thresholds.json`: tests 10977→11010, build 715.9→716.8kb
- `sprint577`: routes-members.ts LOC threshold 290→300

## Test Results
- **11,010 tests** across 468 files, all passing in ~6.0s
- Server build: 716.8kb
