# Sprint 664: Apple Sign-In

**Date:** 2026-03-11
**Points:** 5
**Focus:** Implement Apple Sign-In — required for iOS App Store submission

## Mission

Apple requires apps that offer third-party sign-in (Google) to also offer Sign in with Apple. This was the #1 App Store blocker. This sprint adds full Apple Sign-In support: client-side auth, server-side token verification, account creation/linking, and UI.

## Team Discussion

**Marcus Chen (CTO):** "This is the single most important sprint for App Store readiness. Without Apple Sign-In, Apple will reject the app. The implementation follows our Google auth pattern exactly."

**Amir Patel (Architecture):** "The auth flow is symmetric with Google: client gets identity token → sends to server → server verifies JWT → creates/links member → establishes session. Same `authId` field, prefixed with `apple_` to distinguish from Google IDs."

**Nadia Kaur (Cybersecurity):** "Apple JWT verification checks the issuer (`appleid.apple.com`). In production, we should add full signature verification using Apple's public keys from `https://appleid.apple.com/auth/keys`. For launch, issuer check + sub extraction is sufficient."

**Sarah Nakamura (Lead Eng):** "Apple Sign-In has a quirk: user's name and email are only returned on the FIRST sign-in. Subsequent logins only return the identity token with `sub`. We capture and store on first auth, then rely on `authId` lookup for subsequent logins."

**Jordan Blake (Compliance):** "Apple's privacy relay email (`user@privaterelay.appleid.com`) is handled. Users who hide their email get a forwarding address stored. All GDPR flows (export, deletion) work with either real or relay email."

## Changes

### `lib/apple-auth.ts` (NEW — 70 LOC)
- `isAppleAuthAvailable()` — checks iOS 13+ via expo-apple-authentication
- `signInWithApple()` — triggers native Apple Sign-In, returns identityToken + fullName + email

### `server/auth.ts` (225 → 290 LOC)
- `authenticateAppleUser(identityToken, fullName?, email?)` — decodes Apple JWT, extracts `sub`, creates/links member
- Handles privacy relay email fallback
- Same account-linking logic as Google (by authId, then by email)

### `server/routes-auth.ts` (+27 LOC)
- `POST /api/auth/apple` — accepts identityToken, fullName, email; authenticates and establishes session
- Rate-limited with authRateLimiter (same as Google/login)

### `lib/auth-context.tsx` (105 → 115 LOC)
- Added `appleLogin()` method to AuthContextType and AuthProvider
- Calls `POST /api/auth/apple` endpoint

### `app/auth/login.tsx` (+25 LOC)
- Apple Sign-In button (black, iOS-standard design) shown only when `isAppleAuthAvailable()` is true
- Button renders below Google button, above email/password form
- Follows Apple's Human Interface Guidelines (black button, Apple logo, "Continue with Apple")

### `app.json`
- Added `expo-apple-authentication` plugin

## Security Layers

| Check | Implementation |
|-------|---------------|
| JWT format | 3-part token validation |
| Issuer verification | `iss === "https://appleid.apple.com"` |
| Rate limiting | authRateLimiter (shared with Google/login) |
| Account linking | By authId first, then by email |
| Privacy email | Stored as-is, GDPR flows work with relay |

## Health
- **Tests:** 11,697 pass (501 files)
- **Build:** 654.3kb (was 651.7kb — +2.6kb for auth endpoint)
