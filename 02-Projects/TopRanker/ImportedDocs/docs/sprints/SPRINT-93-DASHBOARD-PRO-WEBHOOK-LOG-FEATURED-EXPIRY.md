# Sprint 93 — Dashboard Pro UI + Webhook Event Log + Featured Placement Expiry

**Date**: 2026-03-08
**Theme**: Revenue Product Completion & Operational Reliability
**Story Points**: 18
**Tests Added**: 17 (343 total)

---

## Mission Alignment

All three revenue products now have complete purchase flows. Webhook event logging means we can
debug and replay failed payment confirmations. Featured placement expiry ensures paid promotions
honor their 7-day window — no indefinite placements.

---

## Team Discussion

**Rachel Wei (CFO)**: "All three revenue streams are now purchasable: Challenger $99, Dashboard Pro
$49/mo, Featured Placement $199/week. The Free vs Pro comparison table in Dashboard Pro is exactly
what converts trial users. Clear value differentiation drives subscription revenue."

**Marcus Chen (CTO)**: "The webhook event log table is critical for production. When a Stripe webhook
fails at 3am, we need the raw payload to replay it. The `processed` flag and `error` column give us
exactly what we need for debugging without losing events."

**Sarah Nakamura (Lead Engineer)**: "Featured placement expiry with the `lte` operator in Drizzle is
clean. The `expireOldPlacements()` function can be called from a cron job or at query time. Three
indexes — business, city+status, expires — cover all our query patterns."

**Nadia Kaur (Cybersecurity)**: "Webhook event logging is also a security audit trail. If we ever
suspect fraudulent payment events, we have the full payload recorded. The signature verification
plus logging gives us defense in depth."

**Priya Patel (Design)**: "Dashboard Pro's comparison table is the star of the sprint. The checkmark
vs X visual makes it instantly clear what you get with Pro. The amber highlight on the Pro column
draws the eye. Renewal note 'Cancel anytime' reduces purchase anxiety."

**Alex Rivera (Mobile)**: "Three purchase screens now follow a consistent pattern — hero card with
gradient, benefits list, price breakdown, Stripe button, security note, disclaimer. Each has distinct
branding: navy for Challenger, amber gradient for Featured, dark blue for Dashboard Pro."

**Jordan Blake (Compliance)**: "The 'Renews monthly. Cancel anytime.' text in Dashboard Pro meets
auto-renewal disclosure requirements. Each purchase screen has Terms of Service reference. We're
compliant for all revenue products."

---

## Changes

### 1. Dashboard Pro Purchase UI (`app/business/enter-dashboard-pro.tsx`)
- Full purchase screen with dark blue gradient hero card
- Free vs Pro comparison table with 7 feature rows
- Checkmark/X icons for feature availability
- Benefits list: analytics, demographics, competitor benchmarking, CSV export, review tools, priority support
- Recurring subscription disclosure: "Renews monthly. Cancel anytime."
- Stripe payment flow to `/api/payments/dashboard-pro`

### 2. Route Registration (`app/_layout.tsx`)
- Added `business/enter-featured` and `business/enter-dashboard-pro` as modal screens

### 3. Webhook Event Log Table (`shared/schema.ts`)
- `webhookEvents` table: source, eventId, eventType, payload (jsonb), processed, error
- Indexes on source and eventId for lookups

### 4. Featured Placements Table (`shared/schema.ts`)
- `featuredPlacements` table: businessId, paymentId, city, startsAt, expiresAt, status
- Three indexes: business, city+status (for active queries), expires (for expiry cron)

### 5. Webhook Event Storage (`server/storage/webhook-events.ts`)
- `logWebhookEvent()` — record incoming webhook
- `markWebhookProcessed()` — mark as processed with optional error
- `getRecentWebhookEvents()` — fetch recent events by source

### 6. Featured Placement Storage (`server/storage/featured-placements.ts`)
- `createFeaturedPlacement()` — 7-day window from now
- `getActiveFeaturedInCity()` — active, non-expired placements
- `getBusinessFeaturedStatus()` — check if business is currently featured
- `expireOldPlacements()` — bulk expire with `lte` on expiresAt

### 7. Webhook Integration (`server/stripe-webhook.ts`)
- Every event logged before processing
- Processed flag set on success or failure
- Error message captured for debugging

### 8. Featured Placement on Payment (`server/routes-payments.ts`)
- Featured payment route creates placement record on `succeeded` status

---

## PRD Gap Closures

| Gap | Status |
|-----|--------|
| Dashboard Pro purchase UI | CLOSED — full subscription flow |
| Webhook event logging | CLOSED — all events recorded |
| Featured placement expiry | CLOSED — 7-day window with auto-expire |
| Revenue product trio | CLOSED — all 3 products purchasable |

---

## What's Next (Sprint 94)

- Receipt email after successful payment
- Featured businesses display in rankings (query active placements)
- Subscription cancellation flow
- Admin webhook event viewer
