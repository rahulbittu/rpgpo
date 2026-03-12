# Sprint 176: Business Pro Subscription Flow

**Date:** 2026-03-09
**Story Points:** 5
**Focus:** Stripe subscription checkout for $49/mo Dashboard Pro tier with lifecycle management

---

## Mission Alignment
Business Pro is TopRanker's first recurring revenue product. Verified business owners pay $49/mo for expanded dashboard analytics, full review access, and response tools. This sprint builds the full subscription lifecycle: checkout → activation → tiered access → cancellation.

---

## Team Discussion

**Marcus Chen (CTO):** "P0 from SLT-175 delivered. The dashboard-pro endpoint now creates a Stripe Checkout Session in subscription mode instead of a one-time PaymentIntent. Webhook handlers process the full subscription lifecycle: created, updated, deleted, payment failed. Dashboard data is tiered — free gets basic stats, Pro gets full history and notes."

**Rachel Wei (CFO):** "This is THE milestone. Our first recurring revenue stream is now buildable end-to-end. Checkout Session handles PCI compliance — we never touch card data. Stripe manages renewals, dunning, and receipts. We just need to respond to webhooks and gate features."

**Sarah Nakamura (Lead Eng):** "Seven changes across four files: (1) Schema adds 4 subscription fields to businesses, (2) payments.ts gets `createDashboardProSubscription` + `cancelSubscription`, (3) stripe-webhook.ts handles 5 subscription event types, (4) routes-payments.ts has 3 new endpoints (checkout, status, cancel), (5) routes-businesses.ts tiers dashboard data, (6) storage/businesses.ts has `updateBusinessSubscription`, (7) storage barrel exports it."

**Amir Patel (Architecture):** "The subscription metadata pattern is clean — businessId flows from checkout → subscription → webhook → storage update. All events are logged in webhookEvents table. The `processSubscriptionEvent` function handles the full state machine: none → active → past_due → cancelled."

**Nadia Kaur (Security):** "Ownership checks everywhere: only business owner can subscribe, only owner can cancel. Stripe signature verification protects webhooks. No card data touches our server — Checkout Session handles PCI. The 409 conflict prevents duplicate subscriptions."

**Priya Sharma (Design):** "Dashboard tiering is a gentle upsell. Free owners see basic stats with limited history. They can see what Pro unlocks without feeling locked out. The 'subscription=success' query param in the redirect URL triggers a confetti/welcome moment on the dashboard."

**Jordan Blake (Compliance):** "Cancel at period end — not immediate cancellation. Users keep access until the period expires. This is consumer-friendly and matches standard SaaS practice. Stripe handles the auto-expiry."

---

## Changes

### Schema (shared/schema.ts)
Added to `businesses` table:
- `stripeCustomerId` — text, nullable
- `stripeSubscriptionId` — text, nullable
- `subscriptionStatus` — text, default "none" (none/active/past_due/cancelled/trialing)
- `subscriptionPeriodEnd` — timestamp, nullable

### Server Changes
| File | Change |
|------|--------|
| `server/payments.ts` | `createDashboardProSubscription()` — Stripe Checkout Session for recurring; `cancelSubscription()` — cancel at period end |
| `server/stripe-webhook.ts` | Handle 5 subscription event types: checkout.session.completed, customer.subscription.{created,updated,deleted}, invoice.payment_failed |
| `server/routes-payments.ts` | 3 new endpoints: POST dashboard-pro (subscription checkout), GET subscription-status/:slug, POST subscription-cancel/:slug |
| `server/routes-businesses.ts` | Dashboard data tiered: free gets 7-day trend + 3 ratings, Pro gets full history + notes |
| `server/storage/businesses.ts` | `updateBusinessSubscription()` — update stripe/subscription fields |
| `server/storage/index.ts` | Export new function |

### API Endpoints (New)
| Method | Path | Purpose |
|--------|------|---------|
| POST | `/api/payments/dashboard-pro` | Create subscription checkout (updated from one-time) |
| GET | `/api/payments/subscription-status/:slug` | Check subscription status |
| POST | `/api/payments/subscription-cancel/:slug` | Cancel at period end |

### Data Tiering
| Feature | Free (Owner) | Pro ($49/mo) |
|---------|-------------|--------------|
| Total ratings | Yes | Yes |
| Average score | Yes | Yes |
| Rank position | Yes | Yes |
| Would-return % | Yes | Yes |
| Top dish | Yes | Yes |
| Rating trend | 7 days | Full history |
| Recent ratings | 3 | 10 |
| Rating notes | Hidden | Visible |

---

## Test Results
- **48 new tests** for subscription flow
- Full suite: **2,568 tests** across 109 files — all passing, <1.8s
