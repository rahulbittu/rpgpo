# Sprint 238 — Business Claim Verification Workflow

**Date**: 2026-03-09
**Theme**: Business Ownership Verification + Admin Tooling
**Story Points**: 8
**Tests Added**: 38 (across static, runtime, admin routes, integration)

---

## Mission Alignment

Business claims are a critical trust mechanism. When an owner claims their listing, they
unlock the ability to respond to reviews, update photos, and manage their profile. But
unverified claims undermine trust — if anyone can claim a business, the rankings become
vulnerable to manipulation. This sprint introduces a formal verification lifecycle: submit
a claim, receive a verification code via email/phone/document/Google Business, verify the
code within 48 hours, and either succeed or get rejected. Admin tooling gives the ops team
visibility into the claim pipeline and the ability to manually reject fraudulent claims.

---

## Team Discussion

**Marcus Chen (CTO)**: "Business claims are the gateway to our B2B revenue stream. Every
claimed business is a potential Business Pro subscriber at $49/month. But we cannot
compromise trust for revenue — the verification workflow must be airtight. The 48-hour
expiry, 3-attempt limit, and admin rejection capability give us multiple layers of defense.
This is infrastructure that directly enables our monetization roadmap."

**Sarah Nakamura (Lead Engineer)**: "The module is intentionally in-memory with FIFO
eviction at 1000 claims. For our current scale this is sufficient, and it avoids coupling
to the database layer which would require a migration. When we hit the point where 1000
concurrent pending claims is a real constraint, we'll promote this to a database-backed
model. The interface is designed so that swap is transparent — all functions return the
same ClaimRequest shape."

**Jordan Blake (Compliance)**: "Verification methods matter for legal liability. Email and
phone verification establish a communication channel we can reference if a dispute arises.
Document verification — business license uploads — provides the strongest legal proof of
ownership. Google Business verification is the fastest path for businesses already verified
on Google. Each method has different evidentiary weight, and our Terms of Service need to
reflect that distinction. I will draft updated ToS language for Sprint 239."

**Cole Anderson (City Growth)**: "As we expand to Memphis and Nashville, claim verification
becomes urgent. Local business owners will want to claim their listings as soon as they
appear. If the claim process is broken or slow, we lose those early adopters permanently.
The 48-hour window is generous but not so long that it creates a backlog. For city launches,
I want to prioritize email verification since we already have business email data in our
seed datasets."

**Nadia Kaur (Security)**: "The verification code uses `crypto.getRandomValues` which is
cryptographically secure — no Math.random vulnerability here. The 6-digit code gives us
1 million combinations, and with a 3-attempt limit, brute force probability is 3 in
1,000,000. The FIFO eviction prevents memory exhaustion from claim spam. One thing to
watch: the admin rejection endpoint currently has no auth middleware — we should wire it
through requireAuth + admin role check in a follow-up sprint."

**Amir Patel (Architecture)**: "The module follows our established pattern: pure functions
operating on an in-memory Map, exported for both API routes and direct test access. The
admin routes are in a separate file following the routes-admin-* convention. The test file
covers static source analysis, runtime behavior, and integration wiring — the same three-tier
pattern we've standardized on since Sprint 200. No new architectural patterns introduced,
which is exactly right for a feature module."

---

## Changes

### New Files
- `server/claim-verification.ts` — Core claim lifecycle: create, verify, query, reject, stats
- `server/routes-admin-claims-verification.ts` — 5 admin endpoints for claim management
- `tests/sprint238-claim-verification.test.ts` — 38 tests (12 static + 14 runtime + 8 admin + 4 integration)

### Modified Files
- `server/routes.ts` — Import and register admin claim verification routes

---

## PRD Gap Status

- **Business Claiming** — Now has verification workflow (was previously unimplemented)
- **Admin Claim Management** — New admin endpoints for pending/stats/reject operations
- **Verification Methods** — Supports email, phone, document, google_business (delivery not yet wired)

---

## Open Items

| Item | Owner | Target Sprint |
|------|-------|---------------|
| Wire admin claim routes through requireAuth + admin role | Nadia Kaur | 239 |
| Add actual email/SMS delivery for verification codes | Cole Anderson | 240 |
| Update Terms of Service with claim verification language | Jordan Blake | 239 |
| Database-backed claims when scale demands it | Sarah Nakamura | TBD |
