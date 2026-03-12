# Sprint 104 — Cross-Department Contributions (All Hands)

**Date**: 2026-03-08
**Theme**: Cross-Department Progressive Updates
**Story Points**: 13
**Tests Added**: ~20 (490 total)

---

## Mission Alignment

Every department contributes progressively. Legal, Marketing, Design, Security, and Finance
all own deliverables. No department sits idle while Engineering ships alone.

---

## Team Discussion

**Marcus Chen (CTO)**: "This is how a real company operates. Engineering shouldn't be the only
department shipping code. Legal owns terms and privacy, Security owns headers, Marketing owns
engagement copy, Design owns the type system, Finance owns pricing constants. Everyone commits."

**Jordan Blake (Compliance)**: "Updated both Terms of Service and Privacy Policy to reflect
Sprints 97-103 changes — real-time SSE data collection, Resend as email provider, webhook
event logging, payment cancellation policy. These documents should evolve with every feature
we ship. 80 sprints of stale legal docs is a compliance risk."

**Nadia Kaur (Cybersecurity)**: "Added OWASP-recommended security headers middleware —
X-Content-Type-Options, X-Frame-Options, XSS protection, Referrer-Policy, Permissions-Policy,
and production HSTS. These are table stakes for any production web app. Should have been
Sprint 1, but better late than never."

**Jasmine Taylor (Marketing)**: "Added an engagement banner to the Rankings tab —
'Trust-weighted rankings by real people.' Subtle, branded, dismissable. Encourages new users
to rate businesses and build credibility. Small copy, big impact on activation."

**Leo Hernandez (Design)**: "Created a centralized typography system (constants/typography.ts)
and refactored colors.ts to import from brand.ts as single source of truth. No more duplicated
hex values. Every color now traces back to one definition. Also audited tab bar and leaderboard
components for brand consistency."

**Rachel Wei (CFO)**: "Centralized all pricing into shared/pricing.ts — Challenger $99,
Dashboard Pro $49/mo, Featured Placement $199/wk. Single source of truth in cents (Stripe
convention) with display amounts derived. No more magic numbers scattered across route handlers."

**Sarah Nakamura (Lead Engineer)**: "Coordinated all six workstreams in parallel — zero
conflicts, zero dependencies. ~20 new tests covering legal content, security headers, typography,
and pricing. 490 total. This is how you scale a team."

**Amir Patel (Architecture)**: "The typography system and pricing constants are exactly the
kind of foundational work that prevents drift. When every component imports from one source,
brand consistency becomes automatic, not manual."

---

## Changes

### Legal (Jordan Blake)
- Updated Terms of Service: new Section 13 (Real-Time Data & Communications), updated Sections 4 and 7, renumbered to 14 sections
- Updated Privacy Policy: SSE connection data, webhook event logging, Resend provider, security headers for webhooks

### Security (Nadia Kaur)
- New `server/security-headers.ts` middleware with OWASP headers
- Integrated before route registration in server/index.ts

### Marketing (Jasmine Taylor)
- Rankings tab engagement banner — branded, dismissable, encourages rating

### Design (Leo Hernandez)
- New `constants/typography.ts` — centralized Playfair Display + DM Sans definitions
- Refactored `constants/colors.ts` to import from brand.ts (single source of truth)

### Finance (Rachel Wei)
- New `shared/pricing.ts` — centralized pricing in cents with display amounts
- Updated routes-payments.ts to use PRICING constants

---

## Audit Status

| Item | Status | Sprint |
|------|--------|--------|
| M1: googlePlaceId index | CLOSED | 98 |
| M2: Email service integration | CLOSED | 102 |
| M3: Cancel → expire placement | CLOSED | 101 |
| L1: E2E tests | Open | — |
| L2: Webhook replay | CLOSED | 103 |
| L3: Mock data | Deferred (dev utility) | — |

---

## What's Next (Sprint 105)

Continue cross-department cadence. Engineering: API rate limiting improvements.
Legal: Cookie consent banner. Security: CSP headers. Marketing: Onboarding flow.
