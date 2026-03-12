# Retrospective — Sprint 783

**Date:** 2026-03-12
**Duration:** 1 session
**Story Points:** 1
**Facilitator:** Sarah Nakamura

---

## What Went Well

**Nadia Kaur:** "Every external fetch in the server now has a timeout. This is a real security hardening win — no more unbounded outbound connections."

**Amir Patel:** "The missing logger import was a latent production bug. Would have crashed Apple Sign-In on first use. Caught it before any user hit it."

**Derek Okonkwo:** "Consistent 10s timeout across Apple JWKS and Google OAuth. Clean pattern."

---

## What Could Improve

- Should add integration tests that verify timeout behavior (mock slow responses).
- Consider centralizing the 10s timeout as a constant (e.g., `OAUTH_TIMEOUT_MS`).

---

## Team Morale: 9/10
