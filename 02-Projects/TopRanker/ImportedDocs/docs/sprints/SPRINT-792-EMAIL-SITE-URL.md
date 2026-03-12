# Sprint 792 — Email Template Refactor to config.siteUrl

**Date:** 2026-03-12
**Theme:** Replace hardcoded topranker.io URLs in email templates with config.siteUrl
**Story Points:** 2 (consistency)

---

## Mission Alignment

- **Principle #15:** One source of truth. Hardcoded domain strings are stale doc bugs.
- **Operations:** If we ever change the domain (e.g., back to topranker.com), only one place needs updating.

---

## Problem

29+ hardcoded `https://topranker.io` URLs were scattered across 4 email template files:
- `server/email.ts` (9 occurrences)
- `server/email-owner-outreach.ts` (6 occurrences)
- `server/email-drip.ts` (6 occurrences)
- `server/email-weekly.ts` (3 occurrences)

If the domain changed, all would need manual updating — and any miss would send users to a broken URL.

## Fix

1. Added `import { config } from "./config"` to all 4 email files
2. Replaced all `https://topranker.io` with `${config.siteUrl}` (already a template literal context)
3. Updated 4 test files that asserted on hardcoded domain strings
4. Fixed `sprint222-email-drip.test.ts` to use dynamic import (config.ts requires DATABASE_URL)

---

## Team Discussion

**Amir Patel (Architecture):** "29 hardcoded URLs in email templates was tech debt from the Sprint 773 domain migration. We replaced topranker.com → topranker.io but left them as literals. Now there's one source of truth: `config.siteUrl`."

**Sarah Nakamura (Lead Eng):** "The dynamic import fix for the drip test is a good pattern — when test modules pull in server code that requires env vars, we need to set them before the import chain runs."

**Derek Okonkwo (Mobile):** "Email links are critical — a broken verify-email or reset-password URL locks users out. config.siteUrl ensures they're always correct."

**Rachel Wei (CFO):** "If we ever need a staging environment with a different domain, the email templates now automatically use the correct URL. Good for UAT testing."

---

## Changes

| File | Change |
|------|--------|
| `server/email.ts` | Import config, replace 9 hardcoded URLs with config.siteUrl |
| `server/email-owner-outreach.ts` | Import config, replace 6 hardcoded URLs |
| `server/email-drip.ts` | Import config, replace 6 hardcoded URLs |
| `server/email-weekly.ts` | Import config, replace 3 hardcoded URLs |
| `__tests__/sprint773-domain-alignment.test.ts` | Updated assertions for config.siteUrl |
| `tests/sprint186-email-verification.test.ts` | Updated assertions |
| `tests/sprint196-beta-invite.test.ts` | Updated assertion |
| `tests/sprint222-email-drip.test.ts` | Dynamic import for config env compatibility |

---

## Tests

- **Updated:** 4 test files with new assertions
- **Total:** 13,368 tests across 595 files — all passing
- **Build:** 666.8kb (max 750kb)
