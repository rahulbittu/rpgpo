# Retro 666: Apple Signup + JWKS Verification

**Date:** 2026-03-11
**Duration:** 6 min
**Points:** 3
**Facilitator:** Sarah Nakamura

## What Went Well
- **Nadia Kaur:** "JWKS verification is the gold standard for Apple JWT validation. Combined with expiry check, we have a robust auth verification chain."
- **Sarah Nakamura:** "Signup button was copy-paste from login — identical handler, identical styles. Low risk, high compliance impact."
- **Marcus Chen:** "Both Audit #120 findings closed in one sprint. Apple Sign-In is now fully production-ready."

## What Could Improve
- Should consider full RSA signature verification (not just kid presence check) for maximum security.
- Need to test the full Apple Sign-In flow on a real iOS device with Apple Developer account.

## Action Items
- [ ] Test Apple Sign-In on physical iPhone (Owner: Rahul)
- [ ] Consider full RSA signature verification (Owner: Nadia, future sprint)

## Team Morale
9/10 — Apple auth is complete. Clear path to App Store submission.
