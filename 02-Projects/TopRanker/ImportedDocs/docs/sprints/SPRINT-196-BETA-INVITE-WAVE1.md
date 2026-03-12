# Sprint 196 — Beta Invite Wave 1 + Landing Page

**Date:** 2026-03-09
**Story Points:** 8
**Status:** Complete

## Mission Alignment

First post-GO sprint. Build the beta invite infrastructure: admin endpoints for sending branded invite emails (single + batch), a public join landing page for invite links, and wire referral code passthrough from invite → signup. This is the bridge between "GO decision" and "real users."

## Team Discussion

**Marcus Chen (CTO):** "We got the GO. Now we execute. The invite flow has to be seamless — email arrives, user clicks, sees a compelling landing page, signs up with their referral code automatically attached. No friction, no dropped context."

**Jasmine Taylor (Marketing):** "The landing page hits the trust narrative hard: credibility matters, real rankings, community driven. Four value props, branded colors, BETA badge. The invite email uses the same language. Consistent messaging from inbox to onboarding."

**Amir Patel (Architecture):** "The admin endpoints follow our established pattern: requireAuth + requireAdmin, input sanitization, duplicate checking. The batch endpoint caps at 25 — matching our wave-1 target exactly. No over-engineering."

**Sarah Nakamura (Lead Eng):** "The referral passthrough is clean: email → join page reads ?ref= → passes to signup → auth context sends referralCode → server creates referral record. Every link in the chain was already built in Sprint 188; we just connected the dots."

**Rachel Wei (CFO):** "25 invites at zero cost. The batch endpoint lets us send all invites in one admin action. If even 2 convert to Challengers, we've covered a month of infrastructure cost."

**Nadia Kaur (Cybersecurity):** "Admin-only endpoints, sanitized inputs, duplicate checking. The join page is public but read-only — no data exposure. Referral codes are just usernames, no sensitive data."

**Jordan Blake (Compliance):** "The invite email includes proper branding, unambiguous opt-in language, and no pre-checked consent. GDPR-compliant by design."

## Deliverables

### Admin Beta Invite Endpoints (`server/routes-admin.ts`)
- `POST /api/admin/beta-invite` — Send single invite with email, displayName, optional referralCode + invitedBy
- `POST /api/admin/beta-invite/batch` — Send up to 25 invites, returns per-invite results (sent/skipped)
- Duplicate prevention: checks getMemberByEmail before sending
- Default referral code: BETA25

### Join Landing Page (`app/join.tsx`)
- Public page receiving `?ref=CODE` from invite emails
- Branded hero: logo, BETA badge, trust-weighted pitch
- Referral code display when present
- Four value propositions: Credibility Matters, Real Rankings, Community Driven, Your Voice Amplified
- CTA → signup with referral code pre-filled
- Login link for existing users
- Redirects authenticated users to home

### Signup Referral Passthrough (`app/auth/signup.tsx` + `lib/auth-context.tsx`)
- Signup reads `?ref=` param via useLocalSearchParams
- Auth context signup() now accepts optional referralCode
- Referral code flows through to server POST /api/auth/signup → createReferral()

### Beta Invite Email (`server/email.ts`)
- `sendBetaInviteEmail()` — branded HTML template (Sprint 196, prior session)
- Navy header, amber CTA, trust narrative, referral code display
- Plain text fallback for email clients

## Tests

- 40 new tests in `tests/sprint196-beta-invite.test.ts`
- Full suite: **3,296 tests across 127 files, all passing in <2s**

### Test Coverage
1. Beta invite email template (9 tests)
2. Admin single invite endpoint (8 tests)
3. Admin batch invite endpoint (6 tests)
4. Join landing page (11 tests)
5. Signup referral passthrough (2 tests)
6. Auth context referralCode (1 test)
7. Server signup route referral handling (3 tests)
