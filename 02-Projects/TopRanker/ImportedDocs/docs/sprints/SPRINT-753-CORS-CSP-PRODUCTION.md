# Sprint 753 — CORS + CSP Production Configuration

**Date:** 2026-03-12
**Theme:** Fix CORS header mismatch + expand CSP connect-src for production domains
**Story Points:** 1

---

## Mission Alignment

- **Infrastructure readiness:** The Expo app sends `expo-platform` header with every request. Production CORS was missing this header, which would cause preflight failures on Railway.

---

## Team Discussion

**Nadia Kaur (Cybersecurity):** "Found two issues. First: the production `Access-Control-Allow-Headers` was missing `expo-platform` — it was only in the dev config. Every Expo app request would fail the preflight check in production. Second: CSP `connect-src` didn't include our own domains or Railway, so the browser would block XHR requests from the web app to the API."

**Sarah Nakamura (Lead Eng):** "This would have been a silent deployment failure — the app would load but every API call would fail with a CORS error. Good catch before we deploy."

**Amir Patel (Architecture):** "The CSP now includes wildcards for `*.topranker.com`, `*.topranker.io`, and `*.up.railway.app`. This covers current and future subdomains without needing a deploy for each new subdomain."

**Marcus Chen (CTO):** "Between the health check (751), readiness probe (752), and CORS fix (753), we've addressed the three most common Railway deployment failure modes. We should be able to deploy clean now."

---

## Changes

| File | Change |
|------|--------|
| `server/security-headers.ts` | Added `expo-platform` to production `Access-Control-Allow-Headers` |
| `server/security-headers.ts` | Added production domains + Railway wildcards to CSP `connect-src` |

### CORS Fix
- **Before:** Production `Allow-Headers` = `Content-Type, Authorization`
- **After:** Production `Allow-Headers` = `Content-Type, Authorization, expo-platform`

### CSP connect-src Additions
- `https://topranker.com`
- `https://*.topranker.com`
- `https://topranker.io`
- `https://*.topranker.io`
- `https://*.up.railway.app`

---

## Tests

- **New:** 23 tests in `__tests__/sprint753-cors-csp-production.test.ts`
- **Total:** 13,001 tests across 560 files — all passing

---

## Health Metrics

| Metric | Value |
|--------|-------|
| Build size | 664.9kb / 750kb (88.7%) |
| Tests | 13,001 / 560 files |
| Tracked files | 34 |
