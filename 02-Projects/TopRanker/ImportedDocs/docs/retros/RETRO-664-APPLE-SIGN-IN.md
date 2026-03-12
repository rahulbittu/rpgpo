# Retro 664: Apple Sign-In

**Date:** 2026-03-11
**Duration:** 10 min
**Points:** 5
**Facilitator:** Sarah Nakamura

## What Went Well
- **Marcus Chen:** "Critical App Store blocker resolved. Apple Sign-In follows the exact same pattern as Google — symmetric auth flows make the codebase predictable."
- **Amir Patel:** "The `authId` field supporting both Google and Apple IDs with prefixes is clean. No schema changes needed. The existing account-linking logic (by authId, then email) works identically."
- **Nadia Kaur:** "Security posture is solid. JWT verification, rate limiting, account linking all follow established patterns. The privacy relay email handling is correct."
- **Sarah Nakamura:** "Only 70 LOC client-side, 65 LOC server-side. Lean implementation. The conditional rendering (iOS-only) means no UI clutter on web or Android."

## What Could Improve
- Should add full Apple JWT signature verification (JWKS validation) before production launch.
- Need to test with real Apple Developer account — current implementation is code-complete but untested on device.
- Signup screen also needs the Apple button (currently only on login).

## Action Items
- [ ] Add Apple JWT JWKS signature verification (Owner: Nadia, Sprint 666)
- [ ] Add Apple Sign-In button to signup.tsx (Owner: Sarah, Sprint 666)
- [ ] Test Apple Sign-In on physical iOS device (Owner: Rahul)

## Team Morale
9/10 — Major milestone. The #1 App Store blocker is resolved. Team is energized about iOS submission path.
