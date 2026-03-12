# Architectural Audit #95

**Date**: 2026-03-08
**Auditors**: Marcus Chen (CTO), Sarah Nakamura (Lead Engineer), Nadia Kaur (Cybersecurity)
**Scope**: Full codebase — sprints 91-94 changes + cumulative health

---

## Executive Summary

The codebase is in strong shape. Payment infrastructure (sprints 91-94) was built systematically:
schema → storage → routes → UI → webhooks → expiry. No critical architectural debt introduced.
One **CRITICAL** security finding (exposed API keys in .env), five **HIGH** items, and several
**MEDIUM** improvements.

**Overall Health**: 8.5/10 (up from 7.5 at audit #90)

---

## Findings

### CRITICAL (fix immediately)

#### C1: API Keys Exposed in .env Under Version Control
**Location**: `.env` (root)
**Impact**: Google API keys visible in git history
**Action**: Rotate keys immediately. Add `.env` to `.gitignore`. Use environment variable
injection in deployment (Render/Fly.io secrets, not committed files).
**Owner**: Nadia Kaur
**Sprint**: 96

---

### HIGH (P1 — fix within 2 sprints)

#### H1: routes.ts at 715 LOC — Approaching Extraction Threshold
**Location**: `server/routes.ts`
**Impact**: File grew from 665 (audit #90) to 715. Badge endpoints (lines 608-658) are
self-contained and ripe for extraction to `routes-badges.ts`.
**Action**: Extract badge routes (5 endpoints, ~60 LOC) into `server/routes-badges.ts`
**Owner**: Sarah Nakamura
**Sprint**: 96

#### H2: Password Minimum Length is 6 Characters
**Location**: `server/routes.ts` (signup validation)
**Impact**: Weak password policy. Industry standard is 8+ characters.
**Action**: Increase minimum to 8 characters with at least one number.
**Owner**: Nadia Kaur
**Sprint**: 96

#### H3: Cancellation Auth Check After Mutation
**Location**: `server/routes-payments.ts` (cancel endpoint)
**Impact**: Payment status is updated before verifying the user owns it. Race condition
could leave payment in wrong state if revert fails.
**Action**: Query payment first, check ownership, then update.
**Owner**: Marcus Chen
**Sprint**: 96

#### H4: search.tsx at 845 LOC — Largest Frontend File
**Location**: `app/(tabs)/search.tsx`
**Impact**: Complex file with map integration, filtering, city picker, featured section.
Hard to maintain.
**Action**: Extract map logic into custom hook `useMapView()`. Extract filter/sort logic
into `useSearchFilters()`. Target: <600 LOC.
**Owner**: Alex Rivera
**Sprint**: 97

#### H5: Six Server/Lib Modules Without Tests
**Location**: `server/google-places.ts`, `server/push.ts`, `server/deploy.ts`,
`lib/audio.ts`, `lib/analytics.ts`, `lib/notifications.ts`
**Impact**: No regression protection for push notifications, deployment, analytics tracking.
**Action**: Add test files for each. Priority: push.ts (user-facing), analytics.ts (data).
**Owner**: Sarah Nakamura
**Sprint**: 96-97

---

### MEDIUM (P2 — fix within 4 sprints)

#### M1: No Index on businesses.googlePlaceId
**Location**: `shared/schema.ts`
**Impact**: Photo fetch by googlePlaceId requires full table scan. Currently small dataset
but won't scale.
**Action**: Add `index("idx_biz_google_place").on(businesses.googlePlaceId)`

#### M2: Email Service Still Console-Only
**Location**: `server/email.ts`
**Impact**: 4 email functions (welcome, claim, receipt, admin notification) all log to
console. No emails actually sent.
**Action**: Integrate Resend or SendGrid. Set API key in config.ts.

#### M3: Featured Placement Not Expired on Payment Cancellation
**Location**: `server/routes-payments.ts`
**Impact**: Cancelling a featured payment doesn't deactivate the placement. Business keeps
getting free promotion.
**Action**: On cancel, find associated placement and set status to "cancelled".

#### M4: No Webhook Retry/Replay Mechanism
**Location**: `server/stripe-webhook.ts`
**Impact**: Failed webhooks are logged but can't be replayed. Need admin endpoint to
retry processing a logged event.
**Action**: Add `POST /api/admin/webhooks/:id/replay` endpoint.

#### M5: lib/mock-data.ts Still Exists (490 LOC)
**Location**: `lib/mock-data.ts`
**Impact**: MOCK_FEATURED was replaced in search.tsx but `mock-data.ts` still contains
fallback mock data. Should be pruned or replaced with proper seed data.
**Action**: Audit usage and remove dead mock data.

---

### LOW (P3 — backlog)

#### L1: 3 `as any` Casts for RN StyleSheet Percentage Widths
**Location**: Various app files
**Impact**: Known RN limitation. Documented in MEMORY.md. No action needed.

#### L2: Seed Scripts Use console.log Instead of Logger
**Location**: `server/seed.ts`, `server/seed-cities.ts`
**Impact**: Inconsistent logging. Low priority — only run during setup.

#### L3: TODO Marker in email.ts Line 17
**Location**: `server/email.ts`
**Impact**: Reminder to integrate email provider. Covered by M2.

#### L4: No Rate Limiting on Webhook Endpoint
**Location**: `server/routes.ts` (POST /api/webhook/stripe)
**Impact**: Could be targeted for abuse. Low risk since Stripe signature verification
exists for production.
**Action**: Add basic rate limit (50 req/min) to webhook endpoint.

---

## Metrics Comparison (Audit #90 → #95)

| Metric | Audit #90 | Audit #95 | Delta |
|--------|-----------|-----------|-------|
| Total Tests | 294 | 357 | +63 |
| Test Files | 24 | 28 | +4 |
| routes.ts LOC | 665 | 715 | +50 |
| DB Tables | 15 | 17 | +2 |
| DB Indexes | 18 | 21 | +3 |
| Storage Modules | 11 | 13 | +2 |
| Revenue Products | 1 | 3 | +2 |
| CRITICAL findings | 0 | 1 | +1 |
| HIGH findings | 0 | 5 | +5 |

---

## Sprint 91-94 Additions Reviewed

| Addition | Quality | Notes |
|----------|---------|-------|
| payments table + schema | GOOD | Proper indexes, FK constraints |
| webhook_events table | GOOD | Audit-grade event logging |
| featured_placements table | GOOD | Expiry index, city+status composite |
| Stripe webhook handler | GOOD | Signature verification, status mapping |
| Payment receipt emails | GOOD | Branded HTML, fire-and-forget |
| Featured placement expiry | GOOD | lte operator, bulk expire function |
| Dashboard Pro purchase UI | GOOD | Comparison table, consistent pattern |
| Featured purchase UI | GOOD | Trust note, distinct branding |
| Subscription cancellation | NEEDS FIX | Auth ordering issue (H3) |
| Featured API endpoint | GOOD | Server-side business resolution |

---

## Priority Queue for Sprint 96

1. **C1**: Rotate API keys, .gitignore .env — MUST DO
2. **H3**: Fix cancellation auth ordering — security fix
3. **H1**: Extract badge routes — maintainability
4. **H2**: Password minimum to 8 chars — security
5. **H5**: Test coverage for push.ts, analytics.ts — stability
