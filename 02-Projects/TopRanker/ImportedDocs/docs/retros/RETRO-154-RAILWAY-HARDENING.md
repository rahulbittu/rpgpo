# Retro 154: Railway Deployment Hardening

**Date:** 2026-03-09
**Duration:** 1 sprint
**Story Points:** 5
**Facilitator:** Sarah Nakamura

---

## What Went Well
- **Marcus Chen:** "IPv6 binding was identified quickly from deploy logs. The fix is one line — surgical."
- **Amir Patel:** "`__DEV__` gate is idiomatic React Native. No custom flags, no env vars to forget — it just works."
- **Nadia Kaur:** "We caught the mock data leak before any production users saw it. That's the kind of near-miss we should celebrate finding early."

## What Could Improve
- The mock data fallback was introduced without a production guard — should have been dev-only from day one
- Railway deployment required multiple iterations across sessions due to IPv6/IPv4, npm ci/install, and port config — a deployment checklist would have saved time
- Google OAuth testing on native still needs end-to-end validation on a physical device

## Action Items
- [ ] **Sarah:** Create Railway deployment checklist in docs/
- [ ] **Marcus:** End-to-end test Google OAuth on iOS device before next push
- [ ] **Amir:** Add integration test verifying mock data is NOT served when `__DEV__` is false

## Team Morale
**7/10** — Relief at closing the Railway blockers and the mock data safety issue. Some fatigue from the multi-session debugging, but confidence is up now that root causes are identified and fixed.
