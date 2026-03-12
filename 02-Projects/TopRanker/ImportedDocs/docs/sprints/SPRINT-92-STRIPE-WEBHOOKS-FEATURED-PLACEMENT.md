# Sprint 92 — Stripe Webhooks + Featured Placement UI + Payment History

**Date**: 2026-03-08
**Theme**: Payment Infrastructure Completion & Revenue UI
**Story Points**: 16
**Tests Added**: 18 (326 total)

---

## Mission Alignment

Payments can't be "fire and forget" — Stripe processes async, 3DS takes time, refunds happen
days later. The webhook handler closes the loop on payment lifecycle. Featured Placement is our
highest-margin revenue product ($199/week) and needed a purchase flow. Payment history in profile
gives members transparency into their transactions.

---

## Team Discussion

**Rachel Wei (CFO)**: "The webhook handler is the piece I've been waiting for. Without it, we're
recording initial payment intents but missing the actual outcome. Now when Stripe confirms a
charge or processes a refund, our database reflects reality. This is audit-grade infrastructure."

**Marcus Chen (CTO)**: "Signature verification with STRIPE_WEBHOOK_SECRET in production, raw JSON
fallback in dev — clean separation. The STATUS_MAP pattern is easy to extend when we add
subscription events later. I like that unhandled event types get a 200 response so Stripe
doesn't retry them."

**Nadia Kaur (Cybersecurity)**: "Webhook signature verification is critical for production. Without
it, anyone could POST fake events to our webhook endpoint. The development fallback should log a
warning — I'd add that before launch. Also, the endpoint should be rate-limited to prevent abuse."

**Priya Patel (Design)**: "The Featured Placement purchase screen uses amber gradient instead of
navy — intentional contrast from the Challenger screen. The trust note callout is important:
'Featured placement increases visibility, not your trust score.' We never want businesses to think
they're buying rankings."

**Alex Rivera (Mobile)**: "enter-featured.tsx mirrors the proven pattern from enter-challenger.tsx
but with distinct branding. Navy step numbers instead of amber reinforce that this is a different
product. The city parameter in the URL params lets us show exactly where the placement will appear."

**Jordan Blake (Compliance)**: "Payment history in profile gives members the transparency they expect.
The status colors — green for succeeded, red for failed, gray for pending — follow standard UX
conventions. We should add receipt download links in a future sprint."

---

## Changes

### 1. Stripe Webhook Handler (`server/stripe-webhook.ts`)
- New file: `handleStripeWebhook(req, res)`
- Signature verification via `STRIPE_WEBHOOK_SECRET` in production
- Event type mapping: `payment_intent.succeeded` → succeeded, `payment_intent.payment_failed` → failed, `charge.refunded` → refunded
- Unhandled events acknowledged with 200 (no retry)
- `charge.refunded` extracts nested `payment_intent` ID

### 2. Storage Update (`server/storage/payments.ts`)
- Added `updatePaymentStatusByStripeId(stripePaymentIntentId, status)` — looks up by Stripe PI ID instead of internal ID
- Exported from barrel `server/storage/index.ts`

### 3. Route Registration (`server/routes.ts`)
- `POST /api/webhook/stripe` — Stripe webhook endpoint
- `GET /api/payments/history` — authenticated member payment history (limit clamped 1-50, default 20)

### 4. Featured Placement Purchase UI (`app/business/enter-featured.tsx`)
- Amber gradient hero card with "$199 per week" pricing
- 3-step "How Featured Works" with navy step indicators
- 5 benefits with icons (megaphone, trending, eye, chart, shield)
- Trust note callout: visibility only, not score manipulation
- Stripe payment flow matching challenger pattern
- Success state with "Featured Placement Active!" confirmation

### 5. Payment History in Profile (`app/(tabs)/profile.tsx`)
- React Query fetch from `/api/payments/history`
- Payment rows: icon by type, name, date, amount, colored status
- Shows after Saved Places section, only when history exists

### 6. Tests (`tests/stripe-webhook.test.ts`)
- 18 tests: status mapping, event parsing, nested PI extraction, endpoint contracts, payment history limit clamping, featured placement flow

---

## PRD Gap Closures

| Gap | Status |
|-----|--------|
| Stripe webhook handler | CLOSED — payment_intent + charge events |
| Featured Placement purchase UI | CLOSED — full purchase flow |
| Payment history visibility | CLOSED — profile section |
| Payment status lifecycle | CLOSED — webhook updates DB records |

---

## What's Next (Sprint 93)

- Dashboard Pro subscription conversion UI
- Webhook event logging/replay for debugging
- Receipt generation (PDF or email)
- Featured placement expiry & renewal notifications
