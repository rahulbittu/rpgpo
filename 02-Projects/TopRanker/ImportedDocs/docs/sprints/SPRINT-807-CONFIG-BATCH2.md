# Sprint 807 — Config Consolidation Batch 2

**Date:** 2026-03-12
**Theme:** Migrate security-headers, wrap-async, routes-admin, google-place-enrichment, unsubscribe-tokens, error-tracking from process.env to config.ts
**Story Points:** 1 (consistency)

---

## Mission Alignment

- **Single source of truth:** All environment configuration through config.ts
- **Security:** Centralized secrets are easier to audit and rotate
- **Completes SLT-805 roadmap item:** Config consolidation batch 2

---

## Problem

Six server files accessed process.env directly for values that should flow through config.ts:
- `security-headers.ts`: 3x — CORS_ORIGINS, RAILWAY_PUBLIC_DOMAIN, NODE_ENV
- `wrap-async.ts`: 1x — NODE_ENV
- `routes-admin.ts`: 1x — NODE_ENV
- `google-place-enrichment.ts`: 1x — GOOGLE_PLACES_API_KEY
- `unsubscribe-tokens.ts`: 1x — UNSUBSCRIBE_SECRET
- `error-tracking.ts`: 1x — SENTRY_DSN

## Fix

1. Added 3 new fields to config.ts: `googlePlacesApiKey`, `unsubscribeSecret`, `sentryDsn` (21 total fields)
2. All 6 files now import config and use config properties
3. Zero direct process.env accesses remain in these files
4. Fixed 12 existing test files that checked for old process.env strings

---

## Team Discussion

**Amir Patel (Architecture):** "config.ts now has 21 fields. Still flat and manageable. 6 more server files fully migrated. We're close to zero direct process.env in the server directory."

**Sarah Nakamura (Lead Eng):** "The test cascade was the main work — 12 test files needed updates. The source-reading tests caught every migration instantly, which is exactly what they're designed for."

**Nadia Kaur (Cybersecurity):** "security-headers.ts was the biggest win — CORS origins and Railway domain now flow through the same config layer as everything else. Audit trail is clean."

**Rachel Wei (CFO):** "UNSUBSCRIBE_SECRET and SENTRY_DSN centralized means our compliance posture improves. Every secret in one auditable place."

**Marcus Chen (CTO):** "Build jumped to 720.6kb — still under 750kb ceiling but worth watching. The config import tree is pulling in more at bundle time."

---

## Changes

| File | Change |
|------|--------|
| `server/config.ts` | Added `googlePlacesApiKey`, `unsubscribeSecret`, `sentryDsn` fields (21 total) |
| `server/security-headers.ts` | 3x process.env → config.corsOrigins, config.railwayPublicDomain, config.isProduction |
| `server/wrap-async.ts` | process.env.NODE_ENV → config.isProduction |
| `server/routes-admin.ts` | process.env.NODE_ENV → !config.isProduction |
| `server/google-place-enrichment.ts` | process.env.GOOGLE_PLACES_API_KEY → config.googlePlacesApiKey |
| `server/unsubscribe-tokens.ts` | process.env.UNSUBSCRIBE_SECRET → config.unsubscribeSecret |
| `server/error-tracking.ts` | process.env.SENTRY_DSN → config.sentryDsn |
| `__tests__/sprint807-config-consolidation-batch2.test.ts` | 26 new tests |
| 12 existing test files | Updated assertions for config.* patterns |

---

## Tests

- **New:** 26 tests in `__tests__/sprint807-config-consolidation-batch2.test.ts`
- **Total:** 13,505 tests across 606 files — all passing
- **Build:** 720.6kb (max 750kb)
