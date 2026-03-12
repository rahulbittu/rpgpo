# Sprint 742 — URL Centralization

**Date:** 2026-03-12
**Theme:** Eliminate hardcoded URLs — single source of truth for share domain and site URL
**Story Points:** 2

---

## Mission Alignment

- **One source of truth (Constitution #15):** All share URLs now flow from `SHARE_BASE_URL` (client) and `config.siteUrl` (server)
- **Agent-friendly codebase (Constitution #27):** Domain changes require editing exactly one constant per layer, not hunting through dozens of files

---

## Team Discussion

**Sarah Nakamura (Lead Eng):** "We had `https://topranker.com` hardcoded in 30+ locations across client and server. If we ever need to change the domain — staging, custom domain, or rebrand — that's 30+ places to update and 30+ chances to miss one. Now it's 2: SHARE_BASE_URL for client, config.siteUrl for server."

**Amir Patel (Architecture):** "The server already had config.ts for centralized env vars. Adding siteUrl follows the existing pattern. The 4 server files that defined their own `const SITE_URL = process.env.SITE_URL || ...` now read from config."

**Marcus Chen (CTO):** "Good cleanup. The email templates still have hardcoded URLs in HTML strings — that's a larger refactor for later. But the high-traffic paths (sharing, referrals, QR codes, SEO) are now centralized."

**Jasmine Taylor (Marketing):** "SHARE_BASE_URL is critical for us. When we do the topranker.io migration, we change one constant and all WhatsApp share links, QR codes, and social previews update instantly."

**Nadia Kaur (Cybersecurity):** "Centralizing URLs also means we can audit the exact domain being used in one place. No risk of a stale staging URL leaking into production share links."

---

## Changes

### Client: SHARE_BASE_URL constant

| File | Change |
|------|--------|
| `lib/sharing.ts` | Added `SHARE_BASE_URL = "https://topranker.com"` constant; replaced 3 hardcoded URLs in getShareUrl, getShareText, getProfileShareText |
| `app/business/qr.tsx` | Import SHARE_BASE_URL; replaced hardcoded QR URL |
| `lib/hooks/useSearchActions.ts` | Import SHARE_BASE_URL; replaced hardcoded search share URL |

### Server: config.siteUrl

| File | Change |
|------|--------|
| `server/config.ts` | Added `siteUrl: optional("SITE_URL", "https://topranker.com")` |
| `server/routes-seo.ts` | `SITE_URL = config.siteUrl` (was `process.env.SITE_URL \|\| "..."`) |
| `server/prerender.ts` | `SITE_URL = config.siteUrl` |
| `server/routes-qr.ts` | `SITE_URL = config.siteUrl` |
| `server/routes-payments.ts` | `config.siteUrl` (was `process.env.SITE_URL \|\| "..."`) |
| `server/unsubscribe-tokens.ts` | `config.siteUrl` for unsubscribe URL |
| `server/routes-referrals.ts` | `config.siteUrl` for referral share URL |

### Test Fixes

| File | Fix |
|------|-----|
| `__tests__/sprint547-share-domain.test.ts` | Updated assertion for SHARE_BASE_URL pattern |
| `tests/sprint118-i18n-sharing.test.ts` | Updated assertion for SHARE_BASE_URL pattern |
| `tests/sprint188-referral-tracking.test.ts` | Updated assertion for config.siteUrl pattern |
| `tests/sprint226-email-tracking-wire-signed-tokens.test.ts` | Dynamic import to handle config.ts env requirements |

---

## Tests

- **New:** 27 tests in `__tests__/sprint742-url-centralization.test.ts`
- **Updated:** 4 existing test files
- **Total:** 12,803 tests across 550 files — all passing

---

## Health Metrics

| Metric | Value |
|--------|-------|
| Build size | 663.0kb / 750kb (88.4%) |
| Tests | 12,803 / 550 files |
| Hardcoded URLs in client share code | 0 (was 5) |
| Server files with direct process.env.SITE_URL | 0 (was 4) |
