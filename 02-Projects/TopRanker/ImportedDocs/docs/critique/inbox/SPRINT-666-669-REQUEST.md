# Critique Request — Sprints 666–669

**Date:** 2026-03-11
**Submitted by:** TopRanker Engineering
**For:** External Watcher (ChatGPT)

---

## Sprints Covered

### Sprint 666: Apple Sign-In on Signup + JWKS Verification
- Added Apple button to signup screen (mirrors existing login flow)
- JWKS verification with 1-hour cache for Apple identity tokens
- JWT decode with issuer check (`https://appleid.apple.com`), kid matching against Apple's public key set
- Signup and login now both support Google, Apple, and email/password

### Sprint 667: Offline Rating Queue
- New `offline-sync-service.ts` (85 LOC)
- Queues ratings on network failure via `queueAction()` + `persistQueue()` to AsyncStorage
- Auto-syncs on app foreground via AppState listener (`active` state transition)
- Max 3 retries per queued action, silent drop on repeated server errors (4xx/5xx)
- Queue persists across app restarts

### Sprint 668: EAS Preview Build Config
- Added `EXPO_PUBLIC_API_URL` to `eas.json` preview profile
- Points to Railway production backend (`topranker-production.up.railway.app`)
- Enables physical device testing via QR code install from EAS dashboard
- iOS-specific: distribution set to `internal`, requires Apple Developer account

### Sprint 669: Native Platform Polish
- Added `StatusBar` with `light-content` barStyle for iOS and Android
- Extracted `modalOpts` and `cardOpts` as shared screen config objects
- `gestureEnabled: true` + `fullScreenGestureEnabled: true` on all modal screens
- Swipe-to-dismiss and swipe-back gestures work consistently across iOS stack

---

## Questions for Reviewer

1. **Offline sync silent drop:** The offline sync service retries max 3 times then silently drops failed ratings. Should we notify the user when a queued rating is permanently dropped? The argument for silence: users rarely notice, and a "your rating failed" notification days later is confusing. The argument against: a lost rating violates "every rating has visible consequence."

2. **Apple JWKS cache TTL:** Apple JWKS cache is 1 hour. Apple rotates keys infrequently (months between rotations). Is this cache TTL appropriate, or should we use a longer TTL (e.g., 24 hours) to reduce outbound requests? Risk: if Apple rotates a key and we have a stale cache, auth fails for up to TTL duration.

3. **Preview build targeting production:** The EAS preview build points to the production API. This means testers on preview builds write real data to production. Should the preview build instead point to a UAT environment once it exists? Or is production acceptable for a small team doing controlled testing?

4. **Global gesture dismissal:** `gestureEnabled: true` is set globally on all modal screens. Are there screens where gesture dismissal should be disabled — for example, the rating flow mid-submission, or a confirmation dialog? Accidental swipe-dismiss during rating submission could lose user input.

---

## Context

- App Store submission target: Sprint 685
- Progress: 95.6% to App Store ready
- Auth surface is now complete (Google + Apple + email/password)
- Offline capability is new — first time the app handles network failures gracefully
- These 4 sprints focused on iOS readiness: auth, offline, build config, native polish
