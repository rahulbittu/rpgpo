# Critique Request: Sprints 661-664

**Date:** 2026-03-11
**Requester:** Marcus Chen (CTO)
**Sprints covered:** 661, 662, 663, 664

## Summary of Changes

### Sprint 661: Threshold Tracking (2 pts)
Added `claim.tsx` and `routes-claims.ts` to thresholds.json, closing Audit #115 L1/L2. 33 files now tracked, 15 test files updated.

### Sprint 662: Auto-Fetch Action URLs (3 pts)
Auto-populate DoorDash, Uber Eats, menu, and Google Maps URLs on business detail view from Google Places API. Constructs delivery platform search URLs from business name + city. Fire-and-forget on first view, cached in DB.

### Sprint 663: Batch Action URL Enrichment (2 pts)
Admin endpoint `POST /api/admin/enrichment/action-urls` to bulk-enrich all businesses. Processes 50/batch with 200ms rate limiting.

### Sprint 664: Apple Sign-In (5 pts)
Full Apple Sign-In implementation: expo-apple-authentication client, server JWT verification, account creation/linking with `apple_` prefix authId, iOS-conditional button on login screen. Required for App Store submission.

## Questions for Reviewer

1. **Apple JWT security:** Current verification only checks issuer, not signature (JWKS). Is this acceptable for initial launch, or must JWKS verification be in place before App Store submission?

2. **DoorDash/UberEats URL strategy:** We construct search URLs (`doordash.com/search/store/...`) rather than deep links. This means the user lands on a search results page, not directly on the restaurant. Is this acceptable UX, or should we invest in DoorDash/UberEats APIs?

3. **Build size trajectory:** 647.1→654.3kb in 4 sprints (+7.2kb). At this rate, we'll hit the 750kb ceiling in ~13 sprints. Should we proactively extract or optimize, or wait until it becomes a concern?

4. **Auth parity:** Apple Sign-In is on login.tsx but not signup.tsx. Apple's guidelines are ambiguous about whether both screens need it. Is login-only sufficient for App Store approval?

5. **Enrichment timing:** Action URL enrichment is lazy (on first view) + batch (admin trigger). Should we add a scheduled cron job for automatic enrichment of new businesses?
