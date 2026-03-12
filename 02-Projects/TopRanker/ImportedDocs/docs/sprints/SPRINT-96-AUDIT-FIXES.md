# Sprint 96 — Audit Fixes: Security Hardening + Route Extraction

**Date**: 2026-03-08
**Theme**: CRITICAL/HIGH Audit Remediation
**Story Points**: 10
**Tests Added**: 14 (371 total)

---

## Mission Alignment

Audit #95 found 1 CRITICAL and 5 HIGH issues. This sprint resolves the most impactful ones:
auth ordering vulnerability, weak passwords, route file bloat, and test coverage gaps.

---

## Team Discussion

**Nadia Kaur (Cybersecurity)**: "The cancel endpoint was mutating state before checking
ownership — classic TOCTOU issue. Now we query first, verify, then mutate. Password policy
upgraded to 8 chars + numeric. Both are production-blocking fixes."

**Marcus Chen (CTO)**: "Badge route extraction dropped routes.ts from 715 to 662 LOC. The
file now delegates to four extracted modules: routes-admin (180), routes-payments (172),
routes-badges (79). Main routes.ts handles core business logic only."

**Sarah Nakamura (Lead Engineer)**: "14 new push notification tests cover message construction,
ticket parsing, truncation logic, and notification type contracts. That's one more module
off the 'untested' list from the audit."

---

## Changes

### H3 Fixed: Cancel Auth Ordering
- `POST /api/payments/cancel` now queries payment first via `getPaymentById()`
- Ownership check (`memberId === req.user.id`) happens before any mutation
- Added `getPaymentById()` to storage/payments.ts

### H2 Fixed: Password Policy
- Minimum increased from 6 to 8 characters
- Added numeric requirement: `!/\d/.test(password)`
- Error messages updated accordingly

### H1 Fixed: Badge Route Extraction
- Created `server/routes-badges.ts` with `registerBadgeRoutes(app)`
- 4 endpoints: member badges, award, earned, leaderboard
- routes.ts: 715 → 662 LOC

### H5 Partial: Push Notification Tests
- 14 tests in `tests/push-notifications.test.ts`
- Coverage: message shape, token mapping, ticket parsing, truncation, notification types

---

## What's Next (Sprint 97)

Address user's UI feedback on bottom tab bar glow effect, then continue with remaining
audit items (M1-M5) and new feature work.
