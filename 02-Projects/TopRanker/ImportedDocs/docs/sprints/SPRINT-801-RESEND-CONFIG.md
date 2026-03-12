# Sprint 801 — Consolidate Resend Env Vars to config.ts

**Date:** 2026-03-12
**Theme:** Eliminate direct process.env access for Resend API key and webhook secret
**Story Points:** 1 (consistency)

---

## Mission Alignment

- **Single source of truth:** All environment configuration through config.ts
- **Auditability:** One file shows every env var the server depends on

---

## Problem

`server/email.ts` used `process.env.RESEND_API_KEY` directly despite config.ts already having `resendApiKey`. `server/routes-webhooks.ts` used `process.env.RESEND_WEBHOOK_SECRET` directly, which wasn't even in config.ts. This was flagged in the Sprint 797 retro as inconsistent.

## Fix

1. `email.ts`: Changed `process.env.RESEND_API_KEY || ""` to `config.resendApiKey || ""`
2. `routes-webhooks.ts`: Added `import { config } from "./config"`, changed `process.env.RESEND_WEBHOOK_SECRET` to `config.resendWebhookSecret`
3. `config.ts`: Added `resendWebhookSecret` field

---

## Team Discussion

**Amir Patel (Architecture):** "config.ts now has 17 fields covering every external service: DB, session, OAuth, Stripe, email (key + webhook + from), push, maps, hosting, and site URL. Clean single-source pattern."

**Sarah Nakamura (Lead Eng):** "There are still ~15 direct process.env accesses in other server files (photos, payments, deploy, etc.). Each one is a candidate for migration. But the Resend ones were the most inconsistent since config.ts already had resendApiKey."

**Nadia Kaur (Cybersecurity):** "Centralizing secrets to config.ts means we can audit all external service credentials in one place. Important for security reviews."

**Rachel Wei (CFO):** "Consistent patterns reduce onboarding time. A new developer can look at config.ts and understand every external dependency without grepping."

---

## Changes

| File | Change |
|------|--------|
| `server/config.ts` | Added `resendWebhookSecret` field |
| `server/email.ts` | Changed RESEND_API_KEY to use `config.resendApiKey` |
| `server/routes-webhooks.ts` | Added config import, changed to `config.resendWebhookSecret` |
| `__tests__/sprint801-resend-config.test.ts` | 8 tests |

---

## Tests

- **New:** 8 tests in `__tests__/sprint801-resend-config.test.ts`
- **Total:** 13,445 tests across 602 files — all passing
- **Build:** 669.1kb (max 750kb)
