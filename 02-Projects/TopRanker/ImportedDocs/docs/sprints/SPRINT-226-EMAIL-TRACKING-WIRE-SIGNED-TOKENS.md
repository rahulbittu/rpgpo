# Sprint 226 — Email Tracking Wire + Signed Unsubscribe Tokens + Beta Badge

**Date:** 2026-03-09
**Story Points:** 5
**Status:** Complete

## Mission Alignment

Sprint 226 closes 3 action items from SLT-225. Email tracking integration gives marketing real open/click data. Signed tokens protect user privacy in unsubscribe flows. Beta badge helpers enable the frontend to distinguish city statuses.

## Team Discussion

- **Sarah Nakamura (Lead Eng):** "Email tracking is now wired into sendEmail() — every email gets a trackEmailSent() call, failures get trackEmailFailed(). Zero changes to callers. The tracking ID flows through for future open/click attribution."
- **Nadia Kaur (Security):** "Signed unsubscribe tokens use HMAC-SHA256 with timingSafeEqual for constant-time comparison. Token format is memberId.type.signature. Backward compatible — raw member IDs still work for existing links."
- **David Okonkwo (VP Product):** "getBetaCities() and getCityBadge() give the frontend everything it needs to show beta badges. OKC shows as 'beta', Dallas as 'active'. Clean separation between data and presentation."
- **Jasmine Taylor (Marketing):** "Email tracking was our #1 blind spot. Now every sendEmail call auto-tracks. We can see total sends, failures, and once we add webhook integration, opens and clicks too."
- **Rachel Wei (CFO):** "Email delivery data directly informs conversion optimization. If owner claim invite emails have a 30% open rate, we know the subject line works. If Pro upgrade emails have 1% click-through, we need to iterate."
- **Marcus Chen (CTO):** "Three deliverables, all under 50 LOC each. unsubscribe-tokens.ts is 40 lines. getBetaCities/getCityBadge are 10 lines combined. The email.ts change is 6 lines. Small, surgical, high-impact."

## Deliverables

### Email Tracking Wire (`server/email.ts`)

- Imports trackEmailSent and trackEmailFailed from email-tracking
- Every sendEmail() call now tracks with template name (from subject)
- Failed sends (after retries) are tracked as failures
- Zero changes required to callers

### Signed Unsubscribe Tokens (`server/unsubscribe-tokens.ts`)

- HMAC-SHA256 signed tokens (memberId.type.signature)
- generateUnsubscribeToken, verifyUnsubscribeToken, buildUnsubscribeUrl
- timingSafeEqual for constant-time comparison
- UNSUBSCRIBE_SECRET env var with dev fallback
- Backward compatible in routes-unsubscribe.ts

### Beta Badge Helpers (`shared/city-config.ts`)

- getBetaCities() — returns cities with status "beta"
- getCityBadge(name) — returns "active" | "beta" | "planned" | "unknown"
- Enables frontend city picker to show beta badges

## Tests

- 25 new tests in sprint226-email-tracking-wire-signed-tokens.test.ts
- Full suite: 4,135+ tests across 156 files, all passing
