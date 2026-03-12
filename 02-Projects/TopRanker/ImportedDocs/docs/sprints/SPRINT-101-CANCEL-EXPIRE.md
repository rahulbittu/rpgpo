# Sprint 101 — Cancel → Expire Featured Placement (M3 Audit Fix)

**Date**: 2026-03-08
**Theme**: Audit Remediation
**Story Points**: 5
**Tests Added**: 11 (439 total)

---

## Mission Alignment

When a business owner cancels a featured placement payment, the placement should
immediately expire — not remain visible until its natural 7-day window ends. This
closes audit M3 and maintains payment integrity.

---

## Team Discussion

**Marcus Chen (CTO)**: "Simple but important. Added `expireFeaturedByPayment()` to the
storage layer — it targets active placements matching the paymentId and sets status to
'cancelled'. The cancel endpoint checks `payment.type === 'featured_placement'` before
calling it."

**Nadia Kaur (Cybersecurity)**: "The fire-and-forget pattern (`.catch(() => {})`) is
appropriate here — the payment is already cancelled, so even if the placement expire fails,
the payment status is correct. The placement will naturally expire after 7 days anyway."

**Sarah Nakamura (Lead Engineer)**: "11 new tests cover the cancel-to-expire flow: payment
type identification, non-featured filtering, status transitions, null handling, broadcast
events, query conditions, and duration math. 439 total."

**Amir Patel (Architecture)**: "The SSE broadcast fires `featured_updated` on cancellation
so connected clients immediately see the placement disappear from the featured section.
No stale featured content for other users."

---

## Changes

### M3 Fixed: Cancel → Expire Featured Placement
- Created `expireFeaturedByPayment(paymentId)` in storage layer
- Sets matching active placement to status 'cancelled'
- Wired into `/api/payments/cancel` endpoint
- Only triggers for `type === "featured_placement"` payments
- Broadcasts `featured_updated` SSE event on cancellation
- Fire-and-forget pattern — payment cancel succeeds regardless

### Storage Export
- Added `expireFeaturedByPayment` to storage index re-exports

---

## Audit Status (Post-Sprint 101)

| Item | Status | Sprint |
|------|--------|--------|
| M1: googlePlaceId index | CLOSED | 98 |
| M2: Email service integration | Open | — |
| M3: Cancel → expire placement | **CLOSED** | 101 |
| L1: E2E tests | Open | — |
| L2: Webhook replay | Open | — |
| L3: Prune mock-data.ts | Open | — |

---

## What's Next (Sprint 102)

Continue with M2 (email provider) and feature work.
