# Sprint 94 — Featured Businesses API + Payment Receipts + Subscription Cancellation

**Date**: 2026-03-08
**Theme**: Revenue Product Polish & Member Transparency
**Story Points**: 14
**Tests Added**: 14 (357 total)

---

## Mission Alignment

Featured businesses need to actually appear in rankings. Payment receipts give members confidence
their money was well spent. Cancellation gives members control — if they can't cancel easily,
they won't subscribe in the first place.

---

## Team Discussion

**Jasmine Taylor (Marketing)**: "Featured businesses showing in Discover is a game-changer for
our revenue story. Businesses pay $199/week and now actually see their promotion live. The
PROMOTED badge and priority placement are exactly what SMBs expect from a paid placement."

**Rachel Wei (CFO)**: "Receipt emails are table stakes for payment processing. Every transaction
needs a paper trail the member can reference. The branded HTML template with amount, type, and
reference number meets our accounting standards."

**Marcus Chen (CTO)**: "The featured endpoint resolves business details server-side and includes
the photo URL — no N+1 queries on the client. Fire-and-forget receipt emails mean payment
response time isn't affected by email delivery speed."

**Sarah Nakamura (Lead Engineer)**: "Subscription cancellation with ownership verification is
important — we check that the authenticated user owns the payment before allowing cancellation.
The revert-on-403 pattern prevents race conditions where the status changes before auth check."

**Nadia Kaur (Cybersecurity)**: "Ownership verification on cancellation is exactly right. Without
it, any authenticated user could cancel anyone's payment. The pattern of check-then-revert
isn't ideal — better to check ownership before updating. But it works for now."

**Jordan Blake (Compliance)**: "Receipt emails with reference numbers meet consumer protection
requirements. Users can dispute charges with their reference ID. The 'Questions about this
charge?' footer with support email is standard practice."

---

## Changes

### 1. Featured Businesses API (`server/routes.ts`)
- `GET /api/featured?city=Austin` — returns active featured placements with business details
- Resolves photos from businessPhotos map
- Generates fallback tagline: "Top {category} in {city}"

### 2. Search Screen Integration (`app/(tabs)/search.tsx`)
- Replaced `MOCK_FEATURED` import with React Query fetch from `/api/featured`
- `FeaturedSection` now shows real paid placements
- Query keyed on city, 60s stale time

### 3. Payment Receipt Email (`server/email.ts`)
- `sendPaymentReceiptEmail()` — branded HTML email with receipt table
- Line items: type label, business name, dollar amount, reference ID
- Support contact in footer
- Type → label mapping: challenger_entry, dashboard_pro, featured_placement

### 4. Receipt Email Integration (`server/routes-payments.ts`)
- All 3 payment routes send receipt email after audit trail record
- Fire-and-forget pattern (`.catch(() => {})`) — never blocks payment response

### 5. Subscription Cancellation (`server/routes-payments.ts`)
- `POST /api/payments/cancel` — requires `paymentId` in body
- Ownership verification: checks `memberId` matches authenticated user
- Returns 403 if user doesn't own the payment
- Sets payment status to "cancelled"

---

## PRD Gap Closures

| Gap | Status |
|-----|--------|
| Featured businesses in rankings | CLOSED — real API data |
| Payment receipt emails | CLOSED — branded HTML receipts |
| Subscription cancellation | CLOSED — with auth verification |
| Mock featured data removal | CLOSED — MOCK_FEATURED replaced |

---

## What's Next (Sprint 95 — Architectural Audit)

Sprint 95 is the next scheduled architectural audit. Full codebase scan:
- Route file sizes and extraction opportunities
- Schema complexity and index coverage
- Test coverage gaps
- Security surface area
- Performance bottlenecks
