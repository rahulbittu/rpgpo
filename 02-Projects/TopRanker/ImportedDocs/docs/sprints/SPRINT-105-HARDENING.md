# Sprint 105 — Platform Hardening & Progressive Migration

**Date**: 2026-03-08
**Theme**: Security Hardening + Cross-Department Progressive Adoption
**Story Points**: 13
**Tests Added**: ~18 (508 total)

---

## Mission Alignment

Sprint 104 established cross-department foundations. Sprint 105 hardens the platform
(CSP, rate limiting) while migrating components to use those foundations (pricing
constants, typography system). Every department continues to own deliverables.

---

## Team Discussion

**Nadia Kaur (Cybersecurity)**: "Added Content Security Policy header — nine directives
covering script-src, style-src, font-src, img-src, connect-src, and frame-ancestors.
Combined with Sprint 104's security headers, we now have comprehensive OWASP coverage.
CSP is the single most effective XSS mitigation."

**Amir Patel (Architecture)**: "Extracted the inline rate limiter from routes.ts into a
proper middleware module. Global API limit at 100 req/min, auth endpoints at 10 req/min.
Rate limit headers (X-RateLimit-Limit, Remaining, Reset) on every response. The old
inline implementation had duplicated cleanup logic — now it's one module, one interval."

**Jordan Blake (Compliance)**: "Cookie consent banner for web — GDPR/ePrivacy compliant.
Two choices: Accept All or Essential Only. Persists to AsyncStorage. This was flagged in
Sprint 104 retro and delivered in Sprint 105. Legal velocity."

**Jasmine Taylor (Marketing)**: "Banner now persists across restarts via AsyncStorage.
Initial state is false to prevent flash-of-banner on returning users. Clean UX pattern."

**Rachel Wei (CFO)**: "Migrated all three payment entry screens to use centralized PRICING
constants. Zero hardcoded dollar amounts in frontend. Price change is now a one-line edit
in shared/pricing.ts — not a find-and-replace across 6 files."

**Leo Hernandez (Design)**: "Started typography migration in leaderboard SubComponents. Four
styles replaced with TYPOGRAPHY spreads — labels and captions. Conservative approach: only
exact matches. More components in future sprints."

**Marcus Chen (CTO)**: "Rate limiter extraction removed 46 lines of duplicated code from
routes.ts. Security headers + CSP + rate limiting = production-ready middleware stack.
This is the infrastructure that lets us scale safely."

**Sarah Nakamura (Lead Engineer)**: "~18 new tests covering CSP, rate limiting, cookie
consent, pricing migration, and banner persistence. 508 total. Six parallel workstreams
again — zero merge conflicts."

---

## Changes

### Security (Nadia Kaur)
- Added Content Security Policy to security-headers.ts (9 directives)

### Architecture (Amir Patel)
- New `server/rate-limiter.ts` — extracted + improved rate limiter middleware
- Global 100 req/min on /api, 10 req/min on auth endpoints
- Removed 46 lines of inline rate limiter from routes.ts

### Legal (Jordan Blake)
- New `components/CookieConsent.tsx` — GDPR cookie consent banner (web only)
- Integrated in app/_layout.tsx

### Marketing (Jasmine Taylor)
- Persisted banner dismissal via AsyncStorage in index.tsx
- Initial state false to prevent flash

### Finance (Rachel Wei)
- Migrated enter-challenger.tsx, enter-dashboard-pro.tsx, enter-featured.tsx to PRICING constants
- Zero hardcoded dollar amounts in payment entry screens

### Design (Leo Hernandez)
- Migrated 4 styles in SubComponents.tsx to TYPOGRAPHY spreads
- Conservative: only exact 1:1 matches replaced

---

## Audit Status

| Item | Status | Sprint |
|------|--------|--------|
| M1-M3 | CLOSED | 98-102 |
| L1: E2E tests | Open | — |
| L2: Webhook replay | CLOSED | 103 |
| L3: Mock data | Deferred (dev utility) | — |

---

## What's Next (Sprint 106)

Onboarding flow, more typography migration, frontend pricing in remaining components,
security audit of SSE endpoint, performance monitoring.
