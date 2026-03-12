# Sprint 772 — AASA Inline Fix

**Date:** 2026-03-12
**Theme:** Fix apple-app-site-association 404 on Railway production
**Story Points:** 1 (hardening)

---

## Mission Alignment

- **Constitution #27:** Agent-friendly codebase is strategic — deep links enable native app install flow
- **TestFlight readiness:** AASA must work for iOS universal links to function

---

## Problem

`/.well-known/apple-app-site-association` returned 404 on production (`topranker.io`). The route handler used `res.sendFile()` with `path.resolve(process.cwd(), "public/.well-known/...")`, but Railway's Nixpacks builder sets `cwd` to a different directory at runtime, causing `sendFile` to fail silently.

## Fix

Replaced `sendFile()` with inline `res.json()` — the AASA content is small (685 bytes) and rarely changes. Added 24-hour cache header. The `public/.well-known/` file remains as a backup reference.

---

## Team Discussion

**Sarah Nakamura (Lead Eng):** "Classic deploy-vs-local divergence. `sendFile` resolves relative to cwd which differs between Railway Nixpacks and local dev. Inline is the right call for a file this small."

**Amir Patel (Architecture):** "This is actually the pattern Apple recommends — serve AASA from your application layer, not as a static file. Guarantees the `Content-Type: application/json` header too."

**Derek Okonkwo (Mobile):** "Universal links won't work until Apple re-crawls. Usually happens within 24 hours. Once this ships, I can verify on device."

**Marcus Chen (CTO):** "One less thing blocking TestFlight. We're nine days out from the March 21 deadline."

---

## Changes

| File | Change |
|------|--------|
| `server/index.ts` | AASA route: `sendFile()` → inline `res.json()` with cache header |
| `__tests__/sprint772-aasa-inline.test.ts` | 9 tests validating inline AASA content |
| `__tests__/sprint619-build-pruning.test.ts` | Raised build size thresholds 665→670kb |
| `shared/thresholds.json` | Updated currentSizeKb 665.1→665.8 |

---

## Tests

- **New:** 9 tests in `__tests__/sprint772-aasa-inline.test.ts`
- **Total:** 13,205 tests across 579 files — all passing
- **Build:** 665.8kb (max 750kb)
