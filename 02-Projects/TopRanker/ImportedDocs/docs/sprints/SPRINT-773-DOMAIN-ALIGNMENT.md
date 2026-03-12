# Sprint 773 — Domain Alignment (topranker.com → topranker.io)

**Date:** 2026-03-12
**Theme:** Fix all user-facing URLs to use topranker.io
**Story Points:** 2 (hardening)

---

## Mission Alignment

- **Constitution #15:** One source of truth — all URLs must point to the live domain
- **Marketing Strategy:** WhatsApp share links, QR codes, and email CTAs must work

---

## Problem

Sprint 771 fixed `app-env.ts` API URLs, but 29+ references to `topranker.com` remained in email templates, sharing utilities, QR code generation, OG images, and server config. Per CTO Marcus Chen: "topranker.com is registered but not configured — everything should point to topranker.io."

Users clicking share links, email CTAs, QR codes, or password reset links would get DNS failures.

## Fix

Bulk replacement of all user-facing `topranker.com` URLs to `topranker.io` across 8 files. The `SHARE_DOMAINS` array still accepts `topranker.com` for backwards-compatible URL parsing. Email FROM address (`noreply@topranker.com`) kept as-is since email domain config is separate.

---

## Team Discussion

**Jasmine Taylor (Marketing):** "This is critical for WhatsApp. If someone shares a link from the app and it goes to topranker.com — dead link. That kills virality on day one."

**Sarah Nakamura (Lead Eng):** "Good catch keeping SHARE_DOMAINS backwards-compatible. If someone bookmarked a .com link before, the deep link parser still handles it."

**Marcus Chen (CTO):** "Once DNS for .com is configured, we'll want both domains. But for launch, .io is the only one that resolves. This is the right call."

**Amir Patel (Architecture):** "29 hardcoded strings across 8 files — this is exactly why the retro from Sprint 771 called for a single constant. We should centralize siteUrl usage from config.ts into email templates."

**Derek Okonkwo (Mobile):** "Share sheet URLs will now resolve correctly. This was silently broken for anyone who tried sharing."

---

## Changes

| File | Change |
|------|--------|
| `lib/sharing.ts` | SHARE_BASE_URL → topranker.io |
| `server/config.ts` | siteUrl fallback → topranker.io |
| `server/email.ts` | All CTA links, support/admin emails → topranker.io |
| `server/email-owner-outreach.ts` | Claim/upgrade/dashboard links → topranker.io |
| `server/email-drip.ts` | Drip campaign CTAs → topranker.io |
| `server/email-weekly.ts` | Weekly digest CTAs → topranker.io |
| `server/og-image.ts` | SVG footer → topranker.io |
| `server/routes-qr.ts` | QR code footer → topranker.io |
| 7 test files | Updated assertions to match new domain |

---

## Tests

- **New:** 14 tests in `__tests__/sprint773-domain-alignment.test.ts`
- **Updated:** 7 existing test files with domain assertions
- **Total:** 13,219 tests across 580 files — all passing
- **Build:** 665.8kb (max 750kb)
