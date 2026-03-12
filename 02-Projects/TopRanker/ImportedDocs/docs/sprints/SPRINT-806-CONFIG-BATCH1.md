# Sprint 806 — Config Consolidation Batch 1

**Date:** 2026-03-12
**Theme:** Migrate payments, stripe-webhook, photos, deploy from process.env to config.ts
**Story Points:** 1 (consistency)

---

## Mission Alignment

- **Single source of truth:** All environment configuration through config.ts
- **Security:** Centralized secrets are easier to audit and rotate

---

## Problem

Four server files accessed process.env directly for values that already existed in config.ts:
- `payments.ts`: 3x `process.env.STRIPE_SECRET_KEY`
- `stripe-webhook.ts`: `process.env.STRIPE_WEBHOOK_SECRET` + `process.env.STRIPE_SECRET_KEY`
- `photos.ts`: `process.env.EXPO_PUBLIC_GOOGLE_MAPS_API_KEY || process.env.GOOGLE_MAPS_API_KEY`
- `deploy.ts`: `process.env.GITHUB_WEBHOOK_SECRET` + `process.env.NTFY_TOPIC`

## Fix

1. Added `stripeWebhookSecret` to config.ts (18 total fields)
2. All 4 files now import config and use config properties
3. Zero direct process.env accesses remain in these files

---

## Team Discussion

**Amir Patel (Architecture):** "config.ts now has 18 fields. Still flat and clean. 4 more server files fully migrated."

**Sarah Nakamura (Lead Eng):** "payments.ts had the most changes — 3 identical process.env.STRIPE_SECRET_KEY calls. The replace-all was straightforward."

**Nadia Kaur (Cybersecurity):** "Stripe keys centralized to config means we can add future protections (key rotation, key masking in logs) in one place."

**Rachel Wei (CFO):** "The payments and stripe-webhook files handle real money. Having their configuration centralized and auditable is important."

---

## Changes

| File | Change |
|------|--------|
| `server/config.ts` | Added `stripeWebhookSecret` field |
| `server/payments.ts` | 3x process.env → config.stripeSecretKey |
| `server/stripe-webhook.ts` | 2x process.env → config.stripeWebhookSecret + config.stripeSecretKey |
| `server/photos.ts` | process.env.GOOGLE_MAPS → config.googleMapsApiKey |
| `server/deploy.ts` | process.env.GITHUB_WEBHOOK_SECRET + NTFY_TOPIC → config |
| `__tests__/sprint806-config-consolidation-batch1.test.ts` | 16 tests |

---

## Tests

- **New:** 16 tests in `__tests__/sprint806-config-consolidation-batch1.test.ts`
- **Total:** 13,479 tests across 605 files — all passing
- **Build:** 669.6kb (max 750kb)
