# Sprint 89 — Payment Endpoints + Claim Email Notifications

**Date:** 2026-03-08
**Duration:** 1 session
**Story Points:** 8
**Theme:** Activate the B2B revenue pipeline — payments and owner communication

---

## Mission Alignment

TopRanker's three revenue streams — Challenger ($99), Dashboard Pro ($49/mo), and Featured Placement ($199/week) — were all stubbed or non-existent on the server. The payment service existed in `payments.ts` but had zero API routes. Business owners claiming listings got no email confirmation. This sprint wires everything together.

---

## Team Discussion

**Marcus Chen (Backend Lead):** "Three payment endpoints, all following the same pattern: validate input, look up business by slug, call the payment service, return the intent. The payment service already handles Stripe in prod and mock in dev — the routes just needed to exist."

**Sage (Backend Engineer):** "The claim endpoint now fires two emails asynchronously — confirmation to the owner and alert to the admin team. Both are fire-and-forget with `.catch(() => {})` so they never block the HTTP response."

**Kai Nakamura (Frontend Lead):** "The enter-challenger screen no longer uses `setTimeout` to fake payment processing. It calls `POST /api/payments/challenger` and shows real success/error states. One less TODO in the codebase."

**Rachel Wei (CFO):** "Revenue endpoints are live. In mock mode, everything succeeds instantly. When we add the Stripe secret key to production, real charges will flow. The pricing is baked into `payments.ts` — $99, $49, $199. No configuration needed."

**Sarah Nakamura (QA Lead):** "11 new tests covering all three payment products, auth requirements, business lookup errors, and email notification structure. 294 tests total."

---

## Changes

### 1. Payment API Endpoints
- **`POST /api/payments/challenger`** — $99 one-time entry
  - Body: `{ businessName, slug }`
  - Returns PaymentIntent with id, amount, status
- **`POST /api/payments/dashboard-pro`** — $49/mo subscription
  - Body: `{ slug }`
- **`POST /api/payments/featured`** — $199/week featured placement
  - Body: `{ slug }`
- All require auth, validate business exists

### 2. Claim Email Notifications
- **`sendClaimConfirmationEmail`** — branded HTML email to business claimant
  - Subject: "Claim received: {businessName}"
  - Shows pending status, 24-48hr timeline, dashboard preview
- **`sendClaimAdminNotification`** — alert email to admin team
  - Includes business name, claimant name/email
  - Links to admin dashboard for review
- Both triggered asynchronously from claim endpoint

### 3. Frontend Wiring
- **`enter-challenger.tsx`** — calls real `POST /api/payments/challenger`
  - Handles success (confirmed state), error (Alert), and loading states

---

## Files Changed

| File | Change |
|------|--------|
| `server/routes.ts` | Added 3 payment endpoints + claim email triggers |
| `server/email.ts` | Added sendClaimConfirmationEmail + sendClaimAdminNotification |
| `app/business/enter-challenger.tsx` | Wired to real payment API |
| `tests/payments.test.ts` | **NEW** — 11 tests |

---

## Quality Gates

- [x] 294 tests passing (24 files) — sub-600ms
- [x] Zero TypeScript errors
- [x] All 3 revenue products have working API endpoints
- [x] Claim submissions trigger email notifications
- [x] Payment amounts match pricing model ($99/$49/$199)
