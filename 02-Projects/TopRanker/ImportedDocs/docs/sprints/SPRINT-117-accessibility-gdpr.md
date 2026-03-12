# Sprint 117 — Accessibility Testing, GDPR Deletion Grace Period, Revenue Analytics

**Date**: 2026-03-08
**Theme**: Compliance Hardening & Revenue Observability
**Story Points**: 13
**Tests Added**: 51 (853 total)

---

## Mission Alignment

Trust requires compliance and accessibility. Users with disabilities must be able to navigate
TopRanker without barriers (WCAG 2.1 AA), and users exercising their right to deletion must
have a clear, cancellable grace period per GDPR Art. 17. Revenue analytics ensure the CFO
has visibility into dashboard and featured placement engagement.

---

## Team Discussion

**Jordan Blake (Compliance)**: "The 30-day grace period for GDPR deletion is industry standard —
Google, Facebook, and Instagram all use similar windows. The key addition here is the
`processExpiredDeletions` background job pattern. In production we'll wire this to a cron
that runs daily, but the in-memory implementation lets us test the full lifecycle: schedule,
check status, cancel, and process expired requests."

**Sarah Nakamura (Lead Engineer)**: "The GDPR module is pure TypeScript with zero dependencies —
just a Map and Date math. The API layer in routes.ts is thin: POST to schedule, GET to check
status. Both require auth. 51 new tests cover every export, every type field, and the
integration points between gdpr.ts and routes.ts."

**Rachel Wei (CFO)**: "We needed `dashboardProViewed` and `featuredViewed` analytics events
to close the revenue funnel visibility gap. Now we can track: user sees featured placement →
taps through → views dashboard → upgrades to Pro. Without these middle-funnel events we were
flying blind on conversion attribution."

**Leo Hernandez (Design)**: "The accessibility utility is a game-changer for our design review
process. Instead of manually checking every component for accessibilityRole and accessibilityLabel,
we now have `runAccessibilityAudit()` that scans key components and reports issues with severity
levels. CookieConsent was missing accessibility attributes entirely — fixed with proper button
roles and descriptive labels."

**Nadia Kaur (Cybersecurity)**: "The GDPR deletion endpoints are auth-gated, which is critical.
Without `requireAuth`, anyone could schedule deletion of arbitrary accounts. The grace period
also serves as a security feature — if an attacker gains temporary access and triggers deletion,
the legitimate user has 30 days to log in and cancel."

**Amir Patel (Architecture)**: "The accessibility module uses fs.readFileSync at test time,
which is the right pattern — no React Native runtime needed. The gdpr.ts module is stateless
beyond its Map, making it trivially testable and easy to swap to database storage later.
Clean separation of concerns."

---

## Workstreams

| # | Workstream | Owner | Files | Status |
|---|-----------|-------|-------|--------|
| 1 | Accessibility testing utility | Leo Hernandez | `lib/accessibility.ts` | Done |
| 2 | GDPR deletion grace period | Jordan Blake | `server/gdpr.ts` | Done |
| 3 | GDPR deletion API endpoints | Sarah Nakamura | `server/routes.ts` | Done |
| 4 | Client analytics revenue events | Rachel Wei | `lib/analytics.ts` | Done |
| 5 | Component accessibility fixes | Leo Hernandez | `components/CookieConsent.tsx` | Done |
| 6 | Tests | Sarah Nakamura | `tests/sprint117-accessibility-gdpr.test.ts` | Done |

---

## Changes

### 1. Accessibility Testing Utility (`lib/accessibility.ts`)
- `checkAccessibilityLabel(component)` — reads component file, checks for accessibilityLabel
- `checkAccessibilityRole(component)` — checks for accessibilityRole
- `getAccessibilityReport()` — returns all recorded AccessibilityIssue entries
- `clearAccessibilityIssues()` — resets issues array between test runs
- `runAccessibilityAudit()` — scans ErrorBoundary, CookieConsent, NavigationRow, SettingRow
- AccessibilityIssue type: component, issue, severity (error/warning/info), timestamp

### 2. GDPR Deletion Grace Period (`server/gdpr.ts`)
- `scheduleDeletion(userId, gracePeriodDays)` — creates pending DeletionRequest
- `cancelDeletion(userId)` — cancels pending request, returns boolean
- `getDeletionStatus(userId)` — returns DeletionRequest or null
- `processExpiredDeletions()` — marks expired pending as completed, returns user IDs
- DeletionRequest: { userId, scheduledAt, deleteAt, status: pending|cancelled|completed }
- In-memory Map storage (swap to DB in production)

### 3. GDPR API Endpoints (`server/routes.ts`)
- `POST /api/account/schedule-deletion` — requires auth, calls scheduleDeletion(userId, 30)
- `GET /api/account/deletion-status` — requires auth, returns hasPendingDeletion flag
- GDPR log tagging for audit trail

### 4. Client Analytics (`lib/analytics.ts`)
- Added `dashboardProViewed(slug)` — tracks dashboard_view with pro tier
- Added `featuredViewed(slug)` — tracks featured_placement_tap with featured_section source

### 5. Component Accessibility (`components/CookieConsent.tsx`)
- Added accessibilityRole="button" to Accept and Decline buttons
- Added descriptive accessibilityLabel to both buttons

---

## Test Summary

- **51 new tests** in `tests/sprint117-accessibility-gdpr.test.ts`
- Sections: Accessibility utility (16), GDPR module (18), GDPR API (10), Analytics (9), Component a11y (5)
- All tests use fs.readFileSync pattern — no React Native runtime required
- **853 total tests** across 50 files, all passing

---

## PRD Gap Status

- [x] GDPR deletion with grace period (P1) — CLOSED
- [x] Automated accessibility testing (P1) — CLOSED
- [x] Client analytics for revenue events (P1) — CLOSED
- [ ] Full dark mode migration — DEFERRED (user reverted dark backgrounds)
