# Sprint 186: Email Verification + Password Reset

**Date:** 2026-03-09
**Story Points:** 5
**Focus:** Email verification flow, password reset with secure token, security hardening for beta launch

---

## Mission Alignment
Core Value #18 (trust through humility) — we can't claim trustworthy rankings if we don't verify who's voting. Email verification closes the fake account vector. Password reset is table-stakes UX that every real product needs. Both are security gates for the SLT-185 beta launch roadmap.

---

## Team Discussion

**Marcus Chen (CTO):** "Four new endpoints, zero schema migrations needed — we added the fields but Drizzle handles column additions gracefully. The verification token is 32 bytes of crypto.randomBytes, stored per-member. Password reset has a 1-hour expiry window."

**Nadia Kaur (Security):** "Critical security measures: forgot-password returns the same message regardless of whether the email exists — prevents email enumeration. Both forgot-password and reset-password use authRateLimiter. Reset tokens are 32 bytes hex (256 bits of entropy). Tokens are cleared after use."

**Sarah Nakamura (Lead Eng):** "Signup now fires two emails in parallel: verification + welcome. Both are fire-and-forget — if either fails, the user still gets logged in. Resend-verification is auth-gated and checks if already verified. The flow is: signup → verify email → full access."

**Jordan Blake (Compliance):** "Email verification strengthens GDPR compliance. We can now prove that the email owner consented to account creation. Google OAuth users are auto-verified (Google already verified their email). The schema changes are backward-compatible — existing users have emailVerified=false by default."

**Amir Patel (Architecture):** "routes-auth.ts grew from 256 to ~320 lines with the 4 new endpoints. Still well within tolerance. Storage functions use crypto.randomBytes for token generation — no external dependencies. The 1-hour expiry for password reset is standard practice (Stripe uses 1 hour, GitHub uses 1 hour)."

**Rachel Wei (CFO):** "This unblocks beta launch. We can't invite Dallas restaurants without email verification — it's a trust signal. Password reset reduces support burden. Both are prerequisites for the referral system in Sprint 188."

---

## Changes

### Schema Changes
| Field | Type | Default | Purpose |
|-------|------|---------|---------|
| `emailVerified` | boolean | false | Email verification status |
| `emailVerificationToken` | text | null | Token for verification link |
| `passwordResetToken` | text | null | Token for password reset link |
| `passwordResetExpires` | timestamp | null | 1-hour expiry for reset tokens |

### Modified Files
| File | Change |
|------|--------|
| `shared/schema.ts` | Added 4 new member fields |
| `server/storage/members.ts` | generateEmailVerificationToken, verifyEmailToken, isEmailVerified, generatePasswordResetToken, resetPasswordWithToken |
| `server/storage/index.ts` | Export new functions |
| `server/email.ts` | sendVerificationEmail, sendPasswordResetEmail templates |
| `server/routes-auth.ts` | 4 new endpoints + signup verification integration |
| `tests/sprint146-freshness-boundary-audit.test.ts` | Updated regex range for signup handler |

### API Endpoints (New)
| Method | Path | Auth | Purpose |
|--------|------|------|---------|
| POST | `/api/auth/verify-email` | None | Verify email with token |
| POST | `/api/auth/resend-verification` | Required | Resend verification email |
| POST | `/api/auth/forgot-password` | None (rate-limited) | Request password reset |
| POST | `/api/auth/reset-password` | None (rate-limited) | Reset password with token |

### Security Measures
- 32-byte hex tokens (256-bit entropy)
- 1-hour expiry on password reset tokens
- Email enumeration prevention (same response for existing/non-existing emails)
- Rate limiting on all auth endpoints
- Tokens cleared after use (one-time)
- Google-only accounts cannot trigger password reset

---

## Test Results
- **51 new tests** for email verification + password reset
- Full suite: **2,993 tests** across 119 files — all passing, <1.9s
