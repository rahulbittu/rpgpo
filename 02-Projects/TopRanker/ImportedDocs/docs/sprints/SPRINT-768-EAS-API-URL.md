# Sprint 768 — EAS Build API URL → topranker.io

**Date:** 2026-03-12
**Theme:** Point native app builds to custom domain instead of Railway subdomain
**Story Points:** 1 (P1 — TestFlight blocker)

---

## Mission Alignment

- **TestFlight readiness:** The production EAS build was configured to connect to `topranker-production.up.railway.app`. Native iOS/Android apps need to connect to `topranker.io` (the custom domain) for production.

---

## Problem

`eas.json` had `EXPO_PUBLIC_API_URL` pointing to the Railway subdomain. While this works, the custom domain `topranker.io` is the canonical production URL. Using the subdomain means:
1. If Railway changes the subdomain, the app breaks
2. Custom domain has better SSL/DNS handling
3. Consistent branding in network requests

## Fix

Updated both preview and production profiles in `eas.json` to use `https://topranker.io`.

---

## Team Discussion

**Sarah Nakamura (Lead Eng):** "This would have been a TestFlight-breaking bug. The app would connect to the wrong URL if Railway ever changes the subdomain."

**Marcus Chen (CTO):** "Custom domain is the single source of truth for production. Everything — web, iOS, Android — should point to topranker.io."

**Nadia Kaur (Cybersecurity):** "The custom domain also gives us control over SSL certificate renewal and DNS configuration. Railway subdomains are managed by Railway."

---

## Changes

| File | Change |
|------|--------|
| `eas.json` | Changed EXPO_PUBLIC_API_URL from Railway subdomain to `https://topranker.io` (preview + production) |
| 3 test files | Updated assertions from Railway subdomain to topranker.io |

---

## Tests

- **New:** 6 tests in `__tests__/sprint768-eas-api-url.test.ts`
- **Updated:** Tests in sprint681, sprint716, sprint754
- **Total:** 13,173 tests across 575 files — all passing

---

## Health Metrics

| Metric | Value |
|--------|-------|
| Build size | 665.4kb / 750kb (88.7%) |
| Tests | 13,173 / 575 files |
| topranker.io | LIVE |
