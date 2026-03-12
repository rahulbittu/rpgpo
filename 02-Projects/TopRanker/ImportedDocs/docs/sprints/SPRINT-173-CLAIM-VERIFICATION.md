# Sprint 173: Business Claim Verification Flow

**Date:** 2026-03-09
**Story Points:** 5
**Focus:** Complete the claim lifecycle — ownership transfer, notification emails, dashboard access control

---

## Mission Alignment
Business claims are TopRanker's first revenue-adjacent feature. Owners who claim their business get dashboard access, analytics, and eventually paid upgrades. A complete, secure claim flow is prerequisite to the Business Pro subscription ($49/mo). This sprint closes the gap between "claim submitted" and "owner verified with dashboard access."

---

## Team Discussion

**Marcus Chen (CTO):** "This closes the P1 from the SLT-170 meeting. The claim flow now has a full lifecycle: submit → admin review → ownership transfer → notification → gated dashboard. Three files changed, zero new patterns."

**Sarah Nakamura (Lead Eng):** "The ownership transfer in `reviewClaim` is clean — single transaction sets ownerId, isClaimed, and claimedAt on the business. The admin route now fetches member + business data to send the right email. Non-blocking `.catch(() => {})` so email failures don't block the admin response."

**Priya Sharma (Design):** "The approved email gives owners a clear CTA to their dashboard. The rejected email is empathetic but direct — gives them a next step (contact support with docs). Both follow our email template system from Sprint 147."

**Amir Patel (Architecture):** "Dashboard access control uses the same `isAdminEmail` pattern from routes-admin.ts. Owner check is `business.ownerId === req.user.id`. Admin bypass ensures our team can always access dashboards for support. The 403 error message is specific enough to be actionable."

**Nadia Kaur (Security):** "This is a critical access control fix. Previously, any authenticated user could view any business dashboard — a data exposure risk. Now it's owner-only with admin override. The email functions sanitize display names through the template system. No PII leakage in error responses."

**Jordan Blake (Compliance):** "The claim rejection email avoids stating a reason, which is correct — we don't want to create discoverable communications about why claims were rejected. The 'contact support' path keeps dispute resolution in a controlled channel."

**Rachel Wei (CFO):** "Claim verification is the gatekeeper to Business Pro revenue. Without verified ownership, we can't sell dashboard upgrades. This unblocks the revenue pipeline we discussed at SLT-170."

---

## Changes

### server/storage/claims.ts
- `reviewClaim()` now transfers ownership on approval: sets `ownerId`, `isClaimed: true`, `claimedAt`

### server/email.ts
- Added `sendClaimApprovedEmail()` — congratulations + dashboard link + capabilities list
- Added `sendClaimRejectedEmail()` — empathetic denial + support contact + next steps

### server/routes-admin.ts
- `PATCH /api/admin/claims/:id` now sends notification emails after review
- Fetches member + business data to compose email
- Non-blocking email dispatch (`.catch(() => {})`)

### server/routes-businesses.ts
- `GET /api/businesses/:slug/dashboard` now checks `business.ownerId === req.user.id`
- Admin bypass via `isAdminEmail` check
- Returns 403 for unauthorized access

---

## Test Results
- **37 new tests** for claim verification flow
- Full suite: **2,446 tests** across 106 files — all passing, <1.8s
