# Sprint 654: Claim Verification UI on Business Detail Page

**Date:** 2026-03-11
**Points:** 3
**Focus:** Wire the email verification code UI into the claim flow + fix the "Coming Soon" claim button

## Mission

Sprint 649 built the server-side email verification for business claims (6-digit code, 48-hour expiry, max 5 attempts), but the UI never handled the `requiresCode: true` response. The claim page showed a generic "Claim Submitted" screen regardless. Additionally, the "Claim Listing" button on the business detail page showed a "Coming Soon" alert instead of navigating to the claim page.

## Team Discussion

**Marcus Chen (CTO):** "This completes the self-service claim flow end-to-end. Owner submits claim → receives email with code → enters code → auto-verified → dashboard access. No admin intervention needed."

**Rachel Wei (CFO):** "This is the final piece of the conversion funnel. Claim → verify → dashboard → upgrade to Pro → pay. Every step is now self-service."

**Amir Patel (Architecture):** "The UI flow branches on the server response: if `requiresCode: true`, show the code entry screen. If not (phone/document method), show the 'submitted for review' screen. Clean branching, same component."

**Sarah Nakamura (Lead Eng):** "The code input uses a large monospace font with letter-spacing for readability. Numeric keyboard, 6-digit max, auto-focus. The amber border on the input draws attention."

**Nadia Kaur (Cybersecurity):** "The verify endpoint (`POST /api/businesses/claims/:claimId/verify`) is auth-gated and the 5-attempt lockout is server-enforced. The UI just shows the user-facing error messages."

**Jordan Blake (Compliance):** "We display the 48-hour expiry and 5-attempt limit clearly. Transparency about verification constraints builds trust."

## Changes

### `app/business/claim.tsx` (366 → 496 LOC)
- Added `requiresCode`, `claimId`, `verificationCode`, `verifying`, `verified` state
- New "verified" success screen with dashboard CTA
- New `handleVerifyCode()` — calls `POST /api/businesses/claims/:claimId/verify`
- New verification code entry screen: mail icon, business email display, large code input, hints
- `handleSubmit` now checks `json.data.requiresCode` to branch between code entry and review screens
- Added styles: `codeIcon`, `codeTitle`, `codeSub`, `codeInput`, `codeHint`

### `components/business/BusinessBottomSection.tsx` (169 LOC, unchanged)
- "Claim Listing" button now navigates to `/business/claim` instead of showing "Coming Soon" alert
- Updated description text: "access analytics and get a verified badge"

## Flow

1. **Unclaimed business** → "Own this business? Claim Listing" card visible
2. **Tap Claim** → navigates to `/business/claim?name=...&slug=...`
3. **Fill form** → role, email, verification method
4. **Submit (email method)** → server returns `{ requiresCode: true, id: claimId }`
5. **Code entry screen** → enter 6-digit code from business email
6. **Verify** → server auto-approves + transfers ownership
7. **Success screen** → "Business Verified!" with "Open Dashboard" CTA

## Health
- **Tests:** 11,696 pass (501 files)
- **Build:** 646.8kb (no change — client-side only)
- **claim.tsx:** 496 LOC (not currently tracked)
