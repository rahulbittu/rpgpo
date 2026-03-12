# Sprint 154: Railway Deployment Hardening & Production Safety

**Date:** 2026-03-09
**Story Points:** 5
**Focus:** P0/P1 fixes — Railway 502, production mock data leak

---

## Mission Alignment
Fix deployment infrastructure so TopRanker can serve real users on Railway without silent data corruption. Trust requires real data, not mock fallbacks.

---

## Team Discussion

**Marcus Chen (CTO):** "The IPv6 binding issue is exactly the kind of subtle platform bug that costs days. Railway routes IPv4 — if we only bind IPv6, we're invisible. Good catch."

**Sarah Nakamura (Lead Eng):** "I'm more concerned about the mock data in production. If our API hiccups for 2 seconds, users see fake Dallas restaurants instead of an error. That's a trust violation."

**Amir Patel (Architecture):** "The `__DEV__` gate is the right pattern. React Native tree-shakes it in production builds, so the mock code won't even ship. Zero runtime cost."

**Nadia Kaur (Cybersecurity):** "Mock data in production is a data integrity issue. If a user screenshots fake rankings and shares them, that's reputational damage. The dev-only gate is mandatory."

**Rachel Wei (CFO):** "Railway costs are predictable — $5/mo for the hobby plan. The domain is already on Namecheap. No budget concerns here."

---

## Changes

### P0: Fix Railway 502 — IPv4 Binding
- **File:** `server/index.ts:370-375`
- **Root cause:** `server.listen(port)` without host parameter binds IPv6 only on Railway's container runtime
- **Fix:** Restored `host: "0.0.0.0"` to explicitly bind IPv4
- **Impact:** Server now reachable on Railway's IPv4 routing layer

### P1: Gate Mock Data to Development Only
- **File:** `lib/api.ts:273-280`
- **Root cause:** `apiFetch()` catch block served mock data on ANY network error, including in production
- **Fix:** Wrapped mock data fallback in `if (__DEV__)` guard
- **Impact:** Production users see proper error states instead of fake data; dev experience unchanged

### Pre-existing (from prior session)
- `lib/google-auth.ts` — Native OAuth flow with iOS client ID + reversed scheme redirect
- `server/auth.ts` — Dual ID token / access token verification
- `lib/query-client.ts` — EXPO_PUBLIC_API_URL priority in getApiUrl()
- `nixpacks.toml` + `.node-version` — Railway build configuration
- `railway.toml` — internalPort 8080, Nixpacks builder

---

## Test Results
- **2117 tests** across 92 files — all passing
- **Duration:** 1.57s
- No regressions from either fix

---

## PRD Gaps Closed
- Railway deployment: infrastructure ready (pending domain DNS propagation)
- Mock data production leak: eliminated
