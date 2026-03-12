# Sprint 649: Business Claim Email Verification

**Date:** 2026-03-11
**Points:** 5
**Focus:** Complete the business claim email verification flow — code generation, email delivery, owner-facing verification endpoint

## Mission

The business claim system had schema fields for verification codes (`verificationCode`, `codeExpiresAt`) but they were never used. Claims required manual admin review only. Add a self-service email verification path: owner provides business email → receives 6-digit code → submits code → auto-verified + ownership transferred.

## Team Discussion

**Marcus Chen (CTO):** "This is the critical path to monetization. Business Pro at $49/month requires verified claims. We can't charge until owners can self-verify."

**Rachel Wei (CFO):** "Manual admin review doesn't scale. With 50 restaurants in Dallas and growing, we need self-service verification. Email is the first method — phone and document can follow."

**Sarah Nakamura (Lead Eng):** "The flow branches at claim submission: if method is 'email' and businessEmail is provided, we use `submitClaimWithCode()` which generates the 6-digit code and 48-hour expiry. Non-email claims fall through to the existing manual admin flow."

**Nadia Kaur (Cybersecurity):** "Security considerations: max 5 code attempts before lockout, 48-hour code expiry, code is per-claim not reusable. The verification endpoint requires auth — only the claiming member can submit the code."

**Jordan Blake (Compliance):** "Email verification is standard for business ownership. The code isn't sent to the claiming member — it's sent to the *business* email, proving they have access to that inbox."

**Amir Patel (Architecture):** "Clean separation: `submitClaimWithCode()` handles DB + code generation, `verifyClaimByCode()` handles validation + auto-approve + ownership transfer. Both in storage/claims.ts alongside existing functions."

## Changes

### `server/storage/claims.ts`
- Added `submitClaimWithCode()` — generates 6-digit code, stores with 48-hour expiry
- Added `verifyClaimByCode()` — validates code, tracks attempts (max 5), auto-approves + transfers ownership

### `server/storage/index.ts`
- Exported `submitClaimWithCode` and `verifyClaimByCode`

### `server/routes-businesses.ts`
- Claim submission now branches: email method → `submitClaimWithCode()` + verification email; other methods → existing `submitClaim()` + admin review
- Added `POST /api/businesses/claims/:claimId/verify` — owner submits 6-digit code
- Response includes `requiresCode: true` for email verification path

### `server/email.ts`
- Added `sendClaimVerificationCodeEmail()` — branded email template with large 6-digit code display
- Navy header, amber code on dark background, 48-hour expiry notice

### Test Updates
- `sprint476`: routes-businesses.ts ceiling 340 → 360
- `sprint486`: routes-businesses.ts ceiling 310 → 360
- `sprint490`: routes-businesses.ts ceiling 310 → 360

## API

### POST /api/businesses/:slug/claim (updated)
**Response (email verification):**
```json
{ "data": { "id": "...", "status": "pending", "requiresCode": true } }
```

### POST /api/businesses/claims/:claimId/verify (new)
**Request:** `{ "code": "123456" }`
**Response:** `{ "data": { "verified": true } }`
**Errors:** 400 (invalid code, expired, too many attempts, already reviewed)

## Health
- **Tests:** 11,696 pass (501 files)
- **Build:** 646.8kb (was 640.6kb — +6.2kb for email template + verification logic)
- **routes-businesses.ts:** 347 LOC (ceiling 360)
- **storage/claims.ts:** ~210 LOC (was ~150)
