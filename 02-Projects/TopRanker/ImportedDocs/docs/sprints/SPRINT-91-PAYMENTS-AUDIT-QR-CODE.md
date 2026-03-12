# Sprint 91 — Payments Audit Trail + QR Code Generation

**Date**: 2026-03-08
**Theme**: Financial Infrastructure & Print Collateral
**Story Points**: 13
**Tests Added**: 14 (308 total)

---

## Mission Alignment

Every dollar flowing through TopRanker must be auditable. The payments table creates a permanent
record of all transactions — challenger entries, dashboard pro subscriptions, and featured
placements. QR codes give businesses a physical bridge to their digital rankings.

---

## Team Discussion

**Rachel Wei (CFO)**: "The payments audit trail is non-negotiable for SOX compliance readiness.
Every transaction needs a paper trail — amount, currency, status, stripe reference. This is
exactly what our auditors will look at during due diligence."

**Marcus Chen (CTO)**: "The schema design is solid — member and business indexes mean we can
query payment history from either direction without full table scans. The jsonb metadata column
gives us flexibility for product-specific data without schema migrations."

**Sarah Nakamura (Lead Engineer)**: "I like the barrel re-export pattern in storage/index.ts.
Four new functions — createPaymentRecord, updatePaymentStatus, getMemberPayments,
getBusinessPayments — all cleanly separated. The routes-payments.ts integration is minimal,
just one createPaymentRecord call after each Stripe interaction."

**Jordan Blake (Compliance)**: "Status lifecycle is well-defined: pending → succeeded/failed →
refunded. The updatePaymentStatus function with timestamp tracking gives us the audit chain we
need. We should add webhook handlers next sprint to catch Stripe-side status changes."

**Priya Patel (Design)**: "The QR code print window is clean — branded header with amber accent,
business name, and clean QR image. Using api.qrserver.com with our brand color embedded in the
URL keeps it consistent. The 180x180 size is optimal for print."

**Alex Rivera (Mobile)**: "Good call using the external QR API instead of fighting npm permission
issues with react-native-qrcode-svg. The Image component handles it cleanly, and SafeImage
provides fallback if the API is slow."

---

## Changes

### 1. Payments Table (`shared/schema.ts`)
- New `payments` pgTable with: id, memberId, businessId, type, amount, currency,
  stripePaymentIntentId, status, metadata (jsonb), createdAt, updatedAt
- Three indexes: member, business, status for query performance
- Foreign keys to members and businesses tables

### 2. Payment Storage Functions (`server/storage/payments.ts`)
- `createPaymentRecord(params)` — insert with defaults (currency=usd, nulls for optional)
- `updatePaymentStatus(id, status)` — sets updatedAt timestamp
- `getMemberPayments(memberId, limit)` — ordered by createdAt desc
- `getBusinessPayments(businessId, limit)` — ordered by createdAt desc

### 3. Payment Audit Trail (`server/routes-payments.ts`)
- All 3 payment routes now call `createPaymentRecord` after Stripe interaction
- Records: memberId, businessId, type, amount, stripePaymentIntentId, status, metadata

### 4. QR Code Generation (`app/business/qr.tsx`)
- Replaced ASCII placeholder grid with real QR image from `api.qrserver.com`
- URL: `https://api.qrserver.com/v1/create-qr-code/?size=180x180&data=...&color=0D1B2A`
- Branded print window with amber header, business name, QR image
- Clean print CSS hides screen-only elements

### 5. Tests (`tests/payment-records.test.ts`)
- 14 tests: schema validation, null handling, payment types, amounts (cents),
  status lifecycle, QR URL generation

---

## PRD Gap Closures

| Gap | Status |
|-----|--------|
| Payment audit trail | CLOSED — full transaction logging |
| QR code generation | CLOSED — real QR images with brand colors |
| Print collateral | CLOSED — branded print window |

---

## What's Next (Sprint 92)

- Stripe webhook handler for async status updates
- Featured Placement purchase UI flow
- Dashboard Pro subscription conversion
- Audit automation script
