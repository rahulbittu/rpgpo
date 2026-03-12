# Sprint 741 — Crypto ID Standardization + Silent Error Recovery

**Date:** 2026-03-11
**Theme:** Security hardening — cryptographic IDs + dev-mode error logging + XSS prevention
**Story Points:** 2

---

## Mission Alignment

- **Rate → Consequence → Ranking:** Cryptographic IDs strengthen anti-gaming infrastructure; claim verification codes are now unpredictable
- **Trust system:** Request IDs, alert IDs, and abuse incident IDs generated with crypto.randomUUID() — no longer predictable via Math.random()
- **Quality:** Empty catch blocks replaced with __DEV__-guarded logging for faster debugging during beta

---

## Team Discussion

**Nadia Kaur (Cybersecurity):** "Math.random() is not cryptographically secure. For request IDs, rate-limit event IDs, alert IDs, and abuse incident IDs, we need crypto.randomUUID(). For the 6-digit claim verification codes, crypto.randomInt() ensures uniform distribution without modulo bias. This closes 6 weak-RNG instances across 5 server modules."

**Marcus Chen (CTO):** "The silent catch blocks were tech debt from early sprints. During beta, we need to know when things fail — even if the failures are non-critical. __DEV__-guarded console.warn gives us visibility in development without polluting production logs."

**Amir Patel (Architecture):** "The QR print XSS fix is important. Business names come from user input — injecting raw strings into innerHTML is a classic stored XSS vector. HTML entity escaping for < > \" & closes this."

**Sarah Nakamura (Lead Eng):** "6 Math.random() → crypto replacements, 3 empty catch → logged catch replacements, 1 XSS prevention fix. Small changes, big security impact. This is exactly the kind of hardening that matters for production."

**Jordan Blake (Compliance):** "Cryptographic randomness for verification codes is a compliance requirement for any authentication flow. crypto.randomInt() also eliminates the modulo bias that Math.floor(Math.random()) introduces."

---

## Changes

### Server: Crypto ID Standardization (6 replacements)

| File | Before | After |
|------|--------|-------|
| `server/security-headers.ts` (×2) | `Date.now().toString(36)-Math.random()` | `crypto.randomUUID()` |
| `server/rate-limit-dashboard.ts` | `rl_${now}_${Math.random()...}` | `rl_${crypto.randomUUID()}` |
| `server/alerting.ts` | `alert_${now}_${Math.random()...}` | `alert_${crypto.randomUUID()}` |
| `server/abuse-detection.ts` | `abuse_${now}_${Math.random()...}` | `abuse_${crypto.randomUUID()}` |
| `server/storage/claims.ts` | `Math.floor(100000 + Math.random() * 900000)` | `crypto.randomInt(100000, 999999)` |

### Client: Silent Error Recovery (3 fixes)

| File | Context | Fix |
|------|---------|-----|
| `app/_layout.tsx` | `reportNotificationOpened().catch(() => {})` | Added `__DEV__` console.warn |
| `app/(tabs)/index.tsx` | `submitCategorySuggestion().catch(() => {})` | Added `__DEV__` console.warn |
| `app/business/qr.tsx` | `} catch {}` in shareQR | Added `__DEV__` console.warn |

### Client: QR Print XSS Prevention

| File | Fix |
|------|-----|
| `app/business/qr.tsx` | Sanitize business `name` via HTML entity escaping before injecting into print window HTML |

### Test Fix

| File | Fix |
|------|-----|
| `__tests__/sprint501-client-open-wiring.test.ts` | Loosened assertion for fire-and-forget pattern (now allows logged catch) |

---

## Tests

- **New:** 30 tests in `__tests__/sprint741-crypto-id-error-handling.test.ts`
- **Updated:** 1 test in `sprint501-client-open-wiring.test.ts`
- **Total:** 12,776 tests across 549 files — all passing

---

## Health Metrics

| Metric | Value |
|--------|-------|
| Build size | 662.9kb / 750kb (88.4%) |
| Tests | 12,776 / 549 files |
| Math.random() in server IDs | 0 (was 6) |
| Empty catch blocks (app/) | 0 (was 3) |
| XSS vectors in QR print | 0 (was 1) |
